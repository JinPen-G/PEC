import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, RimoTable, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './permissions.css';
function createPageState(model) {
  const _document = model.document;
  const _window = model.window;
  const _localStorage = model.storage;
  const _sessionStorage = model.storage;
  const _themeColor = () => model.theme();
  const _themeColorLight = level => model.theme(level);
  const _themeRGBA = alpha => model.themeAlpha(alpha);
  const feedback = {
    ElMessage: Object.assign(message => model.notify('info', message), {
      success: message => model.notify('success', message),
      warning: message => model.notify('warning', message),
      error: message => model.notify('error', message),
      info: message => model.notify('info', message)
    }),
    ElMessageBox: {
      confirm: (message, title) => model.confirm(message, title),
      alert: (message, title) => model.confirm(message, title)
    }
  };
  function pageSetup() {
    const {
      cell: ref,
      record: reactive,
      derived: computed
    } = model;
    const businesses = [{
      id: 'SHARING_ROUND',
      name: '同站租還',
      prefix: 'sharing.round',
      group: 'SHARING'
    }, {
      id: 'SHARING_ONEWAY',
      name: '甲租乙還',
      prefix: 'sharing.oneway',
      group: 'SHARING'
    }, {
      id: 'STORE_STANDARD',
      name: '門市租車',
      prefix: 'store.std',
      group: 'STORE'
    }, {
      id: 'STORE_24H',
      name: '24h門市自助',
      prefix: 'store.24h',
      group: 'STORE'
    }, {
      id: 'GOV_FLEET',
      name: '公務車',
      prefix: 'gov',
      group: 'GOV'
    }];
    const businessGroups = [{
      id: 'SHARING',
      name: '分時租賃'
    }, {
      id: 'STORE',
      name: '門市租賃'
    }, {
      id: 'GOV',
      name: '公務車'
    }];
    const visibleGroupIds = ref(businessGroups.map(group => group.id));
    const visibleBusinesses = computed(() => businesses.filter(business => visibleGroupIds.value.includes(business.group)));
    const visibleSubBusinesses = computed(() => visibleBusinesses.value.filter(business => business.group !== 'GOV'));
    const hasSubHeaders = computed(() => visibleSubBusinesses.value.length > 0);
    const visibleBusinessGroups = computed(() => businessGroups.map(group => ({
      ...group,
      businesses: visibleBusinesses.value.filter(business => business.group === group.id)
    })).filter(group => group.businesses.length));
    const orderActions = [['view', '查看'], ['create', '新增'], ['edit', '編輯'], ['cancel', '取消'], ['export', '導出'], ['review', '審覈'], ['start', '開始用車'], ['extend', '延長用車'], ['return', '還車'], ['return_amount', '還車（可修改金額）'], ['fees', '費用管理'], ['accident', '事故記錄'], ['note', '備註訂單'], ['print', '打印'], ['tag', '添加標籤'], ['fee_edit', '費用管理修改'], ['fee_delete', '費用管理刪除'], ['fee_collect', '費用管理收款'], ['fee_refund', '費用管理退款']];
    const basicActions = [['view', '查看'], ['create', '新增'], ['edit', '編輯'], ['delete', '刪除']];
    const sharingMenuDefinitions = [{
      id: 'sharing_orders',
      name: '分時租賃訂單',
      key: 'order',
      actions: orderActions
    }, {
      id: 'pricing',
      name: '費率設定',
      key: 'pricing',
      actions: [...basicActions, ['status', '設置狀態'], ['export', '導出']]
    }, {
      id: 'marketing',
      name: '行銷方案',
      key: 'marketing',
      actions: [...basicActions, ['status', '設置狀態'], ['priority', '優先級設置'], ['copy', '複製'], ['export', '導出']]
    }, {
      id: 'assurance',
      name: '安心方案',
      key: 'assurance',
      actions: [...basicActions, ['export', '導出']]
    }, {
      id: 'order_rules',
      name: '訂單規則',
      key: 'rules',
      actions: [['cancel_fee', '取消費設定'], ['overtime_fee', '逾時費用設定'], ['early_fee', '提前用/還車費用設定'], ['cancel_order', '取消訂單設定'], ['other', '其他設定']]
    }];
    const makePermissions = (prefix, key, actions) => actions.map(([action, name]) => ({
      id: `${prefix}.${key}.${action}`,
      name
    }));
    const businessMenus = sharingMenuDefinitions.map(menu => ({
      id: menu.id,
      name: menu.name,
      permissions: Object.fromEntries(businesses.filter(business => business.group === 'SHARING').map(business => [business.id, makePermissions(business.prefix, menu.key, menu.actions)]))
    }));
    businessMenus.splice(1, 0, {
      id: 'store_orders',
      name: '門市租賃訂單',
      permissions: {
        STORE_STANDARD: makePermissions('store.std', 'order', basicActions),
        STORE_24H: makePermissions('store.24h', 'order', [['view', '查看'], ['intervention', '人工介入']])
      }
    });
    businessMenus.push({
      id: 'vehicle_preparation',
      name: '車輛整備',
      permissions: {
        STORE_STANDARD: makePermissions('store.std', 'vehicle', [['inspec', '整備檢查']])
      }
    }, {
      id: 'store_financial',
      name: 'POS結算',
      permissions: {
        STORE_STANDARD: makePermissions('store.std', 'financial', [['pos', 'POS結算'], ['auth', '預授權管理']])
      }
    }, {
      id: 'self_service_devices',
      name: '自助設備監控',
      permissions: {
        STORE_24H: makePermissions('store.24h', 'device', [['monitor', '設備監控']])
      }
    });
    businessMenus.push({
      id: 'gov_approval',
      name: '公務用車審批',
      permissions: {
        GOV_FLEET: makePermissions('gov', 'approval', [['view', '查看審批'], ['audit', '審批訂單']])
      }
    }, {
      id: 'gov_financial',
      name: '企業月結賬單',
      permissions: {
        GOV_FLEET: makePermissions('gov', 'financial', [['bill', '月結賬單']])
      }
    });
    const sharedMenus = [{
      id: 'organization',
      name: '組織架構',
      shared: [{
        id: 'sys.user.manage',
        name: '用戶管理'
      }, {
        id: 'sys.role.manage',
        name: '角色權限'
      }]
    }, {
      id: 'system_settings',
      name: '系統設置',
      shared: [{
        id: 'sys.setting.rule',
        name: '規則配置'
      }]
    }, {
      id: 'security_logs',
      name: '安全與日誌',
      shared: [{
        id: 'sys.log.view',
        name: '日誌審計'
      }]
    }];
    const permissionIds = items => items.map(permission => permission.id);
    const businessPermissionIds = id => businessMenus.flatMap(menu => permissionIds(menu.permissions[id] || []));
    const groupPermissionIds = group => group.businesses.flatMap(business => businessPermissionIds(business.id));
    const menuPermissionIds = menu => visibleBusinesses.value.flatMap(business => permissionIds(menu.permissions[business.id] || []));
    const visibleBusinessMenus = computed(() => businessMenus.filter(menu => visibleBusinesses.value.some(business => menu.permissions[business.id])));
    const allPermissions = [...businessMenus.flatMap(menu => Object.values(menu.permissions).flat()), ...sharedMenus.flatMap(menu => menu.shared)];
    const roles = ref([{
      id: 2,
      code: 'SYS_ADMIN',
      name: '系統管理員',
      description: '負責用戶管理、系統參數配置及日誌審計',
      isSystem: true,
      permissions: ['sys.user.manage', 'sys.role.manage', 'sys.log.view']
    }, {
      id: 3,
      code: 'STORE_MGR',
      name: '門市店長',
      description: '負責門店日常營運及訂單處理',
      isSystem: false,
      type: 'STORE',
      permissions: ['store.std.order.view', 'store.std.order.create', 'store.std.order.edit', 'store.24h.order.view', 'store.24h.order.intervention']
    }, {
      id: 4,
      code: 'SHARING_OPS',
      name: '分時營運經理',
      description: '負責分時租賃訂單、費率與方案管理',
      isSystem: false,
      type: 'STATION',
      permissions: [...businessPermissionIds('SHARING_ROUND'), ...businessPermissionIds('SHARING_ONEWAY')]
    }, {
      id: 5,
      code: 'FINANCE',
      name: '財務專員',
      description: '負責各業務營收核對與報表導出',
      isSystem: false,
      type: 'HEADQUARTERS',
      permissions: ['sharing.round.order.view', 'sharing.round.order.export', 'sharing.oneway.order.view', 'sharing.oneway.order.export', 'store.std.order.view', 'store.std.financial.pos', 'gov.financial.bill']
    }]);
    const cloneRole = role => JSON.parse(JSON.stringify(role));
    const currentRole = ref(cloneRole(roles.value[2]));
    const selectRole = role => {
      currentRole.value = cloneRole(role);
    };
    const selectedIds = computed(() => new Set(currentRole.value.permissions));
    const isAllSelected = ids => ids.length > 0 && ids.every(id => selectedIds.value.has(id));
    const isPartiallySelected = ids => ids.some(id => selectedIds.value.has(id)) && !isAllSelected(ids);
    const togglePermissions = (ids, checked) => {
      const next = new Set(currentRole.value.permissions);
      ids.forEach(id => checked ? next.add(id) : next.delete(id));
      for (const menu of businessMenus) {
        for (const items of Object.values(menu.permissions)) {
          const view = items.find(permission => permission.id.endsWith('.view'));
          if (!view) continue;
          if (!checked && ids.includes(view.id)) items.forEach(permission => next.delete(permission.id));else if (checked && items.some(permission => ids.includes(permission.id))) next.add(view.id);
        }
      }
      const approvalView = 'gov.approval.view';
      if (!checked && ids.includes(approvalView)) next.delete('gov.approval.audit');
      if (checked && ids.includes('gov.approval.audit')) next.add(approvalView);
      currentRole.value.permissions = allPermissions.filter(permission => next.has(permission.id)).map(permission => permission.id);
    };
    const togglePermission = (permission, checked) => togglePermissions([permission.id], checked);
    const hasUnsavedChanges = computed(() => {
      const saved = roles.value.find(role => role.id === currentRole.value.id);
      return saved && JSON.stringify([...saved.permissions].sort()) !== JSON.stringify([...currentRole.value.permissions].sort());
    });
    const savePermissions = () => {
      const index = roles.value.findIndex(role => role.id === currentRole.value.id);
      if (index !== -1) roles.value[index] = cloneRole(currentRole.value);
      feedback.ElMessage.success('權限配置已保存');
    };
    const resetPermissions = () => {
      const original = roles.value.find(role => role.id === currentRole.value.id);
      if (original) currentRole.value = cloneRole(original);
      feedback.ElMessage.info('已重置為保存狀態');
    };
    const orderAccess = computed(() => Object.fromEntries(businessGroups.filter(group => group.id !== 'GOV').map(group => {
      const authorizedBusinesses = businesses.filter(business => business.group === group.id && selectedIds.value.has(`${business.prefix}.order.view`));
      return [group.id, {
        menuVisible: authorizedBusinesses.length > 0,
        tabs: authorizedBusinesses.length ? ['全部', ...authorizedBusinesses.map(business => business.name)] : [],
        allowedBusinessIds: authorizedBusinesses.map(business => business.id),
        exportBusinessIds: authorizedBusinesses.filter(business => selectedIds.value.has(`${business.prefix}.order.export`)).map(business => business.id)
      }];
    })));
    const addRoleDialogVisible = ref(false);
    const isEditRole = ref(false);
    const roleFormRef = ref(null);
    const roleForm = reactive({
      name: '',
      type: '',
      description: ''
    });
    const roleTypes = [{
      label: '營運 (Headquarters)',
      value: 'HEADQUARTERS'
    }, {
      label: '車行 (Provider)',
      value: 'PROVIDER'
    }, {
      label: '門市 (Store)',
      value: 'STORE'
    }, {
      label: '站點 (Station)',
      value: 'STATION'
    }];
    const roleRules = {
      name: [{
        required: true,
        whitespace: true,
        message: '請輸入角色名稱',
        trigger: 'blur'
      }],
      type: [{
        required: true,
        message: '請選擇角色類型',
        trigger: 'change'
      }]
    };
    const getRoleTypeLabel = type => roleTypes.find(item => item.value === type)?.label.split(' ')[0] || type;
    const openAddRoleDialog = () => {
      isEditRole.value = false;
      Object.assign(roleForm, {
        name: '',
        type: '',
        description: ''
      });
      addRoleDialogVisible.value = true;
    };
    const openEditRoleDialog = () => {
      if (currentRole.value.isSystem) return;
      isEditRole.value = true;
      Object.assign(roleForm, {
        name: currentRole.value.name,
        type: currentRole.value.type,
        description: currentRole.value.description
      });
      addRoleDialogVisible.value = true;
    };
    const deleteRole = async () => {
      if (currentRole.value.isSystem) return;
      const roleId = currentRole.value.id;
      try {
        await feedback.ElMessageBox.confirm(`確定要刪除角色「${currentRole.value.name}」嗎？`, '刪除角色', {
          confirmButtonText: '確定刪除',
          cancelButtonText: '取消',
          type: 'warning'
        });
        roles.value = roles.value.filter(role => role.id !== roleId);
        selectRole(roles.value[0]);
        feedback.ElMessage.success('角色已刪除');
      } catch (action) {
        if (action !== 'cancel' && action !== 'close') throw action;
      }
    };
    const confirmRoleDialog = async () => {
      if (!roleFormRef.value) return;
      const valid = await roleFormRef.value.validate().catch(() => false);
      if (!valid) return;
      const details = {
        name: roleForm.name.trim(),
        type: roleForm.type,
        description: roleForm.description.trim() || '暫無描述'
      };
      if (isEditRole.value) {
        Object.assign(roles.value.find(role => role.id === currentRole.value.id), details);
        Object.assign(currentRole.value, details);
        feedback.ElMessage.success('角色資訊已更新');
      } else {
        const newRole = {
          id: Math.max(...roles.value.map(role => role.id)) + 1,
          ...details,
          isSystem: false,
          permissions: []
        };
        roles.value.push(newRole);
        selectRole(newRole);
        feedback.ElMessage.success('角色創建成功');
      }
      addRoleDialogVisible.value = false;
    };
    return {
      businesses,
      businessGroups,
      visibleGroupIds,
      visibleBusinesses,
      visibleSubBusinesses,
      hasSubHeaders,
      visibleBusinessGroups,
      visibleBusinessMenus,
      sharedMenus,
      permissionIds,
      businessPermissionIds,
      groupPermissionIds,
      menuPermissionIds,
      isAllSelected,
      isPartiallySelected,
      roles,
      currentRole,
      selectRole,
      togglePermissions,
      togglePermission,
      hasUnsavedChanges,
      savePermissions,
      resetPermissions,
      orderAccess,
      addRoleDialogVisible,
      isEditRole,
      roleForm,
      roleFormRef,
      roleTypes,
      roleRules,
      getRoleTypeLabel,
      openAddRoleDialog,
      openEditRoleDialog,
      deleteRole,
      confirmRoleDialog,
      orderActions,
      basicActions,
      sharingMenuDefinitions,
      makePermissions,
      businessMenus,
      allPermissions,
      cloneRole,
      selectedIds
    };
  }
  return pageSetup();
}
export default function PermissionsBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="permissions" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="permission-back"><a href="./employees.html"><RimoElement kind="el-icon"><RimoIcon name="ArrowLeft" /></RimoElement>
{text("返回")}</a></div>
<div className="permission-layout"><aside className="role-panel" aria-label="角色列表"><div className="role-panel-header"><h2>{text("角色列表")}</h2>
<RimoElement kind="el-button" type="primary" link={true} icon="Plus" onClick={event => {
              view.openAddRoleDialog?.(event);
            }}>{text("新增")}</RimoElement></div>
