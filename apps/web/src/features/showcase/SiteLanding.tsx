/** Original landing-page region classes and motion, with only current project
 * content. No fabricated customer logos, purchase statistics or other projects. */
import { useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  ChevronDown,
  Component,
  Compass,
  FileText,
  Gauge,
  Layers3,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';
import { siteMotionTokens } from '@preview/ui';
import { useShowcaseText } from './showcase-locale';
import { useQuery } from '@tanstack/react-query';
import { createNativeClient } from '../../../../../packages/platform-client/src/client';
import { RuntimePage } from './RuntimePage';
import { selectLandingPages, type LandingPage } from './landing-pages';
const link = (page: LandingPage) => `/pages/${page.projectId}/${page.clientId}/${page.pageKey}`;
const client = createNativeClient();
const principles: [string, string, ReactNode][] = [
  ['源自实践', '方法与规范来自真实的行业项目和一线产品工作。', <Compass size={22} />],
  ['由 Agent 驱动', '为人与 Agent 共同协作的工作流而设计。从撰写需求到提交代码。', <Bot size={22} />],
  ['为速度而设计', '减少沟通噪音和理解偏差，让团队专注、快速地交付。', <Gauge size={22} />],
];
const toolkit: [string, string, ReactNode][] = [
  ['组件库', '界面组件与业务区块，开箱即用。Agent 直接调用，交付风格始终一致。', <Component size={22} />],
  ['需求库', '需求、规则与功能关系统一管理，每一条都能追溯到原文。', <FileText size={22} />],
  ['AI 工程治理', '覆盖需求、编码、验证到交付的开发规范。Agent 接入即遵循。', <ShieldCheck size={22} />],
];
const questions = [
  ['这是什么？', '面向团队与 Agent 的产品中心，汇集行业产品、业务逻辑、组件库、需求库和 AI 工程治理规范。'],
  [
    '什么是 AI 工程治理？',
    '一套规范 AI 开发全过程的规则：如何提需求、写代码、做验证。接入后由 Agent 自动遵循，不熟悉 AI 的开发者也能专业交付。',
  ],
  [
    '我的 AI 工具能用吗？',
    '可以。Claude Code、Cursor、Codex 等支持 MCP 的工具，接入后即可读取治理规范、业务需求和功能关系。',
  ],
  ['业务逻辑可信吗？', '每条逻辑关系都标注需求原文出处，AI 提炼的要点可随时对照原文核实。'],
  ['谁可以访问？', '公开内容直接浏览；其余内容由管理员按账号和项目授权。'],
  ['产品演示中的数据是真实的吗？', '演示数据均为模拟，任何操作都不会影响真实业务。'],
];
function LandingPreview({ page }: { page: LandingPage }) {
  const host = useRef<HTMLSpanElement>(null);
  const visible = useInView(host, { margin: '120px 0px' });
  const text = useShowcaseText();
  const query = useQuery<{ entry: string; styles: string[] }>({
    queryKey: ['landing-preview', page.projectId, page.clientId, page.pageKey],
    queryFn: ({ signal }) =>
      client.request(`/showcase/${page.projectId}/${page.clientId}/${page.pageKey}`, { signal }),
    enabled: visible && page.access === 'public',
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
  return (
    <span ref={host} className="showcase-landing-native" inert aria-hidden="true">
      {visible && query.data ? (
        <span className="showcase-landing-native-inner">
          <RuntimePage entry={query.data.entry} styles={query.data.styles} />
        </span>
      ) : (
        <span className="showcase-landing-locked">
          {query.error ? (
            text('预览暂不可用')
          ) : page.access === 'public' ? (
            <Layers3 size={32} />
          ) : (
            <LockKeyhole size={32} />
          )}
        </span>
      )}
    </span>
  );
}
function FeatureSection({
  title,
  action,
  to,
  items,
  spaced,
}: {
  title: string;
  action: string;
  to: string;
  items: [string, string, ReactNode][];
  spaced?: boolean;
}) {
  const text = useShowcaseText();
  return (
    <section
      className={`how-it-works_section__rivYt page_container__jZF7q${spaced ? ' landing_clips__26AfS' : ''}`}
    >
      <div className="how-it-works_head__WdYQC">
        <h2>{text(title)}</h2>
        <Link className="how-it-works_link__lty1j" to={to}>
          {text(action)}
          <ArrowRight size={16} />
        </Link>
      </div>
      <div className="how-it-works_grid__LRsJ3">
        {items.map(([name, description, icon]) => (
          <article className="how-it-works_item__i_vjv" key={name}>
            {icon}
            <h3>{text(name)}</h3>
            <p>{text(description)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
export function SiteLanding({
  pages,
  projectId = pages[0]?.projectId ?? '',
  projectMenu,
}: {
  pages: LandingPage[];
  projectId?: string;
  projectMenu?: ReactNode;
}) {
  const text = useShowcaseText(),
    reduced = useReducedMotion();
  const [question, setQuestion] = useState(0);
  const featured = selectLandingPages(pages, projectId);
  const explore = `/pages${projectId ? `?project=${encodeURIComponent(projectId)}` : ''}`;
  return (
    <main id="main">
      <section className="page_hero__7KFOs">
        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 12, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: reduced ? 0 : 0.6, ease: [...siteMotionTokens.ease.enter] }}
        >
          {text('为团队和 Agent 打造的')}
          <br />
          {text('产品中心。')}
        </motion.h1>
        <motion.div
          className="page_heroLeadIn__Bamxl"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: reduced ? 0 : 0.18 }}
        >
          <p className="page_lead__vF_iL">{text('专为规划和构建产品而设计，为 AI 时代而生。')}</p>
          <div className="page_actions___si5r">
            <Link className="page_primary__2CBMe" to={explore}>
              {text('探索产品')}
              <ArrowRight size={16} />
            </Link>
            <Link className="page_secondary__jzhTV" to="/docs/ai">
              {text('接入 MCP')}
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>
      <FeatureSection
        title="新一代的产品工具"
        action="了解 AI 接入"
        to="/docs/ai"
        items={principles}
        spaced
      />
      <section
        className="page_container__jZF7q landing_clips__26AfS"
        aria-labelledby="featured-products-heading"
      >
        <div className="clip-sections_head__E7FqN">
          <div>
            <h2 id="featured-products-heading">{text('产品与业务逻辑')}</h2>
            <p>{text('从行业场景到每条规则的前因后果，一图看清。产品可直接体验，逻辑逐条溯源。')}</p>
          </div>
          <div className="showcase-product-section-actions">
            {projectMenu}
            <Link className="clip-sections_all__myGLe" to={explore}>
              {text('查看全部产品')}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="clip-sections_grid__Vaqr3">
          {featured.map((page) => (
            <motion.div
              key={link(page)}
              className="clip-sections_tile__HQsJ8 showcase-landing-tile"
              initial={false}
              whileInView={{ opacity: 1 }}
            >
              <span className="clip-sections_stage__fnaUL showcase-landing-preview">
                <LandingPreview page={page} />
              </span>
              <Link className="clip-sections_link__ywcUR showcase-landing-page-link" to={link(page)}>
                <span className="clip-sections_caption__BDu4x">
                  <span className="clip-sections_nameRow__oti5a">
                    <span className="clip-sections_name__mnc5h">{text(page.title)}</span>
                    <span
                      className={
                        page.access === 'public' ? 'clip-sections_free__74m6j' : 'pro-badge_badge__4HMgK'
                      }
                    >
                      {text(page.access === 'public' ? '公开' : '需授权')}
                    </span>
                  </span>
                  <span className="clip-sections_hint__1bJxU">
                    {text(page.access === 'public' ? '可交互演示，逻辑可溯源' : '授权后可见')}
                  </span>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
        {!featured.length && <p className="showcase-muted">{text('暂无公开精选，请前往产品目录查看。')}</p>}
      </section>
      <FeatureSection title="构建所需，一应俱全" action="阅读文档" to="/docs" items={toolkit} />
      <section className="page_container__jZF7q page_faqSection__mfM8r">
        <div className="page_faqIntro__KtkWD">
          <h2>{text('常见问题')}</h2>
          <Link className="page_textLink__pfFKU" to="/docs">
            {text('阅读文档')}
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="page_faqList__Z9LYs">
          {questions.map(([title, description], index) => (
            <div className="showcase-faq-item" key={title}>
              <button
                aria-expanded={question === index}
                onClick={() => setQuestion(question === index ? -1 : index)}
              >
                {text(title)}
                <motion.span
                  animate={{ rotate: question === index ? 180 : 0 }}
                  transition={siteMotionTokens.spring.snappy}
                >
                  <ChevronDown size={17} />
                </motion.span>
              </button>
              {question === index && <p>{text(description)}</p>}
            </div>
          ))}
        </div>
      </section>
      <section className="page_finalSection__VX7vN">
        <div className="page_container__jZF7q page_finalInner__InEtC">
          <div className="page_finalCopy__eUcGt">
            <h2>
              {text('为未来而建，')}
              <br />
              {text('今天即可使用。')}
            </h2>
            <p>{text('接入一次，产品、需求与规范随 Agent 同行。')}</p>
            <div className="page_finalActions__96kLD">
              <Link className="page_finalPrimary__Vdlf_" to={explore}>
                {text('探索产品')}
                <ArrowRight size={16} />
              </Link>
              <Link className="page_finalSecondary__j7s1j" to="/docs/ai">
                {text('接入 MCP')}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <footer className="site-footer_footer__UVYZj">
        <div className="site-footer_top__vpxM_">
          <div className="site-footer_intro__IJ5n1">
            <Link to="/" className="site-footer_brand__g39fu">
              <Layers3 size={22} />
              Preview
            </Link>
            <p>{text('为团队和 Agent 打造的产品中心。')}</p>
          </div>
          <nav className="showcase-landing-footer-links">
            <Link to={explore}>{text('产品')}</Link>
            <Link to="/docs/graph">{text('需求图谱')}</Link>
            <Link to="/docs">{text('文档')}</Link>
            <Link to="/docs/ai">{text('AI 接入')}</Link>
          </nav>
        </div>
        <div className="showcase-landing-copyright">© 2026 Preview</div>
      </footer>
    </main>
  );
}
