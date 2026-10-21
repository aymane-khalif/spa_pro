import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api, csrf, errorText } from '../api';
const clientFields = ['nom', 'prenom', 'email', 'telephone', 'date_inscription'];
const blankClient = { nom:'', prenom:'', email:'', telephone:'', date_inscription:new Date().toLocaleDateString('en-CA') };
const blankAppointment = { client_id:'', service_id:'', appointment_date:'', appointment_time:'', status:'pending' };
export default function Admin() {
 const location = useLocation(), resource = location.pathname.includes('messages') ? 'messages' : location.pathname.includes('clients') ? 'clients' : 'appointments';
 const [rows, setRows] = useState([]), [clients, setClients] = useState([]), [services, setServices] = useState([]), [error, setError] = useState(''), [loading, setLoading] = useState(false), [busy, setBusy] = useState(false), [search, setSearch] = useState(''), [form, setForm] = useState(null), [selected, setSelected] = useState(null);
 const requestNumber = useRef(0);
 const resourceRef = useRef(resource);
 resourceRef.current = resource;
 async function load() {
   const number = ++requestNumber.current;
   setLoading(true); setError('');
   try {
     const [r, c, s] = await Promise.all([
       api.get('/api/admin/' + resource, { params: resource === 'clients' ? { search } : {} }),
       resource === 'appointments' ? api.get('/api/admin/clients') : Promise.resolve(null),
       resource === 'appointments' ? api.get('/api/services') : Promise.resolve(null),
     ]);
     if (number !== requestNumber.current) return;
     setRows(r.data);
     if (c) setClients(c.data);
     if (s) setServices(s.data);
   } catch (e) { if (number === requestNumber.current) setError(errorText(e)); }
   finally { if (number === requestNumber.current) setLoading(false); }
 }
 useEffect(() => { setRows([]); setForm(null); setSelected(null); setSearch(''); }, [resource]);
 useEffect(() => { load(); return () => { requestNumber.current++; }; }, [resource, search]);
 async function mutate(method, suffix, data) {
   setBusy(true); setError('');
   try {
     await csrf();
     await api.request({ method, url: '/api/admin/' + resource + suffix, data });
     if (resourceRef.current !== resource) return;
     setForm(null); setSelected(null); await load();
   } catch (e) { if (resourceRef.current === resource) setError(errorText(e)); }
   finally { setBusy(false); }
 }
 function edit(row) { setForm(resource === 'clients' ? { ...row } : { ...row, appointment_time: row.appointment_time.slice(0,5) }); setSelected(null); }
 return <main className="pro-panel"><div className="pro-admin-links"><Link to="/admin/appointments">Rendez-vous</Link><Link to="/admin/clients">Clients</Link><Link to="/admin/messages">Messages</Link></div><h1>{{clients:'Gestion des clients',appointments:'Gestion des rendez-vous',messages:'Messages reçus'}[resource]}</h1><p role="alert">{error}</p>{loading && <p>Chargement…</p>}{resource === 'clients' && <label>Rechercher<input value={search} onChange={e => setSearch(e.target.value)}/></label>}{resource !== 'messages' && <button onClick={() => { setForm({ ...(resource === 'clients' ? blankClient : blankAppointment) }); setSelected(null); }}>Nouveau</button>}
 {form && <form onSubmit={e => { e.preventDefault(); const fields = resource === 'clients' ? clientFields : Object.keys(blankAppointment); const data = Object.fromEntries(fields.map(key => [key,form[key]])); mutate(form.id ? 'put':'post',form.id ? '/' + form.id:'',data); }}>
 {(resource === 'clients' ? clientFields : Object.keys(blankAppointment)).map(key => <label key={key}>{key}{['client_id','service_id','status'].includes(key) ? <select required value={form[key]} onChange={e => setForm({ ...form,[key]:e.target.value })}><option value="">Choisir</option>{key === 'status' ? ['pending','confirmed','cancelled'].map(s => <option key={s}>{s}</option>) : (key === 'client_id' ? clients : services).map(item => <option key={item.id} value={item.id}>{item.name || item.prenom + ' ' + item.nom}</option>)}</select> : <input required type={key.includes('date') ? 'date' : key.includes('time') ? 'time' : key === 'email' ? 'email':'text'} value={form[key]} onChange={e => setForm({ ...form,[key]:e.target.value })}/>}</label>)}<button disabled={busy}>Enregistrer</button><button type="button" onClick={() => setForm(null)}>Annuler</button></form>}
 {selected && <section><h2>Détails</h2>{Object.entries(selected).filter(([key]) => !['created_at','updated_at'].includes(key)).map(([key,value]) => <p key={key}><strong>{key}: </strong>{typeof value === 'object' ? (value?.name || (value ? value.prenom + ' ' + value.nom : '')) : String(value ?? '')}</p>)}<button onClick={() => setSelected(null)}>Fermer</button></section>}
 {!loading && rows.length === 0 && <p>Aucun résultat.</p>}<table><thead><tr><th>ID</th><th>{resource === 'messages' ? 'Sujet' : resource === 'clients' ? 'Client' : 'Service'}</th><th>{resource === 'appointments' ? 'Date / statut':'Email'}</th><th>Actions</th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td>{row.id}</td><td>{row.sujet || row.service?.name || row.prenom + ' ' + row.nom}</td><td>{resource === 'appointments' ? row.appointment_date + ' ' + row.appointment_time + ' · ' + row.status : row.email}</td><td><button onClick={() => setSelected(row)}>Voir</button>{resource !== 'messages' && <><button onClick={() => edit(row)}>Modifier</button><button disabled={busy} onClick={() => { if(window.confirm('Supprimer cet élément ? Les rendez-vous associés à un client seront aussi supprimés.')) mutate('delete','/' + row.id); }}>Supprimer</button></>}{resource === 'appointments' && <><button disabled={busy} onClick={() => mutate('patch','/' + row.id + '/status',{status:'confirmed'})}>Confirmer</button><button disabled={busy} onClick={() => mutate('patch','/' + row.id + '/status',{status:'cancelled'})}>Refuser</button></>}</td></tr>)}</tbody></table></main>;
}
