import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { api, csrf, errorText } from './api';
import Home from './pages/Home';
import Services from './pages/Services';
import RendezVous from './pages/RendezVous';
import Connexion from './pages/connexion';
import Contact from './pages/Contact';
import Tracking from './pages/Tracking';
import Admin from './pages/Admin';
import './styles/app.css';
import './styles/pro.css';
function ServicePage({ booking = false }) {
 const [services, setServices] = useState(null), [error, setError] = useState(''); const location = useLocation();
 useEffect(() => { let active = true; api.get('/api/services').then(r => { if(active) setServices(r.data); }).catch(e => { if(active) setError(errorText(e)); }); return () => { active = false; }; }, []);
 if (error) return <p role="alert" className="pro-panel">{error}</p>;
 if (!services) return <p className="pro-panel">Chargement…</p>;
 if (booking) { const service = services.find(s => s.name === new URLSearchParams(location.search).get('service')); return service ? <RendezVous service={service}/> : <p className="pro-panel">Service introuvable. <Link to="/services">Voir les services</Link></p>; }
 return <><Services services={services}/>{services.length === 0 && <p className="pro-panel">Aucun service disponible pour le moment.</p>}</>;
}
function Protected({ children, admin = false }) {
 const location = useLocation(); const [user, setUser] = useState(undefined), [error, setError] = useState('');
 useEffect(() => { let active = true; api.get('/api/user').then(r => { if(active) setUser(r.data); }).catch(e => { if(active) { if (e.response?.status === 401) setUser(null); else setError(errorText(e)); } }); return () => { active = false; }; }, []);
 if (error) return <p className="pro-panel">{error}</p>;
 if (user === undefined) return <p className="pro-panel">Chargement…</p>;
 if (!user) return <Navigate to="/connexion" replace state={{ from: location.pathname + location.search }}/>;
 if (admin && !user.is_admin) return <p className="pro-panel">Accès réservé à l'administration.</p>;
 return children;
}
function Navigation() {
 const location = useLocation(); const [error, setError] = useState('');
 async function logout() { try { await csrf(); await api.post('/api/logout'); window.location.assign('/connexion'); } catch(e) { setError(errorText(e)); } }
 return <><nav className="pro-nav"><Link to="/">Lunéa Spa</Link><Link to="/services">Services</Link><Link to="/mon-rendez-vous">Suivi</Link><Link to="/contact">Contact</Link><Link to="/connexion">Connexion</Link><Link to="/admin/appointments">Administration</Link>{location.pathname !== '/connexion' && <button onClick={logout}>Déconnexion</button>}</nav>{error && <p role="alert">{error}</p>}</>;
}
function App() { return <BrowserRouter><Navigation/><Routes><Route path="/" element={<Home/>}/><Route path="/services" element={<ServicePage/>}/><Route path="/rendez-vous" element={<Protected><ServicePage booking/></Protected>}/><Route path="/connexion" element={<Connexion/>}/><Route path="/login" element={<Navigate to="/connexion" replace/>}/><Route path="/contact" element={<Contact/>}/><Route path="/mon-rendez-vous" element={<Tracking/>}/><Route path="/admin/*" element={<Protected admin><Admin/></Protected>}/><Route path="/clients/*" element={<Navigate to="/admin/clients" replace/>}/><Route path="/appointments/*" element={<Navigate to="/admin/appointments" replace/>}/><Route path="*" element={<main className="pro-panel">Page introuvable.</main>}/></Routes></BrowserRouter>; }
createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
