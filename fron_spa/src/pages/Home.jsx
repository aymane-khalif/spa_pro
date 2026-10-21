import React from 'react';
import { Link } from '../ui';

export default function Home() {
    return (
        <div className="lunea-container">

            {/* NAVBAR */}
            <nav className="lunea-navbar">

                <Link href="/" className="lunea-logo">
                    <div className="logo-name">🌿 Lunéa Spa</div>
                    <div className="logo-subtitle">
                        WELLNESS & RELAXATION
                    </div>
                </Link>

                <div className="nav-links">
                    <Link href="/">Home</Link>
                    <Link href="/services">Services</Link>
                      <Link href="/contact">Contact</Link>
                </div>

<Link href="/connexion" className="login-btn">
    Connexion
</Link>


            </nav>


            {/* HERO */}
            <main>

                <section className="hero">

                    <div className="hero-text">

                        <p className="small-title">
                            WELCOME TO LUNÉA SPA
                        </p>

                        <h1>
                            Renew.
                            <br />
                            Refresh.
                            <br />
                            Rebalance.
                        </h1>

                        <p>
                            Take a moment for yourself and discover our
                            relaxing wellness experience.
                        </p>

                    </div>


                    <div className="hero-image">
                        <img
                            src="/images/spa.jpg"
                            alt="Lunéa Spa"
                        />
                    </div>

                </section>


                {/* SERVICES */}
                <section className="services">

                    <h2>Our Services</h2>

                    <div className="services-grid">

                        <div className="service-card">
                            <div className="service-image">
                                <img
                                    src="/images/relaxing.jpg"
                                    alt="Relaxing Massage"
                                />
                            </div>

                            <h3>Relaxing Massage</h3>

                            <p>
                                A relaxing treatment to release stress
                                and restore your energy.
                            </p>

                            <span>250 DH</span>
                        </div>


                        <div className="service-card">
                            <div className="service-image">
                                <img
                                    src="/images/facial.jpg"
                                    alt="Facial Treatment"
                                />
                            </div>

                            <h3>Facial Treatment</h3>

                            <p>
                                A refreshing facial treatment for healthy
                                and glowing skin.
                            </p>

                            <span>200 DH</span>
                        </div>


                        <div className="service-card">
                            <div className="service-image">
                                <img
                                    src="/images/body.jpg"
                                    alt="Body Care"
                                />
                            </div>

                            <h3>Body Care</h3>

                            <p>
                                A complete wellness experience for your
                                body and mind.
                            </p>

                            <span>220 DH</span>
                        </div>


                        <div className="service-card">
                            <div className="service-image">
                                <img
                                    src="/images/massage.jpg"
                                    alt="Aromatherapy"
                                />
                            </div>

                            <h3>Aromatherapy</h3>

                            <p>
                                A soothing treatment with relaxing
                                essential oils for body and mind.
                            </p>

                            <span>230 DH</span>
                        </div>


                        <div className="service-card">
                            <div className="service-image">
                                <img
                                    src="/images/hamam.jpg"
                                    alt="Hammam Spa"
                                />
                            </div>

                            <h3>Hammam Spa</h3>

                            <p>
                                A traditional wellness ritual with steam,
                                black soap and gentle exfoliation.
                            </p>

                            <span>180 DH</span>
                        </div>


                        <div className="service-card">
                            <div className="service-image">
                                <img
                                    src="/images/signature.jpg"
                                    alt="Signature Head Massage"
                                />
                            </div>

                            <h3>Signature Head Massage</h3>

                            <p>
                                A soothing head massage to release tension
                                and promote deep relaxation.
                            </p>

                            <span>150 DH</span>
                        </div>

                    </div>

                </section>
{/* LOCATION */}
<section className="lunea-location">

    <div className="location-inner">

        <div className="location-heading">
            <span>YOUR MOMENT OF WELLNESS</span>

            <h2>
                Come in.
                <br />
                Slow down.
            </h2>

            <p>
                Discover a peaceful space designed for relaxation,
                beauty and complete well-being.
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
                    <span>FIND US</span>
                    <strong>Our Location</strong>
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
                    VISIT LUNÉA
                </span>

                <h3>
                    A little escape
                    <br />
                    from everyday life.
                </h3>


                <div className="detail-item">

                    <div className="detail-icon">♧</div>

                    <div>
                        <span>ADDRESS</span>
                        <p>Rabat, Morocco</p>
                    </div>

                </div>


                <div className="detail-item">

                    <div className="detail-icon">◷</div>

                    <div>
                        <span>OPENING HOURS</span>

                        <p>
                            Monday – Sunday
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
                            +212 6 XX XX XX XX
                        </p>
                    </div>

                </div>

            </div>

        </div>


        <div className="location-footer">
            <span></span>

            <p>Take time for yourself</p>

            <span></span>
        </div>

    </div>

</section>
            </main>

        </div>
    );
}
