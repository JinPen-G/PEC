import { describe, expect, it } from 'vitest';
import { documentDisplay } from './document-display';

describe('PRD reading mode', () => {
  it('keeps a short structured document intact even when a separate brief exists', () => {
    const full = '# 调拨\n\n## 规则\n跨站点与调度排程的完整规则。';
    const summary = '仅空闲车辆可调拨。目标据点必须适用所选服务。';
    expect(documentDisplay(full, summary)).toEqual({ long: false, summary: full });
    expect(documentDisplay(full, '')).toEqual({ long: false, summary: full });
  });
  it('accepts a structured overview only for a genuinely long document', () => {
    const full = '# 文档\n\n## 范围\n实际范围。\n\n## 接口\n' + '详细资料。'.repeat(1500);
    const summary = '## 使用场景\n明确用途。\n\n## 主要流程\n1. 读取\n2. 处理';
    expect(documentDisplay(full, summary)).toEqual({ long: true, summary });
    expect(documentDisplay(full, '一句话摘要。').summary).toContain('## 范围');
  });
  it('keeps short PRDs complete and ignores heading-like code when counting chapters', () => {
    const source = '# 车辆管理\n\n## 用途\n管理车辆。\n\n```md\n' + '## example\n'.repeat(15) + '```';
    expect(documentDisplay(source)).toEqual({ long: false, summary: source });
  });
  it('selects intact business sections for long PRDs and keeps version history in the full document', () => {
    const table = '| 字段 | 规则 |\n| --- | --- |\n| 状态 | 未知值不得替换为成功。 |';
    const source =
      '# 车辆控制台\n\n说明。\n\n## 版本更新记录\nv1.0\n\n## 范围\n仅展示汽车。\n\n## 核心约束\n' +
      table +
      '\n\n## 接口明细\n' +
      '长篇接口资料。'.repeat(1000);
    const result = documentDisplay(source);
    expect(result.long).toBe(true);
    expect(result.summary).toContain(table);
    expect(result.summary).toContain('仅展示汽车。');
    expect(result.summary).not.toContain('v1.0');
    expect(result.summary).not.toContain('长篇接口资料');
    expect(source).toContain('v1.0');
  });
  it('treats dense tables as long without cutting rows into an incomplete summary', () => {
    const source = '# 字段\n\n## 字段表\n| 字段 | 规则 |\n| --- | --- |\n' + '| 开关 | 未知 |\n'.repeat(40);
    const result = documentDisplay(source);
    expect(result.long).toBe(true);
    expect(result.summary).toContain(source.slice(source.indexOf('## 字段表')).trim());
  });
});
