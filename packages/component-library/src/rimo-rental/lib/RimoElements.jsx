/** Native React controls for the imported page contracts; the host supplies its standard UI. */
import { Children, Fragment, cloneElement, createContext, isValidElement, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Ellipsis } from 'lucide-react';
import dayjs from 'dayjs';
import DOMPurify from 'dompurify';
import { useRimoEnvironment, useRimoPageKey, RimoIcon, RimoImage } from './RimoEnvironment.jsx';
import { clockText, clockValue, hierarchicalOptions, pickerValue } from './rimo-control-values.js';

const Group = createContext(null);
const FormContext = createContext(null);
const FormItemContext = createContext(false);
const TabsContext = createContext(null);
const ListContext = createContext(null);
const emptyForm = Object.freeze({});
const slot = (value, argument) => typeof value === 'function' ? value(argument) : value;
const nodes = value => Children.toArray(value).flatMap(child =>
  isValidElement(child) && child.type === Fragment ? nodes(child.props.children) : [child],
);
const nodeText = value => nodes(value).map(child => isValidElement(child) ? nodeText(child.props.children) : typeof child === 'string' || typeof child === 'number' ? String(child) : '').join('').trim();
const optionValues = children => nodes(children).flatMap(child => {
  if (!isValidElement(child)) return [];
  if (child.props.kind === 'el-option') return [{ value: child.props.value, label: child.props.label ?? child.props.children, disabled: child.props.disabled }];
  return optionValues(child.props.children);
});
const base = props => ({
  ref: props.ref,
  className: `el-${props.kind.slice(3)}${props.className ? ` ${props.className}` : ''}`,
  style: props.hidden ? { ...props.style, display: 'none' } : props.style,
  disabled: props.disabled,
  id: props.id,
  title: props.title,
  'aria-label': props['aria-label'] ?? props.placeholder,
});

export function RimoMarkup({ html, as: Tag = 'span', children: _children, ...props }) {
  const markup = DOMPurify.sanitize(String(html ?? ''), {
    ALLOWED_TAGS: ['span', 'mark', 'strong', 'b', 'em', 'br'],
    ALLOWED_ATTR: ['class'],
  });
  return <Tag {...props} dangerouslySetInnerHTML={{ __html: markup }} />;
}

export function RimoTable({ children, className, style, ...props }) {
  const { controls } = useRimoEnvironment();
  const toolbar = useRimoToolbar(props);
  const collectRows = value => nodes(value).flatMap(child => !isValidElement(child) ? [] : child.type === 'tr' ? [child] : collectRows(child.props.children));
  const head = nodes(children).find(child => isValidElement(child) && child.type === 'thead');
  const headers = head ? collectRows(head.props.children) : [];
  const body = nodes(children).filter(child => !(isValidElement(child) && ['thead', 'caption', 'colgroup'].includes(child.type)));
  const rows = collectRows(body);
  const cells = row => nodes(row.props.children).filter(child => isValidElement(child) && ['td', 'th'].includes(child.type));
  const width = row => cells(row).reduce((count, cell) => count + Number(cell.props.colSpan ?? 1), 0);
  const count = Math.max(0, ...[...headers, ...rows].map(width));
  const occupied = [];
  const expand = row => {
    const expanded = Array.from({ length: count });
    for (let index = 0; index < count; index++) if (occupied[index] > 0) { expanded[index] = { hidden: true }; occupied[index]--; }
    let index = 0;
    for (const cell of cells(row)) {
      while (expanded[index]) index++;
      const span = Number(cell.props.colSpan ?? 1);
      expanded[index] = { ...cell.props, colSpan: span };
      for (let offset = 0; offset < span; offset++) {
        if (offset) expanded[index + offset] = { hidden: true };
        if (Number(cell.props.rowSpan) > 1) occupied[index + offset] = Number(cell.props.rowSpan) - 1;
      }
      index += span;
    }
    return expanded;
  };
  const headerRows = headers.map(expand);
  occupied.fill(0);
  const data = rows.map((row, index) => ({ key: row.key ?? index, cells: expand(row), props: row.props }));
  const columns = Array.from({ length: count }, (_, index) => ({
    key: `column-${index}`,
    title: <span>{headerRows.map((row, rowIndex) => row[index]?.children ? <span key={rowIndex}>{row[index].children}{rowIndex < headerRows.length - 1 ? ' ' : ''}</span> : null)}</span>,
    render: (_value, row) => row.cells[index]?.children ?? null,
    onCell: row => ({ className: row.cells[index]?.className, style: row.cells[index]?.style, onClick: row.cells[index]?.onClick, onDoubleClick: row.cells[index]?.onDoubleClick, colSpan: row.cells[index]?.hidden ? 0 : row.cells[index]?.colSpan, rowSpan: row.cells[index]?.rowSpan }),
  }));
  const merged = [...headerRows, ...data.map(row => row.cells)].some(row => row.some(cell => cell?.colSpan > 1 || cell?.rowSpan > 1));
  const standard = toolbar.length > 0 && !merged;
  return <>
    {!standard && toolbar.length > 0 && (controls.ListFilterBar ? <controls.ListFilterBar>{toolbar}</controls.ListFilterBar> : <div className="rimo-portable-toolbar">{toolbar}</div>)}
    <controls.Table className={className} style={style} components={standard ? undefined : {}} toolbar={standard ? <>{toolbar}</> : undefined} columns={columns} dataSource={data} pagination={false} rowKey="key" showHeader={Boolean(headers.length)} scroll={{ x: 'max-content' }} rowClassName={row => row.props.className ?? ''} onRow={row => Object.fromEntries(Object.entries(row.props).filter(([key]) => !['children', 'key', 'className'].includes(key)))} />
  </>;
}

