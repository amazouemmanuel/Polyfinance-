import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";

const C = {
  navy: "#1B4D6E", navyDark: "#0F2E42", navyLight: "#245f85",
  teal: "#2AABAA", tealLight: "#3ECFCE", orange: "#F47B2A",
  bg: "#F5F8FA", white: "#FFFFFF", text: "#1a2a35",
  textMuted: "#6B8FA8", border: "rgba(27,77,110,0.12)",
  red: "#ef4444", green: "#10b981", amber: "#f59e0b", purple: "#8b5cf6"
};

const ADMIN_EMAIL = "amazouemmanuel274@gmail.com";

const PLANS = [
  { id: "gratuit", nom: "Gratuit", prix: "0 F", periode: "2 jours d'essai", jours: 2 },
  { id: "premium", nom: "Premium", prix: "8 000 F", periode: "/ 30 jours", jours: 30 },
];

const MODES_PAIEMENT = ["Espèces", "Wave", "Orange Money", "Virement"];

function fmt(v) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(Number(v) || 0)) + " F";
}

function ajouterJours(dateStr, jours) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + jours);
  return d.toISOString().slice(0, 10);
}

function ajouterMois(dateStr, mois) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + mois);
  return d.toISOString().slice(0, 10);
}

function genererEcheances(creanceId, montantTotal, nombreEcheances, dateDebut) {
  const base = Math.floor(montantTotal / nombreEcheances);
  const reste = montantTotal - base * nombreEcheances;
  return Array.from({ length: nombreEcheances }, (_, i) => ({
    creance_id: creanceId,
    numero: i + 1,
    date_echeance: ajouterMois(dateDebut, i),
    montant: base + (i === nombreEcheances - 1 ? reste : 0),
    paye: false,
  }));
}

function statutEcheance(e) {
  const aujourdHui = new Date().toISOString().slice(0, 10);
  if (e.paye) return "Payée";
  return e.date_echeance < aujourdHui ? "En retard" : "À venir";
}

function debutSemaineISO() {
  const d = new Date();
  const jour = d.getDay();
  const diff = jour === 0 ? -6 : 1 - jour;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function debutMoisISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function debutAnneeISO() {
  const d = new Date();
  return `${d.getFullYear()}-01-01`;
}

function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ color: C.textMuted, fontSize: "0.75rem", display: "block", marginBottom: 5 }}>{label}</label>}
      <input {...props} style={{ width: "100%", padding: "10px 13px", boxSizing: "border-box", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: "0.9rem", outline: "none" }} />
    </div>
  );
}

function Btn({ children, onClick, disabled, variant = "primary" }) {
  const bg = variant === "primary" ? `linear-gradient(135deg,${C.teal},${C.tealLight})` : "transparent";
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ width: "100%", padding: 13, background: disabled ? "#ccc" : bg, border: variant === "outline" ? `1px solid ${C.border}` : "none", borderRadius: 11, color: variant === "outline" ? C.text : C.white, fontSize: "0.9rem", fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer" }}>
      {children}
    </button>
  );
}

function Badge({ text, color }) {
  const map = { vert: C.green, rouge: C.red, ambre: C.amber, gris: C.textMuted, violet: C.purple };
  const c = map[color] || C.textMuted;
  return <span style={{ fontSize: "0.68rem", fontWeight: 700, color: c, background: `${c}18`, padding: "3px 8px", borderRadius: 20 }}>{text}</span>;
}

