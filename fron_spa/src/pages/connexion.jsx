import { useState } from "react";
import { Head, Link } from "../ui";


import { useForm } from '../useForm';
export default function Connexion() {
    const [mode, setMode] = useState("login");

    const { data, setData, post, processing, errors } = useForm({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        password: "",
        password_confirmation: "",
    });

    function handleSubmit(e) {
        e.preventDefault();

        if (mode === "login") {
            post("/login");
        } else {
            post("/inscription");
        }
    }

    return (
        <>
            <Head title="Connexion - Lunéa Spa" />

            <div className="auth-page">
                <Link href="/" className="auth-back">
                    ← Retour à l'accueil
                </Link>

                <div className="auth-card">
                    <p className="auth-brand">LUNÉA SPA</p>
                    <h1>
                        {mode === "login"
                            ? "Bienvenue"
                            : "Créer un compte"}
                    </h1>

                    <p className="auth-subtitle">
                        {mode === "login"
                            ? "Connectez-vous pour réserver votre moment de détente."
                            : "Créez votre compte pour profiter de nos services."}
                    </p>

                    <div className="auth-tabs">
                        <button
                            type="button"
                            className={mode === "login" ? "active" : ""}
                            onClick={() => setMode("login")}
                        >
                            Connexion
                        </button>

                        <button
                            type="button"
                            className={mode === "register" ? "active" : ""}
                            onClick={() => setMode("register")}
                        >
                            Créer un compte
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {mode === "register" && (
                            <>
                                <label>Nom</label>
                                <input
                                    value={data.nom}
                                    onChange={(e) =>
                                        setData("nom", e.target.value)
                                    }
                                    required
                                />
                                {errors.nom && <p className="auth-error">{errors.nom}</p>}

                                <label>Prénom</label>
                                <input
                                    value={data.prenom}
                                    onChange={(e) =>
                                        setData("prenom", e.target.value)
                                    }
                                    required
                                />
                                {errors.prenom && <p className="auth-error">{errors.prenom}</p>}

                                <label>Téléphone</label>
                                <input
                                    type="tel"
                                    value={data.telephone}
                                    onChange={(e) =>
                                        setData("telephone", e.target.value)
                                    }
                                    required
                                />
                                {errors.telephone && <p className="auth-error">{errors.telephone}</p>}
                            </>
                        )}

                        <label>Adresse e-mail</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) =>
                                setData("email", e.target.value)
                            }
                            required
                        />
                        {errors.email && <p className="auth-error">{errors.email}</p>}

                        <label>Mot de passe</label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            required
                        />
                        {errors.password && <p className="auth-error">{errors.password}</p>}

                        {mode === "register" && (
                            <>
                                <label>Confirmer le mot de passe</label>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                            </>
                        )}

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={processing}
                        >
                            {processing
                                ? "Veuillez patienter..."
                                : mode === "login"
                                ? "Se connecter"
                                : "Créer mon compte"}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Prenez soin de vous, l'instant vous appartient.
                    </p>
                </div>
            </div>
        </>
    );
}
