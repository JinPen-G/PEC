import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRimoModel } from '../../packages/component-library/src/rimo-rental/lib/rimo-model.js';
import devicesState from '../../packages/component-library/src/rimo-rental/blocks/tbox-management/tbox-management-model.js';
import companiesState from '../../packages/component-library/src/rimo-rental/blocks/rental-companies/rental-companies-model.js';
import storesState from '../../packages/component-library/src/rimo-rental/blocks/stores/stores-model.js';
import vehiclesState from '../../packages/component-library/src/rimo-rental/blocks/vehicles/vehicles-model.js';
import statusState from '../../packages/component-library/src/rimo-rental/blocks/vehicle-status-list/vehicle-status-list-model.js';
import consoleState from '../../packages/component-library/src/rimo-rental/blocks/vehicle-console/vehicle-console-model.js';

const disposals = [];
afterEach(() => {
  disposals.splice(0).forEach((dispose) => dispose());
  vi.useRealTimers();
});
function initialize(factory) {
  const services = {
    notify: vi.fn(() => vi.fn()),
    confirm: vi.fn().mockResolvedValue(true),
    navigate: vi.fn(),
  };
  const model = createRimoModel(services);
  model.initialize(factory);
  disposals.push(model.start());
  return { model, view: model.view, services };
}