function toolbarNodes(value) {
  return nodes(value).filter(child => typeof child !== 'string' || child.trim()).flatMap((child) => {
    if (!isValidElement(child) || child.type !== 'div' || child.props.hidden || child.props.id || Object.keys(child.props).some((key) => key.startsWith('on')))
      return [child];
    const descendants = nodes(child.props.children).filter(child => typeof child !== 'string' || child.trim());
    return descendants.every(isValidElement) ? toolbarNodes(descendants) : [child];
  });
}

export function RimoList({ slots, children, ...props }) {
  return <ListContext.Provider value={slots?.toolbar}><div {...props}>{children}</div></ListContext.Provider>;
}

export function RimoCheckbox({ type: _type, ...props }) {
  const { controls } = useRimoEnvironment();
  return <controls.Checkbox {...props} title={props.title ?? props['aria-label']} />;
}

const toolbarControl = child => child.props.kind === 'el-tooltip' ? nodes(child.props.children).find(isValidElement) ?? child : child;

function RimoToolbarActions({ children }) {
  const { controls, text } = useRimoEnvironment();
  const root = useRef(null);
  const [compact, setCompact] = useState(false);
  useLayoutEffect(() => {
    const toolbar = root.current?.closest('[data-table-tools]') ?? root.current?.parentElement;
    if (!toolbar) return;
    const resize = () => { const width = toolbar.clientWidth; if (width > 0) setCompact(width < 640); };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(toolbar);
    return () => observer.disconnect();
  }, []);
  const items = children.map((child, index) => {
    const field = toolbarControl(child).props;
    const trigger = field.kind === 'el-dropdown' ? nodes(field.children).find(isValidElement)?.props : field;
    const label = field['aria-label'] ?? child.props.content ?? trigger?.['aria-label'] ?? nodeText(field.children);
    const entry = { key: String(index), label: text(label || '更多操作'), disabled: Boolean(field.disabled || field.loading || trigger?.disabled) };
    if (field.kind !== 'el-dropdown') return { ...entry, ...(field.type === 'danger' ? { danger: true } : {}), onClick: ({ domEvent }) => field.onClick?.(domEvent) };
    const options = nodes(slot(field.slots?.dropdown)).flatMap(menu => isValidElement(menu) ? nodes(menu.props.children) : []).filter(isValidElement);
    return { ...entry, children: options.map((option, optionIndex) => ({
      key: `${index}/${optionIndex}`, label: option.props.children, disabled: option.props.disabled,
      onClick: () => { field.onCommand?.(option.props.command ?? optionIndex); option.props.onClick?.(); },
    })) };
  });
  const getPopupContainer = trigger => trigger.closest('[role="dialog"]') ?? trigger.ownerDocument.body;
  return <span ref={root} className="rimo-toolbar-actions">
    {compact ? <controls.Dropdown menu={{ items, getPopupContainer, triggerSubMenuAction: 'click' }} trigger={['click']}
      getPopupContainer={getPopupContainer}>
      <controls.Button size="small" aria-label={text('更多操作')} title={text('更多操作')} icon={<Ellipsis size={16} />} />
    </controls.Dropdown> : children}
  </span>;
}