<div className="role-list">{rimoEntries(view.roles).map(([role], _itemIndex) => <Fragment key={role.id}><button key={role.id} type="button" className={rimoClass(["role-item", rimoClass({
                active: view.currentRole.id === role.id
              })])} aria-pressed={view.currentRole.id === role.id} onClick={_event => {
                view.selectRole(role);
              }}><span className="role-item-title">{rimoText(role.name)}
{role.isSystem ? <><RimoElement kind="el-tag" size="small" type="info">{text("預設")}</RimoElement></> : <><RimoElement kind="el-tag" size="small" type="info" effect="plain">{rimoText(view.getRoleTypeLabel(role.type))}</RimoElement></>}</span>
<p>{rimoText(role.description)}</p></button></Fragment>)}</div></aside>
<div className="permission-panel"><div className="permission-header"><div><h2>{rimoText(view.currentRole.name)}
{view.currentRole.code ? <><RimoElement kind="el-tag" type="info" size="small">{rimoText(view.currentRole.code)}</RimoElement></> : null}</h2>
<p>{rimoText(view.currentRole.description)}</p></div>
<div className="permission-actions">{!view.currentRole.isSystem ? <><><RimoElement kind="el-button" onClick={event => {
                    view.openEditRoleDialog?.(event);
                  }}>{text("編輯角色")}</RimoElement>
<RimoElement kind="el-button" type="danger" plain={true} onClick={event => {
                    view.deleteRole?.(event);
                  }}>{text("刪除角色")}</RimoElement></></> : null}
