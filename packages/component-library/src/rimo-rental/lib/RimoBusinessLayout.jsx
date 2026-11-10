import { useRimoEnvironment } from './RimoEnvironment.jsx';
import { useEffect, useMemo } from 'react';
import './rimo-business.css';

export function RimoHeading({ title, description, actions }) {
  const { text } = useRimoEnvironment();
  return (
    <header className="rimo-page-heading">
      <div>
        <h1>{text(title)}</h1>
        {description && <p>{text(description)}</p>}
      </div>
      {actions && <div className="rimo-actions">{actions}</div>}
    </header>
  );
}

export function RimoSection({ title, description, actions, children }) {
  const { text } = useRimoEnvironment();
  return (
    <section className="rimo-section">
      {title && (
        <div className="rimo-section-heading">
          <div>
            <h2>{text(title)}</h2>
            {description && <p>{text(description)}</p>}
          </div>
          {actions && <div className="rimo-actions">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function RimoDialog({ pageKey, children, ...props }) {
  const { controls, text } = useRimoEnvironment();
  return (
    <controls.Modal
      {...props}
      title={text(props.title ?? '详情')}
      okText={props.okText ?? text('保存')}
      cancelText={props.cancelText ?? text('取消')}
    >
      {props.open && (
        <div className="rimo-business-page rimo-dialog-content" data-rimo-overlay={pageKey}>
          {children}
        </div>
      )}
    </controls.Modal>
  );
}

export function RimoStats({ items, active, onSelect }) {
  const { text } = useRimoEnvironment();
  return <div className="rimo-stats" aria-label={text('统计筛选')}>
    {items.map(item => <button key={item.key} type="button" className="rimo-stat" aria-pressed={active === item.key} onClick={() => onSelect(item.key)}>
      <span>{text(item.label)}</span><strong>{item.value}</strong>
    </button>)}
  </div>;
}

export function RimoFacts({ items, columns = 2 }) {
  const { text } = useRimoEnvironment();
  return <dl className="rimo-facts" style={{ '--rimo-fact-columns': columns }}>{items.filter(Boolean).map(item => <div key={item.key ?? item.label}>
    <dt>{text(item.label)}</dt><dd>{item.value ?? 'NA'}</dd>
  </div>)}</dl>;
}

export function RimoModelForm({ model, field = 'form', reference = 'formRef', onChange, onSubmit, children }) {
  const { controls: { Form } } = useRimoEnvironment();
  const [form] = Form.useForm();
  const contract = useMemo(() => ({
    async validate(callback) {
      try { await form.validateFields(); callback?.(true); return true; }
      catch { callback?.(false); return false; }
    },
    clearValidate() { form.setFields(form.getFieldsError().map(item => ({ ...item, errors: [] }))); },
  }), [form]);
  useEffect(() => { model.assignRef(reference, contract); return () => model.assignRef(reference, null); }, [model, reference, contract]);
  return <Form form={form} layout="vertical" initialValues={{ ...model.view[field] }} onValuesChange={changes => {
    for (const [key, value] of Object.entries(changes)) model.assign(model.view[field], key, value);
    onChange?.(changes, form);
  }} onFinish={() => onSubmit()}>{children}</Form>;
}
