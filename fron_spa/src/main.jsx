import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { api, csrf, errorText } from './api';
import Home from './pages/Home';
import Services from './pages/Services';
import RendezVous from './pages/RendezVous';
import Connexion from './pages/connexion';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import MyReservations from './pages/MyReservations';
import Admin from './pages/Admin';
import './styles/app.css';
import './styles/pro.css';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import './styles/spa-theme.css';
function ServicePage({ booking = false }) {
 const [services, setServices] = useState(null), [error, setError] = useState(''); const location = useLocation();
 useEffect(() => { let active = true; api.get('/api/services').then(r => { if(active) setServices(r.data); }).catch(e => { if(active) setError(errorText(e)); }); return () => { active = false; }; }, []);
 if (error) return <p role="alert" className="pro-panel">{error}</p>;
 if (!services) return <p className="pro-panel">Chargement…</p>;
 if (booking) { const service = services.find(s => s.name === new URLSearchParams(location.search).get('service')); return service ? <RendezVous key={service.id} service={service}/> : <p className="pro-panel">Service introuvable. <Link to="/services">Voir les services</Link></p>; }
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
 const [user, setUser] = useState(null);
 useEffect(() => {
   let active = true;
   const titles = { '/': 'Accueil', '/services': 'Nos Services', '/contact': 'Contact', '/profil': 'Mon profil', '/mes-reservations': 'Mes réservations', '/connexion': 'Connexion', '/rendez-vous': 'Réservation' };
   document.title = (titles[location.pathname] || 'Administration') + ' | Lunéa Spa';
   api.get('/api/user').then(({ data }) => { if (active) setUser(data); }).catch(() => { if (active) setUser(null); });
   return () => { active = false; };
 }, [location.pathname]);
 async function logout() { try { await csrf(); await api.post('/api/logout'); window.location.assign('/connexion'); } catch(e) { setError(errorText(e)); } }
 return <>
   <header className={`site-header ${location.pathname === '/' ? 'site-header--home' : ''}`}>
     <nav className="lunea-navbar" aria-label="Navigation principale">
       <Link to="/" className="lunea-logo" aria-label="Lunéa Spa — Accueil">
         <span className="logo-name"><svg className="brand-lotus" viewBox="0 0 44 44" fill="none" aria-hidden="true"><path d="M22 35C9 30 5 23 7 14c8 0 13 7 15 21Zm0 0c13-5 17-12 15-21-8 0-13 7-15 21Zm0 0C12 23 14 12 22 5c8 7 10 18 0 30ZM7 35c10 6 20 6 30 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>Lunéa<span className="logo-spa-word">SPA</span></span>
         <span className="logo-subtitle">WELLNESS &amp; RELAXATION</span>
       </Link>
       <div className="nav-links">
         <Link to="/" aria-current={location.pathname === '/' ? 'page' : undefined}>Home</Link>
         <Link to="/services" aria-current={location.pathname === '/services' ? 'page' : undefined}>Services</Link>
         <Link to="/contact" aria-current={location.pathname === '/contact' ? 'page' : undefined}>Contact</Link>
         {user?.is_admin && <Link to="/admin/appointments">Administration</Link>}
       </div>
       <div className="site-account">
         {user ? <><Link to="/mes-reservations" className="site-profile">Mes réservations</Link><Link to="/profil" className="site-profile">Mon profil</Link><button type="button" className="login-btn" onClick={logout}>Déconnexion</button></> : <Link to="/connexion" className="login-btn">Connexion</Link>}
       </div>
     </nav>
     {error && <p className="site-nav-error" role="alert">{error}</p>}
   </header>
 </>;
}
function Footer() {
 return <footer className="spa-footer"><div className="spa-footer-top"><div><div className="footer-brand">Lunéa Spa<span aria-hidden="true"> ✧</span></div><p>Un lieu pour ralentir. Un moment pour vous.<br/>Beauté · Bien-être · Détente</p></div><div className="spa-footer-links"><Link to="/">Accueil</Link><Link to="/services">Nos soins</Link><Link to="/contact">Nous contacter</Link></div><div><p>Rabat, Maroc<br/>contact@luneaspa.com</p></div></div><div className="spa-footer-bottom"><span>© {new Date().getFullYear()} Lunéa Spa</span><span>Le bien-être, tout simplement.</span></div></footer>;
}
function App() { return <BrowserRouter><Navigation/><Routes><Route path="/" element={<Home/>}/><Route path="/services" element={<ServicePage/>}/><Route path="/rendez-vous" element={<Protected><ServicePage booking/></Protected>}/><Route path="/connexion" element={<Connexion/>}/><Route path="/login" element={<Navigate to="/connexion" replace/>}/><Route path="/contact" element={<Contact/>}/><Route path="/profil" element={<Protected><Profile/></Protected>}/><Route path="/mes-reservations" element={<Protected><MyReservations/></Protected>}/><Route path="/mon-rendez-vous" element={<Navigate to="/services" replace/>}/><Route path="/admin/*" element={<Protected admin><Admin/></Protected>}/><Route path="/clients/*" element={<Navigate to="/admin/clients" replace/>}/><Route path="/appointments/*" element={<Navigate to="/admin/appointments" replace/>}/><Route path="*" element={<main className="pro-panel">Page introuvable.</main>}/></Routes><Footer/></BrowserRouter>; }
createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
