/** Original landing-page region classes and motion, with only current project
 * content. No fabricated customer logos, purchase statistics or other projects. */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ArrowUpRight, ChevronDown, Code2, Eye, Layers3, LockKeyhole } from 'lucide-react';
import { siteMotionTokens } from '@preview/ui';
import { useShowcaseText } from './showcase-locale';
import { useQuery } from '@tanstack/react-query';
import { createNativeClient } from '../../../../../packages/platform-client/src/client';
import { RuntimePage } from './RuntimePage';

export interface LandingPage {
  projectId: string;
  clientId: string;
  pageKey: string;
  title: string;
  category: string;
  access: string;
}
const link = (page: LandingPage) => `/pages/${page.projectId}/${page.clientId}/${page.pageKey}`;
const client = createNativeClient();
function LandingPreview({ page }: { page: LandingPage }) {
  const query = useQuery<{ entry: string; styles: string[] }>({
    queryKey: ['landing-preview', page.pageKey],
    queryFn: () => client.request(`/showcase/${page.projectId}/${page.clientId}/${page.pageKey}`),
    enabled: page.access === 'public',
    retry: false,
  });
  if (page.access !== 'public')
    return (
      <span className="showcase-landing-locked">
        <LockKeyhole size={32} />
      </span>
    );
  if (!query.data)
    return (
      <span className="showcase-landing-locked">
        <Layers3 size={32} />
      </span>
    );
  return (
    <span className="showcase-landing-native" inert aria-hidden="true">
      <span className="showcase-landing-native-inner">
        <RuntimePage entry={query.data.entry} styles={query.data.styles} />
      </span>
    </span>
  );
}
export function SiteLanding({ pages }: { pages: LandingPage[] }) {
  const text = useShowcaseText(),
    reduced = useReducedMotion();
  const [question, setQuestion] = useState(0);
  const first = pages[0];
  const questions = [
    ['公开页面需要登录吗？', '公开页面可直接查看预览、页面源码和业务说明。'],
    ['重要页面如何访问？', '重要页面需要登录，并由管理员授权给指定账号；仅登录不会自动获得权限。'],
    ['AI 可以读取需求吗？', 'AI 使用项目只读凭证读取业务需求。凭证通过私有配置提供，不写入页面网址。'],
    ['如何更新原型和需求？', '在本地修改后提交 Git，通过已配置的 GitHub 发布流程更新。网页仅提供读取。'],
  ];
  return (
    <main id="main">
      <section className="page_hero__7KFOs">
        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 12, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: reduced ? 0 : 0.6, ease: [...siteMotionTokens.ease.enter] }}
        >
          {text('原型与需求，')}
          <br />
          {text('在一个地方看清楚。')}
        </motion.h1>
        <motion.div
          className="page_heroLeadIn__Bamxl"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: reduced ? 0 : 0.18 }}
        >
          <p className="page_lead__vF_iL">
            {text('查看可交互的原生页面、页面源码与业务 PRD。公开页面直接浏览，重要页面由管理员授权。')}
          </p>
          <div className="page_actions___si5r">
            <Link className="page_primary__2CBMe" to={first ? link(first) : '/pages'}>
              {text('浏览原型页面')}
              <ArrowRight size={16} />
            </Link>
            <Link className="page_secondary__jzhTV" to="/docs/ai">
              {text('让 AI 读取业务需求')}
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>
      <section className="page_container__jZF7q landing_clips__26AfS">
        <div className="clip-sections_head__E7FqN">
          <div>
            <h2>{text('当前原型页面')}</h2>
            <p>{text('预览交互、查看源码，随页面阅读业务说明。')}</p>
          </div>
          <Link className="clip-sections_all__myGLe" to={first ? link(first) : '/pages'}>
            {text('浏览全部页面')}
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="clip-sections_grid__Vaqr3">
          {pages.map((page) => (
            <motion.div
              key={link(page)}
              className="clip-sections_tile__HQsJ8"
              initial={false}
              whileInView={{ opacity: 1 }}
            >
              <Link className="clip-sections_link__ywcUR" to={link(page)}>
                <span className="clip-sections_stage__fnaUL showcase-landing-preview">
                  <LandingPreview page={page} />
                </span>
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
                    {text(page.access === 'public' ? '直接查看预览、源码和页面说明' : '由管理员授权后查看')}
                  </span>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
      <section className="how-it-works_section__rivYt page_container__jZF7q">
        <div className="how-it-works_head__WdYQC">
          <h2>{text('同一页面，三种查看方式')}</h2>
          <Link className="how-it-works_link__lty1j" to="/docs/ai">
            {text('AI 接入')}
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="how-it-works_grid__LRsJ3">
          {[
            ['交互预览', '在原生页面中操作列表、表单与弹窗。', <Eye size={22} />],
            ['页面源码', '查看明确允许展示的 React 页面源码。', <Code2 size={22} />],
            ['业务需求', '阅读当前页面关联的 PRD，与原型一起评审。', <LockKeyhole size={22} />],
          ].map(([title, description, icon]) => (
            <article className="how-it-works_item__i_vjv" key={String(title)}>
              {icon}
              <h3>{text(String(title))}</h3>
              <p>{text(String(description))}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="page_container__jZF7q page_faqSection__mfM8r">
        <div className="page_faqIntro__KtkWD">
          <h2>{text('常见问题')}</h2>
          <Link className="page_textLink__pfFKU" to="/docs">
            {text('查看业务说明')}
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
      <footer className="site-footer_footer__UVYZj">
        <div className="site-footer_top__vpxM_">
          <div className="site-footer_intro__IJ5n1">
            <Link to="/" className="site-footer_brand__g39fu">
              <Layers3 size={22} />
              Preview
            </Link>
            <p>{text('原型页面、业务需求和 AI 只读资料入口。')}</p>
          </div>
          <nav className="showcase-landing-footer-links">
            <Link to={first ? link(first) : '/pages'}>{text('原型页面')}</Link>
            <Link to="/docs">{text('业务需求')}</Link>
            <Link to="/docs/ai">{text('AI 接入')}</Link>
          </nav>
        </div>
        <div className="showcase-landing-copyright">© 2026 Preview</div>
      </footer>
    </main>
  );
}
