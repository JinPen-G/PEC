import { createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, act, within, waitFor } from '@testing-library/react';
import * as antd from 'antd';
import dayjs from 'dayjs';
import {
  RimoElement,
  RimoMarkup,
} from '../../packages/component-library/src/rimo-rental/lib/RimoElements.jsx';
import { RimoEnvironmentProvider } from '../../packages/component-library/src/rimo-rental/lib/RimoEnvironment.jsx';

afterEach(cleanup);
const element = (kind, props, ...children) => createElement(RimoElement, { kind, ...props }, ...children);
const host = (content, controls = {}, extra = {}) =>
  createElement(RimoEnvironmentProvider, { controls: { ...antd, ...controls }, ...extra }, content);

describe('RIMO shared native controls', () => {
  it('provides source filters to the standard table toolbar and keeps columns and row actions', () => {
    let received;
    const Table = (props) => {
      received = props;
      return createElement('div', {}, props.toolbar);
    };
    const action = vi.fn();
    render(
      host(
        element(
          'el-table',
          {
            data: [{ id: 'one', plate: 'RIMO-001' }],
            slots: { toolbar: () => element('el-input', { placeholder: '搜索车辆', modelValue: '' }) },
          },
          element('el-table-column', {
            prop: 'plate',
            label: '车牌',
            minWidth: '220',
            slots: {
              default: ({ row }) => createElement('button', { onClick: () => action(row) }, row.plate),
            },
          }),
          element('el-table-column', { label: '操作', width: '150', fixed: 'right' }),
        ),
        { Table },
      ),
    );
    expect(screen.getByPlaceholderText('搜索车辆')).toBeInTheDocument();
    expect(received.columns[0]).toMatchObject({ dataIndex: 'plate', width: 220 });
    expect(received.columns[1].fixed).toBe(false);
    const cell = received.columns[0].render(null, received.dataSource[0], 0);
    render(cell);
    fireEvent.click(screen.getByRole('button', { name: 'RIMO-001' }));
    expect(action).toHaveBeenCalledWith({ id: 'one', plate: 'RIMO-001' });
  });

  it('uses complete cascader paths instead of replacing them with a leaf string', () => {
    let received;
    const Select = (props) => {
      received = props;
      return createElement('button', { onClick: () => props.onChange('["company","store"]') }, '选择');
    };
    const change = vi.fn();
    render(
      host(
        element('el-cascader', {
          modelValue: ['company'],
          props: { value: 'id', checkStrictly: true },
          options: [{ id: 'company', label: '车行', children: [{ id: 'store', label: '门市' }] }],
          onModelChange: change,
        }),
        { Select },
      ),
    );
    expect(received.value).toBe('["company"]');
    fireEvent.click(screen.getByRole('button', { name: '选择' }));
    expect(change).toHaveBeenCalledWith(['company', 'store']);
  });

  it('reads multiple and emitPath from the original organization settings', () => {
    let received;
    const Select = (props) => {
      received = props;
      return null;
    };
    const change = vi.fn();
    render(
      host(
        element('el-cascader', {
          modelValue: ['store'],
          props: { multiple: true, emitPath: false, checkStrictly: true },
          options: [{ value: 'store', label: '门市' }],
          onModelChange: change,
        }),
        { Select },
      ),
    );
    expect(received.mode).toBe('multiple');
    expect(received.value).toEqual(['store']);
    received.onChange(['store']);
    expect(change).toHaveBeenCalledWith(['store']);
  });

  it('shows an empty selection placeholder without losing an explicit empty-value option', () => {
    const received = [];
    const Select = (props) => {
      received.push(props);
      return null;
    };
    render(
      host(
        element('el-select', {
          modelValue: '',
          placeholder: '营运状态',
          options: [{ value: 'ACTIVE', label: '营运中' }],
        }),
        { Select },
      ),
    );
    render(
      host(element('el-select', { modelValue: '', options: [{ value: '', label: '全部' }] }), { Select }),
    );
    expect(received[0].value).toBeUndefined();
    expect(received[0]['aria-label']).toBe('营运状态');
    expect(received[1].value).toBe('');
  });

  it('retains both Date values when changing a store service time', () => {
    const start = new Date(2026, 10, 9, 8);
    const end = new Date(2026, 10, 9, 20);
    const change = vi.fn();
    render(
      host(
        element('el-time-picker', {
          isRange: true,
          modelValue: [start, end],
          startPlaceholder: '开始时间',
          endPlaceholder: '结束时间',
          onModelChange: change,
        }),
      ),
    );
    expect(screen.getByLabelText('开始时间')).toHaveValue('08:00');
    expect(screen.getByLabelText('结束时间')).toHaveValue('20:00');
    fireEvent.change(screen.getByLabelText('结束时间'), { target: { value: '19:15' } });
    expect(change).toHaveBeenCalledWith([start, new Date(2026, 10, 9, 19, 15)]);
  });

  it('passes Date-based validation and preserves an explicit date format', () => {
    let received;
    const DatePicker = (props) => {
      received = props;
      return null;
    };
    const change = vi.fn();
    const disabledDate = vi.fn(() => false);
    render(
      host(
        element('el-date-picker', {
          type: 'datetime',
          modelValue: new Date(2026, 10, 9),
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
          disabledDate,
          onModelChange: change,
        }),
        { DatePicker },
      ),
    );
    received.disabledDate(dayjs('2026-11-09'));
    expect(disabledDate).toHaveBeenCalledWith(new Date(2026, 10, 9));
    received.onChange(dayjs('2026-11-09 10:15:00'));
    expect(change).toHaveBeenCalledWith('2026-11-09 10:15:00');
  });

  it('validates the actual edited model and releases form refs on unmount', async () => {
    const values = { name: '' };
    let contract;
    const reference = vi.fn((value) => {
      contract = value;
    });
    const view = render(
      host(
        element(
          'el-form',
          { model: values, modelRef: reference, rules: { name: [{ required: true, message: '名称必填' }] } },
          element(
            'el-form-item',
            { label: '名称', prop: 'name' },
            element('el-input', {
              modelValue: values.name,
              onModelChange: (value) => {
                values.name = value;
              },
            }),
          ),
        ),
      ),
    );
    await act(async () => {
      await expect(contract.validate()).rejects.toBeTruthy();
    });
    fireEvent.change(screen.getByLabelText('名称'), { target: { value: '示例门市' } });
    await act(async () => {
      await expect(contract.validate()).resolves.toBe(true);
    });
    expect(values.name).toBe('示例门市');
    view.unmount();
    expect(reference).toHaveBeenLastCalledWith(null);
  });

  it('preserves v-show-mounted controls and forwards closed callbacks', () => {
    let received;
    const Modal = (props) => {
      received = props;
      return createElement('div', {}, props.children);
    };
    const closed = vi.fn();
    render(
      host(
        element(
          'el-dialog',
          { title: '详情', modelValue: true, onClosed: closed, closeOnClickModal: false },
          () => element('el-input', { hidden: true, modelValue: '保留', placeholder: '隐藏字段' }),
        ),
        { Modal },
      ),
    );
    expect(screen.getByPlaceholderText('隐藏字段')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('隐藏字段')).not.toBeVisible();
    expect(received.maskClosable).toBe(false);
    received.afterClose();
    expect(closed).toHaveBeenCalledOnce();
  });

  it('translates control labels and does not publish unsanitized rich text', () => {
    const translations = { 名稱: '名称', 搜尋: '搜索' };
    render(
      host(
        element(
          'el-form',
          { model: {} },
          element('el-form-item', { label: '名稱' }, element('el-input', { placeholder: '搜尋' })),
        ),
        {},
        { text: (value) => translations[value] ?? value },
      ),
    );
    expect(screen.getByText('名称')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('搜索')).toBeInTheDocument();
    const { container } = render(
      createElement(RimoMarkup, {
        html: '<span class="result">命中</span><img src=x onerror=alert(1)><script>alert(1)</script>',
      }),
    );
    expect(container.querySelector('span.result')).toHaveTextContent('命中');
    expect(container.querySelector('script, img, [onerror]')).toBeNull();
  });

  it('retains attachment selections, enforces source limits, supports remove and accepts a replacement', async () => {
    const change = vi.fn();
    const remove = vi.fn();
    const exceed = vi.fn();
    render(
      host(
        element('el-upload', {
          accept: '.csv',
          limit: 1,
          autoUpload: false,
          onChange: change,
          onRemove: remove,
          onExceed: exceed,
        }),
      ),
    );
    const input = screen.getByLabelText('选择附件文件');
    const file = new File(['plate\nRIMO-001'], 'vehicles.csv', { type: 'text/csv' });
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    expect(change).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'vehicles.csv', raw: file, status: 'ready' }),
      expect.any(Array),
    );
    expect(screen.getByText('vehicles.csv')).toBeInTheDocument();
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    expect(exceed).toHaveBeenCalledOnce();
    expect(change).toHaveBeenCalledOnce();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '移除' }));
    });
    expect(remove).toHaveBeenCalledWith(expect.objectContaining({ name: 'vehicles.csv' }), []);
    expect(screen.queryByText('vehicles.csv')).not.toBeInTheDocument();
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    expect(change).toHaveBeenCalledTimes(2);
  });

  it('opens the complete image gallery and closes only its own modal', async () => {
    const first = 'data:image/png;base64,YQ==';
    const second = 'data:image/png;base64,Yg==';
    const Modal = (props) => createElement(antd.Modal, { ...props, transitionName: '', maskTransitionName: '' });
    render(host(element('el-image', { src: first, alt: '车辆照片', previewSrcList: [first, second] }), { Modal }));
    fireEvent.click(screen.getByRole('button', { name: '预览图片' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('img', { name: '车辆照片' })).toHaveAttribute('src', first);
    fireEvent.click(within(dialog).getByRole('button', { name: '下一张' }));
    expect(within(dialog).getByRole('img', { name: '车辆照片' })).toHaveAttribute('src', second);
    expect(within(dialog).getByRole('button', { name: '下一张' })).toBeDisabled();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: '预览图片' })).toBeInTheDocument();
  });
});
