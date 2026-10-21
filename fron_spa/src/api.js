import axios from 'axios';
export const api = axios.create({ baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, ''), withCredentials: true, withXSRFToken: true, headers: { Accept: 'application/json' } });
export async function csrf() { await api.get('/sanctum/csrf-cookie'); }
export function errorText(error) { return Object.values(error.response?.data?.errors || {}).flat().join(' ') || error.response?.data?.message || 'Connexion au serveur impossible. Veuillez réessayer.'; }
