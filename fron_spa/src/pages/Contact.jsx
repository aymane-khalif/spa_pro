import { useState } from 'react';
import { api, csrf, errorText } from '../api';
export default function Contact() {
 const [data, setData] = useState({ nom: '', email: '', sujet: '', message: '' }), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
 async function submit(e) { e.preventDefault(); setBusy(true); setMessage(''); try { await csrf(); const result = await api.post('/api/contact', data); setMessage(result.data.message); setData({ nom: '', email: '', sujet: '', message: '' }); } catch (e) { setMessage(errorText(e)); } finally { setBusy(false); } }
 return <main className="pro-panel"><p>LUNÉA SPA</p><h1>Contactez-nous</h1><p>Rabat, Morocco · contact@luneaspa.com</p><form onSubmit={submit}>{Object.keys(data).map(key => <label key={key}>{key}{key === 'message' ? <textarea required maxLength={10000} value={data[key]} onChange={e => setData({ ...data, [key]: e.target.value })}/> : <input required type={key === 'email' ? 'email' : 'text'} maxLength={255} value={data[key]} onChange={e => setData({ ...data, [key]: e.target.value })}/>}</label>)}<button disabled={busy}>Envoyer le message</button><p role="status">{message}</p></form></main>;
}