// ============================================================
// CALCULATRICE
// ============================================================
function Calculatrice() {
  const [expression, setExpression] = useState("");
  const [resultat, setResultat] = useState(null);

  const appuyer = (val) => {
    if (val === "C") { setExpression(""); setResultat(null); return; }
    if (val === "⌫") { setExpression(e => e.slice(0, -1)); setResultat(null); return; }
    if (val === "=") {
      const propre = expression.replace(/×/g, "*").replace(/÷/g, "/");
      if (!/^[0-9+\-*/. ]*$/.test(propre) || !propre.trim()) { setResultat("Erreur"); return; }
      try {
        const r = Function(`"use strict"; return (${propre})`)();
        setResultat(Number.isFinite(r) ? r : "Erreur");
      } catch { setResultat("Erreur"); }
      return;
    }
    setResultat(null);
    setExpression(e => e + val);
  };

  const touches = ["7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "-", "C", "0", "=", "+"];
  const speciales = ["C", "=", "+", "-", "×", "÷"];

  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontWeight: 700, color: C.navy, fontSize: "0.85rem" }}>🧮 Calculatrice</div>
        <span onClick={() => appuyer("⌫")} style={{ color: C.textMuted, fontSize: "0.75rem", cursor: "pointer" }}>⌫ Effacer</span>
      </div>
      <div style={{ background: C.bg, borderRadius: 8, padding: 12, textAlign: "right", fontSize: "1.15rem", fontWeight: 700, marginBottom: 10, minHeight: 30, overflowX: "auto", whiteSpace: "nowrap" }}>
        {resultat !== null ? (typeof resultat === "number" ? resultat.toLocaleString("fr-FR") : resultat) : (expression || "0")}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
        {touches.map(k => (
          <button key={k} onClick={() => appuyer(k)}
            style={{ padding: 14, borderRadius: 8, border: `1px solid ${C.border}`, background: speciales.includes(k) ? C.teal : C.bg, color: speciales.includes(k) ? C.white : C.text, fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// ÉCRAN : Connexion
// ============================================================
function Connexion({ onGoSignup, onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const connecter = async () => {
    setErreur("");
    if (!email || !motDePasse) { setErreur("Remplis tous les champs."); return; }
    setChargement(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });
    setChargement(false);
    if (error) { setErreur("Email ou mot de passe incorrect, ou email non confirmé."); return; }
    onLoggedIn();
  };

  return (
    <div style={{ padding: 20, maxWidth: 420, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ color: C.navy, fontWeight: 800, fontSize: "1.2rem" }}>PolyFinance <span style={{ color: C.teal }}>GF</span></div>
        <div style={{ color: C.textMuted, fontSize: "0.78rem", marginTop: 4 }}>Connexion à votre espace entreprise</div>
      </div>
      <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@entreprise.ci" />
      <Input label="Mot de passe" type="password" value={motDePasse} onChange={e => setMotDePasse(e.target.value)} placeholder="••••••••" />
      {erreur && <div style={{ color: C.red, fontSize: "0.78rem", marginBottom: 12 }}>{erreur}</div>}
      <Btn onClick={connecter} disabled={chargement}>{chargement ? "Connexion..." : "Se connecter"}</Btn>
      <div style={{ textAlign: "center", marginTop: 16, fontSize: "0.82rem", color: C.textMuted }}>
        Pas encore de compte ? <span onClick={onGoSignup} style={{ color: C.teal, fontWeight: 700, cursor: "pointer" }}>Créer un compte</span>
      </div>
    </div>
  );
}

// ============================================================
// ÉCRAN : Inscription
// ============================================================
function Inscription({ onGoLogin, onInscrit }) {
  const [etape, setEtape] = useState(1);
  const [nomEntreprise, setNomEntreprise] = useState("");
  const [ville, setVille] = useState("");
  const [responsable, setResponsable] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmMotDePasse, setConfirmMotDePasse] = useState("");
  const [plan, setPlan] = useState("premium");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const emailValide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const motDePasseValide = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/.test(motDePasse);
  const pretEtape1 = nomEntreprise && ville && responsable && telephone && emailValide && motDePasseValide && motDePasse === confirmMotDePasse;

  const creerCompte = async () => {
    setErreur("");
    setChargement(true);

    const planChoisi = PLANS.find(p => p.id === plan);
    const statutInitial = plan === "gratuit" ? "Gratuit" : "En attente";
    const dateExpiration = plan === "gratuit" ? ajouterJours(new Date().toISOString().slice(0, 10), planChoisi.jours) : "";

    const { error: authError } = await supabase.auth.signUp({
      email,
      password: motDePasse,
      options: {
        data: {
          nom_entreprise: nomEntreprise,
          ville,
          responsable,
          telephone,
          plan,
          statut: statutInitial,
          date_expiration: dateExpiration,
        },
      },
    });

    setChargement(false);
    if (authError) {
      setErreur(authError.message.includes("already registered") ? "Cet email a déjà un compte." : "Une erreur est survenue, réessayez.");
      return;
    }

    onInscrit(plan);
  };

  if (etape === 1) {
    return (
      <div style={{ padding: 20, maxWidth: 420, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ color: C.navy, fontWeight: 800, fontSize: "1.2rem" }}>Créer votre compte entreprise</div>
          <div style={{ color: C.textMuted, fontSize: "0.78rem", marginTop: 4 }}>Étape 1 sur 2</div>
        </div>
        <Input label="Nom de l'entreprise" value={nomEntreprise} onChange={e => setNomEntreprise(e.target.value)} placeholder="Ets Koffi & Fils" />
        <Input label="Ville" value={ville} onChange={e => setVille(e.target.value)} placeholder="Bouaké" />
        <Input label="Nom du responsable" value={responsable} onChange={e => setResponsable(e.target.value)} placeholder="Emmanuel Koffi" />
        <Input label="Téléphone / WhatsApp" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="07 01 02 03 04" />
        <Input label="Email professionnel" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@entreprise.ci" />
        <Input label="Créer un mot de passe" type="password" value={motDePasse} onChange={e => setMotDePasse(e.target.value)} placeholder="Min. 6 caractères" />
        <Input label="Confirmation du mot de passe" type="password" value={confirmMotDePasse} onChange={e => setConfirmMotDePasse(e.target.value)} placeholder="••••••••" />
        <div style={{ color: C.textMuted, fontSize: "0.72rem", marginBottom: 12 }}>
          Le mot de passe doit contenir au moins 6 caractères, un chiffre et un caractère spécial (ex: # ! *).
        </div>
        {erreur && <div style={{ color: C.red, fontSize: "0.78rem", marginBottom: 12 }}>{erreur}</div>}
        <Btn onClick={() => pretEtape1 ? setEtape(2) : setErreur("Vérifie tous les champs, et que le mot de passe respecte le format demandé.")}>Continuer</Btn>
        <div style={{ textAlign: "center", marginTop: 16, fontSize: "0.82rem", color: C.textMuted }}>
          Déjà un compte ? <span onClick={onGoLogin} style={{ color: C.teal, fontWeight: 700, cursor: "pointer" }}>Se connecter</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 420, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ color: C.navy, fontWeight: 800, fontSize: "1.2rem" }}>Choisissez votre abonnement</div>
        <div style={{ color: C.textMuted, fontSize: "0.78rem", marginTop: 4 }}>Étape 2 sur 2 — {nomEntreprise}</div>
      </div>
      {PLANS.map(p => (
        <div key={p.id} onClick={() => setPlan(p.id)}
          style={{ border: `2px solid ${plan === p.id ? C.teal : C.border}`, borderRadius: 12, padding: 14, marginBottom: 10, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: "0.9rem" }}>{p.nom}</div>
            <div style={{ color: C.textMuted, fontSize: "0.72rem" }}>{p.periode}</div>
          </div>
          <div style={{ fontWeight: 800, color: C.teal }}>{p.prix}</div>
        </div>
      ))}
      {erreur && <div style={{ color: C.red, fontSize: "0.78rem", margin: "12px 0" }}>{erreur}</div>}
      <div style={{ marginTop: 16 }}>
        <Btn onClick={creerCompte} disabled={chargement}>{chargement ? "Création..." : (plan === "gratuit" ? "Activer mon compte" : "Payer et activer")}</Btn>
      </div>
      <div onClick={() => setEtape(1)} style={{ textAlign: "center", marginTop: 14, fontSize: "0.8rem", color: C.textMuted, cursor: "pointer" }}>← Retour</div>
      {plan !== "gratuit" && (
        <div style={{ fontSize: "0.72rem", color: C.textMuted, textAlign: "center", marginTop: 10 }}>
          Un email de confirmation vous sera envoyé. Votre accès Premium ne sera activé qu'après vérification du paiement.
        </div>
      )}
    </div>
  );
}

// ============================================================
// ÉCRAN : Attente de vérification
// ============================================================
function EnAttente({ onGoLogin }) {
  return (
    <div style={{ padding: 24, textAlign: "center", maxWidth: 420, margin: "0 auto" }}>
      <div style={{ fontSize: "2.2rem", marginBottom: 10 }}>📧</div>
      <div style={{ color: C.navy, fontWeight: 800, fontSize: "1.1rem", marginBottom: 8 }}>Vérifiez votre email</div>
      <div style={{ color: C.textMuted, fontSize: "0.85rem", lineHeight: 1.6, marginBottom: 20 }}>
        Votre compte a été créé. Cliquez sur le lien reçu par email pour confirmer votre adresse.
        Ensuite, effectuez le paiement de 8 000 FCFA via Wave ou Orange Money au{" "}
        <strong style={{ color: C.text }}>07 59 57 03 27</strong>, puis envoyez la preuve sur WhatsApp.
        Votre accès Premium sera activé dès vérification.
      </div>
      <div onClick={onGoLogin} style={{ color: C.teal, fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>Retour à la connexion</div>
    </div>
  );
}

// ============================================================
// ÉCRAN : Connecté mais en attente d'activation Premium
// ============================================================
function EnAttenteConnecte({ entreprise, onLogout }) {
  return (
    <div style={{ padding: 24, textAlign: "center", maxWidth: 420, margin: "0 auto" }}>
      <div style={{ fontSize: "2.2rem", marginBottom: 10 }}>⏳</div>
      <div style={{ color: C.navy, fontWeight: 800, fontSize: "1.1rem", marginBottom: 8 }}>
        Bienvenue {entreprise.nom}, votre paiement est en cours de vérification
      </div>
      <div style={{ color: C.textMuted, fontSize: "0.85rem", lineHeight: 1.6, marginBottom: 20 }}>
        Votre email est bien confirmé. Il ne reste plus qu'à valider votre paiement Premium de 8 000 FCFA
        (Wave/Orange Money au <strong style={{ color: C.text }}>07 59 57 03 27</strong>, preuve envoyée sur WhatsApp).
        Votre espace s'ouvrira automatiquement dès l'activation.
      </div>
      <span onClick={onLogout} style={{ color: C.teal, fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>Déconnexion</span>
    </div>
  );
}

// ============================================================
// ÉCRAN : Accès expiré
// ============================================================
function AccesExpire({ entreprise, onLogout }) {
  return (
    <div style={{ padding: 24, textAlign: "center", maxWidth: 420, margin: "0 auto" }}>
      <div style={{ fontSize: "2.2rem", marginBottom: 10 }}>⏰</div>
      <div style={{ color: C.navy, fontWeight: 800, fontSize: "1.1rem", marginBottom: 8 }}>
        Votre accès a expiré
      </div>
      <div style={{ color: C.textMuted, fontSize: "0.85rem", lineHeight: 1.6, marginBottom: 20 }}>
        Votre période {entreprise.plan === "gratuit" ? "d'essai gratuit" : "Premium"} est terminée.
        Passez en Premium (8 000 FCFA / 30 jours) via Wave ou Orange Money au{" "}
        <strong style={{ color: C.text }}>07 59 57 03 27</strong>, puis envoyez la preuve sur WhatsApp.
      </div>
      <span onClick={onLogout} style={{ color: C.teal, fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>Déconnexion</span>
    </div>
  );
}

// ============================================================
// ESPACE ADMINISTRATEUR
// ============================================================
function AdminDashboard({ onLogout }) {
  const [entreprises, setEntreprises] = useState([]);
  const [chargement, setChargement] = useState(true);

  const recharger = async () => {
    setChargement(true);
    const { data } = await supabase.from("entreprises").select("*").order("created_at", { ascending: false });
    setEntreprises(data || []);
    setChargement(false);
  };

  useEffect(() => { recharger(); }, []);

  const activerPremium = async (id) => {
    const nouvelleDate = ajouterJours(new Date().toISOString().slice(0, 10), 30);
    await supabase.from("entreprises").update({ statut: "Premium", plan: "premium", date_expiration: nouvelleDate }).eq("id", id);
    recharger();
  };

  const couleurStatut = (statut) => statut === "Premium" ? "vert" : statut === "En attente" ? "ambre" : "gris";

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ background: `linear-gradient(135deg,${C.navyDark},${C.navy})`, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: C.white, fontWeight: 700, fontSize: "0.95rem" }}>Espace Administrateur</div>
          <div style={{ color: C.tealLight, fontSize: "0.68rem" }}>PolyFinance GF</div>
        </div>
        <span onClick={onLogout} style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", cursor: "pointer" }}>Déconnexion</span>
      </div>
      <div style={{ padding: 16 }}>
        {chargement && <div style={{ color: C.textMuted, textAlign: "center", padding: 20 }}>Chargement...</div>}
        {!chargement && entreprises.length === 0 && (
          <div style={{ color: C.textMuted, textAlign: "center", padding: 20 }}>Aucune entreprise inscrite pour l'instant.</div>
        )}
        {entreprises.map(e => (
          <div key={e.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: C.text }}>{e.nom}</div>
                <div style={{ color: C.textMuted, fontSize: "0.75rem" }}>{e.responsable} · {e.telephone}</div>
              </div>
              <Badge text={e.statut} color={couleurStatut(e.statut)} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: C.textMuted, marginBottom: e.statut === "En attente" ? 10 : 0 }}>
              <span>Plan : {e.plan}</span>
              <span>{e.date_expiration ? `Expire le ${e.date_expiration}` : "Pas d'expiration"}</span>
            </div>
            {e.statut === "En attente" && (
              <Btn onClick={() => activerPremium(e.id)}>✅ Activer Premium</Btn>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// TABLEAU DE BORD
// ============================================================
function TableauDeBord({ clients, paiements, creances, ventes, produits, depenses }) {
  const aujourdHui = new Date().toISOString().slice(0, 10);
  const debutSem = debutSemaineISO();
  const debutMois = debutMoisISO();
  const debutAnnee = debutAnneeISO();

  const revenuPeriode = (depuis) => {
    const v = ventes.filter(x => x.date >= depuis).reduce((s, x) => s + Number(x.montant), 0);
    const p = paiements.filter(x => x.statut === "Payé" && x.date >= depuis).reduce((s, x) => s + Number(x.montant), 0);
    return v + p;
  };
  const nbVentesPeriode = (depuis) => ventes.filter(x => x.date >= depuis).length;

  const caJour = revenuPeriode(aujourdHui);
  const caSemaine = revenuPeriode(debutSem);
  const caMois = revenuPeriode(debutMois);
  const caAnnee = revenuPeriode(debutAnnee);

  const depensesJour = depenses.filter(d => d.date === aujourdHui).reduce((s, d) => s + Number(d.montant), 0);
  const depensesTotal = depenses.reduce((s, d) => s + Number(d.montant), 0);
  const enAttentePaiements = paiements.filter(p => p.statut !== "Payé").reduce((s, p) => s + Number(p.montant), 0);
  const enAttenteCreances = creances.reduce((s, cr) => s + (cr.echeances || []).filter(e => !e.paye).reduce((s2, e) => s2 + Number(e.montant), 0), 0);
  const enAttente = enAttentePaiements + enAttenteCreances;

  const totalEncaisseGlobal = revenuPeriode("2000-01-01");
  const solde = totalEncaisseGlobal - depensesTotal;

  const beneficeJour = ventes.filter(v => v.date === aujourdHui).reduce((s, v) => {
    const p = produits.find(pr => pr.id === v.produit_id);
    const cout = (p?.prix_achat || 0) * v.quantite;
    return s + (Number(v.montant) - cout);
  }, 0);

  const stockFaible = produits.filter(p => Number(p.stock_actuel) <= Number(p.seuil_alerte));

  const produitsPlusVendus = Object.values(
    ventes.reduce((acc, v) => {
      if (!acc[v.produit_id]) acc[v.produit_id] = { produit_id: v.produit_id, quantite: 0 };
      acc[v.produit_id].quantite += Number(v.quantite);
      return acc;
    }, {})
  ).sort((a, b) => b.quantite - a.quantite).slice(0, 3);

  const repartitionPaiements = MODES_PAIEMENT.map(mode => ({
    mode,
    montant: ventes.filter(v => v.mode === mode).reduce((s, v) => s + Number(v.montant), 0),
  })).filter(r => r.montant > 0);

  const enRetard = clients.filter(c =>
    paiements.some(p => p.client_id === c.id && p.statut !== "Payé" && p.date < aujourdHui) ||
    creances.some(cr => cr.client_id === c.id && (cr.echeances || []).some(e => statutEcheance(e) === "En retard"))
  ).length;

  return (
    <div>
      <style>{`
        .gf-grid4 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
        .gf-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
        @media (min-width: 820px) {
          .gf-grid4 { grid-template-columns: repeat(4, 1fr); }
          .gf-grid2 { grid-template-columns: repeat(2, 1fr); max-width: 500px; }
        }
      `}</style>

      <div className="gf-grid4">
        {[
          ["CA aujourd'hui", fmt(caJour), C.green],
          ["Dépenses du jour", fmt(depensesJour), C.red],
          ["Bénéfice estimé (jour)", fmt(beneficeJour), beneficeJour >= 0 ? C.green : C.red],
          ["Solde / trésorerie", fmt(solde), solde >= 0 ? C.navy : C.red],
        ].map(([label, val, color], i) => (
          <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
            <div style={{ color: C.textMuted, fontSize: "0.68rem", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem", color }}>{val}</div>
          </div>
        ))}
      </div>

      <div className="gf-grid2">
        {[
          ["Reste à encaisser", fmt(enAttente), C.amber],
          ["Clients à relancer", enRetard, C.red],
        ].map(([label, val, color], i) => (
          <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
            <div style={{ color: C.textMuted, fontSize: "0.68rem", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem", color }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ fontWeight: 700, color: C.navy, fontSize: "0.85rem", marginBottom: 8, marginTop: 4 }}>Récapitulatif des ventes</div>
      <div className="gf-grid4">
        {[
          ["Point du jour", caJour, nbVentesPeriode(aujourdHui), "#10b981"],
          ["Point de la semaine", caSemaine, nbVentesPeriode(debutSem), "#2563eb"],
          ["Point du mois", caMois, nbVentesPeriode(debutMois), "#f59e0b"],
          ["Point de l'année", caAnnee, nbVentesPeriode(debutAnnee), "#8b5cf6"],
        ].map(([label, montant, nb, color], i) => (
          <div key={i} style={{ background: color, borderRadius: 12, padding: 14, color: C.white }}>
            <div style={{ fontSize: "0.72rem", opacity: 0.9, marginBottom: 6 }}>{label}</div>
            <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>{fmt(montant)}</div>
            <div style={{ fontSize: "0.7rem", opacity: 0.85, marginTop: 2 }}>{nb} vente{nb > 1 ? "s" : ""}</div>
          </div>
        ))}
      </div>

      {stockFaible.length > 0 && (
        <div style={{ background: "#fef2f2", border: `1px solid ${C.red}40`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, color: C.red, fontSize: "0.82rem", marginBottom: 8 }}>⚠️ Stock faible</div>
          {stockFaible.map(p => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", padding: "4px 0" }}>
              <span>{p.nom}</span>
              <span style={{ fontWeight: 700, color: C.red }}>{p.stock_actuel} restant(s)</span>
            </div>
          ))}
        </div>
      )}

      {produitsPlusVendus.length > 0 && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, color: C.navy, fontSize: "0.85rem", marginBottom: 10 }}>Produits les plus vendus</div>
          {produitsPlusVendus.map((pv, i) => {
            const produit = produits.find(p => p.id === pv.produit_id);
            return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "0.82rem" }}>
                <span>{produit?.nom || "Produit supprimé"}</span>
                <span style={{ fontWeight: 700 }}>{pv.quantite} unités</span>
              </div>
            );
          })}
        </div>
      )}

      {repartitionPaiements.length > 0 && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, color: C.navy, fontSize: "0.85rem", marginBottom: 10 }}>Répartition des paiements (ventes)</div>
          {repartitionPaiements.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "0.82rem" }}>
              <span>{r.mode}</span>
              <span style={{ fontWeight: 700 }}>{fmt(r.montant)}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
        <div style={{ fontWeight: 700, color: C.navy, fontSize: "0.85rem", marginBottom: 10 }}>Dernières ventes</div>
        {ventes.slice(0, 5).map(v => {
          const produit = produits.find(p => p.id === v.produit_id);
          return (
            <div key={v.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: "0.8rem" }}>
              <span>{produit?.nom || "Produit supprimé"} × {v.quantite}</span>
              <span style={{ fontWeight: 700 }}>{fmt(v.montant)}</span>
            </div>
          );
        })}
        {ventes.length === 0 && <div style={{ color: C.textMuted, fontSize: "0.8rem" }}>Aucune vente encore.</div>}
      </div>
    </div>
  );
}

// ============================================================
// CLIENTS
// ============================================================
function ClientsView({ entreprise, clients, paiements, creances, recharger }) {
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [clientOuvert, setClientOuvert] = useState(null);

  const ajouter = async () => {
    if (!nom) return;
    await supabase.from("clients").insert({ entreprise_id: entreprise.id, nom, telephone, statut: "Actif" });
    setNom(""); setTelephone("");
    recharger();
  };

  const supprimer = async (id) => {
    await supabase.from("clients").delete().eq("id", id);
    recharger();
  };

  const modifierClient = async (id, champ, valeur) => {
    await supabase.from("clients").update({ [champ]: valeur }).eq("id", id);
    recharger();
  };

  if (clientOuvert) {
    const client = clients.find(c => c.id === clientOuvert.id) || clientOuvert;
    const historiquePaiements = paiements.filter(p => p.client_id === client.id);
    const historiqueCreances = creances.filter(cr => cr.client_id === client.id);
    const totalPaye = historiquePaiements.filter(p => p.statut === "Payé").reduce((s, p) => s + Number(p.montant), 0);

    return (
      <div style={{ maxWidth: 500 }}>
        <div onClick={() => setClientOuvert(null)} style={{ color: C.teal, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", marginBottom: 14 }}>← Retour aux clients</div>

        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <Input label="Nom" defaultValue={client.nom} onBlur={e => modifierClient(client.id, "nom", e.target.value)} />
          <Input label="Téléphone" defaultValue={client.telephone} onBlur={e => modifierClient(client.id, "telephone", e.target.value)} />
          <div style={{ color: C.textMuted, fontSize: "0.72rem", marginTop: 4 }}>Statut : {client.statut}</div>
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ color: C.textMuted, fontSize: "0.68rem" }}>TOTAL ENCAISSÉ</div>
          <div style={{ color: C.green, fontWeight: 800, fontSize: "1.15rem" }}>{fmt(totalPaye)}</div>
        </div>

        {historiqueCreances.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: "0.85rem", marginBottom: 8 }}>Créances échelonnées</div>
            {historiqueCreances.map(cr => (
              <div key={cr.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{fmt(cr.montant_total)}</div>
                <div style={{ color: C.textMuted, fontSize: "0.72rem" }}>{(cr.echeances || []).filter(e => e.paye).length} / {cr.nombre_echeances} échéances payées</div>
              </div>
            ))}
          </div>
        )}

        <div>
          <div style={{ fontWeight: 700, color: C.navy, fontSize: "0.85rem", marginBottom: 8 }}>Historique des paiements</div>
          {historiquePaiements.length === 0 && <div style={{ color: C.textMuted, fontSize: "0.8rem" }}>Aucun paiement enregistré.</div>}
          {historiquePaiements.map(p => (
            <div key={p.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{fmt(p.montant)}</div>
                <div style={{ color: C.textMuted, fontSize: "0.72rem" }}>{p.date} · {p.mode}</div>
              </div>
              <Badge text={p.statut} color={p.statut === "Payé" ? "vert" : "ambre"} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontWeight: 700, color: C.navy, fontSize: "0.85rem", marginBottom: 10 }}>Ajouter un client</div>
        <Input placeholder="Nom du client" value={nom} onChange={e => setNom(e.target.value)} />
        <Input placeholder="Téléphone" value={telephone} onChange={e => setTelephone(e.target.value)} />
        <Btn onClick={ajouter}>Ajouter</Btn>
      </div>
      {clients.map(c => (
        <div key={c.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div onClick={() => setClientOuvert(c)} style={{ cursor: "pointer", flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", color: C.teal }}>{c.nom}</div>
            <div style={{ color: C.textMuted, fontSize: "0.75rem" }}>{c.telephone}</div>
          </div>
          <span onClick={() => supprimer(c.id)} style={{ color: C.red, fontSize: "0.75rem", cursor: "pointer" }}>Supprimer</span>
        </div>
      ))}
    </div>
  );
}

function PaiementsView({ entreprise, clients, paiements, recharger }) {
  const [clientId, setClientId] = useState("");
  const [montant, setMontant] = useState("");
  const [statut, setStatut] = useState("Payé");

  const ajouter = async () => {
    if (!clientId || !montant) return;
    await supabase.from("paiements").insert({
      entreprise_id: entreprise.id, client_id: clientId, montant: Number(montant),
      mode: "Wave", date: new Date().toISOString().slice(0, 10), statut,
    });
    setMontant("");
    recharger();
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontWeight: 700, color: C.navy, fontSize: "0.85rem", marginBottom: 10 }}>Enregistrer un paiement</div>
        <select value={clientId} onChange={e => setClientId(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 12, borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg }}>
          <option value="">— Choisir un client —</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
        <Input type="number" placeholder="Montant (FCFA)" value={montant} onChange={e => setMontant(e.target.value)} />
        <select value={statut} onChange={e => setStatut(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 12, borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg }}>
          <option>Payé</option><option>En attente</option>
        </select>
        <Btn onClick={ajouter}>Enregistrer</Btn>
      </div>
      {paiements.map(p => {
        const client = clients.find(c => c.id === p.client_id);
        return (
          <div key={p.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{client?.nom || "—"}</div>
              <div style={{ color: C.textMuted, fontSize: "0.72rem" }}>{p.date}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700 }}>{fmt(p.montant)}</div>
              <Badge text={p.statut} color={p.statut === "Payé" ? "vert" : "ambre"} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// CRÉANCES ÉCHELONNÉES
// ============================================================
function CreancesView({ entreprise, clients, creances, recharger }) {
  const [formOuvert, setFormOuvert] = useState(false);
  const [creanceOuverte, setCreanceOuverte] = useState(null);
  const [clientId, setClientId] = useState("");
  const [montantTotal, setMontantTotal] = useState("");
  const [nombreEcheances, setNombreEcheances] = useState(3);
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().slice(0, 10));
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const creerCreance = async () => {
    setErreur("");
    if (!clientId || !montantTotal || !nombreEcheances) { setErreur("Remplis tous les champs."); return; }
    setChargement(true);

    const { data: creance, error: err1 } = await supabase
      .from("creances")
      .insert({ entreprise_id: entreprise.id, client_id: clientId, montant_total: Number(montantTotal), nombre_echeances: Number(nombreEcheances) })
      .select()
      .single();

    if (err1) { setChargement(false); setErreur("Erreur : " + err1.message); return; }

    const echeances = genererEcheances(creance.id, Number(montantTotal), Number(nombreEcheances), dateDebut);
    const { error: err2 } = await supabase.from("echeances").insert(echeances);

    setChargement(false);
    if (err2) { setErreur("Créance créée mais erreur échéances : " + err2.message); return; }

    setMontantTotal(""); setClientId(""); setFormOuvert(false);
    recharger();
  };

  const toggleEcheancePayee = async (echeanceId, payeActuel) => {
    await supabase.from("echeances").update({ paye: !payeActuel }).eq("id", echeanceId);
    recharger();
    if (creanceOuverte) {
      const misAJour = creances.find(c => c.id === creanceOuverte.id);
      if (misAJour) setCreanceOuverte(misAJour);
    }
  };

  if (creanceOuverte) {
    const cr = creances.find(c => c.id === creanceOuverte.id) || creanceOuverte;
    const client = clients.find(c => c.id === cr.client_id);
    const echeances = (cr.echeances || []).slice().sort((a, b) => a.numero - b.numero);
    const paye = echeances.filter(e => e.paye).reduce((s, e) => s + Number(e.montant), 0);
    const reste = cr.montant_total - paye;

    return (
      <div style={{ maxWidth: 500 }}>
        <div onClick={() => setCreanceOuverte(null)} style={{ color: C.teal, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", marginBottom: 14 }}>← Retour aux créances</div>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, color: C.navy, fontSize: "0.95rem", marginBottom: 4 }}>{client?.nom || "Client supprimé"}</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            <div><div style={{ color: C.textMuted, fontSize: "0.68rem" }}>ENCAISSÉ</div><div style={{ color: C.green, fontWeight: 800 }}>{fmt(paye)}</div></div>
            <div><div style={{ color: C.textMuted, fontSize: "0.68rem" }}>RESTE DÛ</div><div style={{ color: C.red, fontWeight: 800 }}>{fmt(reste)}</div></div>
          </div>
        </div>
        {echeances.map(e => (
          <div key={e.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>Échéance {e.numero} · {fmt(e.montant)}</div>
              <div style={{ color: C.textMuted, fontSize: "0.72rem" }}>{e.date_echeance}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Badge text={statutEcheance(e)} color={e.paye ? "vert" : statutEcheance(e) === "En retard" ? "rouge" : "gris"} />
              <span onClick={() => toggleEcheancePayee(e.id, e.paye)} style={{ color: C.teal, fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                {e.paye ? "Annuler" : "Marquer payée"}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700 }}>
      {!formOuvert && (
        <Btn onClick={() => setFormOuvert(true)}>+ Nouvelle créance échelonnée</Btn>
      )}
      {formOuvert && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14, marginTop: 10 }}>
          <div style={{ fontWeight: 700, color: C.navy, fontSize: "0.85rem", marginBottom: 10 }}>Nouvelle créance échelonnée</div>
          <select value={clientId} onChange={e => setClientId(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 12, borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg }}>
            <option value="">— Choisir un client —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <Input type="number" placeholder="Montant total (FCFA)" value={montantTotal} onChange={e => setMontantTotal(e.target.value)} />
          <Input type="number" label="Nombre d'échéances" value={nombreEcheances} onChange={e => setNombreEcheances(e.target.value)} />
          <Input type="date" label="1ère échéance" value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
          {erreur && <div style={{ color: C.red, fontSize: "0.78rem", marginBottom: 10 }}>{erreur}</div>}
          <Btn onClick={creerCreance} disabled={chargement}>{chargement ? "Création..." : "Créer l'échéancier"}</Btn>
          <div onClick={() => setFormOuvert(false)} style={{ textAlign: "center", marginTop: 10, fontSize: "0.78rem", color: C.textMuted, cursor: "pointer" }}>Annuler</div>
        </div>
      )}
      {creances.length === 0 && !formOuvert && (
        <div style={{ color: C.textMuted, textAlign: "center", padding: 20, fontSize: "0.85rem" }}>Aucune créance échelonnée pour l'instant.</div>
      )}
      {creances.map(cr => {
        const client = clients.find(c => c.id === cr.client_id);
        const echeances = cr.echeances || [];
        const payees = echeances.filter(e => e.paye).length;
        const enRetard = echeances.some(e => statutEcheance(e) === "En retard");
        const statutGlobal = payees === cr.nombre_echeances ? "Payée" : enRetard ? "En retard" : "À venir";
        return (
          <div key={cr.id} onClick={() => setCreanceOuverte(cr)}
            style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 10, cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.88rem", color: C.text }}>{client?.nom || "Client supprimé"}</div>
                <div style={{ color: C.textMuted, fontSize: "0.75rem", marginTop: 2 }}>{payees} / {cr.nombre_echeances} échéances payées</div>
              </div>
              <Badge text={statutGlobal} color={statutGlobal === "Payée" ? "vert" : statutGlobal === "En retard" ? "rouge" : "gris"} />
            </div>
            <div style={{ fontWeight: 800, color: C.teal, marginTop: 8 }}>{fmt(cr.montant_total)}</div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// VENTE / CAISSE — panier → facture (aperçu) → imprimer → valider
// ============================================================
function VentesView({ entreprise, produits, ventes, recharger }) {
  const [gererProduits, setGererProduits] = useState(false);
  const [nomProduit, setNomProduit] = useState("");
  const [prixProduit, setPrixProduit] = useState("");
  const [prixAchatProduit, setPrixAchatProduit] = useState("");
  const [seuilProduit, setSeuilProduit] = useState("5");
  const [panier, setPanier] = useState([]);
  const [mode, setMode] = useState("Espèces");
  const [typeCommande, setTypeCommande] = useState("Sur Place");
  const [calculatriceOuverte, setCalculatriceOuverte] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);
  const [ecran, setEcran] = useState("caisse");
  const [ticketCourant, setTicketCourant] = useState(null);

  const ajouterProduit = async () => {
    if (!nomProduit || !prixProduit) return;
    await supabase.from("produits").insert({
      entreprise_id: entreprise.id, nom: nomProduit, prix: Number(prixProduit),
      prix_achat: Number(prixAchatProduit) || 0, seuil_alerte: Number(seuilProduit) || 5, stock_actuel: 0,
    });
    setNomProduit(""); setPrixProduit(""); setPrixAchatProduit(""); setSeuilProduit("5");
    recharger();
  };

  const supprimerProduit = async (id) => {
    await supabase.from("produits").delete().eq("id", id);
    recharger();
  };

  const ajouterAuPanier = (produit) => {
    setPanier(p => {
      const existant = p.find(l => l.produit_id === produit.id);
      if (existant) return p.map(l => l.produit_id === produit.id ? { ...l, quantite: l.quantite + 1 } : l);
      return [...p, { produit_id: produit.id, nom: produit.nom, prix: produit.prix, quantite: 1 }];
    });
  };

  const changerQuantite = (produit_id, delta) => {
    setPanier(p => p
      .map(l => l.produit_id === produit_id ? { ...l, quantite: l.quantite + delta } : l)
      .filter(l => l.quantite > 0)
    );
  };

  const retirerDuPanier = (produit_id) => setPanier(p => p.filter(l => l.produit_id !== produit_id));

  const totalPanier = panier.reduce((s, l) => s + l.prix * l.quantite, 0);

  const aujourdHui = new Date().toISOString().slice(0, 10);
  const ventesDuJour = ventes.filter(v => v.date === aujourdHui);
  const totalDuJour = ventesDuJour.reduce((s, v) => s + Number(v.montant), 0);

  const genererApercu = () => {
    if (panier.length === 0) return;
    const ticketsAujourdhui = new Set(ventesDuJour.filter(v => v.ticket_id).map(v => v.ticket_id)).size;
    const id = crypto.randomUUID();
    setTicketCourant({ id, numero: `#${ticketsAujourdhui + 1}-${id.slice(0, 4).toUpperCase()}`, dateHeure: new Date() });
    setEcran("apercu");
  };

  const validerTicket = async () => {
    if (!ticketCourant) return;
    setEnregistrement(true);
    for (const ligne of panier) {
      await supabase.from("ventes").insert({
        entreprise_id: entreprise.id, produit_id: ligne.produit_id, quantite: ligne.quantite,
        montant: ligne.prix * ligne.quantite, mode, date: aujourdHui, ticket_id: ticketCourant.id,
      });
      const produit = produits.find(p => p.id === ligne.produit_id);
      if (produit) {
        const nouveauStock = Math.max(0, Number(produit.stock_actuel) - ligne.quantite);
        await supabase.from("produits").update({ stock_actuel: nouveauStock }).eq("id", produit.id);
        await supabase.from("mouvements_stock").insert({
          entreprise_id: entreprise.id, produit_id: produit.id, type: "sortie", quantite: ligne.quantite, motif: "Vente", date: aujourdHui,
        });
      }
    }
    setPanier([]);
    setTicketCourant(null);
    setEcran("caisse");
    setEnregistrement(false);
    recharger();
  };

  const supprimerVente = async (id) => {
    await supabase.from("ventes").delete().eq("id", id);
    recharger();
  };

  if (gererProduits) {
    return (
      <div style={{ maxWidth: 500 }}>
        <div onClick={() => setGererProduits(false)} style={{ color: C.teal, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", marginBottom: 14 }}>← Retour à la caisse</div>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, color: C.navy, fontSize: "0.85rem", marginBottom: 10 }}>Ajouter un produit</div>
          <Input placeholder="Nom du produit (ex: Bière 33cl)" value={nomProduit} onChange={e => setNomProduit(e.target.value)} />
          <Input type="number" placeholder="Prix de vente (FCFA)" value={prixProduit} onChange={e => setPrixProduit(e.target.value)} />
          <Input type="number" placeholder="Prix d'achat (FCFA, optionnel)" value={prixAchatProduit} onChange={e => setPrixAchatProduit(e.target.value)} />
          <Input type="number" label="Seuil d'alerte stock" value={seuilProduit} onChange={e => setSeuilProduit(e.target.value)} />
          <Btn onClick={ajouterProduit}>Ajouter</Btn>
        </div>
        {produits.map(p => (
          <div key={p.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{p.nom}</div>
              <div style={{ color: C.textMuted, fontSize: "0.75rem" }}>{fmt(p.prix)} · Stock: {p.stock_actuel}</div>
            </div>
            <span onClick={() => supprimerProduit(p.id)} style={{ color: C.red, fontSize: "0.75rem", cursor: "pointer" }}>Supprimer</span>
          </div>
        ))}
      </div>
    );
  }

  if (ecran === "apercu" && ticketCourant) {
    return (
      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        <style media="print">{`
          body * { visibility: hidden; }
          #zone-impression, #zone-impression * { visibility: visible; }
          #zone-impression { position: absolute; left: 0; top: 0; width: 100%; }
        `}</style>
        <div onClick={() => setEcran("caisse")} style={{ color: C.teal, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", marginBottom: 14 }}>← Modifier le ticket</div>

        <div id="zone-impression" style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, fontFamily: "monospace", fontSize: "0.82rem", marginBottom: 16 }}>
          <div style={{ textAlign: "center", fontWeight: 800, marginBottom: 6 }}>{(entreprise.nom || "").toUpperCase()}</div>
          <div>Employé : {entreprise.responsable || "—"}</div>
          <div>PDV : Comptoir</div>
          <div style={{ borderTop: `1px dashed ${C.border}`, margin: "8px 0" }} />
          <div style={{ textAlign: "center", fontWeight: 700 }}>{typeCommande.toUpperCase()}</div>
          <div style={{ borderTop: `1px dashed ${C.border}`, margin: "8px 0" }} />
          {panier.map(l => (
            <div key={l.produit_id} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{l.nom}</span>
                <span>{fmt(l.prix * l.quantite)}</span>
              </div>
              <div style={{ color: C.textMuted, fontSize: "0.75rem" }}>{l.quantite} × {fmt(l.prix)}</div>
            </div>
          ))}
          <div style={{ borderTop: `1px dashed ${C.border}`, margin: "8px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
            <span>TOTAL</span><span>{fmt(totalPanier)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span>{mode}</span><span>{fmt(totalPanier)}</span>
          </div>
          <div style={{ borderTop: `1px dashed ${C.border}`, margin: "8px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{ticketCourant.dateHeure.toLocaleDateString("fr-FR")}</span>
            <span>{ticketCourant.dateHeure.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <div style={{ textAlign: "center", marginTop: 4 }}>{ticketCourant.numero}</div>
          <div style={{ borderTop: `1px dashed ${C.border}`, margin: "8px 0" }} />
          <div style={{ textAlign: "center", fontWeight: 700 }}>MERCI POUR VOTRE VISITE</div>
        </div>

        <Btn onClick={() => window.print()} variant="outline">🖨️ Imprimer</Btn>
        <div style={{ height: 10 }} />
        <Btn onClick={validerTicket} disabled={enregistrement}>{enregistrement ? "Enregistrement..." : "✅ Valider et encaisser"}</Btn>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        .gf-caisse { display: block; }
        @media (min-width: 900px) {
          .gf-caisse { display: grid; grid-template-columns: 1fr 380px; gap: 20px; align-items: start; }
        }
        .gf-produits-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        @media (min-width: 600px) {
          .gf-produits-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontWeight: 700, color: C.navy, fontSize: "0.9rem" }}>Vendu aujourd'hui : <span style={{ color: C.green }}>{fmt(totalDuJour)}</span></div>
        <div style={{ display: "flex", gap: 12 }}>
          <span onClick={() => setCalculatriceOuverte(o => !o)} style={{ color: C.teal, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>🧮 Calculatrice</span>
          <span onClick={() => setGererProduits(true)} style={{ color: C.teal, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>Gérer les produits</span>
        </div>
      </div>

      {calculatriceOuverte && <Calculatrice />}

      {produits.length === 0 && (
        <div style={{ color: C.textMuted, textAlign: "center", padding: 20, fontSize: "0.85rem" }}>
          Aucun produit encore. <span onClick={() => setGererProduits(true)} style={{ color: C.teal, cursor: "pointer" }}>Ajoute ton premier produit</span>.
        </div>
      )}

      {produits.length > 0 && (
        <div className="gf-caisse">
          <div className="gf-produits-grid">
            {produits.map(p => {
              const rupture = Number(p.stock_actuel) <= 0;
              return (
                <button key={p.id} onClick={() => ajouterAuPanier(p)}
                  style={{ position: "relative", textAlign: "left", background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, cursor: "pointer" }}>
                  {rupture && (
                    <span style={{ position: "absolute", top: 8, right: 8, fontSize: "0.6rem", fontWeight: 700, color: C.red, background: `${C.red}18`, padding: "2px 6px", borderRadius: 8 }}>Rupture</span>
                  )}
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: C.text, marginBottom: 4 }}>{p.nom}</div>
                  <div style={{ color: C.teal, fontWeight: 800, fontSize: "0.9rem" }}>{fmt(p.prix)}</div>
                  <div style={{ color: C.textMuted, fontSize: "0.68rem", marginTop: 2 }}>Stock: {p.stock_actuel}</div>
                </button>
              );
            })}
          </div>

          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginTop: 16 }}>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: "0.9rem", marginBottom: 10 }}>🧾 Ticket en cours</div>

            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {["Sur Place", "À emporter"].map(t => (
                <button key={t} onClick={() => setTypeCommande(t)}
                  style={{ flex: 1, padding: 8, borderRadius: 8, border: `1px solid ${typeCommande === t ? C.teal : C.border}`, background: typeCommande === t ? C.teal : C.bg, color: typeCommande === t ? C.white : C.text, fontSize: "0.75rem", fontWeight: 700 }}>
                  {t}
                </button>
              ))}
            </div>

            {panier.length === 0 && <div style={{ color: C.textMuted, fontSize: "0.82rem", textAlign: "center", padding: "10px 0" }}>Appuie sur un produit pour l'ajouter</div>}
            {panier.map(l => (
              <div key={l.produit_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.82rem" }}>{l.nom}</div>
                  <div style={{ color: C.textMuted, fontSize: "0.72rem" }}>{fmt(l.prix)} × {l.quantite}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={() => changerQuantite(l.produit_id, -1)} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, fontWeight: 700 }}>-</button>
                  <span style={{ fontWeight: 700, minWidth: 16, textAlign: "center" }}>{l.quantite}</span>
                  <button onClick={() => changerQuantite(l.produit_id, 1)} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, fontWeight: 700 }}>+</button>
                  <span onClick={() => retirerDuPanier(l.produit_id)} style={{ color: C.red, fontSize: "0.7rem", cursor: "pointer", marginLeft: 4 }}>✕</span>
                </div>
              </div>
            ))}

            {panier.length > 0 && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", fontWeight: 800, fontSize: "1rem" }}>
                  <span>Total</span>
                  <span style={{ color: C.teal }}>{fmt(totalPanier)}</span>
                </div>
                <select value={mode} onChange={e => setMode(e.target.value)}
                  style={{ width: "100%", padding: 10, marginBottom: 12, borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg }}>
                  {MODES_PAIEMENT.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <Btn onClick={genererApercu}>Voir la facture</Btn>
                <div onClick={() => setPanier([])} style={{ textAlign: "center", marginTop: 10, fontSize: "0.75rem", color: C.textMuted, cursor: "pointer" }}>Vider le ticket</div>
              </>
            )}
          </div>
        </div>
      )}

      {ventesDuJour.length > 0 && (
        <div style={{ marginTop: 20, maxWidth: 700 }}>
          <div style={{ fontWeight: 700, color: C.navy, fontSize: "0.85rem", marginBottom: 8 }}>Ventes du jour</div>
          {ventesDuJour.map(v => {
            const produit = produits.find(p => p.id === v.produit_id);
            return (
              <div key={v.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{produit?.nom || "Produit supprimé"} × {v.quantite}</div>
                  <div style={{ color: C.textMuted, fontSize: "0.72rem" }}>{fmt(v.montant)} · {v.mode}</div>
                </div>
                <span onClick={() => supprimerVente(v.id)} style={{ color: C.red, fontSize: "0.72rem", cursor: "pointer" }}>Annuler</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// STOCK
// ============================================================
function StockView({ entreprise, produits, recharger }) {
  const [ajoutOuvert, setAjoutOuvert] = useState(false);
  const [produitId, setProduitId] = useState("");
  const [quantite, setQuantite] = useState("");
  const [motif, setMotif] = useState("");
  const [erreur, setErreur] = useState("");

  const ajouterStock = async () => {
    setErreur("");
    if (!produitId || !quantite) { setErreur("Choisis un produit et une quantité."); return; }
    const produit = produits.find(p => p.id === produitId);
    if (!produit) return;

    await supabase.from("mouvements_stock").insert({
      entreprise_id: entreprise.id, produit_id: produitId, type: "entree",
      quantite: Number(quantite), motif: motif || "Approvisionnement", date: new Date().toISOString().slice(0, 10),
    });
    await supabase.from("produits").update({ stock_actuel: Number(produit.stock_actuel) + Number(quantite) }).eq("id", produitId);

    setProduitId(""); setQuantite(""); setMotif(""); setAjoutOuvert(false);
    recharger();
  };

  const modifierProduit = async (id, champ, valeur) => {
    await supabase.from("produits").update({ [champ]: Number(valeur) || 0 }).eq("id", id);
    recharger();
  };

  return (
    <div style={{ maxWidth: 700 }}>
      {!ajoutOuvert && <Btn onClick={() => setAjoutOuvert(true)}>+ Ajouter du stock</Btn>}
      {ajoutOuvert && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14, marginTop: 10 }}>
          <div style={{ fontWeight: 700, color: C.navy, fontSize: "0.85rem", marginBottom: 10 }}>Entrée de stock</div>
          <select value={produitId} onChange={e => setProduitId(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 12, borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg }}>
            <option value="">— Choisir un produit —</option>
            {produits.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
          </select>
          <Input type="number" placeholder="Quantité reçue" value={quantite} onChange={e => setQuantite(e.target.value)} />
          <Input placeholder="Motif (ex: Livraison fournisseur)" value={motif} onChange={e => setMotif(e.target.value)} />
          {erreur && <div style={{ color: C.red, fontSize: "0.78rem", marginBottom: 10 }}>{erreur}</div>}
          <Btn onClick={ajouterStock}>Enregistrer l'entrée</Btn>
          <div onClick={() => setAjoutOuvert(false)} style={{ textAlign: "center", marginTop: 10, fontSize: "0.78rem", color: C.textMuted, cursor: "pointer" }}>Annuler</div>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <div style={{ fontWeight: 700, color: C.navy, fontSize: "0.85rem", marginBottom: 10 }}>Stock actuel</div>
        {produits.length === 0 && <div style={{ color: C.textMuted, fontSize: "0.85rem" }}>Aucun produit — ajoute-en depuis l'onglet Ventes.</div>}
        {produits.map(p => {
          const faible = Number(p.stock_actuel) <= Number(p.seuil_alerte);
          return (
            <div key={p.id} style={{ background: C.white, border: `1px solid ${faible ? C.red : C.border}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{p.nom}</div>
                <div style={{ fontWeight: 800, fontSize: "1rem", color: faible ? C.red : C.green }}>{p.stock_actuel}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: C.textMuted, fontSize: "0.68rem" }}>Prix d'achat</label>
                  <input type="number" defaultValue={p.prix_achat} onBlur={e => modifierProduit(p.id, "prix_achat", e.target.value)}
                    style={{ width: "100%", padding: 8, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: "0.82rem" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: C.textMuted, fontSize: "0.68rem" }}>Seuil d'alerte</label>
                  <input type="number" defaultValue={p.seuil_alerte} onBlur={e => modifierProduit(p.id, "seuil_alerte", e.target.value)}
                    style={{ width: "100%", padding: 8, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: "0.82rem" }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// DÉPENSES
// ============================================================
function DepensesView({ entreprise, depenses, recharger }) {
  const [categorie, setCategorie] = useState("");
  const [description, setDescription] = useState("");
  const [montant, setMontant] = useState("");

  const ajouter = async () => {
    if (!categorie || !montant) return;
    await supabase.from("depenses").insert({
      entreprise_id: entreprise.id, categorie, description, montant: Number(montant), date: new Date().toISOString().slice(0, 10),
    });
    setCategorie(""); setDescription(""); setMontant("");
    recharger();
  };

  const supprimer = async (id) => {
    await supabase.from("depenses").delete().eq("id", id);
    recharger();
  };

  const aujourdHui = new Date().toISOString().slice(0, 10);
  const totalJour = depenses.filter(d => d.date === aujourdHui).reduce((s, d) => s + Number(d.montant), 0);

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ fontWeight: 700, color: C.navy, fontSize: "0.9rem", marginBottom: 14 }}>Dépenses aujourd'hui : <span style={{ color: C.red }}>{fmt(totalJour)}</span></div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontWeight: 700, color: C.navy, fontSize: "0.85rem", marginBottom: 10 }}>Enregistrer une dépense</div>
        <Input placeholder="Catégorie (ex: Transport, Loyer, Achat marchandise)" value={categorie} onChange={e => setCategorie(e.target.value)} />
        <Input placeholder="Description (optionnel)" value={description} onChange={e => setDescription(e.target.value)} />
        <Input type="number" placeholder="Montant (FCFA)" value={montant} onChange={e => setMontant(e.target.value)} />
        <Btn onClick={ajouter}>Enregistrer</Btn>
      </div>

      {depenses.length === 0 && <div style={{ color: C.textMuted, textAlign: "center", padding: 20, fontSize: "0.85rem" }}>Aucune dépense enregistrée.</div>}
      {depenses.map(d => (
        <div key={d.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{d.categorie}</div>
            <div style={{ color: C.textMuted, fontSize: "0.72rem" }}>{d.description ? `${d.description} · ` : ""}{d.date}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, color: C.red }}>{fmt(d.montant)}</div>
            <span onClick={() => supprimer(d.id)} style={{ color: C.red, fontSize: "0.7rem", cursor: "pointer" }}>Supprimer</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function EspaceEntreprise({ entreprise, onLogout }) {
  const [tab, setTab] = useState("dashboard");
  const [clients, setClients] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [creances, setCreances] = useState([]);
  const [produits, setProduits] = useState([]);
  const [ventes, setVentes] = useState([]);
  const [depenses, setDepenses] = useState([]);

  const recharger = async () => {
    const { data: c } = await supabase.from("clients").select("*").eq("entreprise_id", entreprise.id).order("created_at", { ascending: false });
    const { data: p } = await supabase.from("paiements").select("*").eq("entreprise_id", entreprise.id).order("date", { ascending: false });
    const { data: cr } = await supabase.from("creances").select("*, echeances(*)").eq("entreprise_id", entreprise.id).order("created_at", { ascending: false });
    setClients(c || []);
    setPaiements(p || []);
    setCreances(cr || []);
    const { data: prod } = await supabase.from("produits").select("*").eq("entreprise_id", entreprise.id).order("created_at", { ascending: false });
    const { data: vte } = await supabase.from("ventes").select("*").eq("entreprise_id", entreprise.id).order("created_at", { ascending: false });
    const { data: dep } = await supabase.from("depenses").select("*").eq("entreprise_id", entreprise.id).order("date", { ascending: false });
    setProduits(prod || []);
    setVentes(vte || []);
    setDepenses(dep || []);
  };

  useEffect(() => { recharger(); }, []);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ background: `linear-gradient(135deg,${C.navyDark},${C.navy})`, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: C.white, fontWeight: 700, fontSize: "0.95rem" }}>{entreprise.nom}</div>
          <div style={{ color: C.tealLight, fontSize: "0.68rem" }}>{entreprise.statut} {entreprise.date_expiration ? `· jusqu'au ${entreprise.date_expiration}` : ""}</div>
        </div>
        <span onClick={onLogout} style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", cursor: "pointer" }}>Déconnexion</span>
      </div>
      <div style={{ display: "flex", background: C.white, borderBottom: `1px solid ${C.border}`, overflowX: "auto" }}>
        {[["dashboard", "Tableau de bord"], ["clients", "Clients"], ["paiements", "Paiements"], ["creances", "Créances"], ["ventes", "Ventes"], ["stock", "Stock"], ["depenses", "Dépenses"]].map(([id, label]) => (
          <div key={id} onClick={() => setTab(id)}
            style={{ flex: "0 0 auto", textAlign: "center", padding: "10px 14px", fontSize: "0.72rem", fontWeight: 700, color: tab === id ? C.teal : C.textMuted, borderBottom: tab === id ? `2px solid ${C.teal}` : "2px solid transparent", cursor: "pointer", whiteSpace: "nowrap" }}>
            {label}
          </div>
        ))}
      </div>
      <div style={{ padding: 16 }}>
        {tab === "dashboard" && <TableauDeBord clients={clients} paiements={paiements} creances={creances} ventes={ventes} produits={produits} depenses={depenses} />}
        {tab === "clients" && <ClientsView entreprise={entreprise} clients={clients} paiements={paiements} creances={creances} recharger={recharger} />}
        {tab === "paiements" && <PaiementsView entreprise={entreprise} clients={clients} paiements={paiements} recharger={recharger} />}
        {tab === "creances" && <CreancesView entreprise={entreprise} clients={clients} creances={creances} recharger={recharger} />}
        {tab === "ventes" && <VentesView entreprise={entreprise} produits={produits} ventes={ventes} recharger={recharger} />}
        {tab === "stock" && <StockView entreprise={entreprise} produits={produits} recharger={recharger} />}
        {tab === "depenses" && <DepensesView entreprise={entreprise} depenses={depenses} recharger={recharger} />}
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT RACINE
// ============================================================
export default function PolyFinanceGF() {
  const [ecran, setEcran] = useState("chargement");
  const [entreprise, setEntreprise] = useState(null);

  const chargerEntreprise = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setEcran("login"); return; }

    if (user.email === ADMIN_EMAIL) {
      setEcran("admin");
      return;
    }

    const { data } = await supabase.from("entreprises").select("*").eq("auth_user_id", user.id).single();
    if (!data) { setEcran("login"); return; }

    setEntreprise(data);
    const aujourdHui = new Date().toISOString().slice(0, 10);
    const expire = data.date_expiration && data.date_expiration < aujourdHui;

    if (data.statut === "En attente") {
      setEcran("attente-connecte");
    } else if (expire) {
      setEcran("expire");
    } else {
      setEcran("app");
    }
  };

  useEffect(() => { chargerEntreprise(); }, []);

  const seDeconnecter = async () => {
    await supabase.auth.signOut();
    setEntreprise(null);
    setEcran("login");
  };

  if (ecran === "chargement") return <div style={{ padding: 40, textAlign: "center", color: C.textMuted }}>Chargement...</div>;
  if (ecran === "login") return <Connexion onGoSignup={() => setEcran("signup")} onLoggedIn={chargerEntreprise} />;
  if (ecran === "signup") return <Inscription onGoLogin={() => setEcran("login")} onInscrit={(plan) => setEcran(plan === "gratuit" ? "login" : "attente")} />;
  if (ecran === "attente") return <EnAttente onGoLogin={() => setEcran("login")} />;
  if (ecran === "attente-connecte") return <EnAttenteConnecte entreprise={entreprise} onLogout={seDeconnecter} />;
  if (ecran === "expire") return <AccesExpire entreprise={entreprise} onLogout={seDeconnecter} />;
  if (ecran === "admin") return <AdminDashboard onLogout={seDeconnecter} />;
  if (ecran === "app" && entreprise) return <EspaceEntreprise entreprise={entreprise} onLogout={seDeconnecter} />;
  return null;
}
