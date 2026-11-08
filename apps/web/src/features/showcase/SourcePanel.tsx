/** Explicit page source with the reference site's line-numbered, collapsible
 * code panel. Rendering uses text nodes; source is never evaluated. */
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Copy, FileCode2 } from 'lucide-react';
import { useShowcaseText } from './showcase-locale';

const tokenPattern =
  /(\/\*[^]*?\*\/|\/\/[^\n]*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b(?:import|export|from|const|let|function|return|if|else|new|type|interface|true|false|null|async|await|default)\b|\b\d+(?:\.\d+)?\b)/g;
export function SourcePanel({ source, fileName }: { source: string; fileName: string }) {
  const [expanded, setExpanded] = useState(false),
    [copied, setCopied] = useState(false),
    [error, setError] = useState('');
  const text = useShowcaseText();
  const reset = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (reset.current) clearTimeout(reset.current);
    },
    [],
  );
  const lines = useMemo(() => {
    const rendered: { text: string; className?: string }[][] = [[]];
    for (const segment of source.split(tokenPattern)) {
      if (!segment) continue;
      const className =
        segment.startsWith('//') || segment.startsWith('/*')
          ? 'docs_tokenComment__ZIOcz'
          : /^["'`]/.test(segment)
            ? 'docs_tokenString__d8XRm'
            : /^\d/.test(segment)
              ? 'docs_tokenNumber__JmMB_'
              : /^(?:import|export|from|const|let|function|return|if|else|new|type|interface|true|false|null|async|await|default)$/.test(
                    segment,
                  )
                ? 'docs_tokenKeyword__pNaL9'
                : undefined;
      segment.split('\n').forEach((part, index) => {
        if (index) rendered.push([]);
        rendered[rendered.length - 1].push({ text: part, className });
      });
    }
    return rendered;
  }, [source]);
  return (
    <div className="docs_code__X6QfU">
      <div className="docs_codeHead__XMuij">
        <div className="docs_codeFile__My7ve">
          <FileCode2 size={14} />
          <span>{fileName}</span>
        </div>
        <div className="docs_codeActions__cJToD">
          <button
            className="docs_copy__At0Np"
            onClick={() => {
              void navigator.clipboard.writeText(source).then(
                () => {
                  setCopied(true);
                  setError('');
                  if (reset.current) clearTimeout(reset.current);
                  reset.current = setTimeout(() => setCopied(false), 1900);
                },
                () => setError(text('复制失败，请检查剪贴板权限')),
              );
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span className="docs_copyLabels__4vHTm">
              <span data-visible={!copied} aria-hidden={copied}>
                {text('复制')}
              </span>
              <span data-visible={copied} aria-hidden={!copied}>
                {text('已复制')}
              </span>
            </span>
          </button>
        </div>
      </div>
      <div className={`docs_codeBody__TFHtG${expanded ? '' : ' docs_codeCollapsed__Zv72M'}`}>
        <pre tabIndex={0}>
          <code>
            {(expanded ? lines : lines.slice(0, 24)).map((line, index) => (
              <span className="docs_codeLine__lVkVH" key={index}>
                <span className="docs_lineNumber___F_76" aria-hidden="true">
                  {index + 1}
                </span>
                <span>
                  {line.map((token, index) => (
                    <Fragment key={index}>
                      {token.className ? <span className={token.className}>{token.text}</span> : token.text}
                    </Fragment>
                  ))}
                </span>
              </span>
            ))}
          </code>
        </pre>
      </div>
      {lines.length > 24 && (
        <button
          className="docs_codeExpand__SpNb6"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? text('收起源码') : `${text('展开全部源码')} (${lines.length})`}
          <ChevronDown size={14} data-open={expanded} />
        </button>
      )}
      <span role="status" className="docs_srOnly__ZPUaK">
        {error}
      </span>
    </div>
  );
}
