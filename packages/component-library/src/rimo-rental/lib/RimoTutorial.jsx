/** The complete supplied tutorial dataset, rendered and edited as local React state. */
import { useState } from 'react';
import { useRimoEnvironment, RimoImage, RimoIcon } from './RimoEnvironment.jsx';
import tutorial from './rimo-tutorial-data.js';
import './rimo-tutorial.css';

export default function RimoTutorial({ editor = false, documentation = false }) {
  const { controls, text, notify, confirm } = useRimoEnvironment();
  const [data, setData] = useState(() => structuredClone(tutorial));
  const [roleId, setRoleId] = useState(data.roles[0]?.id ?? '');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('');
  const [image, setImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [settings, setSettings] = useState(null);
  const [chapter, setChapter] = useState(null);
  const role = data.roles.find(role => role.id === roleId);
  const sections = (role?.sections ?? []).filter(section => !query || JSON.stringify(section).toLowerCase().includes(query.toLowerCase()));
  const current = sections.find(section => section.id === selected) ?? sections[0];
  const showImage = image => { setImage(image); setZoom(1); };
  const changeChapter = (key, value) => setChapter(previous => ({ ...previous, [key]: value }));
  const changeStep = (index, patch) => setChapter(previous => ({ ...previous, steps: previous.steps.map((step, stepIndex) => stepIndex === index ? { ...step, ...patch } : step) }));
  const addRole = () => {
    const id = `role-${crypto.randomUUID()}`;
    setData(previous => ({ ...previous, roles: [...previous.roles, { id, name: text('新角色'), description: '', sections: [] }] }));
    setRoleId(id); setSelected(''); setQuery('');
  };
  const deleteRole = async () => {
    if (!role || data.roles.length <= 1) return;
    try { await confirm(text('删除此角色及全部章节？')); } catch { return; }
    const roles = data.roles.filter(item => item.id !== roleId);
    setData(previous => ({ ...previous, roles })); setRoleId(roles[0].id); setSelected('');
  };
  const deleteChapter = async () => {
    if (!current) return;
    try { await confirm(text('删除当前章节？')); } catch { return; }
    setData(previous => ({ ...previous, roles: previous.roles.map(item => item.id === roleId ? { ...item, sections: item.sections.filter(section => section.id !== current.id) } : item) }));
    setSelected('');
  };
  const saveChapter = () => {
    if (!chapter.title.trim() || chapter.steps.some(step => !step.text.trim())) { notify('warning', text('请填写章节标题和每步说明')); return; }
    setData(previous => ({ ...previous, roles: previous.roles.map(item => item.id === roleId ? {
      ...item, sections: item.sections.some(section => section.id === chapter.id) ? item.sections.map(section => section.id === chapter.id ? chapter : section) : [...item.sections, chapter],
    } : item) }));
    setSelected(chapter.id); setChapter(null); setQuery('');
  };
  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'official-vehicle-tutorial.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return <div className={`rimo-tutorial${documentation ? ' documentation' : ''}`}>
    <header className="rimo-tutorial-heading">
      <div><h1>{editor ? text('公务车操作教程维护') : data.title}</h1><p>{data.subtitle}</p><p>{data.description}</p><p>{text('最后更新')}：{data.updatedAt}</p></div>
      {editor && <div className="rimo-tutorial-tools"><controls.Button onClick={() => setSettings({ title: data.title, subtitle: data.subtitle, description: data.description, updatedAt: data.updatedAt, roleName: role.name, roleDescription: role.description })}>{text('整体与角色设置')}</controls.Button><controls.Button onClick={exportData}>{text('导出教程')}</controls.Button></div>}
    </header>
    {editor && <section className="rimo-tutorial-editor-head">
      <label>{text('导入教程')}<input type="file" accept="application/json,.json" onChange={async event => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
          const parsed = JSON.parse(await file.text());
          const string = value => typeof value === 'string';
          const images = values => values === undefined || Array.isArray(values) && values.every(image => image && string(image.src) && (image.caption === undefined || string(image.caption)));
          if (!string(parsed.title) || !parsed.title.trim() || !Array.isArray(parsed.roles) || !parsed.roles.length || parsed.roles.length > 100 || new Set(parsed.roles.map(role => role.id)).size !== parsed.roles.length || parsed.roles.some(role =>
            !string(role.id) || !string(role.name) || !Array.isArray(role.sections) || role.sections.length > 300 || new Set(role.sections.map(section => section.id)).size !== role.sections.length || role.sections.some(section =>
              !string(section.id) || !string(section.title) || !Array.isArray(section.steps) || section.steps.some(step => !string(step.text) || !images(step.images)) || !images(section.images),
            ),
          )) throw new Error('教程格式不正确');
          setData(parsed); setRoleId(parsed.roles[0]?.id ?? ''); setSelected('');
        } catch (error) { notify('error', text(error.message)); }
      }} /></label>
    </section>}
    <div className="rimo-tutorial-layout">
      <nav className="rimo-tutorial-navigation" aria-label={text('操作教程目录')}>
        <controls.Select aria-label={text('查看角色')} value={roleId} options={data.roles.map(role => ({ value: role.id, label: role.name }))} onChange={value => { setRoleId(value); setSelected(''); }} />
        <controls.Input aria-label={text('搜索教程')} placeholder={text('搜索教程')} value={query} onChange={event => setQuery(event.target.value)} prefix={<RimoIcon name="Search" />} />
        <p>{role?.description}</p>
        {editor && <div className="rimo-tutorial-tools"><controls.Button onClick={addRole}>{text('新增角色')}</controls.Button><controls.Button disabled={data.roles.length <= 1} onClick={deleteRole}>{text('删除角色')}</controls.Button><controls.Button onClick={() => setChapter({ id: `section-${crypto.randomUUID()}`, title: '', summary: '', path: '', steps: [], notes: [] })}>{text('新增章节')}</controls.Button></div>}
        {sections.map(section => <controls.Button key={section.id} type={current?.id === section.id ? 'primary' : 'text'} onClick={() => setSelected(section.id)}>{section.title}</controls.Button>)}
      </nav>
      <article className="rimo-tutorial-article">
        {!current ? <controls.Empty description={text('没有匹配的教程')} /> : <>
          <h2>{current.title}</h2><p>{current.summary}</p><p className="rimo-tutorial-path">{current.path}</p>
          {editor && <div className="rimo-tutorial-tools"><controls.Button onClick={() => setChapter(structuredClone(current))}>{text('编辑章节')}</controls.Button><controls.Button onClick={deleteChapter}>{text('删除章节')}</controls.Button></div>}
          {(current.steps ?? []).map((step, index) => <section key={index} className="rimo-tutorial-step">
            <h3>{index + 1}. {step.text}</h3>
            {(step.images ?? []).map((image, imageIndex) => <figure key={imageIndex}><button type="button" aria-label={text('查看操作截图')} onClick={() => showImage(image)}><RimoImage src={image.src} alt={image.caption ?? step.text} /></button>{image.caption && <figcaption>{image.caption}</figcaption>}</figure>)}
          </section>)}
          {(current.images ?? []).map((image, index) => <figure key={index}><button type="button" onClick={() => showImage(image)}><RimoImage src={image.src} alt={image.caption ?? current.title} /></button>{image.caption && <figcaption>{image.caption}</figcaption>}</figure>)}
          {current.notes?.length > 0 && <controls.Alert type="info" title={text('使用提醒')} description={<ul>{current.notes.map((note, index) => <li key={index}>{note}</li>)}</ul>} />}
        </>}
      </article>
    </div>
    <controls.Modal open={Boolean(image)} onCancel={() => setImage(null)} title={image?.caption ?? text('操作截图')} footer={null} width={1100}>
      {image && <><div className="rimo-tutorial-tools"><controls.Button aria-label={text('缩小')} onClick={() => setZoom(value => Math.max(.5, value - .25))}>−</controls.Button><controls.Button onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</controls.Button><controls.Button aria-label={text('放大')} onClick={() => setZoom(value => Math.min(3, value + .25))}>+</controls.Button></div><div style={{ overflow: 'auto', maxHeight: '70dvh' }}><RimoImage src={image.src} alt={image.caption ?? ''} style={{ width: `${zoom * 100}%`, maxWidth: 'none' }} /></div></>}
    </controls.Modal>
    <controls.Modal open={Boolean(settings)} title={text('整体与角色设置')} onCancel={() => setSettings(null)} onOk={() => {
      if (!settings.title.trim() || !settings.roleName.trim()) { notify('warning', text('请填写教程和角色名称')); return; }
      setData(previous => ({ ...previous, title: settings.title, subtitle: settings.subtitle, description: settings.description, updatedAt: settings.updatedAt, roles: previous.roles.map(item => item.id === roleId ? { ...item, name: settings.roleName, description: settings.roleDescription } : item) })); setSettings(null);
    }}>
      {settings && <div className="rimo-tutorial-editor-head">{[['title', '教程名称'], ['subtitle', '教程副标题'], ['updatedAt', '最后更新'], ['description', '教程说明'], ['roleName', '角色名称'], ['roleDescription', '角色说明']].map(([key, label]) => <label key={key}>{text(label)}<controls.Input value={settings[key]} onChange={event => setSettings(previous => ({ ...previous, [key]: event.target.value }))} /></label>)}</div>}
    </controls.Modal>
    <controls.Modal open={Boolean(chapter)} title={text('编辑章节')} width={850} onCancel={() => setChapter(null)} onOk={saveChapter}>
      {chapter && <div className="rimo-tutorial-editor-head">
        {[['title', '章节标题'], ['summary', '章节概要'], ['path', '进入路径']].map(([key, label]) => <label key={key}>{text(label)}<controls.Input value={chapter[key]} onChange={event => changeChapter(key, event.target.value)} /></label>)}
        {chapter.steps.map((step, index) => <section key={index} className="rimo-tutorial-step"><label>{text('步骤')} {index + 1}<controls.Input.TextArea value={step.text} onChange={event => changeStep(index, { text: event.target.value })} /></label>
          {(step.images ?? []).map((image, imageIndex) => <div key={imageIndex} className="rimo-tutorial-tools"><controls.Input aria-label={text('截图路径')} value={image.src} onChange={event => changeStep(index, { images: step.images.map((item, position) => position === imageIndex ? { ...item, src: event.target.value } : item) })} /><controls.Input aria-label={text('截图说明')} value={image.caption ?? ''} onChange={event => changeStep(index, { images: step.images.map((item, position) => position === imageIndex ? { ...item, caption: event.target.value } : item) })} /><controls.Button onClick={() => changeStep(index, { images: step.images.filter((_item, position) => position !== imageIndex) })}>{text('移除图片')}</controls.Button></div>)}
          <div className="rimo-tutorial-tools"><controls.Button onClick={() => changeStep(index, { images: [...(step.images ?? []), { src: '', caption: '' }] })}>{text('添加图片')}</controls.Button><controls.Button onClick={() => changeChapter('steps', chapter.steps.filter((_step, position) => position !== index))}>{text('删除步骤')}</controls.Button></div>
        </section>)}
        <controls.Button onClick={() => changeChapter('steps', [...chapter.steps, { text: '', images: [] }])}>{text('新增步骤')}</controls.Button>
        <label>{text('使用提醒')}<controls.Input.TextArea value={(chapter.notes ?? []).join('\n')} onChange={event => changeChapter('notes', event.target.value.split('\n').filter(Boolean))} /></label>
      </div>}
    </controls.Modal>
  </div>;
}
