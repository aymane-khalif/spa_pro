import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorText } from '../api';

const pictures = { 'Relaxing Massage':'relaxing.jpg', 'Facial Treatment':'facial.jpg', 'Body Care':'body.jpg', Aromatherapy:'massage.jpg', 'Hammam Spa':'hamam.jpg', 'Signature Head Massage':'signature.jpg' };
const statusNames = { confirmed:'Confirmé', pending:'En attente', cancelled:'Annulé' };
function formatDate(value) {
  return new Date(value.slice(0,10) + 'T12:00:00').toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
}
export default function MyReservations() {
  const [page,setPage]=useState(1),[result,setResult]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[revision,setRevision]=useState(0);
  useEffect(()=>{
    let active=true; setLoading(true); setError('');
    api.get('/api/my-appointments',{params:{page}}).then(({data})=>{if(active)setResult(data);}).catch(e=>{if(active)setError(errorText(e));}).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[page,revision]);
  return <main className="pro-panel my-reservations">
    <header className="reservations-heading"><div><p className="editorial-eyebrow">MES MOMENTS LUNÉA</p><h1>Mes réservations</h1><p>Retrouvez vos rendez-vous et les détails de chaque soin.</p></div><Link to="/services" className="hero-primary">Réserver un soin ↗</Link></header>
    {loading ? <p role="status">Chargement de vos réservations…</p> : error ? <div role="alert"><p>{error}</p><button onClick={()=>setRevision(value=>value+1)}>Réessayer</button></div> : !result?.data.length ? <section className="reservations-empty"><span aria-hidden="true">✧</span><h2>Votre prochaine pause vous attend.</h2><p>Vous n’avez pas encore de réservation. Découvrez nos soins et choisissez votre moment.</p><Link to="/services" className="editorial-link">Découvrir les soins ↗</Link></section> : <>
      <p className="reservations-count">{result.total} réservation{result.total > 1 ? 's' : ''}</p>
      <ul className="reservation-list">{result.data.map(appointment=><li className="reservation-item" key={appointment.id}>
        <img loading="lazy" src={'/images/'+(pictures[appointment.service?.name]||'spa.jpg')} alt={appointment.service?.name||'Soin'}/>
        <div className="reservation-info"><span className={'reservation-status status-'+appointment.status}>{statusNames[appointment.status]||appointment.status}</span><h2>{appointment.service?.name||'Soin'}</h2><p className="reservation-date">{formatDate(appointment.appointment_date)} · {appointment.appointment_time.slice(0,5)}</p><p className="reservation-meta">{appointment.service?.duration} min · Horaire du spa (Maroc)</p></div>
        <div className="reservation-price">{new Intl.NumberFormat('fr-MA',{maximumFractionDigits:2}).format(Number(appointment.service?.price||0))}<small>DH</small></div>
      </li>)}</ul>
      {result.last_page>1&&<nav className="reservation-pagination" aria-label="Pages de réservations"><button disabled={page===1} onClick={()=>setPage(value=>value-1)}>Précédent</button><span>Page {result.current_page} / {result.last_page}</span><button disabled={page>=result.last_page} onClick={()=>setPage(value=>value+1)}>Suivant</button></nav>}
    </>}
  </main>;
}
