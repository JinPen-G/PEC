/** Shared account submission for both login shells. Initial administrator setup
 * stays explicit; credentials only reach Preview's existing identity client. */
import { useRef, useState, type FormEvent } from 'react';
import { useNativeAuth } from './platform-api';
export function useNativeLoginForm() {
  const { session, client, login, refresh } = useNativeAuth();
  const initializing = session?.initialized === false;
  const [username, setUsername] = useState(''),
    [password, setPassword] = useState(''),
    [displayName, setDisplayName] = useState('');
  const [pending, setPending] = useState(false),
    [error, setError] = useState('');
  const submitting = useRef(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setError('');
    try {
      if (initializing) {
        await client.bootstrap({ username, password, displayName });
        await refresh();
      }
      await login(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      submitting.current = false;
      setPending(false);
      setPassword('');
    }
  };
  return {
    initializing,
    username,
    setUsername,
    password,
    setPassword,
    displayName,
    setDisplayName,
    pending,
    error,
    submit,
  };
}
