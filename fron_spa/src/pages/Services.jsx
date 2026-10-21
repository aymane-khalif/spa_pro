import React from 'react';

export default function Services({ services = [] }) {
    const images = {
        'Hammam Spa': '/images/hamam.jpg',
        'Relaxing Massage': '/images/relaxing.jpg',
        'Facial Treatment': '/images/facial.jpg',
        'Body Care': '/images/body.jpg',
        'Aromatherapy': '/images/massage.jpg',
        'Signature Head Massage': '/images/signature.jpg',
    };

    const included = {
        'Hammam Spa': [
            'Accueil et préparation',
            'Chaleur et vapeur relaxante',
            'Savon noir',
            'Gommage au gant kessa',
            'Rinçage et nettoyage',
            'Moment de détente'
        ],
        'Relaxing Massage': [
            'Préparation et installation',
            'Huile de massage',
            'Massage du corps',
            'Travail des zones de tension',
            'Moment de relaxation'
        ],
        'Facial Treatment': [
            'Nettoyage du visage',
            'Préparation de la peau',
            'Exfoliation douce',
            'Masque adapté',
            'Hydratation',
            'Massage léger du visage'
        ],
        'Body Care': [
            'Préparation du corps',
            'Gommage corporel',
            'Nettoyage de la peau',
            'Soin hydratant',
            'Massage relaxant'
        ],
        'Aromatherapy': [
            "Choix d'une huile adaptée",
            'Préparation relaxante',
            'Massage aux huiles essentielles',
            'Ambiance parfumée',
            'Moment de détente'
        ],
        'Signature Head Massage': [
            'Préparation relaxante',
            'Massage du cuir chevelu',
            'Massage de la tête',
            'Massage des tempes',
            'Massage de la nuque'
        ]
    };

    return (
        <div className="services-page">

            <section className="services-hero">
                <div className="services-hero-overlay"></div>

                <div className="leaf-decoration left">
                    <div className="leaf-stem"></div>
                    <div className="leaf-shape one"></div>
                    <div className="leaf-shape two"></div>
                    <div className="leaf-shape three"></div>
                </div>

                <div className="leaf-decoration right">
                    <div className="leaf-stem"></div>
                    <div className="leaf-shape one"></div>
                    <div className="leaf-shape two"></div>
                    <div className="leaf-shape three"></div>
                </div>

                <div className="services-banner">
                    <div className="services-banner-content">
                        <h1>Lunéa Spa</h1>

                        <p className="services-tagline">
                            BEAUTÉ · BIEN-ÊTRE · DÉTENTE
                        </p>

                        <div className="services-banner-title">
                            <h2>Nos Services</h2>
                            <p>Des soins sur mesure pour votre bien-être</p>
                        </div>
                    </div>
                </div>

            </section>

            <section className="services-section">
                <div className="section-intro">
                    <p className="services-eyebrow">
                        NOS SOINS SIGNATURE
                    </p>

                    <h2>Prenez soin de vous...</h2>

                    <p>
                        Découvrez nos soins et choisissez
                        l'expérience qui vous correspond.
                    </p>
                </div>

                <div className="services-grid">
                    {services.map((service) => (
                        <article
                            className="service-card"
                            key={service.id}
                        >
                            <div className="service-image">
                                <img
                                    src={
                                        images[service.name] ||
                                        '/images/spa.jpg'
                                    }
                                    alt={service.name}
                                    loading="lazy"
                                />
                            </div>

                            <div className="service-content">
                                <h3 className="service-title">
                                    {service.name}
                                </h3>

                                <p className="service-description">
                                    {service.description}
                                </p>

                                <div className="included-title">
                                    Ce soin comprend
                                </div>

                                <ul className="included-list">
                                    {(included[service.name] || []).map(
                                        (item, index) => (
                                            <li key={index}>
                                                {item}
                                            </li>
                                        )
                                    )}
                                </ul>

                                <div className="service-bottom">
                                    <span className="duration">
                                        {service.duration} min
                                    </span>

                                    <span className="price">
                                        {service.price} DH
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className="service-book-btn"
                                    onClick={() => {
                                        window.location.href =
                                            `/rendez-vous?service=${encodeURIComponent(
                                                service.name
                                            )}`;
                                    }}
                                >
                                    Prenez votre rendez-vous
                                </button>

                            </div>
                        </article>
                    ))}
                </div>
            </section>

        </div>
    );
}
