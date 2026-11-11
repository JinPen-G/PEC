[CmdletBinding()]
param([switch]$ConfirmCleanup)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Resolve-CleanupPath {
    param([string]$WorkspaceRoot, [string]$Relative)

    $root = [System.IO.Path]::GetFullPath($WorkspaceRoot).TrimEnd('\', '/')
    $absolute = [System.IO.Path]::GetFullPath((Join-Path $root $Relative))
    if (-not $absolute.StartsWith($root + [System.IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
        throw "路径不在工程内部：$Relative"
    }
    $ancestor = $absolute
    while ($ancestor) {
        if (Test-Path -LiteralPath $ancestor) {
            $item = Get-Item -LiteralPath $ancestor -Force
            if ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
                throw "拒绝符号链接或目录联接：$ancestor"
            }
        }
        $ancestor = Split-Path -Parent $ancestor
    }
    return $absolute
}

function Get-CleanupEntry {
    param([string]$WorkspaceRoot, [string]$Relative)

    $absolute = Resolve-CleanupPath $WorkspaceRoot $Relative
    if (-not (Test-Path -LiteralPath $absolute)) { return }
    $entries = [System.Collections.Generic.List[object]]::new()
    $pending = [System.Collections.Generic.Stack[string]]::new()
    $pending.Push($absolute)
    while ($pending.Count) {
        $item = Get-Item -LiteralPath $pending.Pop() -Force
        if ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
            throw "清理目标包含符号链接或目录联接：$($item.FullName)"
        }
        $entries.Add($item)
        if ($item.PSIsContainer) {
            foreach ($child in Get-ChildItem -LiteralPath $item.FullName -Force) {
                $pending.Push($child.FullName)
            }
        }
    }
    if ($entries | Where-Object { $_.Name -eq 'AGENTS.md' }) {
        throw "清理目录包含独立开发规则，需人工复核：$Relative"
    }
    $files = @($entries | Where-Object { -not $_.PSIsContainer })
    [long]$totalBytes = 0
    foreach ($file in $files) { $totalBytes += $file.Length }
    $metadata = @($entries | Sort-Object FullName | ForEach-Object {
        $length = if ($_.PSIsContainer) { 0 } else { $_.Length }
        @($_.FullName, $length, $_.LastWriteTimeUtc.Ticks, [int]$_.Attributes)
    }) | ConvertTo-Json -Compress -Depth 4
    $hasher = [System.Security.Cryptography.SHA256]::Create()
    try {
        $fingerprint = [BitConverter]::ToString($hasher.ComputeHash([Text.Encoding]::UTF8.GetBytes($metadata)))
    } finally {
        $hasher.Dispose()
    }
    [pscustomobject]@{
        Relative = $Relative
        Absolute = $absolute
        Files = $files.Count
        Bytes = $totalBytes
        Fingerprint = $fingerprint
    }
}

function Assert-CleanupGitBoundary {
    param([string]$WorkspaceRoot, [string[]]$Targets)

    $topLevel = & git --no-optional-locks -C $WorkspaceRoot rev-parse --show-toplevel
    if ($LASTEXITCODE -ne 0 -or [System.IO.Path]::GetFullPath($topLevel).TrimEnd('\', '/') -ne $WorkspaceRoot.TrimEnd('\', '/')) {
        throw '脚本必须位于目标 Git 工程的 scripts 目录中。'
    }
    if (-not $Targets.Count) { return }
    $tracked = @(& git --no-optional-locks -C $WorkspaceRoot ls-files --cached --others --exclude-standard -- $Targets)
    if ($LASTEXITCODE -ne 0) { throw '无法核对 Git 文件边界。' }
    if ($tracked.Count) { throw '清理目标包含已跟踪文件或未忽略的新文件，已停止。' }
}

function Get-CleanupPlan {
    param([string]$WorkspaceRoot)

    $targets = [System.Collections.Generic.List[string]]::new()
    foreach ($relative in @(
        '.preview-data/discard', '.preview-data/logs',
        'output/web', 'output/runtime', 'output/tools', 'output/releases',
        'output/rimo-import/smoke', 'output/rimo-import/browser-snapshots',
        'output/rimo-import/graph-browser-snapshots', 'node_modules/.vite', 'node_modules/.vite-temp'
    )) { $targets.Add($relative) }

    $screenshots = Resolve-CleanupPath $WorkspaceRoot 'output/evidence/rimo-import'
    if (Test-Path -LiteralPath $screenshots -PathType Container) {
        $documents = @('README.md', 'docs/原生原型平台/原生原型平台-开发记录.md',
            'docs/原生原型平台/原生原型平台-协作接续.md', 'docs/原生原型平台/原生原型平台-开发任务.md')
        $references = ($documents | ForEach-Object {
            $document = Resolve-CleanupPath $WorkspaceRoot $_
            if (Test-Path -LiteralPath $document) { Get-Content -LiteralPath $document -Raw -Encoding UTF8 }
        }) -join "`n"
        foreach ($image in Get-ChildItem -LiteralPath $screenshots -File -Filter '*.png') {
            if ($image.Name.StartsWith('batch-') -or $references.Contains($image.Name)) { continue }
            if ($image.Name -notmatch '^[a-z0-9-]+\.png$') { continue }
            $pageKey = $image.Name -replace '-business\.png$', '' -replace '\.png$', ''
            $replacement = Resolve-CleanupPath $WorkspaceRoot "output/evidence/rimo-import/batch-$pageKey.png"
            if ((Test-Path -LiteralPath $replacement -PathType Leaf) -and (Get-Item -LiteralPath $replacement).Length -gt 0) {
                $targets.Add("output/evidence/rimo-import/$($image.Name)")
            }
        }
    }
    Assert-CleanupGitBoundary $WorkspaceRoot $targets.ToArray()
    foreach ($relative in $targets | Sort-Object -Unique) {
        Get-CleanupEntry $WorkspaceRoot $relative
    }
}

function Assert-CleanupIdle {
    param([string]$WorkspaceRoot)

    $listeners = @(Get-NetTCPConnection -State Listen -ErrorAction Stop | Where-Object {
        $_.LocalPort -in @(4188, 5190, 5191, 5194, 5195)
    })
    $processes = @(Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction Stop | Where-Object {
        $_.CommandLine -and $_.CommandLine.IndexOf($WorkspaceRoot, [StringComparison]::OrdinalIgnoreCase) -ge 0
    })
    if ($listeners.Count -or $processes.Count) {
        throw '检测到 Preview 服务或工程 Node 进程。请先自行停止开发服务、构建和测试；脚本不会结束进程。'
    }
}

function Show-CleanupConfirmation {
    param([string]$WorkspaceRoot, [object[]]$Plan)

    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
    $form = New-Object System.Windows.Forms.Form
    try {
        $form.Text = 'Preview · 确认清理临时产物'
        $form.StartPosition = 'CenterScreen'
        $form.ClientSize = New-Object System.Drawing.Size(820, 560)
        $form.MinimumSize = New-Object System.Drawing.Size(620, 440)
        $form.Font = New-Object System.Drawing.Font('Microsoft YaHei UI', 10)
        $form.MaximizeBox = $false
        $form.MinimizeBox = $false

        $content = New-Object System.Windows.Forms.TextBox
        $content.Multiline = $true
        $content.ReadOnly = $true
        $content.ScrollBars = 'Both'
        $content.WordWrap = $false
        $content.Dock = 'Fill'
        $fileCount = ($Plan | Measure-Object Files -Sum).Sum
        $size = [math]::Round(($Plan | Measure-Object Bytes -Sum).Sum / 1MB, 2)
        $rows = $Plan | ForEach-Object { '{0}  ·  {1} 个文件  ·  {2:N2} MiB' -f $_.Relative, $_.Files, ($_.Bytes / 1MB) }
        $content.Text = @(
            "工程：$WorkspaceRoot", "共 $($Plan.Count) 项 / $fileCount 个文件 / $size MiB", '',
            '将永久删除下列产物，不经过回收站。',
            '保留源码、PRD、数据库、凭证、备份、原文归档、迁移清单和最终证据。',
            '只清理列出的 node_modules 缓存，不删除依赖。构建产物可重新生成。',
            '请先停止所有使用本工程的服务和构建。此确认不会提升系统或工具权限。', '',
            ($rows -join "`r`n")
        ) -join "`r`n"
        $buttons = New-Object System.Windows.Forms.FlowLayoutPanel
        $buttons.Dock = 'Bottom'
        $buttons.Height = 54
        $buttons.FlowDirection = 'RightToLeft'
        $cancel = New-Object System.Windows.Forms.Button
        $cancel.Text = '取消'
        $cancel.AutoSize = $true
        $cancel.DialogResult = 'Cancel'
        $confirm = New-Object System.Windows.Forms.Button
        $confirm.Text = '确认永久删除'
        $confirm.AutoSize = $true
        $confirm.DialogResult = 'OK'
        $buttons.Controls.Add($cancel)
        $buttons.Controls.Add($confirm)
        $form.Controls.Add($content)
        $form.Controls.Add($buttons)
        $form.CancelButton = $cancel
        $form.AcceptButton = $cancel
        return $form.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK
    } finally {
        $form.Dispose()
    }
}

function Invoke-GeneratedCleanup {
    param([string]$WorkspaceRoot, [switch]$ConfirmCleanup)

    $plan = @(Get-CleanupPlan $WorkspaceRoot)
    if (-not $plan.Count) { Write-Host '没有符合白名单的临时产物。'; return }
    $plan | Select-Object Relative, Files, @{ Name = 'MiB'; Expression = { [math]::Round($_.Bytes / 1MB, 2) } } | Format-Table -AutoSize | Out-Host
    if (-not $ConfirmCleanup) {
        Write-Host '只读预览：未删除任何文件。由你本机运行时加 -ConfirmCleanup 才显示确认弹窗。'
        return
    }
    Assert-CleanupIdle $WorkspaceRoot
    if (-not (Show-CleanupConfirmation $WorkspaceRoot $plan)) {
        Write-Host '已取消，未删除任何文件。'
        return
    }
    Assert-CleanupIdle $WorkspaceRoot
    $rechecked = @(Get-CleanupPlan $WorkspaceRoot)
    if (($plan | ConvertTo-Json -Compress -Depth 4) -cne ($rechecked | ConvertTo-Json -Compress -Depth 4)) {
        throw '确认期间清单或文件发生变化；未执行删除，请重新预览。'
    }
    $removedFiles = 0
    [long]$removedBytes = 0
    try {
        foreach ($target in $plan) {
            Assert-CleanupGitBoundary $WorkspaceRoot @($target.Relative)
            $current = Get-CleanupEntry $WorkspaceRoot $target.Relative
            if (-not $current -or $current.Fingerprint -cne $target.Fingerprint) {
                throw "删除前目标发生变化：$($target.Relative)"
            }
            $absolute = Resolve-CleanupPath $WorkspaceRoot $target.Relative
            Remove-Item -LiteralPath $absolute -Recurse -Force -ErrorAction Stop
            if (Test-Path -LiteralPath $absolute) { throw "目标未完全删除：$($target.Relative)" }
            $removedFiles += $target.Files
            $removedBytes += $target.Bytes
            Write-Host "已删除：$($target.Relative)"
        }
    } catch {
        Write-Warning "清理中止。已完整删除 $removedFiles 个文件；失败目标可能部分删除，其余目标未继续处理。"
        throw
    }
    $message = "清理完成：删除 $removedFiles 个文件，移除 $([math]::Round($removedBytes / 1MB, 2)) MiB 产物。"
    Write-Host $message
    [void][System.Windows.Forms.MessageBox]::Show($message, 'Preview · 清理结果', 'OK', 'Information')
}

if ($MyInvocation.InvocationName -ne '.') {
    Invoke-GeneratedCleanup -WorkspaceRoot (Split-Path -Parent $PSScriptRoot) -ConfirmCleanup:$ConfirmCleanup
}
