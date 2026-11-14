# Preview 更新与缓存

维护日期：2026-11-12。完整自动部署已在本地隔离环境验证；真实 Linux/systemd、nginx、TLS、SSH 与 GitHub Secrets 尚待现场验证。

## 日常更新

入口 HTML、版本信息、业务文档和身份接口逐次读取。`assets` 下带构建哈希的公共 JS、CSS、字体及图片使用一年不可变缓存，同一地址可直接复用，新发行按新的哈希地址加载。`page-assets` 使用私有条件缓存，每次向服务端复核页面权限和内容 ETag，相同版本返回 304，撤权返回对应拒绝响应。

首次配置完成后，本地修改并推送 main 即触发 [.github/workflows/release.yml](../../../.github/workflows/release.yml)：锁定提交 → 安装锁定构建依赖 → 文档/分层/类型与来源检查 → web/API构建 → 部署冒烟 → 打包并上传 → SSH部署。其他分支不会覆盖生产。仓库变量 PREVIEW_DEPLOY_ENABLED 不为 true 时只生成可下载产物。

schemaVersion 3 的发行包只有 manifest.json、web、runtime 和 project-content。runtime 包含编译后的 server/admin/migrate、注册声明、运行合同和第三方许可；Node依赖已经打包，服务器无需执行 npm install。所有文件及运行时共同参与 SHA-256 和 releaseId。数据库、凭证、.env、源码研发四册及原始项目目录不进入包。业务资料按显式清单发布，只能通过受控API读取。

部署先检查压缩包路径、类型、大小、清单及散列，再取独占锁、核对序号与数据库兼容。维护标记让nginx返回503和Retry-After；停止服务后用SQLite backup获得私有快照，执行声明允许的增量迁移，启动候选API，并核对releaseId、协议、数据库版本和首页。健康通过才原子更新current.json并解除维护。API、页面和业务资料始终取同一候选目录，不在请求期间混合切换。

普通完整更新也会短暂进入维护模式；不承诺零停机。后台每30秒检查版本，提示用户保存表单并手动刷新，不强制打断表单。全局散列资产保留供旧标签页加载，私有源码和资料仍由当前版本与实时授权决定。

## 首次服务器准备

个人测试沿用独立的Preview服务与SQLite。首次可将入口设为`http://localhost:8088`，安装器会让Nginx仅监听服务器回环地址；通过SSH隧道访问，账号请求随SSH加密传输。应用也兼容普通HTTP下的UI随机标识和主动复制操作。公网及团队入口使用HTTPS。

```bash
sudo bash deploy/server/install.sh http://localhost:8088 /usr/bin/node 5190
```

第三个参数是独立API端口，默认5190，可按现场占用调整。HTTP入口支持独立端口，必须与API端口不同。HTTPS辅助流程使用标准443端口。域名、对外端口和浏览器地址须与publicOrigin一致，来源不匹配会拒绝登录和写操作。

在自己的电脑保持SSH隧道连接，浏览器打开`http://localhost:8088`。

```bash
ssh -N -L 8088:127.0.0.1:8088 <ssh-user>@<server>
```

安装前核对现有服务、Node版本和所选端口。独立Nginx配置与服务只作用于Preview。当前选择systemd运行方式，容器化属于后续明确选用时的部署适配。

当前支持Ubuntu/Debian类Linux，Node.js 24.13.0或更新24.x、systemd、nginx、tar、sudo与visudo。HTTPS辅助脚本使用certbot、python3-certbot-nginx及certbot.timer。发行暂不自动升级系统Node、系统软件或部署启动器。

本地执行下列命令，或从GitHub Actions下载preview-server-setup产物到服务器解压。初始化产物包含deploy/server与output/tools两个目录，应保持它们的相对位置。

```powershell
npm run build:web
npm run build:runtime
npm run release:smoke
npm run release:package
```

服务器首次安装（需要root，域名换成实际域名）：

```bash
sudo bash deploy/server/install.sh https://preview.example.com /usr/bin/node
sudo bash deploy/server/configure-tls.sh certificate-contact@example.com
```

域名A记录须指向服务器，80/443可达。TLS脚本申请证书、保留nginx的维护判断、启用自动续期并运行renew --dry-run；它只有在真实环境执行成功后才代表证书可用。安装器不下载安装Node或更改其他业务服务，遇到现有Preview配置时拒绝覆盖。已有Preview服务或数据需先停机、备份并核对目录，再迁入独立数据目录；不要用新安装覆盖旧现场。

生成的服务账号为preview；/opt/preview/scripts由root维护，/opt/preview/releases与state由preview维护。配置在/etc/preview/deploy.json，含独立安装根、存储根、固定publicOrigin、API端口及Node可执行路径。API仅监听127.0.0.1，入口统一经nginx。Nginx覆盖客户端提交的X-Forwarded-For，稳定启动器仅信任回环代理提供的单一客户端IP。保护以下目录，不能通过nginx alias/root公开：

| 目录                      | 用途                                    |
| ------------------------- | --------------------------------------- |
| /opt/preview/releases     | 完整版本和current.json；账号库不在这里  |
| /opt/preview/state        | 部署锁、事务日志和维护标记              |
| /var/lib/preview/data     | 私有platform.sqlite、WAL与会话/授权数据 |
| /var/lib/preview/backups  | 迁移前备份及失败数据库副本              |
| /var/lib/preview/media    | 独立保存的休息音频及封面                |
| /var/lib/preview/incoming | CI上传压缩包                            |

