import React from 'react';
import { Link } from '../ui';


export default function Home() {
    return (
        <div className="lunea-container">

            {/* HERO */}
            <main>

                <section className="hero">

                    <div className="hero-text">

                        <p className="small-title">
                            LE BIEN-ÊTRE COMME ART DE VIVRE
                        </p>

                        <h1>L’art de<br/>prendre soin<br/><em>de vous.</em></h1>

                        <p>
                            Offrez-vous une parenthèse de douceur. Découvrez nos
                            rituels de soin et retrouvez votre équilibre.
                        </p>

                        <div className="hero-actions"><Link href="/services" className="hero-primary">Découvrir nos soins ↗</Link><Link href="/contact" className="hero-secondary">Nous rencontrer</Link></div>
                        <div className="hero-note"><span>✧ Soins personnalisés</span><span>✧ Détente profonde</span></div>
                    </div>


                    <div className="hero-image">
                        <div className="hero-orbit" aria-hidden="true">LUNÉA · BEAUTÉ · BIEN-ÊTRE ·</div>
                        <img
                            src="/images/spa.jpg"
                            alt="Lunéa Spa"
                        />
                    </div>

                </section>


                <div className="ritual-ribbon"><span>Ralentir</span><i aria-hidden="true">✧</i><span>Ressentir</span><i aria-hidden="true">✧</i><span>Se reconnecter</span><i aria-hidden="true">✧</i><span>Rayonner</span></div>

                <section className="spa-story" aria-labelledby="spa-story-title">
                    <div className="story-photos">
                        <img className="story-main-image" src="/images/spa3.jpg" alt="Huiles de soin, pierres chaudes et lumière des bougies" loading="lazy"/>
                        <img className="story-detail-image" src="/images/spa5.jpg" alt="Linge doux, fleurs et bougies pour votre rituel" loading="lazy"/>
                        <span className="story-photo-caption">UNE PARENTHÈSE HORS DU TEMPS</span>
                    </div>
                    <div className="story-copy"><p className="editorial-eyebrow">L’ESPRIT LUNÉA</p><h2 id="spa-story-title">Un retour à soi.<br/><em>Tout simplement.</em></h2><p>La chaleur d’un hammam, la douceur d’un massage, le parfum d’une huile… Chez Lunéa, chaque détail invite à laisser le quotidien à la porte.</p><p>Choisissez le rituel qui vous ressemble et accordez-vous le temps de vous sentir bien.</p><Link href="/services" className="editorial-link">Trouver mon rituel <span aria-hidden="true">↗</span></Link></div>
                </section>

                <section className="home-journey" aria-labelledby="home-journey-title">
                    <div className="journey-heading"><p className="editorial-eyebrow">VOTRE EXPÉRIENCE LUNÉA</p><h2 id="home-journey-title">Moins de bruit.<br/><em>Plus de vous.</em></h2><p>Une expérience simple, du premier choix jusqu’à votre moment de détente.</p></div>
                    <ol className="journey-steps">
                        <li><span className="journey-number" aria-hidden="true">01</span><div><h3>Trouvez votre rituel</h3><p>Parcourez notre carte et choisissez le soin qui correspond à votre envie du moment.</p></div></li>
                        <li><span className="journey-number" aria-hidden="true">02</span><div><h3>Choisissez votre instant</h3><p>Retrouvez les horaires disponibles et confirmez votre rendez-vous depuis votre compte.</p></div></li>
                        <li><span className="journey-number" aria-hidden="true">03</span><div><h3>Laissez-vous porter</h3><p>Le temps d’une pause, retrouvez la douceur des gestes et le plaisir de prendre soin de vous.</p></div></li>
                    </ol>
                </section>
<section className="spa-invitation"><div><p className="editorial-eyebrow">LE TEMPS D’UNE PAUSE</p><h2>Et si aujourd’hui,<br/>vous choisissiez <em>vous ?</em></h2><Link href="/services" className="hero-primary">Réserver mon moment <span aria-hidden="true">↗</span></Link></div><span className="invitation-caption">LUNÉA SPA · RABAT</span></section>
{/* LOCATION */}
<section className="lunea-location">

    <div className="location-inner">

        <div className="location-heading">
            <span>VOTRE BULLE DE BIEN-ÊTRE</span>

            <h2>
                Entrez.
                <br />
                Ralentissez.
            </h2>

            <p>
                Un lieu paisible pour prendre soin de vous,
                retrouver le calme et respirer.
            </p>
        </div>


        <div className="location-showcase">

            {/* PHOTO */}
            <div className="location-photo">

                <img
                    src="/images/candle.jpg"
                    alt="Lunéa Spa atmosphere"
                />

                <div className="photo-overlay">
                    <span>LUNÉA</span>
                    <strong>SPA</strong>
                    <small>Relax · Beauty · Wellness</small>
                </div>

            </div>


            {/* MAP */}
            <div className="location-map-box">

                <div className="map-label">
                    <span>NOUS TROUVER</span>
                    <strong>Notre adresse</strong>
                </div>

                <iframe
                    src="https://www.google.com/maps?q=Rabat%20Morocco&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                ></iframe>

            </div>


            {/* DETAILS */}
            <div className="location-details">

                <span className="details-label">
                    RENDEZ-VOUS CHEZ LUNÉA
                </span>

                <h3>
                    Une douce échappée
                    <br />
                    au quotidien.
                </h3>


                <div className="detail-item">

                    <div className="detail-icon">♧</div>

                    <div>
                        <span>ADRESSE</span>
                        <p>Rabat, Morocco</p>
                    </div>

                </div>


                <div className="detail-item">

                    <div className="detail-icon">◷</div>

                    <div>
                        <span>HORAIRES</span>

                        <p>
                            Lundi – Dimanche
                            <br />
                            09:00 – 20:00
                        </p>
                    </div>

                </div>


                <div className="detail-item">

                    <div className="detail-icon">♡</div>

                    <div>
                        <span>CONTACT</span>

                        <p>
                            contact@luneaspa.com
                        </p>
                    </div>

                </div>

            </div>

        </div>


        <div className="location-footer">
            <span></span>

            <p>Prenez du temps pour vous</p>

            <span></span>
        </div>

    </div>

</section>
            </main>

        </div>
    );
}
