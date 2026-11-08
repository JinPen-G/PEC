import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Form, Input, Modal } from '@preview/ui/admin';
import { Button } from '@preview/ui/admin';
import { useNativeAuth } from './platform-api';
import { LocalizedView } from '@/features/showcase/showcase-locale';
import { loginAfterPasswordChange } from './login-route';

export function PasswordForm({ required = false, onClose }: { required?: boolean; onClose?: () => void }) {
  const { client, refresh } = useNativeAuth();
  const navigate = useNavigate(),
    location = useLocation();
  const [error, setError] = useState(''),
    [pending, setPending] = useState(false);
  const [form] = Form.useForm();
  const submit = async (input: { currentPassword: string; password: string }) => {
    setPending(true);
    setError('');
    try {
      await client.changePassword(input);
      await refresh();
      onClose?.();
      navigate(loginAfterPasswordChange(location.pathname, location.search), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '修改失败');
    } finally {
      setPending(false);
    }
  };
  const content = (
    <Form form={form} layout="vertical" onFinish={(values) => void submit(values)} disabled={pending}>
      {required && (
        <Alert type="info" title="首次登录或管理员重置后需要修改密码" style={{ marginBottom: 16 }} />
      )}
      <Form.Item label="当前密码" name="currentPassword" rules={[{ required: true }]}>
        <Input.Password autoComplete="current-password" />
      </Form.Item>
      <Form.Item label="新密码" name="password" rules={[{ required: true, min: 8, max: 128 }]}>
        <Input.Password autoComplete="new-password" />
      </Form.Item>
      <Form.Item
        label="确认新密码"
        name="confirm"
        dependencies={['password']}
        rules={[
          { required: true },
          ({ getFieldValue }) => ({
            validator: (_, value) =>
              value === getFieldValue('password')
                ? Promise.resolve()
                : Promise.reject(new Error('两次密码不一致')),
          }),
        ]}
      >
        <Input.Password autoComplete="new-password" />
      </Form.Item>
      {error && <Alert type="error" title={error} style={{ marginBottom: 16 }} />}
      <Button type="primary" htmlType="submit" disabled={pending} loading={pending}>
        修改密码并重新登录
      </Button>
    </Form>
  );
  return (
    <LocalizedView>
      {required ? (
        <main className="native-password-page">
          <h1>修改密码</h1>
          {content}
        </main>
      ) : (
        <Modal open title="修改密码" onCancel={pending ? undefined : onClose} footer={null} destroyOnHidden>
          {content}
        </Modal>
      )}
    </LocalizedView>
  );
}
