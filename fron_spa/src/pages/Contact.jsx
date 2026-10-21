import { useEffect, useState } from 'react';
import { api, csrf, errorText } from '../api';

export default function Contact() {
 const [data,setData]=useState({nom:'',email:'',sujet:'',message:''}),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[user,setUser]=useState(undefined),[authError,setAuthError]=useState('');
 useEffect(()=>{let active=true;api.get('/api/user').then(({data})=>{if(active)setUser(data);}).catch(e=>{if(!active)return;if(e.response?.status===401)setUser(null);else setAuthError(errorText(e));});return()=>{active=false;};},[]);
 async function submit(e) {e.preventDefault();setBusy(true);setMessage('');try{await csrf();const payload=user?{sujet:data.sujet,message:data.message}:data;const result=await api.post('/api/contact',payload);setMessage(result.data.message);setData({...data,sujet:'',message:''});}catch(e){setMessage(errorText(e));}finally{setBusy(false);}}
 const fields=user?['sujet','message']:['nom','email','sujet','message'];
 return <main className="pro-panel"><p>LUNÉA SPA</p><h1>Contactez-nous</h1><p>Rabat, Morocco · contact@luneaspa.com</p>{authError?<p role="alert">{authError}</p>:user===undefined?<p>Chargement…</p>:<><p>{user?'Votre message sera envoyé avec les coordonnées de votre compte.':'Laissez-nous votre message.'}</p><form onSubmit={submit}>{fields.map(key=><label key={key}>{{nom:'Nom',email:'Email',sujet:'Sujet',message:'Message'}[key]}{key==='message'?<textarea required maxLength={10000} value={data[key]} onChange={e=>setData({...data,[key]:e.target.value})}/>:<input required type={key==='email'?'email':'text'} maxLength={255} value={data[key]} onChange={e=>setData({...data,[key]:e.target.value})}/>}</label>)}<button disabled={busy}>Envoyer le message</button><p role="status">{message}</p></form></>}</main>;
}