function useRimoToolbar(props) {
  const { controls, text } = useRimoEnvironment();
  const FilterItem = controls.ListFilterItem;
  const sharedToolbar = useContext(ListContext);
  const items = toolbarNodes(slot(props.slots?.toolbar ?? (props['data-rimo-shared-toolbar'] ? sharedToolbar : null)));
  const searches = items.filter(child => isValidElement(child) && child.props.kind === 'el-input' && (!child.props.type || ['text', 'search'].includes(child.props.type)) && !child.props.showPassword && child.props['data-rimo-secondary'] !== 'true');
  const primary = searches.find(child => child.props.prefixIcon) ?? searches[0];
  const actions = [];
  const filters = items.flatMap((child, index) => {
    if (!FilterItem || !isValidElement(child)) return child;
    const inner = toolbarControl(child);
    const field = inner?.props ?? child.props;
    const secondary = field['data-rimo-secondary'] === 'true';
    const kind = field['data-rimo-filter-reset'] === 'true' ? 'reset'
      : field.kind === 'el-button' || field.kind === 'el-dropdown' ? 'action'
      : child === primary ? 'search' : 'filter';
    const label = field['aria-label'] ?? field.placeholder ?? field.title ?? field.startPlaceholder ?? field.label ?? child.props.content ?? (kind === 'action' ? nodeText(field.children) : undefined);
    if (kind === 'action' && controls.Dropdown) {
      actions.push(cloneElement(child, { key: `${index}/${child.key ?? 'action'}` }));
      return [];
    }
    const content = kind === 'search' && child.props.kind === 'el-input' ? cloneElement(child, { 'data-rimo-query': true }) : child;
    return <FilterItem key={`${index}/${child.key ?? 'field'}`} kind={kind} label={typeof label === 'string' ? text(label) : undefined}
      collapsed={secondary} width={/date-picker|cascader/.test(field.kind ?? '') ? 'wide' : undefined}
      active={Array.isArray(field.modelValue) ? field.modelValue.length > 0 : field.modelValue != null && !['', 'ALL', 'all'].includes(field.modelValue)}>{content}</FilterItem>;
  });
  if (actions.length) filters.push(<FilterItem key="actions" kind="action" label={text('更多操作')}><RimoToolbarActions>{actions}</RimoToolbarActions></FilterItem>);
  return filters;
}

function TableElement(props) {
  const { controls, text } = useRimoEnvironment();
  const Table = controls.Table;
  const tableProps = base(props);
  const toolbar = useRimoToolbar(props);
  const definitions = nodes(props.children).filter(child => isValidElement(child) && child.props.kind === 'el-table-column');
  const selection = definitions.find(child => child.props.type === 'selection')?.props;
  const expanded = definitions.find(child => child.props.type === 'expand')?.props;
  const data = Array.isArray(props.data) ? [...props.data] : [];
  const columns = definitions.filter(child => !['selection', 'expand'].includes(child.props.type)).map((child, index) => {
    const column = child.props;
    return {
      key: column.prop ?? `column-${index}`,
      title: slot(column.slots?.header, { column }) ?? text(column.label ?? ''),
      dataIndex: column.prop,
      width: column.width ? Number(column.width) : column.minWidth ? Number(column.minWidth) : 160,
      minWidth: column.minWidth ? Number(column.minWidth) : undefined,
      fixed: column.fixed === true ? 'left' : column.fixed === 'left' ? 'left' : false,
      sorter: column.sortable && column.prop ? (first, second) => typeof first[column.prop] === 'number' && typeof second[column.prop] === 'number'
        ? first[column.prop] - second[column.prop] : String(first[column.prop] ?? '').localeCompare(String(second[column.prop] ?? ''), undefined, { numeric: true }) : undefined,
      render: (value, row, rowIndex) => column.type === 'index' ? rowIndex + 1
        : column.slots?.default ? slot(column.slots.default, { row, $index: rowIndex, column })
        : value,
    };
  });
  return <Table
    {...tableProps} style={{ ...tableProps.style, minWidth: 0, maxWidth: '100%', width: '100%' }} tableLayout="fixed" dataSource={data} rowKey={props.rowKey ?? ((row, index) => row.id ?? row.key ?? index)}
    columns={columns} pagination={false} loading={props.loading} scroll={{ x: 'max-content' }}
    toolbar={toolbar.length ? <>{toolbar}</> : undefined}
    showHeader={props.showHeader}
    onRow={row => ({ onClick: event => props.onRowClick?.(row, null, event), onDoubleClick: event => props.onRowDblclick?.(row, null, event) })}
    rowClassName={typeof props.rowClassName === 'function' ? (row, rowIndex) => props.rowClassName({ row, rowIndex }) : undefined}
    rowSelection={selection ? {
      onChange: (_keys, rows) => props.onSelectionChange?.(rows),
      getCheckboxProps: row => ({ disabled: selection.selectable ? !selection.selectable(row) : false }),
    } : undefined}
    expandable={expanded ? { expandedRowRender: (row, index) => slot(expanded.slots?.default, { row, $index: index }) } : undefined}
    locale={{ emptyText: slot(props.slots?.empty) ?? text('暂无数据') }}
  />;
}

function FormElement(props) {
  const { controls } = useRimoEnvironment();
  const Form = controls.Form;
  const values = props.model ?? emptyForm;
  const modelRef = props.modelRef;
  const rules = props.rules;
  const [form] = Form.useForm();
  const contract = useMemo(() => ({
    async validate(callback) {
      form.setFieldsValue(values);
      try { await form.validateFields(); callback?.(true); return true; }
      catch (error) { callback?.(false); if (!callback) throw error; return false; }
    },
    clearValidate() { form.setFields(form.getFieldsError().map(field => ({ ...field, errors: [] }))); },
    resetFields() { form.resetFields(); },
  }), [form, values]);
  useEffect(() => { modelRef?.(contract); return () => modelRef?.(null); }, [modelRef, contract]);
  return <FormContext.Provider value={{ rules }}>
    <Form {...base(props)} form={form} initialValues={values} layout={props.inline ? 'inline' : 'vertical'} onFinish={props.onSubmit}>
      {props.children}
    </Form>
  </FormContext.Provider>;
}

