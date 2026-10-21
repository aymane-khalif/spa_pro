import React, { useState } from "react";
import { Head, Link } from "../ui";


const heures = [
    "09:00", "10:00", "11:00", "12:00",
    "14:00", "15:00", "16:00", "17:00",
];

const moisFrancais = [
    "Janvier", "Février", "Mars", "Avril",
    "Mai", "Juin", "Juillet", "Août",
    "Septembre", "Octobre", "Novembre", "Décembre",
];

const joursFrancais = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

import { api, csrf, errorText } from '../api';
import { useNavigate } from 'react-router-dom';
export default function RendezVous({ service }) {
    const maintenant = new Date();
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [client, setClient] = useState({ nom: '', prenom: '', telephone: '' });

    const [mois, setMois] = useState(maintenant.getMonth());
    const [annee, setAnnee] = useState(maintenant.getFullYear());
    const [dateChoisie, setDateChoisie] = useState("");
    const [heureChoisie, setHeureChoisie] = useState("");
    const [message, setMessage] = useState("");

    if (!service) {
        return <p>Service introuvable.</p>;
    }

    const premierJour = new Date(annee, mois, 1).getDay();
    const decalage = (premierJour + 6) % 7;
    const nombreJours = new Date(annee, mois + 1, 0).getDate();
    const joursPrecedents = new Date(annee, mois, 0).getDate();

    const cases = [];

    for (let i = decalage - 1; i >= 0; i--) {
        cases.push({
            jour: joursPrecedents - i,
            ancien: true,
            date: "",
        });
    }

    for (let jour = 1; jour <= nombreJours; jour++) {
        const date = [
            annee,
            String(mois + 1).padStart(2, "0"),
            String(jour).padStart(2, "0"),
        ].join("-");

        cases.push({ jour, ancien: false, date });
    }

    while (cases.length % 7 !== 0) {
        cases.push({
            jour: cases.length % 7 + 1,
            ancien: true,
            date: "",
        });
    }

    function changerMois(direction) {
        let nouvelleDate = new Date(annee, mois + direction, 1);
        setMois(nouvelleDate.getMonth());
        setAnnee(nouvelleDate.getFullYear());
    }

    function estDansLePasse(date) {
        return date < [
            maintenant.getFullYear(),
            String(maintenant.getMonth() + 1).padStart(2, "0"),
            String(maintenant.getDate()).padStart(2, "0"),
        ].join("-");
    }

    async function confirmer(e) {
        e.preventDefault();
        if (!dateChoisie || !heureChoisie) { setMessage('Veuillez choisir une date et une heure.'); return; }
        setProcessing(true); setMessage('');
        try {
            await csrf();
            const { data } = await api.post('/api/appointments', { ...client, service_id: service.id, appointment_date: dateChoisie, appointment_time: heureChoisie });
            navigate('/mon-rendez-vous', { state: { code: data.code_suivi } });
        } catch (error) { setMessage(errorText(error)); }
        finally { setProcessing(false); }
    }

    return (
        <>
            <Head title="Rendez-vous | Lunéa Spa" />

            <div className="booking-page">
                <header className="booking-hero">
                    <div className="booking-hero-content">
                        <p className="booking-eyebrow">LUNÉA SPA</p>
                        <h1>Réservez votre moment de détente</h1>
                        <p>
                            Choisissez la date et l'heure de votre soin.
                        </p>
                        <span className="booking-flourish">✧ ─── ❋ ─── ✧</span>
                    </div>
                </header>

                <main className="booking-main">
                    <article className="booking-card">
                        <div className="booking-service">
                            <img
                                src={
                                    {
                                        "Hammam Spa": "/images/hamam.jpg",
                                        "Relaxing Massage": "/images/relaxing.jpg",
                                        "Facial Treatment": "/images/facial.jpg",
                                        "Body Care": "/images/body.jpg",
                                        "Aromatherapy": "/images/massage.jpg",
                                        "Signature Head Massage": "/images/signature.jpg",
                                    }[service.name] || "/images/spa.jpg"
                                }
                                alt={service.name}
                            />

                            <div className="booking-service-info">
                                <h2>{service.name}</h2>
                                <p>{service.description}</p>
                                <div className="booking-meta">
                                    <span>◷ {service.duration} min</span>
                                    <span>◆ {service.price} DH</span>
                                </div>
                            </div>
                        </div>

                        <div className="booking-divider" />

                        <form onSubmit={confirmer}>
                            <div className="booking-client">
                            {['nom', 'prenom', 'telephone'].map(field => <label key={field}>{field}<input required type={field === 'telephone' ? 'tel' : 'text'} maxLength={255} value={client[field]} onChange={e => setClient({ ...client, [field]: e.target.value })}/></label>)}
                            </div>
                            <h3 className="booking-section-title">
                                <span>▦</span> Choisissez une date
                            </h3>

                            <div className="booking-calendar">
                                <div className="calendar-header">
                                    <button
                                        type="button"
                                        onClick={() => changerMois(-1)}
                                        disabled={
                                            annee === maintenant.getFullYear() &&
                                            mois <= maintenant.getMonth()
                                        }
                                        aria-label="Mois précédent"
                                    >
                                        ‹
                                    </button>

                                    <strong>
                                        {moisFrancais[mois]} {annee}
                                    </strong>

                                    <button
                                        type="button"
                                        onClick={() => changerMois(1)}
                                        aria-label="Mois suivant"
                                    >
                                        ›
                                    </button>
                                </div>

                                <div className="calendar-grid">
                                    {joursFrancais.map((jour) => (
                                        <div
                                            className="calendar-weekday"
                                            key={jour}
                                        >
                                            {jour}
                                        </div>
                                    ))}

                                    {cases.map((caseJour, index) => {
                                        const desactive =
                                            caseJour.ancien ||
                                            estDansLePasse(caseJour.date);

                                        return (
                                            <button
                                                type="button"
                                                key={`${caseJour.date}-${index}`}
                                                className={[
                                                    "calendar-day",
                                                    caseJour.ancien ? "outside" : "",
                                                    dateChoisie === caseJour.date
                                                        ? "selected"
                                                        : "",
                                                ].join(" ")}
                                                disabled={desactive}
                                                onClick={() => {
                                                    setDateChoisie(caseJour.date);
                                                    setHeureChoisie("");
                                                    setMessage("");
                                                }}
                                            >
                                                {caseJour.jour}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <h3 className="booking-section-title time-title">
                                <span>◷</span> Choisissez une heure
                            </h3>

                            <div className="booking-times">
                                {heures.map((heure) => (
                                    <button
                                        type="button"
                                        key={heure}
                                        className={
                                            heureChoisie === heure
                                                ? "booking-time selected"
                                                : "booking-time"
                                        }
                                        onClick={() => {
                                            setHeureChoisie(heure);
                                            setMessage("");
                                        }}
                                    >
                                        {heure}
                                    </button>
                                ))}
                            </div>

                            {message && (
                                <p className="booking-message" role="status">
                                    {message}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="booking-confirm" disabled={processing}
                            >
                                ▦ &nbsp; Confirmer ma demande
                            </button>
                        </form>

                        <Link href="/services" className="booking-back">
                            ← &nbsp; Retour aux services
                        </Link>
                    </article>
                </main>
            </div>
        </>
    );
}
