import React, { useEffect, useState } from "react";
import { Head, Link } from "../ui";


const moisFrancais = [
    "Janvier", "Février", "Mars", "Avril",
    "Mai", "Juin", "Juillet", "Août",
    "Septembre", "Octobre", "Novembre", "Décembre",
];

const joursFrancais = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

import { api, csrf, errorText } from '../api';
export default function RendezVous({ service }) {
    const maintenant = new Date();
    const [processing, setProcessing] = useState(false);

    const [mois, setMois] = useState(maintenant.getMonth());
    const [annee, setAnnee] = useState(maintenant.getFullYear());
    const [dateChoisie, setDateChoisie] = useState("");
    const [heureChoisie, setHeureChoisie] = useState("");
    const [message, setMessage] = useState("");

    const [availability, setAvailability] = useState({ date: '', slots: [], loading: false, error: '' });
    const [revision, setRevision] = useState(0);
    const [reservation, setReservation] = useState(null);
    useEffect(() => {
        if (!dateChoisie) return;
        let active = true;
        setHeureChoisie('');
        setAvailability({ date: dateChoisie, slots: [], loading: true, error: '' });
        api.get('/api/availability', { params: { service_id: service.id, date: dateChoisie } })
            .then(({ data }) => { if (active) setAvailability({ date: dateChoisie, slots: data.slots, loading: false, error: '' }); })
            .catch(error => { if (active) setAvailability({ date: dateChoisie, slots: [], loading: false, error: errorText(error) }); });
        return () => { active = false; };
    }, [dateChoisie, service.id, revision]);

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

    let jourSuivant = 1;
    while (cases.length % 7 !== 0) {
        cases.push({
            jour: jourSuivant++,
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
            const { data } = await api.post('/api/appointments', { service_id: service.id, appointment_date: dateChoisie, appointment_time: heureChoisie });
            setReservation(data);
        } catch (error) { setMessage(errorText(error)); setRevision(value => value + 1); }
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

                        {reservation ? <section className="booking-success" role="status">
                            <h3>Votre rendez-vous est confirmé</h3>
                            <p>{service.name} — {reservation.appointment_date} à {reservation.appointment_time.slice(0, 5)}</p>
                            <p>Durée : {service.duration} min · {service.price} DH</p>
                            <button type="button" className="booking-confirm" onClick={() => { setReservation(null); setDateChoisie(''); setHeureChoisie(''); setMessage(''); }}>Réserver un autre rendez-vous</button>
                        </section> : <form onSubmit={confirmer}>
                            <p>Vos coordonnées sont reprises automatiquement depuis votre compte.</p>
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

                            {!dateChoisie && <p role="status">Choisissez une date pour voir les horaires disponibles.</p>}
                            {dateChoisie && availability.loading && <p role="status">Recherche des créneaux disponibles…</p>}
                            {availability.error && <p role="alert">{availability.error} <button type="button" onClick={() => setRevision(value => value + 1)}>Réessayer</button></p>}
                            {dateChoisie && availability.date === dateChoisie && !availability.loading && !availability.error && availability.slots.length === 0 && <p role="status">Aucun créneau disponible à cette date. Choisissez un autre jour.</p>}
                            <div className="booking-times">
                                {(availability.date === dateChoisie && !availability.loading ? availability.slots : []).map((heure) => (
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
                                className="booking-confirm" disabled={processing || !dateChoisie || !heureChoisie || availability.loading || availability.date !== dateChoisie || !availability.slots.includes(heureChoisie)}
                            >
                                ▦ &nbsp; Confirmer mon rendez-vous
                            </button>
                        </form>}

                        <Link href="/services" className="booking-back">
                            ← &nbsp; Retour aux services
                        </Link>
                    </article>
                </main>
            </div>
        </>
    );
}
