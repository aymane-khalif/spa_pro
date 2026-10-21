import { useEffect, useState } from 'react';
import { api, csrf, errorText } from '../api';
import { Link } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '' });
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const fillForm = account => ({ nom: account.nom || '', prenom: account.prenom || '', telephone: account.telephone || '' });

  useEffect(() => {
    let active = true;
    api.get('/api/user').then(({ data }) => {
      if (active) { setUser(data); setForm(fillForm(data)); }
    }).catch(e => { if (active) setError(errorText(e)); });
    return () => { active = false; };
  }, []);

  async function uploadPhoto(event) {
    const input = event.target;
    const photo = input.files?.[0];
    if (!photo) return;
    setError(''); setSuccess('');
    if (!['image/jpeg','image/png','image/webp'].includes(photo.type) || photo.size > 2 * 1024 * 1024) {
      setError('Choisissez une image JPG, PNG ou WebP de 2 Mo maximum.'); input.value = ''; return;
    }
    setUploading(true);
    try {
      await csrf();
      const payload = new FormData(); payload.append('photo', photo);
      const { data } = await api.post('/api/profile/photo', payload);
      setUser(data); setSuccess('Votre photo de profil a été mise à jour.');
    } catch (e) { setError(errorText(e)); }
    finally { setUploading(false); input.value = ''; }
  }

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(''); setSuccess('');
    try {
      await csrf();
      const { data } = await api.put('/api/profile', form);
      setUser(data); setForm(fillForm(data)); setEditing(false);
      setSuccess('Votre profil a été mis à jour.');
    } catch (e) { setError(errorText(e)); }
    finally { setBusy(false); }
  }

  if (!user) return <main className="pro-panel"><h1>Mon profil</h1>{error ? <p role="alert">{error}</p> : <p>Chargement de votre compte…</p>}</main>;
  const initials = user.name.trim().split(/\s+/).slice(0, 2).map(word => Array.from(word)[0]).join('').toUpperCase();
  const joined = user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

  return <main className="pro-panel account-profile">
    <header className="profile-heading"><p className="profile-eyebrow">MON ESPACE LUNÉA</p><h1>Mon profil</h1><p>Retrouvez les informations de votre compte.</p></header>
    <div className="profile-layout">
      <aside className="profile-identity"><div className="profile-avatar">{user.profile_photo_url ? <img src={user.profile_photo_url} alt="Votre photo de profil"/> : <span aria-hidden="true">{initials}</span>}</div>
        <label className="profile-photo-picker">{uploading ? 'Envoi en cours…' : user.profile_photo_url ? 'Changer la photo' : 'Ajouter une photo'}<input type="file" accept="image/jpeg,image/png,image/webp" aria-label="Choisir une photo de profil" disabled={uploading || busy} onChange={uploadPhoto}/></label>
        <small className="profile-photo-help">JPG, PNG ou WebP · 2 Mo max.</small><h2>{user.name}</h2><p>{user.email}</p>{joined && <small>Membre depuis le {joined}</small>}<Link to="/mes-reservations" className="profile-reservations-link">Voir mes réservations ↗</Link></aside>
      <section className="profile-details" aria-label="Informations personnelles">
        <div className="profile-section-title"><h2>Informations personnelles</h2>{!editing && <button type="button" onClick={() => { setForm(fillForm(user)); setError(''); setSuccess(''); setEditing(true); }}>Modifier</button>}</div>
        {success && <p className="profile-success" role="status">{success}</p>}
        {error && <p role="alert">{error}</p>}
        {editing ? <form onSubmit={submit}>
          {['nom', 'prenom', 'telephone'].map(key => <label key={key}>{key === 'prenom' ? 'Prénom' : key === 'telephone' ? 'Téléphone' : 'Nom'}<input required type={key === 'telephone' ? 'tel' : 'text'} maxLength={key === 'telephone' ? 20 : 255} autoComplete={key === 'telephone' ? 'tel' : key === 'prenom' ? 'given-name' : 'family-name'} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}/></label>)}
          <label>Adresse e-mail<input type="email" value={user.email} readOnly aria-readonly="true"/></label>
          <div className="profile-actions"><button disabled={busy || uploading}>Enregistrer les modifications</button><button className="profile-cancel" type="button" disabled={busy || uploading} onClick={() => { setEditing(false); setError(''); }}>Annuler</button></div>
        </form> : <dl className="profile-fields">
          {[['Nom complet', user.name], ['Adresse e-mail', user.email], ['Nom', user.nom], ['Prénom', user.prenom], ['Téléphone', user.telephone]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Non renseigné'}</dd></div>)}
        </dl>}
      </section>
    </div>
  </main>;
}