function FormItemElement(props) {
  const { controls } = useRimoEnvironment();
  const inherited = useContext(FormContext);
  const name = props.prop ? String(props.prop).split('.') : undefined;
  const rules = props.rules ?? inherited?.rules?.[props.prop];
  const children = nodes(props.children).filter(child => typeof child !== 'string' || child.trim());
  const split = name && children.length > 1;
  const binding = { valuePropName: 'modelValue', trigger: 'onModelChange', validateTrigger: 'onModelChange', getValueProps: () => ({}) };
  return <FormItemContext.Provider value><controls.Form.Item {...base(props)} {...binding} name={split ? undefined : name} rules={split ? undefined : rules} label={slot(props.slots?.label) ?? props.label} required={props.required}>
    {split ? <><controls.Form.Item noStyle {...binding} name={name} rules={rules}>{children[0]}</controls.Form.Item>{children.slice(1)}</> : children.length === 1 ? children[0] : props.children}
  </controls.Form.Item></FormItemContext.Provider>;
}

function FieldFeedback({ children }) {
  const { controls } = useRimoEnvironment();
  const field = useContext(FormItemContext);
  return field ? children : <controls.Form.Item noStyle>{children}</controls.Form.Item>;
}

function InputElement(props) {
  const { controls } = useRimoEnvironment();
  const form = useContext(FormContext);
  const change = (value) => { props.onModelChange?.(value); props.onInput?.(value); props.onChange?.(value); };
  if (!form && (props.prefixIcon === 'Search' || props['data-rimo-query']) && controls.SearchField)
    return <controls.SearchField {...base(props)} label={props['aria-label'] ?? props.placeholder} placeholder={props.placeholder}
      value={props.modelValue ?? ''} onValueChange={change} onKeyDown={props.onKeyDown} onKeyUp={props.onKeyUp}
      readOnly={props.readOnly} maxLength={props.maxLength ? Number(props.maxLength) : undefined} onClear={props.onClear} onBlur={props.onBlur} onFocus={props.onFocus} />;
  const Input = props.type === 'textarea' ? controls.Input.TextArea : props.showPassword ? controls.Input.Password : controls.Input;
  const field = <Input {...base(props)}
    value={props.modelValue ?? ''} placeholder={props.placeholder} type={props.type === 'textarea' ? undefined : props.type}
    maxLength={props.maxLength ? Number(props.maxLength) : undefined} rows={props.rows ? Number(props.rows) : undefined}
    allowClear={props.clearable} readOnly={props.readOnly} prefix={slot(props.slots?.prefix) ?? (props.prefixIcon ? <RimoIcon name={props.prefixIcon} /> : undefined)}
    onChange={event => change(event.target.value)}
    onKeyDown={props.onKeyDown} onKeyUp={props.onKeyUp} onBlur={props.onBlur} onFocus={props.onFocus} onPressEnter={props.onKeyDown ? undefined : props.onEnter}
  />;
  const append = slot(props.slots?.append);
  return <FieldFeedback>{append ? <controls.Space.Compact block className="rimo-input-group">{field}<span className="rimo-input-unit">{append}</span></controls.Space.Compact> : field}</FieldFeedback>;
}

function SelectElement(props) {
  const { controls } = useRimoEnvironment();
  const Select = controls.Select;
  let options = props.options ?? optionValues(props.children);
  let value = props.modelValue;
  let decode = (selected) => selected;
  const multiple = props.multiple ?? props.props?.multiple;
  if (props.kind === 'el-tree-select' || props.kind === 'el-cascader') {
    const emitPath = props.kind === 'el-cascader' && props.props?.emitPath !== false;
    options = hierarchicalOptions(props.data ?? props.options, { ...props.props, emitPath, checkStrictly: props.checkStrictly ?? props.props?.checkStrictly });
    if (emitPath) {
      value = multiple ? (value ?? []).map((path) => JSON.stringify(path)) : value?.length ? JSON.stringify(value) : undefined;
      const original = (selected) => options.find((option) => option.value === selected)?.originalValue;
      decode = (selected) => multiple ? (selected ?? []).map(original).filter(Boolean) : original(selected) ?? [];
    }
  }
  if (value === '' && !options.some((option) => option.value === '')) value = undefined;
  return <FieldFeedback><Select {...base(props)}
    value={props.allowCreate && !multiple ? value ? [value] : [] : value ?? undefined}
    options={options} placeholder={props.placeholder} allowClear={props.clearable}
    mode={props.allowCreate ? 'tags' : multiple ? 'multiple' : undefined}
    showSearch={props.filterable || multiple ? { optionFilterProp: 'label' } : false}
    onChange={selected => { const next = decode(props.allowCreate && !multiple ? selected.at(-1) ?? '' : selected ?? (multiple ? [] : selected)); props.onModelChange?.(next); props.onChange?.(next); }}
    onClear={props.onClear}
  /></FieldFeedback>;
}