describe('RIMO extended business models used by batch-generated views', () => {
  it('keeps cancelled device binding local and binds the originally submitted device', async () => {
    vi.useFakeTimers();
    const { model, view } = initialize(devicesState);
    const first = view.devices.find((device) => !device.boundPlate);
    const second = view.devices.find((device) => device.id !== first.id);
    const originalPlate = second.boundPlate;
    const originalCommunication = first.lastReturnTime;
    const target = view.unboundVehicles[0].plate;
    view.openBindDialog(first);
    model.write(['targetPlate'], target);
    model.write(['bindDialogVisible'], false);
    expect(first.boundPlate).toBeNull();
    view.openBindDialog(first);
    model.write(['targetPlate'], target);
    view.confirmBinding();
    view.openBindDialog(second, true);
    await vi.advanceTimersByTimeAsync(900);
    expect(view.devices.find((device) => device.id === first.id).boundPlate).toBe(target);
    expect(view.devices.find((device) => device.id === second.id).boundPlate).toBe(originalPlate);
    expect(view.devices.find((device) => device.id === first.id).lastReturnTime).toBe(originalCommunication);
    expect(view.bindDialogVisible).toBe(true);
  });

  it('returns an unbound vehicle to the available pool without losing its model', async () => {
    const { view } = initialize(devicesState);
    const device = view.devices.find((item) => item.boundPlate);
    const plate = device.boundPlate;
    const vehicleModel = device.vehicleModel;
    await view.unbindVehicle(device);
    expect(device.boundPlate).toBeNull();
    expect(view.unboundVehicles).toContainEqual({ plate, model: vehicleModel });
  });

  it('rejects a device target that became bound while submitting', async () => {
    vi.useFakeTimers();
    const { model, view, services } = initialize(devicesState);
    const first = view.devices.find((device) => !device.boundPlate);
    const second = view.devices.find((device) => device.id !== first.id);
    const target = view.unboundVehicles[0].plate;
    view.openBindDialog(first);
    model.write(['targetPlate'], target);
    view.confirmBinding();
    model.assign(second, 'boundPlate', target);
    await vi.advanceTimersByTimeAsync(900);
    expect(first.boundPlate).toBeNull();
    expect(view.isSubmitting).toBe(false);
    expect(services.notify).toHaveBeenCalledWith('error', expect.stringContaining('重新選擇'));
  });

  it('retains company scope and refuses identifier or name conflicts', async () => {
    const { model, view, services } = initialize(companiesState);
    const original = view.rows[0];
    const code = original.code;
    view.openDialog(original);
    model.assignRef('formRef', { validate: async () => true });
    model.assign(view.form, 'code', 'changed-id');
    await view.save();
    expect(view.rows[0].code).toBe(code);
    expect(services.notify).toHaveBeenCalledWith('error', expect.stringContaining('不可修改'));
    model.write(['permissionDemoMode'], 'COMPANY_MANAGE');
    expect(view.canCreateCompany).toBe(false);
    expect(view.permissionScopedRows.length).toBeLessThan(view.rows.length);
    model.write(['permissionDemoMode'], 'VIEW_ONLY');
    expect(view.rows.every((row) => !view.canManageRow(row))).toBe(true);
  });

  it('retains Date-based store hours and the existing company identity on save', async () => {
    const { model, view } = initialize(storesState);
    const row = view.rows[0];
    const company = row.companyId;
    const originalStart = row.counterServiceHours[0].getTime();
    view.openDialog(row);
    expect(view.form.counterServiceHours[0]).toBeInstanceOf(Date);
    expect(view.form.counterServiceHours[0]).not.toBe(row.counterServiceHours[0]);
    view.form.counterServiceHours[0].setHours(10);
    expect(row.counterServiceHours[0].getTime()).toBe(originalStart);
    model.assignRef('formRef', { validate: async () => true });
    model.assign(view.form, 'companyId', 'another-company');
    await view.save();
    expect(view.rows.find((item) => item.id === row.id).companyId).toBe(company);
    model.write(['permissionDemoMode'], 'VIEW_ONLY');
    expect(view.canCreateStore).toBe(false);
  });

  it('does not leak cancelled service edits or permit direct asset relocation', () => {
    const { model, view, services } = initialize(vehiclesState);
    const row = view.vehicles[0];
    const servicesBefore = [...row.serviceTypes];
    view.openDialog(row);
    view.currentVehicle.serviceTypes.push('extra-service');
    model.write(['dialogVisible'], false);
    expect(row.serviceTypes).toEqual(servicesBefore);
    view.openDialog(row);
    model.assignRef('formRef', { validate: (callback) => callback(true) });
    model.assign(view.currentVehicle, 'assetCompanyId', 'another-owner');
    view.saveVehicle();
    expect(view.vehicles.find((vehicle) => vehicle.id === row.id).assetCompanyId).toBe(row.assetCompanyId);
    expect(services.notify).toHaveBeenCalledWith('error', expect.any(String));
  });

  it('does not turn invalid coordinates or unknown telemetry into valid states', () => {
    const { view } = initialize(statusState);
    expect(view.hasMapPosition({ latitude: 999, longitude: 120 })).toBe(false);
    expect(view.hasMapPosition({ latitude: 25, longitude: null })).toBe(false);
    expect(view.hasMapPosition({ latitude: 25, longitude: 121 })).toBe(true);
    expect(view.formatBooleanState(null, '是', '否')).toBe('NA');
    view.openMapDialog({ latitude: 999, longitude: 120 });
    expect(view.mapDialogVisible).toBe(false);
  });

  it('refreshes cached console data without inventing a new receive timestamp', async () => {
    vi.useFakeTimers();
    const { view } = initialize(consoleState);
    await vi.advanceTimersByTimeAsync(800);
    const receivedAt = view.telemetry.receivedAt;
    await vi.advanceTimersByTimeAsync(2000);
    view.refreshTelemetry();
    await vi.advanceTimersByTimeAsync(800);
    expect(view.telemetry.receivedAt).toBe(receivedAt);
    expect(view.yesNo(null)).toBe('NA');
    expect(view.yesNo('0')).toBe('否');
  });

  it('keeps pending console commands attached to their original vehicle after switching', async () => {
    vi.useFakeTimers();
    const { view } = initialize(consoleState);
    await vi.advanceTimersByTimeAsync(800);
    const first = view.activeVehicle;
    const second = view.filteredVehicles.find((vehicle) => vehicle.id !== first.id);
    expect(view.isDeviceOnline).toBe(true);
    await view.sendCommand('UNLOCK_DOOR');
    view.selectVehicle(second);
    await vi.advanceTimersByTimeAsync(1500);
    expect(view.historyArchive.every((entry) => entry.plate === second.licensePlate)).toBe(true);
    view.selectVehicle(first);
    expect(view.historyArchive[0]).toMatchObject({
      plate: first.licensePlate,
      action: 'UNLOCK_DOOR',
      status: 'PENDING',
    });
  });
});
