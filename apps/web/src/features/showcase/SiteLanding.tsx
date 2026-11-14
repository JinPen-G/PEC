/** Platform homepage: Animate UI composition with Preview copy and MCP entry points.
 * Demonstrations are independent of business packages and do not make live MCP requests. */
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Bot, Code2, Component, FileText, ShieldCheck } from 'lucide-react';
import { Button as AnimatedButton } from '@animate-ui/react/primitives/buttons/button';
import {
  ReducedMotionConfig,
  ease,
  useShouldReduceMotion,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';
import {
  LandingAgentDemo,
  LandingCommand,
  LandingHeroTitle,
  LandingOrbit,
  type LandingCommandOption,
  type LandingScenario,
} from '@preview/ui/landing';
import { useShowcaseText } from './showcase-locale';
import { createLandingCommands } from './landing-copy';

const REPOSITORY = 'https://github.com/JinPen-G/Preview';
function Actions({
  primary = '接入 MCP',
  secondary = '浏览页面',
  secondaryTo = '/pages',
}: {
  primary?: string;
  secondary?: string;
  secondaryTo?: string;
}) {
  const text = useShowcaseText();
  return (
    <div className="home-actions">
      <AnimatedButton asChild className="home-button home-button-primary">
        <Link to="/docs/ai">{text(primary)}</Link>
      </AnimatedButton>
      <AnimatedButton asChild className="home-button home-button-secondary">
        <Link to={secondaryTo}>{text(secondary)}</Link>
      </AnimatedButton>
    </div>
  );
}
export function SiteLanding({ openingReady = true }: { openingReady?: boolean }) {
  const text = useShowcaseText();
  const reduce = useShouldReduceMotion();
  const reveal = useTempoTransition({ duration: 0.7, ease: ease.out });
  const ready = openingReady || reduce;
  const rise = (index: number) => ({
    initial: false as const,
    animate: ready
      ? { opacity: 1, y: 0, filter: 'blur(0px)' }
      : { opacity: 0, y: reduce ? 0 : 20, filter: 'blur(10px)' },
    transition: { ...reveal, delay: index * 0.09 },
  });
  const commands: LandingCommandOption[] = createLandingCommands(window.location.origin);
  const scenarios: LandingScenario[] = [
    {
      id: 'requirements',
      label: text('读取需求'),
      preview: 'read',
      prompt: text('连接 Preview MCP，找到相关需求，先说明规则和验收条件。'),
      steps: [
        text('调用 `get_project_context`，确认可读范围和资料版本'),
        text('用 `search_requirements` 查找，再用 `read_requirement` 读原文'),
        text('核对字段、流程、异常和验收条件，不用演示覆盖需求'),
        text('保留出处与版本，冲突先向负责人确认'),
      ],
      result: text('示例：需求已定位，带着原文与验收条件继续开发'),
    },
    {
      id: 'source',
      label: text('读取源码'),
      preview: 'source',
      prompt: text('找到合适的组件、区块或页面，把源码和依赖带到我的工程。'),
      steps: [
        text('调用 `list_components` 查找可用组件、区块和页面'),
        text('用 `get_component` 读取文件清单与依赖'),
        text('按 `read_component_file` 读完整源码、样式与辅助模块'),
        text('核对来源、许可和版本，再接入已有工程'),
      ],
      result: text('示例：源码与依赖已整理，可在本地按需接入'),
    },
    {
      id: 'governance',
      label: text('工程治理'),
      preview: 'governance',
      prompt: text('读取工程治理指引，说明如何采用，再检查我的工程。'),
      steps: [
        text('用 `list_governance_rules` 和 `read_governance_rule` 读完规范'),
        text('说明需求确认、任务拆分、协作和验证的方法'),
        text('询问是否采用，已有选择沿用；本地需求文档按需建立'),
        text('按证据自查，授权内同步 Git 并清理自产临时文件'),
      ],
      result: text('示例：规则可独立用于任何工程，采用方式由你决定'),
    },
    {
      id: 'updates',
      label: text('查看更新'),
      preview: 'updates',
      prompt: text('继续开发前，先检查更新，告诉我哪些内容需要重新核对。'),
      steps: [
        text('调用 `read_project_updates`，先读 `source: platform`'),
        text('涉及已发布需求时，再读 `source: project` 的更新'),
        text('核对变化的版本，重新读取受影响的需求和源码'),
        text('更新任务与接续，更新记录不能替代需求原文'),
      ],
      result: text('示例：变化已核对，按当前依据继续任务'),
    },
  ];
  return (
    <ReducedMotionConfig>
      <main id="main" className="home-landing">
        <section className="home-hero">
          <motion.div className="home-framework-pill" {...rise(0)}>
            <Link to="/docs">
              <Code2 size={14} />
              React
            </Link>
            <Link to="/docs/ai">
              <Bot size={14} />
              MCP
            </Link>
          </motion.div>
          <LandingHeroTitle
            ready={ready}
            prefix={text('让团队和 Agent')}
            phrases={[text('读懂需求'), text('复用源码'), text('组织开发')]}
            suffix={text('从预览，走向实现。')}
          />
          <motion.p className="home-lead" {...rise(5)}>
            {text(
              '浏览组件、区块和完整页面，体验交互、阅读需求、复用源码。连接 MCP，让 Agent 获取上下文与工程治理指引。',
            )}
          </motion.p>
          <motion.div className="home-hero-connect" {...rise(6)}>
            <LandingCommand options={commands} text={text} />
            <Actions />
          </motion.div>
          <motion.div className="home-capabilities" {...rise(7)}>
            <span>
              <Component size={16} />
              {text('组件与页面')}
            </span>
            <span>
              <FileText size={16} />
              {text('需求与源码')}
            </span>
            <span>
              <ShieldCheck size={16} />
              {text('工程治理')}
            </span>
          </motion.div>
        </section>
        <LandingOrbit text={text} />
        <section className="home-ai-section" data-slot="home-ai" aria-labelledby="home-agent-heading">
          <span className="home-ai-badge">
            <Bot size={14} />
            Preview MCP
          </span>
          <h2 id="home-agent-heading">{text('把开发的上下文，交给 Agent。')}</h2>
          <p className="home-lead">
            {text(
              '用自然语言提出任务，让 Agent 读取需求原文、获取完整源码，或学习工程治理方法。先核对依据，再在你的工程中开发。',
            )}
          </p>
          <LandingAgentDemo key={text('读取需求')} scenarios={scenarios} text={text} />
          <div className="home-connect-bottom">
            <p>{text('适用于 Codex、Cursor、Claude Code 等支持 MCP 的开发工具。')}</p>
            <LandingCommand options={commands} text={text} />
            <span className="home-connect-note">{text('在开发工具中配置 MCP 地址与项目读取凭证。')}</span>
            <Actions
              primary="阅读接入文档"
              secondary="查看工程治理"
              secondaryTo="/docs/ai?anchor=%E5%B7%A5%E7%A8%8B%E6%B2%BB%E7%90%86"
            />
          </div>
        </section>
        <footer className="home-footer">
          <p>
            {text('由')}{' '}
            <a href="https://github.com/JinPen-G" target="_blank" rel="noreferrer">
              JinPen-G
            </a>{' '}
            {text('制作。源码发布在')}{' '}
            <a href={REPOSITORY} target="_blank" rel="noreferrer">
              GitHub
            </a>
            。
          </p>
          <nav aria-label={text('页脚导航')}>
            <Link to="/docs">{text('文档')}</Link>
            <a href={REPOSITORY} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <Link to="/docs/changelog">{text('更新记录')}</Link>
          </nav>
        </footer>
      </main>
    </ReducedMotionConfig>
  );
}
