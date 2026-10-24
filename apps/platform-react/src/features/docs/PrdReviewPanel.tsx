import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { platformApi } from '@/data/platform-api';
import { Button, Empty, Flex, Input, Segmented, Select, Tag, Tooltip, Typography } from '@/ui/ant';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CloseOutlined,
  DragOutlined,
  FileTextOutlined,
  LinkOutlined,
  OrderedListOutlined,
  SearchOutlined,
} from '@/ui/ant/icons';
import { appRouteUrl } from '@/features/routes/app-url';
import { MarkdownReader } from './MarkdownReader';
import { resolveDocumentAssetPath, type MarkdownHeading } from './markdown';

const { Text, Title } = Typography;

export type PrdPanelMode = 'split' | 'overlay';

interface PrdDocumentOption {
  path: string;
  title?: string;
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
}

export function PrdReviewPanel({
  open,
  projectId,
  pageTitle,
  documentPath,
  documentAnchor,
  documents,
  mode,
  onModeChange,
  onClose,
}: {
  open: boolean;
  projectId: string;
  pageTitle: string;
  documentPath: string;
  documentAnchor?: string;
  documents: PrdDocumentOption[];
  mode: PrdPanelMode;
  onModeChange: (mode: PrdPanelMode) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const options = useMemo(() => {
    const values = new Map<string, PrdDocumentOption>();
    for (const item of documents) if (item.path) values.set(item.path, item);
    if (documentPath && !values.has(documentPath)) values.set(documentPath, { path: documentPath });
    return [...values.values()];
  }, [documentPath, documents]);
  const [activeDocument, setActiveDocument] = useState(documentPath);
  const [headings, setHeadings] = useState<MarkdownHeading[]>([]);
  const [outlineVisible, setOutlineVisible] = useState(false);
  const [activeHeading, setActiveHeading] = useState(documentAnchor || '');
  const [requestedAnchor, setRequestedAnchor] = useState(documentAnchor || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchStatus, setSearchStatus] = useState({ index: 0, count: 0 });
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState(() => {
    try {
      const value = JSON.parse(localStorage.getItem(`prd-review-position:${projectId}`) || 'null');
      return Number.isFinite(value?.x) && Number.isFinite(value?.y) ? value : { x: 0, y: 0 };
    } catch {
      return { x: 0, y: 0 };
    }
  });
  const panelRef = useRef<HTMLElement>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const matchesRef = useRef<HTMLElement[]>([]);
  const positionRef = useRef(position);
  const query = useQuery({
    queryKey: ['platform', 'document', projectId, activeDocument],
    queryFn: () => platformApi.loadDocument(projectId, activeDocument),
    enabled: open && Boolean(projectId && activeDocument),
  });
  const resolveAssetUrl = useCallback(
    (assetPath: string) =>
      platformApi.getDocumentAssetUrl(projectId, resolveDocumentAssetPath(activeDocument, assetPath)),
    [activeDocument, projectId],
  );
  const resolveDocumentUrl = useCallback(
    (documentPath: string, anchor = '') => {
      const search = new URLSearchParams({ doc: documentPath });
      if (anchor) search.set('anchor', anchor);
      return appRouteUrl(`/p/${projectId}/docs?${search.toString()}`);
    },
    [projectId],
  );

  useEffect(() => {
    if (!open || mode !== 'overlay') return;
    function constrainOverlayPosition() {
      const workspace = panelRef.current?.parentElement?.getBoundingClientRect();
      const panel = panelRef.current?.getBoundingClientRect();
      if (!workspace || !panel) return;
      const current = positionRef.current;
      const baseLeft = panel.left - current.x;
      const baseTop = panel.top - current.y;
      const nextPosition = {
        x: Math.min(
          Math.max(current.x, workspace.left + 8 - baseLeft),
          workspace.right - panel.width - 8 - baseLeft,
        ),
        y: Math.min(
          Math.max(current.y, workspace.top + 8 - baseTop),
          workspace.bottom - panel.height - 8 - baseTop,
        ),
      };
      if (nextPosition.x === current.x && nextPosition.y === current.y) return;
      positionRef.current = nextPosition;
      setPosition(nextPosition);
    }
    const frame = window.requestAnimationFrame(constrainOverlayPosition);
    window.addEventListener('resize', constrainOverlayPosition);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', constrainOverlayPosition);
    };
  }, [mode, open]);

  useEffect(() => {
    if (!open || !readerRef.current || !headings.length) return;
    const reader = readerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)[0];
        if (current?.target.id) setActiveHeading(current.target.id);
      },
      { root: reader, rootMargin: '0px 0px -72% 0px', threshold: [0, 1] },
    );
    for (const heading of headings) {
      const element = reader.querySelector(`#${CSS.escape(heading.id)}`);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [headings, open, query.data]);

  useEffect(() => {
    if (!outlineVisible || !activeHeading) return;
    outlineRef.current
      ?.querySelector<HTMLElement>(`[data-heading-id="${CSS.escape(activeHeading)}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeHeading, outlineVisible]);

  if (!open) return null;

  function clearSearchMarks() {
    for (const mark of matchesRef.current) {
      const parent = mark.parentNode;
      if (!parent) continue;
      parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
      parent.normalize();
    }
    matchesRef.current = [];
  }

  function updateSearch(value: string) {
    setSearchTerm(value);
    clearSearchMarks();
    if (!value.trim() || !readerRef.current) {
      setSearchStatus({ index: 0, count: 0 });
      return;
    }
    const article = readerRef.current.querySelector('.markdown-body');
    if (!article) return;
    const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!node.textContent?.trim() || parent?.closest('script, style, mark'))
          return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    const needle = value.toLocaleLowerCase();
    const marks: HTMLElement[] = [];
    for (const node of nodes) {
      const source = node.data;
      const lowered = source.toLocaleLowerCase();
      let cursor = 0;
      let match = lowered.indexOf(needle);
      if (match < 0) continue;
      const fragment = document.createDocumentFragment();
      while (match >= 0) {
        fragment.append(source.slice(cursor, match));
        const mark = document.createElement('mark');
        mark.dataset.prdSearch = '1';
        mark.textContent = source.slice(match, match + value.length);
        fragment.append(mark);
        marks.push(mark);
        cursor = match + value.length;
        match = lowered.indexOf(needle, cursor);
      }
      fragment.append(source.slice(cursor));
      node.replaceWith(fragment);
    }
    matchesRef.current = marks;
    setSearchStatus({ index: marks.length ? 1 : 0, count: marks.length });
    focusSearchMatch(0, marks);
  }

  function focusSearchMatch(index: number, source = matchesRef.current) {
    if (!source.length) return;
    const normalized = (index + source.length) % source.length;
    source.forEach((mark, itemIndex) => mark.classList.toggle('is-current', itemIndex === normalized));
    source[normalized].scrollIntoView({ behavior: 'smooth', block: 'center' });
    setSearchStatus({ index: normalized + 1, count: source.length });
  }

  function openDocumentWindow() {
    window.open(resolveDocumentUrl(activeDocument, activeHeading), '_blank', 'noopener,noreferrer');
  }

  function scrollToHeading(headingId: string) {
    setActiveHeading(headingId);
    readerRef.current
      ?.querySelector<HTMLElement>(`#${CSS.escape(headingId)}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function openLinkedDocument(documentPath: string, anchor = '') {
    if (!documentPath) return;
    setActiveDocument(documentPath);
    setActiveHeading(anchor);
    setRequestedAnchor(anchor);
    updateSearch('');
  }

  function beginDrag(event: ReactPointerEvent<HTMLElement>) {
    if (mode !== 'overlay' || event.button !== 0) return;
    if ((event.target as HTMLElement).closest('button, input, [role="button"]')) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
    };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: ReactPointerEvent<HTMLElement>) {
    const state = dragRef.current;
    if (!state || state.pointerId !== event.pointerId) return;
    const workspace = panelRef.current?.parentElement?.getBoundingClientRect();
    const panel = panelRef.current?.getBoundingClientRect();
    if (!workspace || !panel) return;
    const nextX = state.originX + event.clientX - state.startX;
    const nextY = state.originY + event.clientY - state.startY;
    const baseLeft = panel.left - positionRef.current.x;
    const baseTop = panel.top - positionRef.current.y;
    const nextPosition = {
      x: Math.min(
        Math.max(nextX, workspace.left + 8 - baseLeft),
        workspace.right - panel.width - 8 - baseLeft,
      ),
      y: Math.min(
        Math.max(nextY, workspace.top + 8 - baseTop),
        workspace.bottom - panel.height - 8 - baseTop,
      ),
    };
    positionRef.current = nextPosition;
    setPosition(nextPosition);
  }

  function finishDrag(event: ReactPointerEvent<HTMLElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    try {
      localStorage.setItem(`prd-review-position:${projectId}`, JSON.stringify(positionRef.current));
    } catch {
      // Position persistence is optional; dragging remains available for the active session.
    }
  }

  const activeTitle =
    options.find((item) => item.path === activeDocument)?.title ||
    activeDocument?.split('/').pop()?.replace(/\.md$/iu, '') ||
    'PRD';
  return (
    <section
      ref={panelRef}
      className={`prd-review-panel prd-review-panel--${mode}${dragging ? ' is-dragging' : ''}`}
      role={mode === 'overlay' ? 'dialog' : 'complementary'}
      aria-label={t('workspace.prd.panelAriaLabel', { page: pageTitle })}
      aria-modal={mode === 'overlay' ? false : undefined}
      style={
        mode === 'overlay' ? { transform: `translate3d(${position.x}px, ${position.y}px, 0)` } : undefined
      }
    >
      <header
        className="prd-review-panel__header"
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      >
        <Flex className="prd-review-panel__identity" align="center" gap={12}>
          <span className="prd-review-panel__document-icon" aria-hidden="true">
            <FileTextOutlined />
          </span>
          <div>
            <Flex className="prd-review-panel__title-line" align="center" gap={6}>
              <Title level={4}>{pageTitle}</Title>
              {mode === 'overlay' ? <DragOutlined className="prd-review-panel__drag-hint" /> : null}
            </Flex>
            <Text className="prd-review-panel__document-name" ellipsis={{ tooltip: activeDocument }}>
              {activeTitle}
            </Text>
          </div>
        </Flex>
        <Flex className="prd-review-panel__header-actions" gap={4}>
          <Tooltip title={t('workspace.prd.openInDocsCenter')}>
            <Button
              type="text"
              disabled={!activeDocument}
              icon={<LinkOutlined />}
              onClick={openDocumentWindow}
              aria-label={t('workspace.prd.openInDocsCenter')}
            />
          </Tooltip>
          <Tooltip title={t('workspace.prd.close')}>
            <Button type="text" icon={<CloseOutlined />} onClick={onClose} aria-label={t('workspace.prd.closeAria')} />
          </Tooltip>
        </Flex>
      </header>
      <div className="prd-review-panel__toolbar">
        <Flex className="prd-review-panel__mode" align="center" gap={8}>
          <Text type="secondary">{t('workspace.prd.displayMode')}</Text>
          <Segmented
            size="small"
            value={mode}
            options={[
              { label: t('workspace.prd.modeSplit'), value: 'split' },
              { label: t('workspace.prd.modeOverlay'), value: 'overlay' },
            ]}
            onChange={(value) => onModeChange(value as PrdPanelMode)}
          />
        </Flex>
        <Button
          type={outlineVisible ? 'primary' : 'default'}
          size="small"
          icon={<OrderedListOutlined />}
          onClick={() => setOutlineVisible((current) => !current)}
          aria-pressed={outlineVisible}
          aria-label={outlineVisible ? t('workspace.prd.hideOutline') : t('workspace.prd.showOutline')}
        >
          {outlineVisible ? t('workspace.prd.hideOutline') : t('workspace.prd.showOutline')}
        </Button>
      </div>
      <div className="prd-review-panel__search">
        {options.length > 1 ? (
          <Select
            value={activeDocument}
            options={options.map((item) => ({ value: item.path, label: item.title || item.path }))}
            showSearch
            optionFilterProp="label"
            popupMatchSelectWidth={false}
            aria-label={t('workspace.prd.selectDocument')}
            onChange={(value) => {
              setActiveDocument(value);
              setActiveHeading('');
              setRequestedAnchor('');
              updateSearch('');
            }}
          />
        ) : null}
        <div className="prd-review-panel__search-control">
          <Input
            value={searchTerm}
            allowClear
            prefix={<SearchOutlined />}
            suffix={
              <Text className="prd-review-panel__search-count" type="secondary">
                {searchStatus.count ? `${searchStatus.index}/${searchStatus.count}` : '0/0'}
              </Text>
            }
            placeholder={t('workspace.prd.searchPlaceholder')}
            aria-label={t('workspace.prd.searchAria')}
            onChange={(event) => updateSearch(event.target.value)}
          />
          <Tooltip title={t('workspace.prd.prevResult')}>
            <Button
              type="text"
              disabled={!searchStatus.count}
              icon={<ArrowUpOutlined />}
              onClick={() => focusSearchMatch(searchStatus.index - 2)}
              aria-label={t('workspace.prd.prevResultAria')}
            />
          </Tooltip>
          <Tooltip title={t('workspace.prd.nextResult')}>
            <Button
              type="text"
              disabled={!searchStatus.count}
              icon={<ArrowDownOutlined />}
              onClick={() => focusSearchMatch(searchStatus.index)}
              aria-label={t('workspace.prd.nextResultAria')}
            />
          </Tooltip>
        </div>
      </div>
      <div className={`prd-review-panel__body ${outlineVisible ? 'has-outline' : ''}`}>
        <div ref={readerRef} className="prd-review-panel__reader">
          {activeDocument ? (
            <MarkdownReader
              source={query.data ?? ''}
              loading={query.isPending}
              error={query.error instanceof Error ? query.error.message : undefined}
              onHeadings={setHeadings}
              documentPath={activeDocument}
              resolveAssetUrl={resolveAssetUrl}
              resolveDocumentUrl={resolveDocumentUrl}
              onDocumentNavigate={openLinkedDocument}
              activeAnchor={requestedAnchor}
            />
          ) : (
            <Empty description={t('workspace.prd.empty')} />
          )}
        </div>
        {outlineVisible ? (
          <aside ref={outlineRef} className="prd-review-panel__outline" aria-label={t('workspace.prd.outlineAria')}>
            <Flex className="prd-review-panel__outline-header" align="center" justify="space-between">
              <Text strong>{t('workspace.prd.outlineTitle')}</Text>
              <Tag variant="filled">{headings.length}</Tag>
            </Flex>
            <ul className="prd-review-panel__outline-list">
              {headings.map((heading) => (
                <li
                  className={heading.id === activeHeading ? 'is-active' : ''}
                  data-heading-id={heading.id}
                  key={heading.id}
                  style={{ paddingLeft: (heading.level - 1) * 8 }}
                >
                  <Button
                    type="text"
                    block
                    title={heading.text}
                    aria-current={heading.id === activeHeading ? 'location' : undefined}
                    onClick={() => scrollToHeading(heading.id)}
                  >
                    {heading.text}
                  </Button>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