为preview账号安装专用SSH公钥到/var/lib/preview/.ssh/authorized_keys，.ssh权限700、authorized_keys权限600、所有者preview。建议为公钥添加restrict选项，禁用端口转发和PTY。私钥只保存在GitHub Secrets；不要上传仓库。安装器仅授予preview免密start/stop preview.service，不授予通用root命令。

GitHub仓库设置：

| 类型                | 名称                    | 值                         |
| ------------------- | ----------------------- | -------------------------- |
| Repository variable | PREVIEW_DEPLOY_ENABLED  | 完成准备后设true           |
| Secret              | PREVIEW_SSH_DESTINATION | preview@实际主机名或IPv4   |
| Secret              | PREVIEW_SSH_KEY         | 专用SSH私钥全文            |
| Secret              | PREVIEW_KNOWN_HOSTS     | 经独立核对的服务器公钥记录 |

deploy job使用production environment；需要无人值守时，环境不能设置每次手工批准门槛。服务器的非交互PATH须能找到Node，配置中的Node路径须与系统实际路径一致。SSH固定StrictHostKeyChecking，不在CI临时信任ssh-keyscan结果。

首次main推送或手动运行Deploy会建立空库并启动服务，无默认管理员。首次版本完成后，在服务器以preview账号初始化管理员：

```bash
sudo -u preview bash
read -rsp '管理员密码（至少8字符）: ' PREVIEW_ADMIN_PASSWORD
export PREVIEW_ADMIN_PASSWORD
release_id=$(node -p "JSON.parse(require('fs').readFileSync('/opt/preview/releases/current.json','utf8')).releaseId")
node "/opt/preview/releases/$release_id/runtime/admin.mjs" --data /var/lib/preview/data --username owner --name 管理员 --with-projects
unset PREVIEW_ADMIN_PASSWORD
exit
```

密码不进入命令参数、日志或Git；普通首次初始化命令在已有管理员时拒绝。正式浏览器bootstrap关闭。

`--with-projects`同时建立工程已登记的项目，使用清单中的初始菜单与访问范围。带该选项重复执行时验证已有管理员密码，只补缺少的项目，现有名称、菜单、归档状态和授权继续由数据库管理。

如果沿用本机配置，先通过`backup.mjs backup`取得一致SQLite备份，单独传入服务器的私有目录。首次发行前使用`backup.mjs restore --backup <snapshot.sqlite> --data /var/lib/preview/data --service-stopped`恢复到空目录；有数据库的目标会拒绝覆盖。该路径保留原账号、项目、菜单与授权，管理员使用原账号登录。数据库、音乐与公开发行包分开传输。

休息媒体仅接受`media/rest-track.mp3`与`media/rest-artwork.jpg`两个固定文件。通过preview账号写入私有media目录后，完整服务在首页注入固定的同源媒体地址，并提供音频Range请求；发行更新和代码回退沿用该目录。文件缺失时使用本地音频选择和内置封面，CSP允许本地blob音频。原录音及封面继续按已确认的分发范围使用。

```bash
sudo install -o preview -g preview -m 600 <audio.mp3> /var/lib/preview/media/rest-track.mp3
sudo install -o preview -g preview -m 600 <artwork.jpg> /var/lib/preview/media/rest-artwork.jpg
```

已有安装需同步升级root维护的supervisor工具，才能把媒体目录与可信代理配置传入API；日常应用发行继续由原部署事务执行。媒体与SQLite均纳入私有备份安排，恢复时分别校验文件。

## 回退、恢复与诊断

可在Actions的Run workflow中选择rollback或recover，也可服务器执行：

```bash
sudo -u preview node /opt/preview/scripts/deploy.mjs status
sudo -u preview node /opt/preview/scripts/deploy.mjs rollback
sudo -u preview node /opt/preview/scripts/deploy.mjs recover
systemctl status preview.service
journalctl -u preview.service --since today
```

rollback只允许上一完整发行，核对当前数据库位于旧API支持区间，生成更高序号，再验证旧API。它保留当前账号、授权和已撤销凭证，不把升级前备份当作正常代码回退的数据源。超出兼容区间会拒绝；删除/重命名字段等破坏性迁移须另行计划，不自动执行。

激活前失败时，保持维护、停止候选服务，将失败数据库保留到backups，恢复升级前快照并启动旧版；此时公网写入已隔离，恢复不会抹掉升级期间用户提交的操作。首次安装失败无旧版可启动，保持维护，修复后重试。激活后已经对外运行的版本不自动恢复旧数据。上传损坏、过期任务及预检失败不会停止当前服务。

进程中断留有transaction.json时，recover依据current.json判断是否已经提交：已提交则保留新数据，未提交则恢复私有快照。开机preview-recovery.service先做停机恢复，随后preview.service启动并在健康后解除维护；故障恢复失败继续503。遗留锁仅在原进程已退出或操作系统启动标识已变化时清除，不直接删除活动锁。

不要直接对schemaVersion 3使用release:activate或旧web回退命令；它们无法完成服务/迁移事务，CLI已拒绝这种操作。部署启动器、systemd或nginx自身变更需要审阅后单独升级，不让上传代码修改root服务配置。

当前不自动清理历史发行、压缩包、失败暂存或数据库备份，以保留恢复证据；上线后按业务数据保留策略安排容量与异机备份。生产验收须实际确认：main推送部署成功、HTTPS登录与授权、更新提示、一次健康失败恢复、一次兼容回退、服务重启及证书续期。未执行这些外部动作时，不宣称服务器自动更新已经启用。