function OverlayElement(props) {
  const environment = useRimoEnvironment();
  const pageKey = useRimoPageKey();
  const Modal = environment.controls.Modal;
  const visible = props.modelValue ?? props.visible ?? false;
  const close = () => { props.onModelChange?.(false); props.onClose?.(); };
  const requestedWidth = props.width ?? props.size;
  const width = typeof requestedWidth === 'string' && requestedWidth.endsWith('%') ? requestedWidth : Number.parseInt(requestedWidth, 10) || 720;
  return <Modal title={props.title} open={Boolean(visible)} onCancel={close}
    footer={visible ? slot(props.slots?.footer) ?? null : null} width={width}
    presentation={props.kind === 'el-drawer' ? 'side' : undefined}
    mask={props.closeOnClickModal === undefined ? undefined : { closable: props.closeOnClickModal }} keyboard={props.closeOnPressEscape} closable={props.showClose}
    afterClose={props.onClosed}
    className={props.className} destroyOnHidden={false}>
    <div className="rimo-business-page rimo-dialog-content" data-rimo-overlay={pageKey}>{visible ? slot(props.children) : null}</div>
  </Modal>;
}

function TabsElement(props) {
  const { controls } = useRimoEnvironment();
  const panes = nodes(props.children).filter(child => isValidElement(child) && child.props.kind === 'el-tab-pane');
  const items = panes.map((child, index) => ({ key: String(child.props.name ?? index), label: slot(child.props.slots?.label) ?? child.props.label, children: child.props.children }));
  return <TabsContext.Provider value={props.modelValue}>
    <controls.Tabs {...base(props)} activeKey={props.modelValue == null ? undefined : String(props.modelValue)} items={items}
      onChange={value => { props.onModelChange?.(value); props.onTabChange?.(value); props.onTabClick?.({ props: { name: value }, paneName: value }); }} />
  </TabsContext.Provider>;
}

function TreeElement(props) {
  const [selected, setSelected] = useState(props.currentNodeKey);
  const entries = props.data ?? [];
  const render = (items, depth = 0) => items.map(item => <Fragment key={item.id ?? item.value ?? item.label}>
    <button type="button" style={{ paddingLeft: 10 + depth * 18 }} aria-pressed={selected === (item.id ?? item.value)}
      onClick={() => { setSelected(item.id ?? item.value); props.onNodeClick?.(item); }}>
      {slot(props.slots?.default, { node: item, data: item }) ?? item.label ?? item.name}
    </button>
    {item.children?.length ? render(item.children, depth + 1) : null}
  </Fragment>);
  return <div className="el-tree rimo-tree">{render(entries)}</div>;
}

function UploadElement(props) {
  const input = useRef(null);
  const { controls, notify, text } = useRimoEnvironment();
  const [localFiles, setLocalFiles] = useState([]);
  const [reading, setReading] = useState(false);
  const files = props.fileList ?? localFiles;
  const update = (next) => { setLocalFiles(next); props.onFileListChange?.(next); };
  const receive = async (selected) => {
    if (props.disabled || reading) return;
    const incoming = [...selected];
    if (props.limit && incoming.length + files.length > Number(props.limit)) {
      if (props.onExceed) props.onExceed(incoming, files);
      else notify('warning', text('超出附件数量限制，请先移除已有附件。'));
      return;
    }
    const next = [...files];
    setReading(true);
    try {
      for (const raw of incoming) {
        const accept = props.accept?.split(',').map((value) => value.trim().toLowerCase());
        if (accept?.length && !accept.some((value) => value.startsWith('.') ? raw.name.toLowerCase().endsWith(value) : value.endsWith('/*') ? raw.type.startsWith(value.slice(0, -1)) : raw.type === value)) {
          notify('warning', text('文件格式不支持，请按提示选择。'));
          continue;
        }
        let url = '';
        if (raw.type.startsWith('image/')) url = await new Promise((resolve, reject) => {
          const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(reader.error); reader.readAsDataURL(raw);
        });
        const entry = { raw, name: raw.name, url, uid: crypto.randomUUID(), status: 'ready' };
        next.push(entry);
        update([...next]);
        props.onChange?.(entry, [...next]);
      }
    } catch { notify('error', text('附件读取失败，请重新选择。')); }
    finally { setReading(false); if (input.current) input.current.value = ''; }
  };
  const remove = async (entry) => {
    if (props.disabled) return;
    const next = files.filter((file) => file !== entry);
    if (await props.onRemove?.(entry, next) !== false) update(next);
  };
  return <div className={`el-upload rimo-upload ${props.className ?? ''}`} data-drag={props.drag || undefined}
    onDragOver={event => { if (props.drag) event.preventDefault(); }}
    onDrop={event => { if (props.drag) { event.preventDefault(); void receive(event.dataTransfer.files); } }}>
    <controls.Button disabled={props.disabled} loading={reading} className="rimo-upload-trigger" aria-label={text('选择附件')}
      onClick={() => input.current?.click()}>{props.children ?? text('选择附件')}</controls.Button>
    <input ref={input} type="file" hidden aria-label={text('选择附件文件')} accept={props.accept ?? 'image/*'} multiple={props.multiple} disabled={props.disabled}
      onChange={event => { void receive(event.target.files ?? []); }} />
    {props.showFileList !== false && files.length > 0 && <ul className="rimo-attachment-list">{files.map((file, index) => <li key={file.uid ?? file.name ?? index}>
      {file.url && <ImageElement kind="el-image" src={file.url} alt={file.name ?? text('附件图片')} previewSrcList={[file.url]} className="rimo-attachment-image" />}
      <span>{file.name ?? text('附件图片')}</span>
      <controls.Button type="text" disabled={props.disabled} onClick={() => { void remove(file); }}>{text('移除')}</controls.Button>
    </li>)}</ul>}
  </div>;
}

