/** Local ticket reservation flows from the supplied mobile prototypes, with no payment or rental API. */
import { useState } from 'react';
import { useRimoEnvironment, RimoIcon } from './RimoEnvironment.jsx';
import './rimo-channel-ticket.css';

const initialTickets = [
  { id: 'ticket-a', name: '金門 7 月企業活動租車券', pickup: '2026-07-18T09:00', returnAt: '2026-07-18T17:00' },
  { id: 'ticket-b', name: '夏季旅遊合作租車券', pickup: '2026-07-18T10:00', returnAt: '2026-07-18T18:00' },
];
const redeemedTicket = { id: 'ticket-c', name: '企業夥伴體驗租車券', pickup: '2026-07-18T09:30', returnAt: '2026-07-18T16:30' };
const displayTime = value => value?.replace('2026-', '').replace('T', ' ');
const stations = [{ name: '金城民生停車場', address: '金門縣金城鎮民生路 18 號地下停車場' }, { name: '金門機場第一停車場', address: '金門縣金湖鎮尚義機場第一停車場' }];
const vehicles = [{ name: 'RIMO E1', type: '微電車', plate: 'KEV-0528' }, { name: 'Toyota Yaris', type: '汽車', plate: 'BKR-8899' }, { name: 'Toyota Corolla Cross', type: '汽車', plate: 'KME-0718' }];
export default function RimoChannelTicketApp({ compatible = false }) {
  const { controls, text } = useRimoEnvironment();
  const [screen, setScreen] = useState('home');
  const [tickets, setTickets] = useState(initialTickets);
  const [selected, setSelected] = useState(initialTickets[0]);
  const [station, setStation] = useState(stations[0]);
  const [vehicle, setVehicle] = useState(vehicles[0]);
  const [tab, setTab] = useState('mine');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [notice, setNotice] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [pickupTime, setPickupTime] = useState(initialTickets[0].pickup);
  const [redeemed, setRedeemed] = useState(false);
  const validTime = pickupTime >= selected.pickup && pickupTime < selected.returnAt;
  const availableVehicles = vehicles.filter(candidate => !orders.some(order => order.status !== 'cancelled' && order.plate === candidate.plate && pickupTime < order.returnAt && selected.returnAt > order.pickup));
  const choose = ticket => { setSelected(ticket); setPickupTime(ticket.pickup); setAccepted(false); setError(''); setScreen('station'); };
  const cancelOrder = order => {
    setOrders(previous => previous.map(item => item.orderId === order.orderId ? { ...item, status: 'cancelled' } : item));
    setTickets(previous => previous.some(ticket => ticket.id === order.id) ? previous : [...previous, order.ticket]);
  };
  const reserve = () => {
    if (!selected || !accepted || !validTime || !tickets.some(ticket => ticket.id === selected.id) || !availableVehicles.some(item => item.plate === vehicle.plate)) {
      setNotice(text('请重新检查租车券、取车时间和车辆可用情况。')); return;
    }
    setTickets(previous => previous.filter(ticket => ticket.id !== selected.id));
    setOrders(previous => previous.some(order => order.id === selected.id && order.status !== 'cancelled') ? previous : [...previous, { ...selected, ticket: selected, pickup: pickupTime, orderId: crypto.randomUUID(), status: 'reserved', station: station.name, vehicle: vehicle.name, plate: vehicle.plate }]);
    setScreen('success');
  };
  return <div className={`rimo-mobile-app${compatible ? ' compatible' : ''}`}>
    <header className="rimo-mobile-header"><controls.Button type="text" aria-label={text('返回首页')} onClick={() => setScreen('home')}><RimoIcon name="Back" /></controls.Button><strong>{text(screen === 'home' ? 'RIMO Rental' : screen === 'tickets' ? '我的租车券' : screen === 'station' ? '选择据点' : screen === 'vehicle' ? '选择车辆' : screen === 'confirm' ? '确认预约' : '预约完成')}</strong><RimoIcon name="User" /></header>
    <div className="rimo-mobile-body">
      {screen === 'home' && <>
        <div className="rimo-mobile-map"><RimoIcon name="Location" size={42} /><strong>{station.name}</strong><span>{text('同站租还 · 选择附近据点')}</span></div>
        <section className="rimo-mobile-panel"><h2>{text('合作通路租车券')}</h2><p>{tickets.length} {text('张可用')}</p><controls.Button type="primary" onClick={() => { setScreen('tickets'); setTab('mine'); }}>{text('查看租车券')}</controls.Button></section>
        <section className="rimo-mobile-panel"><h3>{text('我的预约')}</h3>{orders.length ? orders.map(order => <div key={order.orderId}><p>{order.name} · {order.plate} · {text(order.status === 'cancelled' ? '已取消' : '已预约')}</p>{order.status !== 'cancelled' && <controls.Button onClick={() => cancelOrder(order)}>{text('取消预约')}</controls.Button>}</div>) : <p>{text('暂无租车券预约')}</p>}</section>
      </>}
      {screen === 'tickets' && <>
        <controls.Tabs activeKey={tab} onChange={setTab} items={[{ key: 'mine', label: text('可用租车券') }, { key: 'history', label: text('历史记录') }, { key: 'redeem', label: text('兑换领取') }]} />
        {tab === 'mine' && <>{tickets.map(ticket => <button type="button" className="rimo-ticket-card" key={ticket.id} onClick={() => choose(ticket)}><h3>{ticket.name}</h3><span>{text('已领取')}</span><p>{displayTime(ticket.pickup)} — {displayTime(ticket.returnAt)}</p><p>{text('适用据点')} · 2 {text('个据点可选')}</p><strong>{text('选择此租车券')} <RimoIcon name="ArrowRight" /></strong></button>)}{!tickets.length && <controls.Empty description={text('暂无可用租车券')} />}<button className="rimo-ticket-card inactive" onClick={() => setNotice(text('租车券已过期，无法继续预约。'))}><h3>{text('已过期租车券')}</h3><span>{text('已过期')}</span></button><button className="rimo-ticket-card inactive" onClick={() => setNotice(text('租车券已作废，请联系活动方或营运商。'))}><h3>{text('已作废租车券')}</h3><span>{text('已作废')}</span></button></>}
        {tab === 'history' && <>{orders.map(order => <section className="rimo-mobile-panel" key={order.orderId}><h3>{order.name}</h3><p>{displayTime(order.pickup)} — {displayTime(order.returnAt)}</p><p>{order.station} · {order.vehicle} · {order.plate}</p><p>{text(order.status === 'cancelled' ? '已取消' : '已预约')} · {text('用券人应付')} NT$0</p>{order.status !== 'cancelled' && <controls.Button onClick={() => cancelOrder(order)}>{text('取消预约')}</controls.Button>}</section>)}{!orders.length && <controls.Empty description={text('暂无历史记录')} />}</>}
        {tab === 'redeem' && <section className="rimo-mobile-panel"><h3>{text('输入兑换码')}</h3><controls.Input value={code} aria-label={text('兑换码')} onChange={event => { setCode(event.target.value); setError(''); }} placeholder="RIMO2026" />{error && <p role="alert" className="rimo-mobile-error">{error}</p>}<controls.Button type="primary" onClick={() => { if (code.trim().toUpperCase() !== 'RIMO2026' || redeemed) { setError(text('兑换码不存在、已领取或目前不可使用。')); return; } setTickets(previous => [...previous, redeemedTicket]); setRedeemed(true); setTab('mine'); setCode(''); }}>{text('兑换领取')}</controls.Button></section>}
      </>}
      {screen === 'station' && <><section className="rimo-mobile-panel"><h3>{selected.name}</h3><label>{text('预约取车时间')}<controls.Input type="datetime-local" value={pickupTime} min={selected.pickup} max={selected.returnAt} onChange={event => setPickupTime(event.target.value)} /></label><p>{text('最晚还车时间')}：{displayTime(selected.returnAt)}</p><p>{text('最晚还车时间与服务类型由租车券锁定')}</p>{!validTime && <p role="alert">{text('取车时间必须在批次时段内，并早于最晚还车时间。')}</p>}{compatible && <controls.Button type="text" onClick={() => setScreen('home')}>{text('退出租车券模式')}</controls.Button>}</section>{stations.map(item => <button type="button" disabled={!validTime} className="rimo-ticket-card" key={item.name} onClick={() => { setStation(item); setScreen('vehicle'); }}><h3>{item.name}</h3><p>{item.address}</p><strong>{text('查看可用车辆')}</strong></button>)}</>}
      {screen === 'vehicle' && <><section className="rimo-mobile-panel"><h3>{station.name}</h3><p>{station.address}</p></section>{availableVehicles.map(item => <button className="rimo-ticket-card" key={item.plate} onClick={() => { setVehicle(item); setScreen('confirm'); }}><RimoIcon name="Van" size={36} /><h3>{item.name}</h3><p>{item.type} · {item.plate}</p><strong>{text('选择车辆')}</strong></button>)}{!availableVehicles.length && <controls.Empty description={text('当前时段暂无可用车辆')} />}<controls.Button onClick={() => setScreen('station')}>{text('返回据点列表')}</controls.Button></>}
      {screen === 'confirm' && <><section className="rimo-mobile-panel"><h2>{vehicle.name}</h2><p>{vehicle.type} · {vehicle.plate}</p><p>{station.name}</p><h3>{selected.name}</h3><p>{displayTime(pickupTime)} — {displayTime(selected.returnAt)}</p></section><section className="rimo-mobile-panel"><h3>{text('用券人应付')} NT$0</h3><p>{text('本次租车费用由租车券所属合作企业承担，实际费用于还车结算后归属企业。')}</p><p>{text('个人支付、预授权、积分与优惠券不可使用。')}</p><controls.Checkbox checked={accepted} onChange={event => setAccepted(typeof event === 'boolean' ? event : event.target.checked)}>{text('我已阅读并同意租车条款')}</controls.Checkbox></section><div className="rimo-mobile-actions"><controls.Button onClick={() => setScreen('vehicle')}>{text('取消')}</controls.Button><controls.Button type="primary" disabled={!accepted || !validTime} onClick={reserve}>{text('使用租车券预约')}</controls.Button></div></>}
      {screen === 'success' && <section className="rimo-mobile-success"><RimoIcon name="CircleCheck" size={56} /><h2>{text('预约成功')}</h2><p>{selected.name}</p><p>{station.name} · {vehicle.plate}</p><p>{text('用券人应付')} NT$0</p><controls.Button type="primary" onClick={() => { setScreen('tickets'); setTab('mine'); }}>{text('再用一张租车券预约')}</controls.Button><controls.Button onClick={() => setScreen('home')}>{text('返回首页')}</controls.Button></section>}
    </div>
    <controls.Modal open={Boolean(notice)} title={text('租车券暂不可用')} onCancel={() => setNotice('')} footer={<controls.Button onClick={() => setNotice('')}>{text('我知道了')}</controls.Button>}>{notice}</controls.Modal>
  </div>;
}
