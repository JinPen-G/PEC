import { createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import VehicleGroupsBlock from '../../packages/component-library/src/rimo-rental/blocks/vehicle-groups/VehicleGroupsBlock.jsx';
import PricingBlock from '../../packages/component-library/src/rimo-rental/blocks/pricing/PricingBlock.jsx';
import { createRimoModel } from '../../packages/component-library/src/rimo-rental/lib/rimo-model.js';
import groupsState from '../../packages/component-library/src/rimo-rental/blocks/vehicle-groups/vehicle-groups-model.js';
import transferState from '../../packages/component-library/src/rimo-rental/blocks/vehicle-transfer/vehicle-transfer-model.js';
import pricingState from '../../packages/component-library/src/rimo-rental/blocks/pricing/pricing-model.js';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const initialize = (factory) => {
  const services = {
    notify: vi.fn(() => vi.fn()),
    confirm: vi.fn().mockResolvedValue(true),
    navigate: vi.fn(),
  };
  const model = createRimoModel(services);
  model.initialize(factory);
  return model;
};

describe('handwritten RIMO business views', () => {
  it('keeps all vehicle group fields, photo management and tags in the native editor', async () => {
    const { container } = render(createElement(VehicleGroupsBlock));
    expect(
      container.querySelector('[data-prototype-shell], .prototype-sidebar, .prototype-topbar'),
    ).toBeNull();
    expect(screen.getByRole('button', { name: '管理品牌庫' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: '搜索品牌或型號' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '新增車型組' }));
    const dialog = await screen.findByRole('dialog');
    for (const label of [
      '載具類型',
      '品牌',
      '型號',
      '年款',
      '所屬類型',
      '座位數',
      '排量',
      '油箱容量 (L)',
      '行李箱容量 (L)',
      '特性標籤 (逗號分隔)',
    ])
      expect(within(dialog).getByLabelText(label)).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: '上傳圖片' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /保\s*存/ })).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: /取\s*消/ }));
    expect(screen.getByText('Tesla Model 3')).toBeInTheDocument();
  });

  it('renders both pricing business tabs, rate versions and schedule actions instead of an empty shell', async () => {
    const { container } = render(createElement(PricingBlock));
    expect(
      container.querySelector('[data-prototype-shell], .prototype-sidebar, .prototype-topbar'),
    ).toBeNull();
    const tabs = [...container.querySelectorAll('[role="tab"]')];
    expect(tabs.map((tab) => tab.textContent)).toEqual(['門市租賃', '分時租賃']);
    expect(screen.getByText('歷史版本').closest('button')).toBeInTheDocument();
    expect(screen.getByText('新增計劃').closest('button')).toBeInTheDocument();
    fireEvent.click(tabs[1]);
    expect(await screen.findByText('同站租還', { selector: 'th' })).toBeInTheDocument();
    expect(screen.getByText('甲租乙還', { selector: 'th' })).toBeInTheDocument();
  }, 15000);

  it('retains brand types, all saved group fields and ordered photos', () => {
    const model = initialize(groupsState);
    const view = model.view;
    view.openDialog(null);
    const draft = {
      vehicleType: 'car',
      brand: 'Example',
      model: 'Touring',
      year: '2026',
      originType: 'domestic',
      seatCount: 7,
      displacement: '2.0L',
      fuelTankCapacity: 60,
      trunkCapacity: 800,
    };
    for (const [key, value] of Object.entries(draft)) model.write(['currentGroup', key], value);
    model.write(['featureInput'], '倒車影像,全景天窗');
    view.handlePhotoChange({ raw: {}, name: 'first', url: 'data:image/png;base64,AA==' });
    view.handlePhotoChange({ raw: {}, name: 'second', url: 'data:image/png;base64,BB==' });
    view.saveGroup();
    const saved = view.groupsData.at(-1);
    expect(saved).toMatchObject(draft);
    expect(saved.features).toEqual(['倒車影像', '全景天窗']);
    expect(saved.photoList).toHaveLength(2);
    expect(saved.defaultPhotoUrl).toBe(saved.photoList[0].url);
    view.openDialog(saved);
    view.removePhotoByIndex(0);
    expect(view.currentGroup.defaultPhotoUrl).toBe('data:image/png;base64,BB==');
    view.clearPhoto();
    expect(view.currentGroup.photoList).toEqual([]);
    expect(saved.photoList).toHaveLength(2);
  });

  it('keeps transfer drafts separate until confirmation and ignores unchanged vehicles', async () => {
    vi.useFakeTimers();
    const model = initialize(transferState);
    const stop = model.start();
    const view = model.view;
    const vehicle = view.allVehicles[0];
    view.openSingleTransfer(vehicle);
    model.assign(view.transferList[0], 'targetStationId', 's-4');
    expect(vehicle.currentStationId).toBe('s-1');
    model.write(['transferDrawerVisible'], false);
    view.openSingleTransfer(vehicle);
    expect(view.changedVehicleCount).toBe(0);
    model.assign(view.transferList[0], 'targetStationId', 's-4');
    model.assign(view.transferList[0], 'targetServiceType', 'STORE_STANDARD');
    view.submitTransfer();
    await vi.advanceTimersByTimeAsync(1000);
    expect(vehicle).toMatchObject({ currentStationId: 's-4', currentServiceType: 'STORE_STANDARD' });
    expect(view.transferDrawerVisible).toBe(false);
    stop();
  });

  it('restores cancelled price edits and retains scheduled prices and historical rate fields', () => {
    const model = initialize(pricingState);
    const view = model.view;
    const previous = view.vehicleGroups[0].dailyPrice;
    view.unlockPricing();
    model.assign(view.vehicleGroups[0], 'dailyPrice', 900);
    view.handlePriceChange();
    view.cancelEdit();
    expect(view.vehicleGroups[0].dailyPrice).toBe(previous);
    view.switchTenant('SHARING_ONEWAY');
    expect(view.hasStoreBusinessPermission).toBe(false);
    expect(view.hasPermission('SHARING_ROUND')).toBe(false);
    expect(view.hasPermission('SHARING_ONEWAY')).toBe(true);
    view.openScheduleDialog();
    model.write(['scheduleForm', 'summary'], '調價');
    model.write(['scheduleForm', 'effectiveTime'], '2027-01-01 00:00:00');
    view.batchSetNewPrice();
    view.confirmSchedule();
    expect(view.scheduledList[0].changes).toHaveLength(view.vehicleGroups.length);
    expect(view.scheduledList[0].status).toBe('待執行');
    view.cancelSchedule(0);
    expect(view.scheduledList[0].status).toBe('已取消');
    expect(view.storePriceVersions[0].values[0]).toHaveProperty('mileage');
    expect(view.storePriceVersions[0].values[0]).toHaveProperty('lastUpdated');
  });

  it('does not apply a cancelled bulk pricing confirmation', async () => {
    const model = createRimoModel({
      notify: vi.fn(),
      confirm: vi.fn().mockRejectedValue(new Error('cancel')),
    });
    model.initialize(pricingState);
    const before = JSON.stringify(model.view.sharingGroups);
    model.write(['sharingBatchMsg'], 10);
    await model.view.applySharingBatch();
    expect(JSON.stringify(model.view.sharingGroups)).toBe(before);
  });
});