function ImageElement(props) {
  const { controls, text } = useRimoEnvironment();
  const pageKey = useRimoPageKey();
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const sources = props.previewSrcList ?? [];
  const image = <RimoImage {...base(props)} src={props.src} alt={props.alt ?? ''} style={{ ...props.style, objectFit: props.fit }} />;
  if (!sources.length) return image;
  return <>
    <controls.Button type="text" className="rimo-image-trigger" aria-label={text('预览图片')}
      onClick={() => { setIndex(Math.max(0, Math.min(sources.length - 1, Number(props.initialIndex) || 0))); setOpen(true); }}>
      {image}
    </controls.Button>
    <controls.Modal title={props.alt || text('图片预览')} open={open} onCancel={() => setOpen(false)} width={880}
      footer={sources.length > 1 ? <div className="rimo-image-navigation">
        <controls.Button disabled={index === 0} onClick={() => setIndex(index - 1)}>{text('上一张')}</controls.Button>
        <span>{index + 1} / {sources.length}</span>
        <controls.Button disabled={index >= sources.length - 1} onClick={() => setIndex(index + 1)}>{text('下一张')}</controls.Button>
      </div> : null}>
      {open && <div className="rimo-business-page" data-rimo-overlay={pageKey}>
        <RimoImage src={sources[index]} alt={props.alt || text('附件图片')} className="rimo-photo-full" />
      </div>}
    </controls.Modal>
  </>;
}

function DateElement(props) {
  const { controls } = useRimoEnvironment();
  const range = /range/.test(props.type ?? '');
  const DatePicker = range ? controls.DatePicker.RangePicker : controls.DatePicker;
  const value = range ? (Array.isArray(props.modelValue) ? props.modelValue.map(value => dayjs(value)) : null)
    : props.modelValue ? dayjs(props.modelValue) : null;
  return <FieldFeedback><DatePicker {...base(props)} value={value} allowClear={props.clearable ?? true}
    picker={props.type === 'month' ? 'month' : props.type === 'year' ? 'year' : undefined}
    disabledDate={props.disabledDate ? (date) => props.disabledDate(date.toDate()) : undefined}
    format={props.format ?? props.valueFormat}
    showTime={String(props.type).includes('time')} placeholder={range ? [props.startPlaceholder, props.endPlaceholder] : props.placeholder}
    onChange={next => { const value = range ? next?.map(item => pickerValue(item, props.valueFormat)) ?? [] : pickerValue(next, props.valueFormat); props.onModelChange?.(value); props.onChange?.(value); }} /></FieldFeedback>;
}

function TimeElement(props) {
  const { controls, text } = useRimoEnvironment();
  const range = Boolean(props.isRange);
  const values = range ? props.modelValue ?? [] : [props.modelValue];
  const interval = props.kind === 'el-time-select' && props.step ? String(props.step).split(':').reduce((total, part) => total * 60 + Number(part), 0) * 60 : undefined;
  const change = (input, index) => {
    const next = props.kind === 'el-time-select' ? input : clockValue(input, values[index], props.valueFormat);
    const value = range ? [index === 0 ? next : values[0] ?? null, index === 1 ? next : values[1] ?? null] : next;
    props.onModelChange?.(value); props.onChange?.(value);
  };
  return <FieldFeedback><div className="rimo-time-range" role="group" aria-label={props['aria-label']}>
    {(range ? [0, 1] : [0]).map((index) => <Fragment key={index}>
      {index === 1 && <span>{props.rangeSeparator ?? text('至')}</span>}
      <controls.Input {...base(props)} id={index ? undefined : props.id} type="time" min={props.start} max={props.end} step={interval}
        aria-label={range ? (index ? props.endPlaceholder ?? text('结束时间') : props.startPlaceholder ?? text('开始时间')) : props.placeholder}
        value={clockText(values[index])} onChange={(event) => change(event.target.value, index)} />
    </Fragment>)}
  </div></FieldFeedback>;
}