<RimoElement kind="el-button" onClick={event => {
                view.resetPermissions?.(event);
              }}>{text("重置")}</RimoElement>
<RimoElement kind="el-button" type="primary" icon="Check" onClick={event => {
                view.savePermissions?.(event);
              }}>{text("保存配置")}</RimoElement></div></div>
<div className="scope-toolbar"><div className="scope-options"><h3>{text("業務線授權")}</h3>
<RimoElement kind="el-checkbox-group" modelValue={view.visibleGroupIds} onModelChange={value => {
                model.write(["visibleGroupIds"], value);
              }} className="scope-group" aria-label="顯示業務欄位">{rimoEntries(view.businessGroups).map(([group], _itemIndex) => <Fragment key={group.id}><RimoElement kind="el-checkbox" key={group.id} value={group.id}>{rimoText(group.name)}</RimoElement></Fragment>)}</RimoElement></div></div>
<div className="matrix-scroll" role="region" aria-label="角色權限表" tabIndex="0"><RimoTable className="permission-matrix" style={rimoStyle({
              minWidth: 160 + Math.max(view.visibleBusinesses.length, 1) * 230 + 'px'
            })} aria-label="菜單與業務權限"><colgroup><col style={rimoStyle("width: 160px")} />
{rimoEntries(view.visibleBusinesses).map(([business], _itemIndex) => <Fragment key={business.id}><col key={business.id} /></Fragment>)}
{!view.visibleBusinesses.length ? <><col /></> : null}</colgroup>
<thead><tr><th className="menu-heading" rowSpan={view.hasSubHeaders ? 2 : 1} scope="col">{text("菜單 / 路由")}</th>
{rimoEntries(view.visibleBusinessGroups).map(([group], _itemIndex) => <Fragment key={group.id}><th key={group.id} colSpan={group.businesses.length} rowSpan={group.id === 'GOV' && view.hasSubHeaders ? 2 : 1} scope="colgroup"><label className="permission-check matrix-group-check"><input type="checkbox" aria-label={group.name + '全部權限'} checked={view.isAllSelected(view.groupPermissionIds(group))} indeterminate={view.isPartiallySelected(view.groupPermissionIds(group))} onChange={event => {
                          view.togglePermissions(view.groupPermissionIds(group), event.target.checked);
                        }} />
<span>{rimoText(group.name)}</span></label></th></Fragment>)}
{!view.visibleBusinesses.length ? <><th scope="col">{text("共用功能權限")}</th></> : null}</tr>
{view.hasSubHeaders ? <><tr>{rimoEntries(view.visibleSubBusinesses).map(([business], _itemIndex) => <Fragment key={business.id}><th key={business.id} scope="col" data-business={business.id}><label className="permission-check matrix-group-check"><input type="checkbox" aria-label={business.name + '全部權限'} checked={view.isAllSelected(view.businessPermissionIds(business.id))} indeterminate={view.isPartiallySelected(view.businessPermissionIds(business.id))} onChange={event => {
                            view.togglePermissions(view.businessPermissionIds(business.id), event.target.checked);
                          }} />
<span>{rimoText(business.name)}</span></label></th></Fragment>)}</tr></> : null}</thead>
<tbody>{!view.visibleBusinesses.length ? <><tr><td colSpan="2"><span className="permission-empty">{text("勾選上方業務以顯示租賃權限；共用功能可直接配置。")}</span></td></tr></> : null}
{rimoEntries(view.visibleBusinessMenus).map(([menu], _itemIndex) => <Fragment key={menu.id}><tr key={menu.id} data-menu={menu.id}><th className="menu-cell" scope="row"><span className="menu-cell-title">{rimoText(menu.name)}</span>
<label className="permission-check cell-select-all"><input type="checkbox" aria-label={menu.name + '可見業務全選'} checked={view.isAllSelected(view.menuPermissionIds(menu))} indeterminate={view.isPartiallySelected(view.menuPermissionIds(menu))} onChange={event => {
                          view.togglePermissions(view.menuPermissionIds(menu), event.target.checked);
                        }} />
<span>{text("全選")}</span></label></th>
{rimoEntries(view.visibleBusinesses).map(([business], _itemIndex) => <Fragment key={business.id}><td key={business.id} data-business={business.id} className={rimoClass({
                        'is-unavailable': !menu.permissions[business.id]
                      })}>{menu.permissions[business.id] ? <><><label className="permission-check cell-select-all"><input type="checkbox" aria-label={business.name + '・' + menu.name + '全選'} checked={view.isAllSelected(view.permissionIds(menu.permissions[business.id]))} indeterminate={view.isPartiallySelected(view.permissionIds(menu.permissions[business.id]))} onChange={event => {
                                view.togglePermissions(view.permissionIds(menu.permissions[business.id]), event.target.checked);
                              }} />
<span>{text("全選")}</span></label>
<div className="permission-grid">{rimoEntries(menu.permissions[business.id]).map(([permission], _itemIndex) => <Fragment key={permission.id}><label key={permission.id} className={rimoClass(["permission-check permission-option", rimoClass({
                                  'is-wide': permission.name.length > 6
                                })])}><input type="checkbox" data-permission={permission.id} aria-label={business.name + '・' + menu.name + '・' + permission.name} checked={view.currentRole.permissions.includes(permission.id)} onChange={event => {
                                    view.togglePermission(permission, event.target.checked);
                                  }} />
<span>{rimoText(permission.name)}</span></label></Fragment>)}</div></></> : <><span className="permission-empty" aria-label="不適用">{text("—")}</span></>}</td></Fragment>)}</tr></Fragment>)}
<tr><th className="section-heading" colSpan={Math.max(view.visibleBusinesses.length, 1) + 1} scope="rowgroup">{text("共用功能")}</th></tr>
{rimoEntries(view.sharedMenus).map(([menu], _itemIndex) => <Fragment key={menu.id}><tr key={menu.id} data-menu={menu.id}><th className="menu-cell" scope="row"><span className="menu-cell-title">{rimoText(menu.name)}</span>
<label className="permission-check cell-select-all"><input type="checkbox" aria-label={menu.name + '全選'} checked={view.isAllSelected(view.permissionIds(menu.shared))} indeterminate={view.isPartiallySelected(view.permissionIds(menu.shared))} onChange={event => {
                          view.togglePermissions(view.permissionIds(menu.shared), event.target.checked);
                        }} />
<span>{text("全選")}</span></label></th>
<td colSpan={Math.max(view.visibleBusinesses.length, 1)}><div className="shared-permissions">{rimoEntries(menu.shared).map(([permission], _itemIndex) => <Fragment key={permission.id}><label key={permission.id} className="permission-check permission-option"><input type="checkbox" data-permission={permission.id} aria-label={menu.name + '・' + permission.name} checked={view.currentRole.permissions.includes(permission.id)} onChange={event => {
                              view.togglePermission(permission, event.target.checked);
                            }} />
<span>{rimoText(permission.name)}</span></label></Fragment>)}</div></td></tr></Fragment>)}</tbody></RimoTable></div>
<div className="permission-footer"><strong>{text("已選 ")}{rimoText(view.currentRole.permissions.length)}{text(" 項")}
{view.hasUnsavedChanges ? <><span>{text(" · 未保存")}</span></> : null}</strong></div></div></div></div><RimoElement kind="el-dialog" modelValue={view.addRoleDialogVisible} onModelChange={value => {
      model.write(["addRoleDialogVisible"], value);
    }} title={view.isEditRole ? '編輯角色' : '新增角色'} width="500px" destroyOnClose={true} className="permissions-overlay" slots={{
      "footer": _slot => <><div className="dialog-footer"><RimoElement kind="el-button" onClick={_event => {
            model.write(["addRoleDialogVisible"], false);
          }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.confirmRoleDialog?.(event);
          }}>{text("\n                            ")}{rimoText(view.isEditRole ? '保存修改' : '確認創建')}{text("\n                        ")}</RimoElement></div></>
    }}>{() => <><RimoElement kind="el-form" model={view.roleForm} rules={view.roleRules} modelRef={model.ref("roleFormRef")} labelPosition="top"><RimoElement kind="el-form-item" label="角色名稱" prop="name"><RimoElement kind="el-input" modelValue={view.roleForm.name} onModelChange={value => {
              model.write(["roleForm", "name"], value);
            }} placeholder="例如：財務助理"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="角色類型" prop="type"><RimoElement kind="el-select" modelValue={view.roleForm.type} onModelChange={value => {
              model.write(["roleForm", "type"], value);
            }} placeholder="請選擇角色所屬層級" style={rimoStyle("width: 100%")}>{rimoEntries(view.roleTypes).map(([type], _itemIndex) => <Fragment key={type.value}><RimoElement kind="el-option" key={type.value} label={type.label} value={type.value}></RimoElement></Fragment>)}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="角色描述" prop="description"><RimoElement kind="el-input" modelValue={view.roleForm.description} onModelChange={value => {
              model.write(["roleForm", "description"], value);
            }} type="textarea" rows={3} placeholder="簡要描述該角色的職責範圍..."></RimoElement></RimoElement></RimoElement></>}</RimoElement></RimoRoot>;
}