import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, csrf, errorText } from './api';
export function useForm(initial) {
  const [data, update] = useState(initial), [processing, busy] = useState(false), [errors, fail] = useState({});
  const navigate = useNavigate(), location = useLocation();
  return { data, processing, errors, setData: (key, value) => update(old => ({ ...old, [key]: value })), post: async path => {
    busy(true); fail({});
    try { await csrf(); await api.post('/api' + path, data); navigate(location.state?.from || '/services', { replace: true }); }
    catch (error) { const fields = error.response?.data?.errors; fail(fields ? Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, value[0]])) : { email: errorText(error) }); }
    finally { busy(false); }
  }};
}