function DescriptionsElement(props) {
  const { controls } = useRimoEnvironment();
  const root = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    setWidth(element.clientWidth);
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const columns = Math.max(1, Math.min(Number(props.column ?? 3), Math.floor(width / 260) || 1));
  return <div ref={root} className="rimo-descriptions"><controls.Descriptions {...base(props)} title={props.title} column={columns}>
    {nodes(props.children).filter(isValidElement).map((child, index) => <controls.Descriptions.Item key={index} label={child.props.label}>{child.props.children}</controls.Descriptions.Item>)}
  </controls.Descriptions></div>;
}

export function RimoElement(inputProps) {
  const environment = useRimoEnvironment();
  const { controls, text } = environment;
  const group = useContext(Group);
  const props = { ...inputProps };
  for (const key of ['title', 'label', 'placeholder', 'description', 'content', 'startPlaceholder', 'endPlaceholder', 'rangeSeparator'])
    if (typeof props[key] === 'string') props[key] = text(props[key]);
  const children = props.children;
  switch (props.kind) {
    case 'el-table': return <TableElement {...props} />;
    case 'el-table-column': case 'el-option': case 'el-option-group': case 'el-tab-pane': return null;
    case 'el-form': return <FormElement {...props} />;
    case 'el-form-item': return <FormItemElement {...props} />;
    case 'el-input': return <InputElement {...props} />;
    case 'el-input-number': return <controls.InputNumber {...base(props)} value={props.modelValue} min={props.min == null ? undefined : Number(props.min)} max={props.max == null ? undefined : Number(props.max)} step={props.step ? Number(props.step) : 1}
      onChange={value => { props.onModelChange?.(value); props.onChange?.(value); }} />;
    case 'el-select': case 'el-tree-select': case 'el-cascader': return <SelectElement {...props} />;
    case 'el-date-picker': return <DateElement {...props} />;
    case 'el-time-select': case 'el-time-picker': return <TimeElement {...props} />;
    case 'el-button': return <controls.Button {...base(props)} type={props.link || props.text ? 'text' : props.type === 'primary' && !props.plain ? 'primary' : 'default'} size={props.size === 'small' ? 'small' : undefined} danger={props.type === 'danger'} loading={props.loading} htmlType={props.nativeType ?? 'button'}
      icon={props.icon ? <RimoIcon name={props.icon} /> : undefined} onClick={props.onClick} onKeyDown={props.onKeyDown} onKeyUp={props.onKeyUp}>{children}</controls.Button>;
    case 'el-button-group': return <div className="el-button-group">{children}</div>;
    case 'el-link': return <a className={props.className} href={props.href} onClick={props.onClick}>{children}</a>;
    case 'el-tag': return <controls.Tag className={`el-tag ${props.className ?? ''}`} onClick={props.onClick} closable={props.closable} onClose={props.onClose} color={props.type === 'success' ? 'green' : props.type === 'danger' ? 'red' : props.type === 'warning' ? 'gold' : props.color}>{children}</controls.Tag>;
    case 'el-icon': return <span className="el-icon" style={props.style}>{children}</span>;
    case 'el-dialog': case 'el-drawer': return <OverlayElement {...props} />;
    case 'el-tabs': return <TabsElement {...props} />;
    case 'el-radio-group': case 'el-checkbox-group': return <Group.Provider value={{ value: props.modelValue, update: props.onModelChange, change: props.onChange, multiple: props.kind === 'el-checkbox-group' }}><div {...base(props)}>{children}</div></Group.Provider>;
    case 'el-radio': case 'el-radio-button': {
      const value = props.value ?? props.label;
      return <label className={props.kind === 'el-radio' ? 'el-radio' : 'el-radio-button'}><input type="radio" checked={Object.is(group?.value, value)} disabled={props.disabled} onChange={() => { group?.update?.(value); group?.change?.(value); }} />{children ?? props.label}</label>;
    }
    case 'el-checkbox': {
      const option = props.value ?? props.label;
      const checked = group?.multiple ? (group.value ?? []).includes(option) : props.modelValue ?? props.checked ?? false;
      return <controls.Checkbox {...base(props)} checked={checked} indeterminate={props.indeterminate} onChange={event => {
        const next = typeof event === 'boolean' ? event : event.target?.checked ?? false;
        if (group?.multiple) { const values = next ? [...group.value, option] : group.value.filter(value => value !== option); group.update?.(values); group.change?.(values); }
        else { props.onModelChange?.(next); props.onChange?.(next); }
      }}>{children ?? props.label}</controls.Checkbox>;
    }
    case 'el-switch': return <controls.Switch {...base(props)} checked={props.modelValue === (props.activeValue ?? true)} onChange={checked => { const value = checked ? props.activeValue ?? true : props.inactiveValue ?? false; props.onModelChange?.(value); props.onChange?.(value); }} />;
    case 'el-card': return <controls.Card {...base(props)} title={slot(props.slots?.header) ?? props.header}>{children}</controls.Card>;
    case 'el-row': return <controls.Row {...base(props)} gutter={Number(props.gutter ?? 0)}>{children}</controls.Row>;
    case 'el-col': return <controls.Col {...base(props)} span={Number(props.span ?? 24)}>{children}</controls.Col>;
    case 'el-divider': return <div className="el-divider">{children}</div>;
    case 'el-empty': return <controls.Empty description={props.description ?? text('暂无数据')} />;
    case 'el-alert': return <controls.Alert {...base(props)} title={props.title} message={props.title} description={props.description ?? children} type={props.type ?? 'info'} showIcon={props.showIcon} />;
    case 'el-tooltip': return <span title={props.content}>{children}</span>;
    case 'el-avatar': return <span className="rimo-icon-placeholder">{props.src ? <RimoImage src={props.src} alt="" /> : children ?? <RimoIcon name="User" />}</span>;
    case 'el-image': return <ImageElement {...props} />;
    case 'el-tree': return <TreeElement {...props} />;
    case 'el-progress': return <div className="el-progress"><div className="el-progress-bar"><span style={{ width: `${Math.min(100, Math.max(0, props.percentage ?? 0))}%` }} /></div>{props.showText !== false ? `${props.percentage ?? 0}%` : null}</div>;
    case 'el-badge': return <span className="el-badge">{children}{props.value ? <controls.Tag>{props.value}</controls.Tag> : null}</span>;
    case 'el-pagination': return <div className="el-pagination"><controls.Pagination current={Number(props.currentPage ?? 1)} pageSize={Number(props.pageSize ?? 10)} total={Number(props.total ?? 0)} showSizeChanger pageSizeOptions={props.pageSizes}
      onChange={(page, size) => { props.onCurrentPageChange?.(page); props.onPageSizeChange?.(size); props.onCurrentChange?.(page); if (size !== props.pageSize) props.onSizeChange?.(size); }} /></div>;
    case 'el-descriptions': return <DescriptionsElement {...props} />;
    case 'el-descriptions-item': return children;
    case 'el-dropdown': {
      const items = nodes(slot(props.slots?.dropdown)).flatMap(child => isValidElement(child) ? nodes(child.props.children) : []);
      return <controls.Dropdown menu={{ items: items.filter(isValidElement).map((child, index) => ({ key: String(child.props.command ?? index), label: child.props.children, disabled: child.props.disabled, onClick: () => { props.onCommand?.(child.props.command ?? index); child.props.onClick?.(); } })) }} trigger={['click']}><span className="rimo-menu-trigger">{children}</span></controls.Dropdown>;
    }
    case 'el-dropdown-menu': case 'el-dropdown-item': return <span>{children}</span>;
    case 'el-popconfirm': return <span onClick={() => environment.confirm(props.title).then(() => props.onConfirm?.()).catch((error) => { if (error?.message !== 'cancel') environment.notify('error', text('操作未完成，请重试。')); })}>{slot(props.slots?.reference) ?? children}</span>;
    case 'el-popover': return <controls.Dropdown trigger={[props.trigger === 'click' ? 'click' : 'hover']}
      popupRender={() => <div className="rimo-business-page rimo-popover-content" style={{ width: Number(props.width) || 280 }}>
        {props.title && <strong>{props.title}</strong>}{props.content ?? children}
      </div>}><span tabIndex={0}>{slot(props.slots?.reference) ?? props.title}</span></controls.Dropdown>;
    case 'el-upload': return <UploadElement {...props} />;
    case 'el-steps': case 'el-timeline': case 'el-carousel': return <div {...base(props)}>{children}</div>;
    case 'el-step': case 'el-timeline-item': return <div {...base(props)}><strong>{props.title ?? props.timestamp}</strong>{children}</div>;
    case 'el-carousel-item': return <div>{children}</div>;
    case 'el-segmented': return <controls.Segmented {...base(props)} value={props.modelValue} options={(props.options ?? []).map(option => typeof option === 'string' ? { label: text(option), value: option } : { ...option, label: text(option.label) })} onChange={value => { props.onModelChange?.(value); props.onChange?.(value); }} />;
    default: throw new Error(`Unregistered RIMO control: ${props.kind}`);
  }
}

export function rimoClass(value) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(rimoClass).join(' ');
  return Object.entries(value ?? {}).filter(([, enabled]) => enabled).map(([key]) => key).join(' ');
}
export function rimoStyle(value) {
  if (typeof value !== 'string') return value;
  return Object.fromEntries(value.split(';').filter(Boolean).map(part => {
    const separator = part.indexOf(':');
    const property = part.slice(0, separator).trim();
    const key = property.startsWith('--') ? property : property.replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase());
    return [key, part.slice(separator + 1).replace(/\s*!important$/, '').trim()];
  }));
}
export function rimoText(value) {
  return value == null ? '' : typeof value === 'object' && !isValidElement(value) ? JSON.stringify(value, null, 2) : typeof value === 'boolean' ? String(value) : value;
}
