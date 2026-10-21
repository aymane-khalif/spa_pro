import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api, csrf, errorText } from '../api';
export default function Tracking() {
 const location = useLocation(); const initial = location.state?.code || '';
 const [code, setCode] = useState(initial), [appointment, setAppointment] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
 async function submit(e) { e.preventDefault(); setError(''); setAppointment(null); setBusy(true); try { await csrf(); setAppointment((await api.post('/api/appointments/suivi', { code_suivi: code })).data); } catch (e) { setError(e.response?.status === 404 ? 'Code de suivi incorrect ou inexistant.' : errorText(e)); } finally { setBusy(false); } }
 return <main className="pro-panel"><h1>Suivre mon rendez-vous</h1>{initial && <p>Votre demande a été envoyée. Gardez votre code : <strong>{initial}</strong></p>}<form onSubmit={submit}><label>Code de suivi<input required value={code} onChange={e => setCode(e.target.value)}/></label><button disabled={busy}>Voir le statut</button></form><p role="alert">{error}</p>{appointment && <section><h2>{appointment.service?.name}</h2><p>{appointment.appointment_date} à {appointment.appointment_time}</p><strong>{{ pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Refusé' }[appointment.status]}</strong></section>}</main>;
}
