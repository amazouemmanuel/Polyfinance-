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
const WHATSAPP_NUMERO = "2250759570327";

const PLANS = [
  { id: "gratuit", nom: "Gratuit", prix: "0 F", periode: "2 jours d'essai", jours: 2 },
  { id: "premium", nom: "Premium", prix: "8 000 F", periode: "/ 30 jours", jours: 30 },
];

const MODES_PAIEMENT = ["Espèces", "Wave", "Orange Money", "Virement"];
const MDP_REGEX = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/;
const MDP_AIDE = "Au moins 6 caractères, un chiffre et un caractère spécial (ex: # ! *).";

// Échelle typographique unique — réutilisée partout
const T = { micro: "11px", small: "12.5px", body: "14px", sub: "15.5px", h3: "17px", h2: "20px", h1: "24px" };

const GLOBAL_CSS = `
  .gf-input { transition: border-color .15s ease, box-shadow .15s ease; }
  .gf-input:focus { border-color: ${C.teal} !important; box-shadow: 0 0 0 3px ${C.teal}22; }
  .gf-input:disabled { cursor: not-allowed; }
  .gf-btn { transition: filter .15s ease, transform .05s ease, box-shadow .15s ease; }
  .gf-btn:hover:not(:disabled) { filter: brightness(1.06); }
  .gf-btn:active:not(:disabled) { transform: translateY(1px); }
  .gf-card-link { transition: border-color .15s ease, box-shadow .15s ease; }
  .gf-card-link:hover { border-color: ${C.teal}80 !important; box-shadow: 0 2px 8px rgba(27,77,110,0.08); }
`;

// ============================================================
// ICÔNES — SVG inline simples, sans dépendance externe
// ============================================================
function Icon({ name, size = 18 }) {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    clients: <><circle cx="12" cy="8" r="3.3" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></>,
    paiements: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /></>,
    creances: <><path d="M6 3h9l4 4v14H6z" /><path d="M9 11h6M9 15h6" /></>,
    caisse: <><path d="M4 9h16l-1.5 10.5a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 9Z" /><path d="M8 9V7a4 4 0 0 1 8 0v2" /></>,
    stock: <><path d="M3 7l9-4 9 4-9 4-9-4Z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></>,
    depenses: <><circle cx="12" cy="12" r="9" /><path d="M8 12h8" /></>,
    rapports: <><path d="M4 20V10M12 20V4M20 20v-7" /><path d="M2 20h20" /></>,
    parametres: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z" /></>,
    export: <><path d="M12 3v12M7 10l5 5 5-5" /><path d="M5 21h14" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || null}
    </svg>
  );
}

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

function exporterCSV(nomFichier, colonnes, lignes) {
  const echapper = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const entete = colonnes.map(c => echapper(c.label)).join(";");
  const corps = lignes.map(ligne => colonnes.map(c => echapper(ligne[c.cle])).join(";")).join("\n");
  const csv = "\uFEFF" + entete + "\n" + corps;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nomFichier}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ color: C.textMuted, fontSize: T.small, display: "block", marginBottom: 5 }}>{label}</label>}
      <input {...props} className="gf-input" style={{ width: "100%", padding: "10px 13px", boxSizing: "border-box", background: props.disabled ? "#eee" : C.bg, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: T.body, outline: "none" }} />
    </div>
  );
}

function Btn({ children, onClick, disabled, variant = "primary" }) {
  const bg = variant === "primary" ? `linear-gradient(135deg,${C.teal},${C.tealLight})` : "transparent";
  return (
    <button onClick={onClick} disabled={disabled} className="gf-btn"
      style={{ width: "100%", padding: 13, background: disabled ? "#ccc" : bg, border: variant === "outline" ? `1px solid ${C.border}` : "none", borderRadius: 10, color: variant === "outline" ? C.text : C.white, fontSize: T.body, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
      {children}
    </button>
  );
}

function Badge({ text, color }) {
  const map = { vert: C.green, rouge: C.red, ambre: C.amber, gris: C.textMuted, violet: C.purple };
  const c = map[color] || C.textMuted;
  return <span style={{ fontSize: T.micro, fontWeight: 700, color: c, background: `${c}18`, padding: "3px 8px", borderRadius: 20 }}>{text}</span>;
}


// Suppression sûre : confirmation + message clair si ça échoue
async function supprimerLigne(table, id, message, recharger) {
  if (!window.confirm(message)) return false;
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) {
    window.alert("Suppression impossible. Vérifie ta connexion et réessaie.");
    return false;
  }
  if (recharger) await recharger();
  return true;
}

function LienSupprimer({ onClick, label = "Supprimer" }) {
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{ background: "transparent", border: `1px solid ${C.red}55`, color: C.red, fontSize: T.small, fontWeight: 700, padding: "8px 12px", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
      {label}
    </button>
  );
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
        <div style={{ fontWeight: 700, color: C.navy, fontSize: T.sub }}>Calculatrice</div>
        <span onClick={() => appuyer("⌫")} style={{ color: C.textMuted, fontSize: T.small, cursor: "pointer" }}>⌫ Effacer</span>
      </div>
      <div style={{ background: C.bg, borderRadius: 8, padding: 12, textAlign: "right", fontSize: T.h3, fontWeight: 700, marginBottom: 10, minHeight: 30, overflowX: "auto", whiteSpace: "nowrap" }}>
        {resultat !== null ? (typeof resultat === "number" ? resultat.toLocaleString("fr-FR") : resultat) : (expression || "0")}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
        {touches.map(k => (
          <button key={k} onClick={() => appuyer(k)} className="gf-btn"
            style={{ padding: 14, borderRadius: 8, border: `1px solid ${C.border}`, background: speciales.includes(k) ? C.teal : C.bg, color: speciales.includes(k) ? C.white : C.text, fontWeight: 700, fontSize: T.sub, cursor: "pointer" }}>
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// ÉCRAN PARTAGÉ : Accès Premium requis (attente / expiré) avec WhatsApp
// ============================================================
function EcranPaiementRequis({ icone, titre, sousTitre, messageWhatsapp, lienSecondaire, onLogout }) {
  const lienWhatsapp = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(messageWhatsapp)}`;

  const Etape = ({ numero }) => (
    <span style={{ width: 26, height: 26, borderRadius: "50%", background: C.navy, color: C.white, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: T.small, flexShrink: 0 }}>{numero}</span>
  );

  return (
    <div style={{ maxWidth: 440, margin: "0 auto", padding: "32px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "2.4rem", marginBottom: 10 }}>{icone}</div>
      <div style={{ color: C.navy, fontWeight: 800, fontSize: T.h1, marginBottom: 6 }}>{titre}</div>
      <div style={{ color: C.textMuted, fontSize: T.body, marginBottom: 22 }}>{sousTitre}</div>

      <div style={{ background: `${C.teal}0d`, border: `1px solid ${C.teal}30`, borderRadius: 12, padding: 16, marginBottom: 12, display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
        <span style={{ fontSize: "1.4rem" }}>👑</span>
        <div>
          <div style={{ color: C.navy, fontWeight: 700, fontSize: T.body }}>Passez en Premium</div>
          <div style={{ color: C.teal, fontWeight: 800, fontSize: T.h3 }}>8 000 F <span style={{ color: C.textMuted, fontWeight: 500, fontSize: T.small }}>/ 30 jours</span></div>
        </div>
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 12, textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <Etape numero="1" />
          <div style={{ fontWeight: 700, color: C.navy, fontSize: T.body }}>Payez via Wave ou Orange Money</div>
        </div>
        <div style={{ color: C.textMuted, fontSize: T.small, marginBottom: 6 }}>Au numéro :</div>
        <div style={{ background: C.navy, color: C.white, borderRadius: 9, padding: "9px 14px", fontWeight: 800, fontSize: T.sub, display: "inline-block", marginBottom: 10 }}>
          07 59 57 03 27
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <span style={{ background: "#1B9CFC18", color: "#0b7fd1", fontWeight: 700, fontSize: T.micro, padding: "4px 10px", borderRadius: 7 }}>Wave</span>
          <span style={{ background: "#F4770018", color: "#c05e00", fontWeight: 700, fontSize: T.micro, padding: "4px 10px", borderRadius: 7 }}>Orange Money</span>
        </div>
        <div style={{ color: C.textMuted, fontSize: T.small }}>Montant : <strong style={{ color: C.text }}>8 000 F</strong> · Durée : <strong style={{ color: C.text }}>30 jours</strong></div>
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 14, textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}>
        <Etape numero="2" />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: C.navy, fontSize: T.body }}>Envoyez votre preuve de paiement</div>
          <div style={{ color: C.textMuted, fontSize: T.small }}>sur WhatsApp</div>
        </div>
      </div>

      <a href={lienWhatsapp} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block", marginBottom: 12 }}>
        <div className="gf-btn" style={{ background: "#25D366", borderRadius: 10, padding: "13px 18px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: C.white, fontWeight: 700, fontSize: T.body }}>
          Envoyer la preuve sur WhatsApp →
        </div>
      </a>

      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
        <span style={{ color: C.textMuted, fontSize: T.small }}>Activation après vérification du paiement.</span>
      </div>

      {lienSecondaire}
      {onLogout && <span onClick={onLogout} style={{ color: C.teal, fontWeight: 700, cursor: "pointer", fontSize: T.body }}>Déconnexion</span>}
    </div>
  );
}

// ============================================================
// ÉCRAN : Connexion
// ============================================================
function Connexion({ onGoSignup, onLoggedIn, onGoForgot }) {
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
        <div style={{ color: C.navy, fontWeight: 800, fontSize: T.h2 }}>PolyFinance <span style={{ color: C.teal }}>GF</span></div>
        <div style={{ color: C.textMuted, fontSize: T.body, marginTop: 4 }}>Connexion à votre espace entreprise</div>
      </div>
      <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@entreprise.ci" />
      <Input label="Mot de passe" type="password" value={motDePasse} onChange={e => setMotDePasse(e.target.value)} placeholder="••••••••" />
      <div onClick={onGoForgot} style={{ textAlign: "right", color: C.teal, fontSize: T.small, fontWeight: 700, cursor: "pointer", marginBottom: 14, marginTop: -6 }}>
        Mot de passe oublié ?
      </div>
      {erreur && <div style={{ color: C.red, fontSize: T.small, marginBottom: 12 }}>{erreur}</div>}
      <Btn onClick={connecter} disabled={chargement}>{chargement ? "Connexion..." : "Se connecter"}</Btn>
      <div style={{ textAlign: "center", marginTop: 16, fontSize: T.body, color: C.textMuted }}>
        Pas encore de compte ? <span onClick={onGoSignup} style={{ color: C.teal, fontWeight: 700, cursor: "pointer" }}>Créer un compte</span>
      </div>
    </div>
  );
}

// ============================================================
// ÉCRAN : Mot de passe oublié
// ============================================================
function MotDePasseOublie({ onGoLogin }) {
  const [email, setEmail] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [chargement, setChargement] = useState(false);

  const envoyer = async () => {
    setErreur("");
    if (!email) { setErreur("Entre ton email."); return; }
    setChargement(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setChargement(false);
    if (error) { setErreur("Erreur : " + error.message); return; }
    setEnvoye(true);
  };

  if (envoye) {
    return (
      <div style={{ padding: 24, textAlign: "center", maxWidth: 420, margin: "0 auto" }}>
        <div style={{ fontSize: "2.2rem", marginBottom: 10 }}>📧</div>
        <div style={{ color: C.navy, fontWeight: 800, fontSize: T.h2, marginBottom: 8 }}>Lien envoyé</div>
        <div style={{ color: C.textMuted, fontSize: T.body, lineHeight: 1.6, marginBottom: 20 }}>
          Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé. Clique dessus pour choisir un nouveau mot de passe.
        </div>
        <div onClick={onGoLogin} style={{ color: C.teal, fontWeight: 700, cursor: "pointer", fontSize: T.body }}>Retour à la connexion</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 420, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ color: C.navy, fontWeight: 800, fontSize: T.h2 }}>Mot de passe oublié</div>
        <div style={{ color: C.textMuted, fontSize: T.body, marginTop: 4 }}>Entre ton email, on t'envoie un lien pour le réinitialiser</div>
      </div>
      <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@entreprise.ci" />
      {erreur && <div style={{ color: C.red, fontSize: T.small, marginBottom: 12 }}>{erreur}</div>}
      <Btn onClick={envoyer} disabled={chargement}>{chargement ? "Envoi..." : "Envoyer le lien"}</Btn>
      <div onClick={onGoLogin} style={{ textAlign: "center", marginTop: 16, fontSize: T.body, color: C.textMuted, cursor: "pointer" }}>← Retour à la connexion</div>
    </div>
  );
}

// ============================================================
// ÉCRAN : Réinitialiser le mot de passe
// ============================================================
function ReinitialiserMotDePasse({ onTermine }) {
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [confirmMdp, setConfirmMdp] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const valider = async () => {
    setErreur("");
    if (!nouveauMdp || !confirmMdp) { setErreur("Remplis tous les champs."); return; }
    if (nouveauMdp !== confirmMdp) { setErreur("Les mots de passe ne correspondent pas."); return; }
    if (!MDP_REGEX.test(nouveauMdp)) { setErreur(MDP_AIDE); return; }
    setChargement(true);
    const { error } = await supabase.auth.updateUser({ password: nouveauMdp });
    setChargement(false);
    if (error) { setErreur("Erreur : " + error.message); return; }
    onTermine();
  };

  return (
    <div style={{ padding: 20, maxWidth: 420, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ color: C.navy, fontWeight: 800, fontSize: T.h2 }}>Réinitialiser votre mot de passe</div>
        <div style={{ color: C.textMuted, fontSize: T.body, marginTop: 4 }}>Choisis un nouveau mot de passe</div>
      </div>
      <Input label="Nouveau mot de passe" type="password" value={nouveauMdp} onChange={e => setNouveauMdp(e.target.value)} placeholder="Min. 6 caractères" />
      <Input label="Confirmation" type="password" value={confirmMdp} onChange={e => setConfirmMdp(e.target.value)} placeholder="••••••••" />
      <div style={{ color: C.textMuted, fontSize: T.small, marginBottom: 12 }}>{MDP_AIDE}</div>
      {erreur && <div style={{ color: C.red, fontSize: T.small, marginBottom: 12 }}>{erreur}</div>}
      <Btn onClick={valider} disabled={chargement}>{chargement ? "Enregistrement..." : "Enregistrer le nouveau mot de passe"}</Btn>
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
  const motDePasseValide = MDP_REGEX.test(motDePasse);
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
          <div style={{ color: C.navy, fontWeight: 800, fontSize: T.h2 }}>Créer votre compte entreprise</div>
          <div style={{ color: C.textMuted, fontSize: T.body, marginTop: 4 }}>Étape 1 sur 2</div>
        </div>
        <Input label="Nom de l'entreprise" value={nomEntreprise} onChange={e => setNomEntreprise(e.target.value)} placeholder="Ets Koffi & Fils" />
        <Input label="Ville" value={ville} onChange={e => setVille(e.target.value)} placeholder="Bouaké" />
        <Input label="Nom du responsable" value={responsable} onChange={e => setResponsable(e.target.value)} placeholder="Emmanuel Koffi" />
        <Input label="Téléphone / WhatsApp" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="07 01 02 03 04" />
        <Input label="Email professionnel" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@entreprise.ci" />
        <Input label="Créer un mot de passe" type="password" value={motDePasse} onChange={e => setMotDePasse(e.target.value)} placeholder="Min. 6 caractères" />
        <Input label="Confirmation du mot de passe" type="password" value={confirmMotDePasse} onChange={e => setConfirmMotDePasse(e.target.value)} placeholder="••••••••" />
        <div style={{ color: C.textMuted, fontSize: T.small, marginBottom: 12 }}>{MDP_AIDE}</div>
        {erreur && <div style={{ color: C.red, fontSize: T.small, marginBottom: 12 }}>{erreur}</div>}
        <Btn onClick={() => pretEtape1 ? setEtape(2) : setErreur("Vérifie tous les champs, et que le mot de passe respecte le format demandé.")}>Continuer</Btn>
        <div style={{ textAlign: "center", marginTop: 16, fontSize: T.body, color: C.textMuted }}>
          Déjà un compte ? <span onClick={onGoLogin} style={{ color: C.teal, fontWeight: 700, cursor: "pointer" }}>Se connecter</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 420, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ color: C.navy, fontWeight: 800, fontSize: T.h2 }}>Choisissez votre abonnement</div>
        <div style={{ color: C.textMuted, fontSize: T.body, marginTop: 4 }}>Étape 2 sur 2 — {nomEntreprise}</div>
      </div>
      {PLANS.map(p => (
        <div key={p.id} onClick={() => setPlan(p.id)}
          style={{ border: `2px solid ${plan === p.id ? C.teal : C.border}`, borderRadius: 12, padding: 14, marginBottom: 10, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: T.sub }}>{p.nom}</div>
            <div style={{ color: C.textMuted, fontSize: T.small }}>{p.periode}</div>
          </div>
          <div style={{ fontWeight: 800, color: C.teal }}>{p.prix}</div>
        </div>
      ))}
      {erreur && <div style={{ color: C.red, fontSize: T.small, margin: "12px 0" }}>{erreur}</div>}
      <div style={{ marginTop: 16 }}>
        <Btn onClick={creerCompte} disabled={chargement}>{chargement ? "Création..." : (plan === "gratuit" ? "Activer mon compte" : "Payer et activer")}</Btn>
      </div>
      <div onClick={() => setEtape(1)} style={{ textAlign: "center", marginTop: 14, fontSize: T.body, color: C.textMuted, cursor: "pointer" }}>← Retour</div>
      {plan !== "gratuit" && (
        <div style={{ fontSize: T.small, color: C.textMuted, textAlign: "center", marginTop: 10 }}>
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
    <EcranPaiementRequis
      icone="📧"
      titre="Vérifiez votre email"
      sousTitre="Confirmez votre adresse, puis réglez votre accès Premium."
      messageWhatsapp="Bonjour, je viens de créer mon compte PolyFinance GF et je souhaite activer mon accès Premium. Voici ma preuve de paiement."
      lienSecondaire={<div onClick={onGoLogin} style={{ color: C.textMuted, fontSize: T.body, cursor: "pointer", marginBottom: 14 }}>← Retour à la connexion</div>}
    />
  );
}

// ============================================================
// ÉCRAN : Connecté mais en attente d'activation Premium
// ============================================================
function EnAttenteConnecte({ entreprise, onLogout }) {
  return (
    <EcranPaiementRequis
      icone="⏳"
      titre={`Bienvenue ${entreprise.nom}`}
      sousTitre="Votre paiement est en cours de vérification."
      messageWhatsapp={`Bonjour, voici ma preuve de paiement Premium pour ${entreprise.nom}.`}
      onLogout={onLogout}
    />
  );
}

// ============================================================
// ÉCRAN : Accès expiré
// ============================================================
function AccesExpire({ entreprise, onLogout }) {
  return (
    <EcranPaiementRequis
      icone="⏰"
      titre="Votre accès a expiré"
      sousTitre={`Votre période ${entreprise.plan === "gratuit" ? "d'essai gratuit" : "Premium"} est terminée.`}
      messageWhatsapp={`Bonjour, je souhaite renouveler mon accès Premium pour ${entreprise.nom}. Voici ma preuve de paiement.`}
      onLogout={onLogout}
    />
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
          <div style={{ color: C.white, fontWeight: 700, fontSize: T.sub }}>Espace Administrateur</div>
          <div style={{ color: C.tealLight, fontSize: T.micro }}>PolyFinance GF</div>
        </div>
        <span onClick={onLogout} style={{ color: "rgba(255,255,255,0.7)", fontSize: T.small, cursor: "pointer" }}>Déconnexion</span>
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
                <div style={{ fontWeight: 700, fontSize: T.sub, color: C.text }}>{e.nom}</div>
                <div style={{ color: C.textMuted, fontSize: T.small }}>{e.responsable} · {e.telephone}</div>
              </div>
              <Badge text={e.statut} color={couleurStatut(e.statut)} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: T.small, color: C.textMuted, marginBottom: e.statut === "En attente" ? 10 : 0 }}>
              <span>Plan : {e.plan}</span>
              <span>{e.date_expiration ? `Expire le ${e.date_expiration}` : "Pas d'expiration"}</span>
            </div>
            {e.statut === "En attente" && (
              <Btn onClick={() => activerPremium(e.id)}>Activer Premium</Btn>
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
function jourISO(decalage = 0) {
  return new Date(Date.now() + decalage * 86400000).toISOString().slice(0, 10);
}

const JOURS_COURTS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
function libelleJourCourt(iso) {
  return JOURS_COURTS[new Date(iso + "T00:00:00Z").getUTCDay()];
}

function fmtCourt(v) {
  const n = Number(v) || 0;
  const a = Math.abs(n);
  if (a >= 1000000) return (n / 1000000).toFixed(1).replace(".", ",") + " M";
  if (a >= 1000) return Math.round(n / 1000) + " k";
  return String(Math.round(n));
}

function lienWhatsapp(tel, msg) {
  let n = String(tel || "").replace(/\D/g, "");
  if (!n) return null;
  if (n.length <= 10) n = "225" + n;
  return `https://wa.me/${n}?text=${encodeURIComponent(msg)}`;
}

const COULEURS_MODE = { "Espèces": "#10b981", "Wave": "#2563eb", "Orange Money": "#F47B2A", "Virement": "#8b5cf6" };

const PERIODES = {
  jour: { n: 1, libelle: "Aujourd'hui", compare: "hier" },
  semaine: { n: 7, libelle: "7 jours", compare: "les 7 jours précédents" },
  mois: { n: 30, libelle: "30 jours", compare: "les 30 jours précédents" },
};

const DASH_CSS = `
  .gf-d-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 12px; }
  .gf-d-kpi { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
  @media (min-width: 900px) {
    .gf-d-grid { grid-template-columns: repeat(12, 1fr); }
    .gf-d-grid > .d4 { grid-column: span 4; }
    .gf-d-grid > .d6 { grid-column: span 6; }
    .gf-d-grid > .d8 { grid-column: span 8; }
    .gf-d-kpi { grid-template-columns: repeat(4, 1fr); }
  }
  .gf-d-ligne { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid ${C.border}; font-size: ${T.body}; }
  .gf-d-ligne:last-child { border-bottom: none; }
  .gf-d-lien { color: ${C.teal}; font-weight: 700; font-size: ${T.small}; text-decoration: none; cursor: pointer; white-space: nowrap; }
`;

function Panneau({ titre, droite, children }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, minWidth: 0 }}>
      {(titre || droite) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 8 }}>
          <div style={{ fontWeight: 700, color: C.navy, fontSize: T.sub }}>{titre}</div>
          {droite}
        </div>
      )}
      {children}
    </div>
  );
}

function Segments({ valeur, options, onChange }) {
  return (
    <div style={{ display: "inline-flex", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 3 }}>
      {options.map(([id, label]) => (
        <button key={id} onClick={() => onChange(id)}
          style={{ border: "none", cursor: "pointer", padding: "6px 12px", borderRadius: 8, fontSize: T.small, fontWeight: 700,
            background: valeur === id ? C.navy : "transparent", color: valeur === id ? C.white : C.textMuted }}>
          {label}
        </button>
      ))}
    </div>
  );
}

function MiniCourbe({ points, couleur }) {
  if (!points || points.length < 2) return null;
  const max = Math.max(...points), min = Math.min(...points);
  const ecart = max - min || 1;
  const W = 100, H = 28;
  const pts = points.map((v, i) => `${(i / (points.length - 1)) * W},${H - 3 - ((v - min) / ecart) * (H - 6)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: 28, display: "block" }} aria-hidden="true">
      <polyline points={pts} fill="none" stroke={couleur} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Variation({ actuel, precedent, inverse, libelle }) {
  if (!precedent) return <span style={{ color: C.textMuted, fontSize: T.micro }}>Pas de base de comparaison</span>;
  const pct = ((actuel - precedent) / Math.abs(precedent)) * 100;
  const bon = inverse ? pct <= 0 : pct >= 0;
  const couleur = Math.abs(pct) < 0.5 ? C.textMuted : bon ? C.green : C.red;
  return (
    <span style={{ fontSize: T.micro, color: C.textMuted }}>
      <span style={{ color: couleur, fontWeight: 700 }}>{pct > 0 ? "+" : ""}{pct.toFixed(0)} %</span> vs {libelle}
    </span>
  );
}

function CarteKpi({ label, valeur, couleur, points, actuel, precedent, inverse, libelle, note }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, minWidth: 0 }}>
      <div style={{ color: C.textMuted, fontSize: T.micro, textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: T.h3, color: couleur, marginBottom: 4, overflowWrap: "anywhere" }}>{valeur}</div>
      <MiniCourbe points={points} couleur={couleur} />
      <div style={{ marginTop: 4 }}>
        {note ? <span style={{ fontSize: T.micro, color: C.textMuted }}>{note}</span>
          : <Variation actuel={actuel} precedent={precedent} inverse={inverse} libelle={libelle} />}
      </div>
    </div>
  );
}

function Jauge({ pct, couleur, centre, sous }) {
  const p = Math.max(0, Math.min(100, pct || 0));
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 220, margin: "0 auto" }}>
      <svg viewBox="0 0 120 70" style={{ width: "100%", display: "block" }} aria-hidden="true">
        <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke={C.bg} strokeWidth="11" strokeLinecap="round" pathLength="100" />
        {p > 0 && <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke={couleur} strokeWidth="11" strokeLinecap="round" pathLength="100" strokeDasharray={`${p} 100`} />}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 2, textAlign: "center" }}>
        <div style={{ fontWeight: 800, fontSize: T.h2, color: C.navy, lineHeight: 1 }}>{centre}</div>
        {sous && <div style={{ fontSize: T.micro, color: C.textMuted, marginTop: 3 }}>{sous}</div>}
      </div>
    </div>
  );
}

function GraphiqueSemaine({ jours }) {
  const max = Math.max(1, ...jours.map(j => Math.max(j.recette, j.depense)));
  const meilleur = jours.reduce((b, j) => (j.recette > b.recette ? j : b), jours[0]);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 150 }}>
        {jours.map(j => {
          const estMeilleur = meilleur.recette > 0 && j.date === meilleur.date;
          return (
            <div key={j.date} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", height: "100%", minWidth: 0 }}>
              <div style={{ fontSize: T.micro, color: estMeilleur ? C.navy : C.textMuted, fontWeight: estMeilleur ? 800 : 500, marginBottom: 3 }}>{j.recette > 0 ? fmtCourt(j.recette) : ""}</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, width: "100%", justifyContent: "center", height: 112 }}>
                <div title={`Recettes ${fmt(j.recette)}`} style={{ width: "42%", maxWidth: 22, height: `${(j.recette / max) * 100}%`, minHeight: j.recette > 0 ? 3 : 0, background: estMeilleur ? C.teal : `${C.teal}99`, borderRadius: "4px 4px 0 0" }} />
                <div title={`Dépenses ${fmt(j.depense)}`} style={{ width: "42%", maxWidth: 22, height: `${(j.depense / max) * 100}%`, minHeight: j.depense > 0 ? 3 : 0, background: `${C.orange}aa`, borderRadius: "4px 4px 0 0" }} />
              </div>
              <div style={{ fontSize: T.micro, color: C.textMuted, marginTop: 5 }}>{libelleJourCourt(j.date)}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: T.micro, color: C.textMuted }}>
        <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: C.teal, marginRight: 5 }} />Recettes</span>
        <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: C.orange, marginRight: 5 }} />Dépenses</span>
      </div>
    </div>
  );
}

function CarteObjectif({ entreprise, recettesMois, recharger }) {
  const [edition, setEdition] = useState(false);
  const [valeur, setValeur] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");
  const objectif = Number(entreprise?.objectif) || 0;
  const pct = objectif > 0 ? (recettesMois / objectif) * 100 : 0;

  const enregistrer = async () => {
    const n = Number(String(valeur).replace(/\s/g, ""));
    if (!Number.isFinite(n) || n < 0) { setErreur("Entre un montant valide."); return; }
    setEnCours(true); setErreur("");
    const { error } = await supabase.from("entreprises").update({ objectif: n }).eq("id", entreprise.id);
    setEnCours(false);
    if (error) { setErreur("Enregistrement impossible. Réessaie."); return; }
    setEdition(false);
    if (recharger) recharger();
  };

  return (
    <Panneau titre="Objectif du mois" droite={!edition && <span className="gf-d-lien" onClick={() => { setValeur(objectif ? String(objectif) : ""); setEdition(true); }}>{objectif > 0 ? "Modifier" : "Définir"}</span>}>
      {edition ? (
        <div>
          <Input label="Objectif de recettes (F)" type="number" inputMode="numeric" value={valeur} onChange={e => setValeur(e.target.value)} placeholder="ex : 500000" />
          {erreur && <div style={{ color: C.red, fontSize: T.small, marginBottom: 8 }}>{erreur}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="outline" onClick={() => { setEdition(false); setErreur(""); }}>Annuler</Btn>
            <Btn onClick={enregistrer} disabled={enCours}>{enCours ? "..." : "Enregistrer"}</Btn>
          </div>
        </div>
      ) : objectif > 0 ? (
        <div>
          <Jauge pct={pct} couleur={pct >= 100 ? C.green : C.teal} centre={`${Math.round(pct)} %`} sous={pct >= 100 ? "Objectif atteint" : "de l'objectif"} />
          <div style={{ textAlign: "center", marginTop: 10, fontSize: T.small, color: C.textMuted }}>
            <b style={{ color: C.navy }}>{fmt(recettesMois)}</b> sur {fmt(objectif)}
          </div>
        </div>
      ) : (
        <div style={{ color: C.textMuted, fontSize: T.body, lineHeight: 1.5 }}>
          Fixe-toi un objectif de recettes pour le mois et suis ta progression ici.
        </div>
      )}
    </Panneau>
  );
}

function PremiersPas({ allerA }) {
  const etapes = [
    ["stock", "Ajoute tes produits", "Nom, prix d'achat, prix de vente, stock."],
    ["ventes", "Fais ta première vente", "Utilise la Caisse : panier, ticket, validation."],
    ["clients", "Enregistre tes clients", "Pour suivre les paiements et les relances."],
    ["depenses", "Note tes dépenses", "Pour connaître ton vrai bénéfice."],
  ];
  return (
    <Panneau titre="Premiers pas">
      <div style={{ color: C.textMuted, fontSize: T.body, marginBottom: 10 }}>Ton tableau de bord se remplira dès les premières opérations.</div>
      {etapes.map(([id, titre, desc], i) => (
        <div key={id} className="gf-d-ligne" style={{ cursor: "pointer" }} onClick={() => allerA && allerA(id)}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
            <div style={{ width: 26, height: 26, borderRadius: 13, background: `${C.teal}22`, color: C.teal, fontWeight: 800, fontSize: T.small, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: C.text }}>{titre}</div>
              <div style={{ fontSize: T.small, color: C.textMuted }}>{desc}</div>
            </div>
          </div>
          <span className="gf-d-lien">Ouvrir</span>
        </div>
      ))}
    </Panneau>
  );
}

function TableauDeBord({ entreprise, clients, paiements, creances, ventes, produits, depenses, allerA, recharger }) {
  const [periode, setPeriode] = useState("semaine");
  const aujourdHui = jourISO(0);
  const P = PERIODES[periode];

  const num = (x) => Number(x) || 0;
  const coutVente = (v) => {
    const p = produits.find(pr => pr.id === v.produit_id);
    return num(p?.prix_achat) * num(v.quantite);
  };

  // Totaux par jour
  const recetteParJour = {}, depenseParJour = {}, beneficeParJour = {};
  const ajouter = (m, d, x) => { m[d] = (m[d] || 0) + x; };
  ventes.forEach(v => { ajouter(recetteParJour, v.date, num(v.montant)); ajouter(beneficeParJour, v.date, num(v.montant) - coutVente(v)); });
  paiements.filter(p => p.statut === "Payé").forEach(p => { ajouter(recetteParJour, p.date, num(p.montant)); ajouter(beneficeParJour, p.date, num(p.montant)); });
  depenses.forEach(d => { ajouter(depenseParJour, d.date, num(d.montant)); ajouter(beneficeParJour, d.date, -num(d.montant)); });

  const somme = (map, debutDecalage, finDecalage) => {
    let s = 0;
    for (let k = debutDecalage; k <= finDecalage; k++) s += map[jourISO(k)] || 0;
    return s;
  };
  const serie = (map, nb) => Array.from({ length: nb }, (_, i) => map[jourISO(-(nb - 1 - i))] || 0);

  const n = P.n;
  const rec = somme(recetteParJour, -(n - 1), 0), recPrec = somme(recetteParJour, -(2 * n - 1), -n);
  const dep = somme(depenseParJour, -(n - 1), 0), depPrec = somme(depenseParJour, -(2 * n - 1), -n);
  const ben = somme(beneficeParJour, -(n - 1), 0), benPrec = somme(beneficeParJour, -(2 * n - 1), -n);
  const nbSpark = n === 1 ? 7 : n;

  // Reste à encaisser et taux d'encaissement
  const echeances = creances.flatMap(cr => cr.echeances || []);
  const resteP = paiements.filter(p => p.statut !== "Payé").reduce((s, p) => s + num(p.montant), 0);
  const resteE = echeances.filter(e => !e.paye).reduce((s, e) => s + num(e.montant), 0);
  const reste = resteP + resteE;
  const encaisseP = paiements.filter(p => p.statut === "Payé").reduce((s, p) => s + num(p.montant), 0);
  const encaisseE = echeances.filter(e => e.paye).reduce((s, e) => s + num(e.montant), 0);
  const encaisse = encaisseP + encaisseE;
  const tauxEncaissement = encaisse + reste > 0 ? (encaisse / (encaisse + reste)) * 100 : null;

  // Trésorerie globale
  const totalRecettes = Object.values(recetteParJour).reduce((s, x) => s + x, 0);
  const totalDepenses = Object.values(depenseParJour).reduce((s, x) => s + x, 0);
  const solde = totalRecettes - totalDepenses;

  // Mois calendaire (objectif)
  const debutMois = debutMoisISO();
  const recettesMois = Object.entries(recetteParJour).filter(([d]) => d >= debutMois).reduce((s, [, x]) => s + x, 0);

  // 7 jours
  const jours7 = Array.from({ length: 7 }, (_, i) => {
    const d = jourISO(-(6 - i));
    return { date: d, recette: recetteParJour[d] || 0, depense: depenseParJour[d] || 0 };
  });

  // Modes de paiement
  const modes = MODES_PAIEMENT.map(m => ({ mode: m, montant: ventes.filter(v => v.mode === m).reduce((s, v) => s + num(v.montant), 0) })).filter(r => r.montant > 0);
  const totalModes = modes.reduce((s, r) => s + r.montant, 0);

  // À faire
  const stockFaible = produits.filter(p => num(p.stock_actuel) <= num(p.seuil_alerte));
  const clientsRetard = clients.map(c => {
    const du = paiements.filter(p => p.client_id === c.id && p.statut !== "Payé" && p.date < aujourdHui).reduce((s, p) => s + num(p.montant), 0)
      + creances.filter(cr => cr.client_id === c.id).flatMap(cr => cr.echeances || []).filter(e => statutEcheance(e) === "En retard").reduce((s, e) => s + num(e.montant), 0);
    return { ...c, du };
  }).filter(c => c.du > 0).sort((a, b) => b.du - a.du);

  // Plus vendus
  const parProduit = {};
  ventes.forEach(v => { parProduit[v.produit_id] = (parProduit[v.produit_id] || 0) + num(v.quantite); });
  const plusVendus = Object.entries(parProduit).map(([id, q]) => ({ id, q })).sort((a, b) => b.q - a.q).slice(0, 5);
  const maxVendu = plusVendus[0]?.q || 1;

  // Récap calendaire
  const nbVentesDepuis = (d) => ventes.filter(v => v.date >= d).length;
  const recapDepuis = (d) => ventes.filter(v => v.date >= d).reduce((s, v) => s + num(v.montant), 0) + paiements.filter(p => p.statut === "Payé" && p.date >= d).reduce((s, p) => s + num(p.montant), 0);
  const recaps = [
    ["Aujourd'hui", aujourdHui, "#10b981"],
    ["Cette semaine", debutSemaineISO(), "#2563eb"],
    ["Ce mois", debutMois, "#f59e0b"],
    ["Cette année", debutAnneeISO(), "#8b5cf6"],
  ];

  const compteVide = ventes.length === 0 && clients.length === 0 && produits.length === 0 && depenses.length === 0 && paiements.length === 0;
  const nomAffiche = entreprise?.responsable ? String(entreprise.responsable).split(" ")[0] : "";

  return (
    <div>
      <style>{DASH_CSS}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: T.h2, color: C.navy }}>{nomAffiche ? `Bonjour ${nomAffiche}` : "Tableau de bord"}</div>
          <div style={{ color: C.textMuted, fontSize: T.small }}>Voici l'état de ton activité.</div>
        </div>
        <Segments valeur={periode} onChange={setPeriode} options={[["jour", "Jour"], ["semaine", "7 jours"], ["mois", "30 jours"]]} />
      </div>

      {compteVide && <div className="gf-d-grid"><div className="d12" style={{ gridColumn: "1 / -1" }}><PremiersPas allerA={allerA} /></div></div>}

      <div className="gf-d-kpi">
        <CarteKpi label="Recettes" valeur={fmt(rec)} couleur={C.green} points={serie(recetteParJour, nbSpark)} actuel={rec} precedent={recPrec} libelle={P.compare} />
        <CarteKpi label="Dépenses" valeur={fmt(dep)} couleur={C.red} points={serie(depenseParJour, nbSpark)} actuel={dep} precedent={depPrec} inverse libelle={P.compare} />
        <CarteKpi label="Bénéfice estimé" valeur={fmt(ben)} couleur={ben >= 0 ? C.navy : C.red} points={serie(beneficeParJour, nbSpark)} actuel={ben} precedent={benPrec} libelle={P.compare} />
        <CarteKpi label="Reste à encaisser" valeur={fmt(reste)} couleur={C.amber} note={`Trésorerie : ${fmt(solde)}`} />
      </div>

      <div className="gf-d-grid">
        <div className="d8"><Panneau titre="7 derniers jours"><GraphiqueSemaine jours={jours7} /></Panneau></div>
        <div className="d4"><CarteObjectif entreprise={entreprise} recettesMois={recettesMois} recharger={recharger} /></div>
      </div>

      <div className="gf-d-grid">
        <div className="d4">
          <Panneau titre="Taux d'encaissement">
            {tauxEncaissement === null
              ? <div style={{ color: C.textMuted, fontSize: T.body }}>Aucun paiement ou échéance enregistré.</div>
              : <>
                <Jauge pct={tauxEncaissement} couleur={tauxEncaissement >= 70 ? C.green : tauxEncaissement >= 40 ? C.amber : C.red} centre={`${Math.round(tauxEncaissement)} %`} sous="encaissé" />
                <div style={{ textAlign: "center", marginTop: 10, fontSize: T.small, color: C.textMuted }}>{fmt(encaisse)} encaissés · {fmt(reste)} à recevoir</div>
              </>}
          </Panneau>
        </div>
        <div className="d4">
          <Panneau titre="Modes de paiement">
            {modes.length === 0 ? <div style={{ color: C.textMuted, fontSize: T.body }}>Aucune vente encore.</div> : (
              <div>
                <div style={{ display: "flex", height: 12, borderRadius: 6, overflow: "hidden", marginBottom: 12 }}>
                  {modes.map(r => <div key={r.mode} style={{ width: `${(r.montant / totalModes) * 100}%`, background: COULEURS_MODE[r.mode] || C.textMuted }} />)}
                </div>
                {modes.map(r => (
                  <div key={r.mode} className="gf-d-ligne">
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 9, height: 9, borderRadius: 3, background: COULEURS_MODE[r.mode] || C.textMuted }} />{r.mode}
                    </span>
                    <span style={{ fontWeight: 700 }}>{Math.round((r.montant / totalModes) * 100)} %</span>
                  </div>
                ))}
              </div>
            )}
          </Panneau>
        </div>
        <div className="d4">
          <Panneau titre="Produits les plus vendus">
            {plusVendus.length === 0 ? <div style={{ color: C.textMuted, fontSize: T.body }}>Aucune vente encore.</div> : plusVendus.map(pv => {
              const produit = produits.find(p => String(p.id) === String(pv.id));
              return (
                <div key={pv.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: T.body, marginBottom: 4, gap: 8 }}>
                    <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{produit?.nom || "Produit supprimé"}</span>
                    <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{pv.q}</span>
                  </div>
                  <div style={{ height: 6, background: C.bg, borderRadius: 3 }}>
                    <div style={{ height: 6, width: `${(pv.q / maxVendu) * 100}%`, background: C.teal, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </Panneau>
        </div>
      </div>

      <div className="gf-d-grid">
        <div className="d6">
          <Panneau titre="À faire" droite={(stockFaible.length + clientsRetard.length) > 0 ? <Badge text={`${stockFaible.length + clientsRetard.length}`} color="rouge" /> : null}>
            {stockFaible.length === 0 && clientsRetard.length === 0 && <div style={{ color: C.textMuted, fontSize: T.body }}>Rien d'urgent. Stock et paiements sont à jour.</div>}
            {stockFaible.slice(0, 5).map(p => (
              <div key={p.id} className="gf-d-ligne">
                <span style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{p.nom}</div>
                  <div style={{ fontSize: T.small, color: C.red }}>Stock faible : {p.stock_actuel} restant(s)</div>
                </span>
                <span className="gf-d-lien" onClick={() => allerA && allerA("stock")}>Réapprovisionner</span>
              </div>
            ))}
            {clientsRetard.slice(0, 5).map(c => {
              const lien = lienWhatsapp(c.telephone, `Bonjour ${c.nom}, un petit rappel : vous avez un solde de ${fmt(c.du)} à régler chez ${entreprise?.nom || "nous"}. Merci !`);
              return (
                <div key={c.id} className="gf-d-ligne">
                  <span style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{c.nom}</div>
                    <div style={{ fontSize: T.small, color: C.amber }}>En retard : {fmt(c.du)}</div>
                  </span>
                  {lien
                    ? <a className="gf-d-lien" href={lien} target="_blank" rel="noopener noreferrer">Relancer</a>
                    : <span style={{ fontSize: T.micro, color: C.textMuted }}>Pas de numéro</span>}
                </div>
              );
            })}
          </Panneau>
        </div>
        <div className="d6">
          <Panneau titre="Dernières ventes" droite={<span className="gf-d-lien" onClick={() => allerA && allerA("ventes")}>Caisse</span>}>
            {ventes.length === 0 && <div style={{ color: C.textMuted, fontSize: T.body }}>Aucune vente encore.</div>}
            {ventes.slice(0, 6).map(v => {
              const produit = produits.find(p => p.id === v.produit_id);
              return (
                <div key={v.id} className="gf-d-ligne">
                  <span style={{ minWidth: 0 }}>
                    <div>{produit?.nom || "Produit supprimé"} × {v.quantite}</div>
                    <div style={{ fontSize: T.micro, color: C.textMuted }}>{v.date}{v.mode ? ` · ${v.mode}` : ""}</div>
                  </span>
                  <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{fmt(v.montant)}</span>
                </div>
              );
            })}
          </Panneau>
        </div>
      </div>

      <div style={{ fontWeight: 700, color: C.navy, fontSize: T.sub, margin: "4px 0 8px" }}>Récapitulatif des ventes</div>
      <div className="gf-d-kpi">
        {recaps.map(([label, depuis, couleur]) => {
          const nb = nbVentesDepuis(depuis);
          return (
            <div key={label} style={{ background: couleur, borderRadius: 14, padding: 14, color: C.white }}>
              <div style={{ fontSize: T.small, opacity: 0.9, marginBottom: 6 }}>{label}</div>
              <div style={{ fontWeight: 800, fontSize: T.sub }}>{fmt(recapDepuis(depuis))}</div>
              <div style={{ fontSize: T.micro, opacity: 0.85, marginTop: 2 }}>{nb} vente{nb > 1 ? "s" : ""}</div>
            </div>
          );
        })}
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
    await supprimerLigne("clients", id, "Supprimer ce client ? Ses paiements et créances resteront enregistrés sans nom.", recharger);
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
        <div onClick={() => setClientOuvert(null)} style={{ color: C.teal, fontWeight: 700, fontSize: T.small, cursor: "pointer", marginBottom: 14 }}>← Retour aux clients</div>

        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <Input label="Nom" defaultValue={client.nom} onBlur={e => modifierClient(client.id, "nom", e.target.value)} />
          <Input label="Téléphone" defaultValue={client.telephone} onBlur={e => modifierClient(client.id, "telephone", e.target.value)} />
          <div style={{ color: C.textMuted, fontSize: T.small, marginTop: 4 }}>Statut : {client.statut}</div>
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ color: C.textMuted, fontSize: T.micro }}>TOTAL ENCAISSÉ</div>
          <div style={{ color: C.green, fontWeight: 800, fontSize: T.h3 }}>{fmt(totalPaye)}</div>
        </div>

        {historiqueCreances.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: T.sub, marginBottom: 8 }}>Créances échelonnées</div>
            {historiqueCreances.map(cr => (
              <div key={cr.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: T.body }}>{fmt(cr.montant_total)}</div>
                <div style={{ color: C.textMuted, fontSize: T.small }}>{(cr.echeances || []).filter(e => e.paye).length} / {cr.nombre_echeances} échéances payées</div>
              </div>
            ))}
          </div>
        )}

        <div>
          <div style={{ fontWeight: 700, color: C.navy, fontSize: T.sub, marginBottom: 8 }}>Historique des paiements</div>
          {historiquePaiements.length === 0 && <div style={{ color: C.textMuted, fontSize: T.body }}>Aucun paiement enregistré.</div>}
          {historiquePaiements.map(p => (
            <div key={p.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: T.body }}>{fmt(p.montant)}</div>
                <div style={{ color: C.textMuted, fontSize: T.small }}>{p.date} · {p.mode}</div>
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
        <div style={{ fontWeight: 700, color: C.navy, fontSize: T.sub, marginBottom: 10 }}>Ajouter un client</div>
        <Input placeholder="Nom du client" value={nom} onChange={e => setNom(e.target.value)} />
        <Input placeholder="Téléphone" value={telephone} onChange={e => setTelephone(e.target.value)} />
        <Btn onClick={ajouter}>Ajouter</Btn>
      </div>
      {clients.length === 0 && (
        <div style={{ color: C.textMuted, textAlign: "center", padding: 24, fontSize: T.body }}>Aucun client pour l'instant.</div>
      )}
      {clients.map(c => (
        <div key={c.id} className="gf-card-link" style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div onClick={() => setClientOuvert(c)} style={{ cursor: "pointer", flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: T.body, color: C.teal }}>{c.nom}</div>
            <div style={{ color: C.textMuted, fontSize: T.small }}>{c.telephone}</div>
          </div>
          <LienSupprimer onClick={() => supprimer(c.id)} />
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

  const supprimerPaiement = async (id) => {
    await supprimerLigne("paiements", id, "Supprimer ce paiement ?", recharger);
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontWeight: 700, color: C.navy, fontSize: T.sub, marginBottom: 10 }}>Enregistrer un paiement</div>
        <select value={clientId} onChange={e => setClientId(e.target.value)} className="gf-input" style={{ width: "100%", padding: 10, marginBottom: 12, borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg, fontSize: T.body }}>
          <option value="">— Choisir un client —</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
        <Input type="number" placeholder="Montant (FCFA)" value={montant} onChange={e => setMontant(e.target.value)} />
        <select value={statut} onChange={e => setStatut(e.target.value)} className="gf-input" style={{ width: "100%", padding: 10, marginBottom: 12, borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg, fontSize: T.body }}>
          <option>Payé</option><option>En attente</option>
        </select>
        <Btn onClick={ajouter}>Enregistrer</Btn>
      </div>
      {paiements.length === 0 && (
        <div style={{ color: C.textMuted, textAlign: "center", padding: 24, fontSize: T.body }}>Aucun paiement enregistré.</div>
      )}
      {paiements.map(p => {
        const client = clients.find(c => c.id === p.client_id);
        return (
          <div key={p.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: T.body }}>{client?.nom || "—"}</div>
              <div style={{ color: C.textMuted, fontSize: T.small }}>{p.date}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700 }}>{fmt(p.montant)}</div>
                <Badge text={p.statut} color={p.statut === "Payé" ? "vert" : "ambre"} />
              </div>
              <LienSupprimer onClick={() => supprimerPaiement(p.id)} />
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

  const supprimerCreance = async (id) => {
    const ok = await supprimerLigne("creances", id, "Supprimer cette créance et toutes ses échéances ?", recharger);
    if (ok) setCreanceOuverte(null);
  };

  if (creanceOuverte) {
    const cr = creances.find(c => c.id === creanceOuverte.id) || creanceOuverte;
    const client = clients.find(c => c.id === cr.client_id);
    const echeances = (cr.echeances || []).slice().sort((a, b) => a.numero - b.numero);
    const paye = echeances.filter(e => e.paye).reduce((s, e) => s + Number(e.montant), 0);
    const reste = cr.montant_total - paye;

    return (
      <div style={{ maxWidth: 500 }}>
        <div onClick={() => setCreanceOuverte(null)} style={{ color: C.teal, fontWeight: 700, fontSize: T.small, cursor: "pointer", marginBottom: 14 }}>← Retour aux créances</div>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, color: C.navy, fontSize: T.sub, marginBottom: 4 }}>{client?.nom || "Client supprimé"}</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            <div><div style={{ color: C.textMuted, fontSize: T.micro }}>ENCAISSÉ</div><div style={{ color: C.green, fontWeight: 800 }}>{fmt(paye)}</div></div>
            <div><div style={{ color: C.textMuted, fontSize: T.micro }}>RESTE DÛ</div><div style={{ color: C.red, fontWeight: 800 }}>{fmt(reste)}</div></div>
          </div>
          <div style={{ marginTop: 12 }}><LienSupprimer onClick={() => supprimerCreance(cr.id)} label="Supprimer cette créance" /></div>
        </div>
        {echeances.map(e => (
          <div key={e.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: T.body }}>Échéance {e.numero} · {fmt(e.montant)}</div>
              <div style={{ color: C.textMuted, fontSize: T.small }}>{e.date_echeance}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Badge text={statutEcheance(e)} color={e.paye ? "vert" : statutEcheance(e) === "En retard" ? "rouge" : "gris"} />
              <span onClick={() => toggleEcheancePayee(e.id, e.paye)} style={{ color: C.teal, fontSize: T.small, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
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
          <div style={{ fontWeight: 700, color: C.navy, fontSize: T.sub, marginBottom: 10 }}>Nouvelle créance échelonnée</div>
          <select value={clientId} onChange={e => setClientId(e.target.value)} className="gf-input" style={{ width: "100%", padding: 10, marginBottom: 12, borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg, fontSize: T.body }}>
            <option value="">— Choisir un client —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <Input type="number" placeholder="Montant total (FCFA)" value={montantTotal} onChange={e => setMontantTotal(e.target.value)} />
          <Input type="number" label="Nombre d'échéances" value={nombreEcheances} onChange={e => setNombreEcheances(e.target.value)} />
          <Input type="date" label="1ère échéance" value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
          {erreur && <div style={{ color: C.red, fontSize: T.small, marginBottom: 10 }}>{erreur}</div>}
          <Btn onClick={creerCreance} disabled={chargement}>{chargement ? "Création..." : "Créer l'échéancier"}</Btn>
          <div onClick={() => setFormOuvert(false)} style={{ textAlign: "center", marginTop: 10, fontSize: T.small, color: C.textMuted, cursor: "pointer" }}>Annuler</div>
        </div>
      )}
      {creances.length === 0 && !formOuvert && (
        <div style={{ color: C.textMuted, textAlign: "center", padding: 24, fontSize: T.body }}>Aucune créance échelonnée pour l'instant.</div>
      )}
      {creances.map(cr => {
        const client = clients.find(c => c.id === cr.client_id);
        const echeances = cr.echeances || [];
        const payees = echeances.filter(e => e.paye).length;
        const enRetard = echeances.some(e => statutEcheance(e) === "En retard");
        const statutGlobal = payees === cr.nombre_echeances ? "Payée" : enRetard ? "En retard" : "À venir";
        return (
          <div key={cr.id} onClick={() => setCreanceOuverte(cr)} className="gf-card-link"
            style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 10, cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: T.body, color: C.text }}>{client?.nom || "Client supprimé"}</div>
                <div style={{ color: C.textMuted, fontSize: T.small, marginTop: 2 }}>{payees} / {cr.nombre_echeances} échéances payées</div>
              </div>
              <Badge text={statutGlobal} color={statutGlobal === "Payée" ? "vert" : statutGlobal === "En retard" ? "rouge" : "gris"} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <div style={{ fontWeight: 800, color: C.teal }}>{fmt(cr.montant_total)}</div>
              <LienSupprimer onClick={() => supprimerCreance(cr.id)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// CAISSE (Ventes)
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
    await supprimerLigne("produits", id, "Supprimer ce produit ?", recharger);
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

  const genererTexteRecu = () => {
    const L = 32;
    const centrer = (t) => { const s = Math.max(0, Math.floor((L - t.length) / 2)); return " ".repeat(s) + t; };
    const ligne2col = (g, d) => { const espace = Math.max(1, L - g.length - d.length); return g + " ".repeat(espace) + d; };
    const sep = "-".repeat(L);
    let lignes = [];
    lignes.push(centrer((entreprise.nom || "").toUpperCase()));
    lignes.push(`Employe : ${entreprise.responsable || "-"}`);
    lignes.push(`PDV : Comptoir`);
    lignes.push(sep);
    lignes.push(centrer(typeCommande.toUpperCase()));
    lignes.push(sep);
    panier.forEach(l => {
      lignes.push(ligne2col(l.nom, fmt(l.prix * l.quantite)));
      lignes.push(`${l.quantite} x ${fmt(l.prix)}`);
    });
    lignes.push(sep);
    lignes.push(ligne2col("TOTAL", fmt(totalPanier)));
    lignes.push(ligne2col(mode, fmt(totalPanier)));
    lignes.push(sep);
    if (ticketCourant) {
      lignes.push(ligne2col(ticketCourant.dateHeure.toLocaleDateString("fr-FR"), ticketCourant.dateHeure.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })));
      lignes.push(centrer(ticketCourant.numero));
    }
    lignes.push(sep);
    lignes.push(centrer("MERCI POUR VOTRE"));
    lignes.push(centrer("VISITE"));
    lignes.push(""); lignes.push(""); lignes.push("");
    return lignes.join("\n");
  };

  const imprimerViaRawBT = () => {
    const texte = genererTexteRecu();
    const b64 = btoa(unescape(encodeURIComponent(texte)));
    window.location.href = `intent:base64,${b64}#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end;`;
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
    await supprimerLigne("ventes", id, "Annuler cette vente ?", recharger);
  };

  if (gererProduits) {
    return (
      <div style={{ maxWidth: 500 }}>
        <div onClick={() => setGererProduits(false)} style={{ color: C.teal, fontWeight: 700, fontSize: T.small, cursor: "pointer", marginBottom: 14 }}>← Retour à la caisse</div>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, color: C.navy, fontSize: T.sub, marginBottom: 10 }}>Ajouter un produit</div>
          <Input placeholder="Nom du produit (ex: Bière 33cl)" value={nomProduit} onChange={e => setNomProduit(e.target.value)} />
          <Input type="number" placeholder="Prix de vente (FCFA)" value={prixProduit} onChange={e => setPrixProduit(e.target.value)} />
          <Input type="number" placeholder="Prix d'achat (FCFA, optionnel)" value={prixAchatProduit} onChange={e => setPrixAchatProduit(e.target.value)} />
          <Input type="number" label="Seuil d'alerte stock" value={seuilProduit} onChange={e => setSeuilProduit(e.target.value)} />
          <Btn onClick={ajouterProduit}>Ajouter</Btn>
        </div>
        {produits.map(p => (
          <div key={p.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: T.body }}>{p.nom}</div>
              <div style={{ color: C.textMuted, fontSize: T.small }}>{fmt(p.prix)} · Stock: {p.stock_actuel}</div>
            </div>
            <LienSupprimer onClick={() => supprimerProduit(p.id)} />
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
        <div onClick={() => setEcran("caisse")} style={{ color: C.teal, fontWeight: 700, fontSize: T.small, cursor: "pointer", marginBottom: 14 }}>← Modifier le ticket</div>

        <div id="zone-impression" style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, fontFamily: "monospace", fontSize: T.body, marginBottom: 16 }}>
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
              <div style={{ color: C.textMuted, fontSize: T.small }}>{l.quantite} × {fmt(l.prix)}</div>
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

        <Btn onClick={() => window.print()} variant="outline">Imprimer (imprimante normale)</Btn>
        <div style={{ height: 10 }} />
        <Btn onClick={imprimerViaRawBT} variant="outline">Imprimer via RawBT (Bluetooth)</Btn>
        <div style={{ height: 10 }} />
        <Btn onClick={validerTicket} disabled={enregistrement}>{enregistrement ? "Enregistrement..." : "Valider et encaisser"}</Btn>
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
        <div style={{ fontWeight: 700, color: C.navy, fontSize: T.sub }}>Vendu aujourd'hui : <span style={{ color: C.green }}>{fmt(totalDuJour)}</span></div>
        <div style={{ display: "flex", gap: 12 }}>
          <span onClick={() => setCalculatriceOuverte(o => !o)} style={{ color: C.teal, fontSize: T.small, fontWeight: 700, cursor: "pointer" }}>Calculatrice</span>
          <span onClick={() => setGererProduits(true)} style={{ color: C.teal, fontSize: T.small, fontWeight: 700, cursor: "pointer" }}>Gérer les produits</span>
        </div>
      </div>

      {calculatriceOuverte && <Calculatrice />}

      {produits.length === 0 && (
        <div style={{ color: C.textMuted, textAlign: "center", padding: 24, fontSize: T.body }}>
          Aucun produit encore. <span onClick={() => setGererProduits(true)} style={{ color: C.teal, cursor: "pointer" }}>Ajoute ton premier produit</span>.
        </div>
      )}

      {produits.length > 0 && (
        <div className="gf-caisse">
          <div className="gf-produits-grid">
            {produits.map(p => {
              const rupture = Number(p.stock_actuel) <= 0;
              return (
                <button key={p.id} onClick={() => ajouterAuPanier(p)} className="gf-btn gf-card-link"
                  style={{ position: "relative", textAlign: "left", background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, cursor: "pointer" }}>
                  {rupture && (
                    <span style={{ position: "absolute", top: 8, right: 8, fontSize: T.micro, fontWeight: 700, color: C.red, background: `${C.red}18`, padding: "2px 6px", borderRadius: 8 }}>Rupture</span>
                  )}
                  <div style={{ fontWeight: 700, fontSize: T.body, color: C.text, marginBottom: 4 }}>{p.nom}</div>
                  <div style={{ color: C.teal, fontWeight: 800, fontSize: T.sub }}>{fmt(p.prix)}</div>
                  <div style={{ color: C.textMuted, fontSize: T.micro, marginTop: 2 }}>Stock: {p.stock_actuel}</div>
                </button>
              );
            })}
          </div>

          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginTop: 16 }}>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: T.sub, marginBottom: 10 }}>Ticket en cours</div>

            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {["Sur Place", "À emporter"].map(t => (
                <button key={t} onClick={() => setTypeCommande(t)} className="gf-btn"
                  style={{ flex: 1, padding: 8, borderRadius: 8, border: `1px solid ${typeCommande === t ? C.teal : C.border}`, background: typeCommande === t ? C.teal : C.bg, color: typeCommande === t ? C.white : C.text, fontSize: T.small, fontWeight: 700 }}>
                  {t}
                </button>
              ))}
            </div>

            {panier.length === 0 && <div style={{ color: C.textMuted, fontSize: T.body, textAlign: "center", padding: "10px 0" }}>Appuie sur un produit pour l'ajouter</div>}
            {panier.map(l => (
              <div key={l.produit_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: T.body }}>{l.nom}</div>
                  <div style={{ color: C.textMuted, fontSize: T.small }}>{fmt(l.prix)} × {l.quantite}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={() => changerQuantite(l.produit_id, -1)} className="gf-btn" style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, fontWeight: 700 }}>-</button>
                  <span style={{ fontWeight: 700, minWidth: 16, textAlign: "center" }}>{l.quantite}</span>
                  <button onClick={() => changerQuantite(l.produit_id, 1)} className="gf-btn" style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, fontWeight: 700 }}>+</button>
                  <span onClick={() => retirerDuPanier(l.produit_id)} style={{ color: C.red, fontSize: T.small, cursor: "pointer", marginLeft: 4 }}>✕</span>
                </div>
              </div>
            ))}

            {panier.length > 0 && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", fontWeight: 800, fontSize: T.h3 }}>
                  <span>Total</span>
                  <span style={{ color: C.teal }}>{fmt(totalPanier)}</span>
                </div>
                <select value={mode} onChange={e => setMode(e.target.value)} className="gf-input"
                  style={{ width: "100%", padding: 10, marginBottom: 12, borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg, fontSize: T.body }}>
                  {MODES_PAIEMENT.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <Btn onClick={genererApercu}>Voir la facture</Btn>
                <div onClick={() => setPanier([])} style={{ textAlign: "center", marginTop: 10, fontSize: T.small, color: C.textMuted, cursor: "pointer" }}>Vider le ticket</div>
              </>
            )}
          </div>
        </div>
      )}

      {ventesDuJour.length > 0 && (
        <div style={{ marginTop: 20, maxWidth: 700 }}>
          <div style={{ fontWeight: 700, color: C.navy, fontSize: T.sub, marginBottom: 8 }}>Ventes du jour</div>
          {ventesDuJour.map(v => {
            const produit = produits.find(p => p.id === v.produit_id);
            return (
              <div key={v.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: T.body }}>{produit?.nom || "Produit supprimé"} × {v.quantite}</div>
                  <div style={{ color: C.textMuted, fontSize: T.small }}>{fmt(v.montant)} · {v.mode}</div>
                </div>
                <LienSupprimer onClick={() => supprimerVente(v.id)} label="Annuler" />
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
          <div style={{ fontWeight: 700, color: C.navy, fontSize: T.sub, marginBottom: 10 }}>Entrée de stock</div>
          <select value={produitId} onChange={e => setProduitId(e.target.value)} className="gf-input" style={{ width: "100%", padding: 10, marginBottom: 12, borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg, fontSize: T.body }}>
            <option value="">— Choisir un produit —</option>
            {produits.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
          </select>
          <Input type="number" placeholder="Quantité reçue" value={quantite} onChange={e => setQuantite(e.target.value)} />
          <Input placeholder="Motif (ex: Livraison fournisseur)" value={motif} onChange={e => setMotif(e.target.value)} />
          {erreur && <div style={{ color: C.red, fontSize: T.small, marginBottom: 10 }}>{erreur}</div>}
          <Btn onClick={ajouterStock}>Enregistrer l'entrée</Btn>
          <div onClick={() => setAjoutOuvert(false)} style={{ textAlign: "center", marginTop: 10, fontSize: T.small, color: C.textMuted, cursor: "pointer" }}>Annuler</div>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <div style={{ fontWeight: 700, color: C.navy, fontSize: T.sub, marginBottom: 10 }}>Stock actuel</div>
        {produits.length === 0 && <div style={{ color: C.textMuted, fontSize: T.body }}>Aucun produit — ajoute-en depuis l'onglet Caisse.</div>}
        {produits.map(p => {
          const faible = Number(p.stock_actuel) <= Number(p.seuil_alerte);
          return (
            <div key={p.id} style={{ background: C.white, border: `1px solid ${faible ? C.red : C.border}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: T.body }}>{p.nom}</div>
                <div style={{ fontWeight: 800, fontSize: T.sub, color: faible ? C.red : C.green }}>{p.stock_actuel}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: C.textMuted, fontSize: T.micro }}>Prix d'achat</label>
                  <input type="number" defaultValue={p.prix_achat} onBlur={e => modifierProduit(p.id, "prix_achat", e.target.value)} className="gf-input"
                    style={{ width: "100%", padding: 8, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: T.small }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: C.textMuted, fontSize: T.micro }}>Seuil d'alerte</label>
                  <input type="number" defaultValue={p.seuil_alerte} onBlur={e => modifierProduit(p.id, "seuil_alerte", e.target.value)} className="gf-input"
                    style={{ width: "100%", padding: 8, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: T.small }} />
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
    await supprimerLigne("depenses", id, "Supprimer cette dépense ?", recharger);
  };

  const aujourdHui = new Date().toISOString().slice(0, 10);
  const totalJour = depenses.filter(d => d.date === aujourdHui).reduce((s, d) => s + Number(d.montant), 0);

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ fontWeight: 700, color: C.navy, fontSize: T.sub, marginBottom: 14 }}>Dépenses aujourd'hui : <span style={{ color: C.red }}>{fmt(totalJour)}</span></div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontWeight: 700, color: C.navy, fontSize: T.sub, marginBottom: 10 }}>Enregistrer une dépense</div>
        <Input placeholder="Catégorie (ex: Transport, Loyer, Achat marchandise)" value={categorie} onChange={e => setCategorie(e.target.value)} />
        <Input placeholder="Description (optionnel)" value={description} onChange={e => setDescription(e.target.value)} />
        <Input type="number" placeholder="Montant (FCFA)" value={montant} onChange={e => setMontant(e.target.value)} />
        <Btn onClick={ajouter}>Enregistrer</Btn>
      </div>

      {depenses.length === 0 && <div style={{ color: C.textMuted, textAlign: "center", padding: 24, fontSize: T.body }}>Aucune dépense enregistrée.</div>}
      {depenses.map(d => (
        <div key={d.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: T.body }}>{d.categorie}</div>
            <div style={{ color: C.textMuted, fontSize: T.small }}>{d.description ? `${d.description} · ` : ""}{d.date}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, color: C.red }}>{fmt(d.montant)}</div>
            <LienSupprimer onClick={() => supprimer(d.id)} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// RAPPORTS — nouvel onglet, centralise exports et stats
// ============================================================
function RapportsView({ clients, paiements, creances, ventes, produits, depenses }) {
  const aujourdHui = new Date().toISOString().slice(0, 10);
  const debutMois = debutMoisISO();

  const caMois = ventes.filter(v => v.date >= debutMois).reduce((s, v) => s + Number(v.montant), 0)
    + paiements.filter(p => p.statut === "Payé" && p.date >= debutMois).reduce((s, p) => s + Number(p.montant), 0);
  const depensesMois = depenses.filter(d => d.date >= debutMois).reduce((s, d) => s + Number(d.montant), 0);
  const nbVentesMois = ventes.filter(v => v.date >= debutMois).length;

  const lignesCreances = creances.flatMap(cr => {
    const client = clients.find(c => c.id === cr.client_id);
    return (cr.echeances || []).map(e => ({
      client: client?.nom || "Client supprimé", numero: e.numero, montant: e.montant, date_echeance: e.date_echeance, statut: statutEcheance(e),
    }));
  });

  const Ligne = ({ label, valeur }) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}`, fontSize: T.body }}>
      <span style={{ color: C.textMuted }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{valeur}</span>
    </div>
  );

  const LigneExport = ({ titre, desc, onClick, disabled }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: T.body, color: C.text }}>{titre}</div>
        <div style={{ color: C.textMuted, fontSize: T.small }}>{desc}</div>
      </div>
      <button onClick={onClick} disabled={disabled} className="gf-btn"
        style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 12px", color: disabled ? C.textMuted : C.teal, fontWeight: 700, fontSize: T.small, cursor: disabled ? "not-allowed" : "pointer" }}>
        <Icon name="export" size={15} /> CSV
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ fontWeight: 700, color: C.navy, fontSize: T.h3, marginBottom: 12 }}>Résumé du mois en cours</div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "4px 16px", marginBottom: 20 }}>
        <Ligne label="Chiffre d'affaires" valeur={fmt(caMois)} />
        <Ligne label="Dépenses" valeur={fmt(depensesMois)} />
        <Ligne label="Nombre de ventes" valeur={nbVentesMois} />
      </div>

      <div style={{ fontWeight: 700, color: C.navy, fontSize: T.h3, marginBottom: 12 }}>Exports</div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "4px 16px" }}>
        <LigneExport titre="Ventes" desc={`${ventes.length} enregistrement(s)`} disabled={ventes.length === 0}
          onClick={() => exporterCSV("ventes", [{ label: "Date", cle: "date" }, { label: "Montant", cle: "montant" }, { label: "Mode", cle: "mode" }, { label: "Quantité", cle: "quantite" }], ventes)} />
        <LigneExport titre="Clients" desc={`${clients.length} enregistrement(s)`} disabled={clients.length === 0}
          onClick={() => exporterCSV("clients", [{ label: "Nom", cle: "nom" }, { label: "Téléphone", cle: "telephone" }, { label: "Statut", cle: "statut" }], clients)} />
        <LigneExport titre="Paiements" desc={`${paiements.length} enregistrement(s)`} disabled={paiements.length === 0}
          onClick={() => exporterCSV("paiements", [{ label: "Date", cle: "date" }, { label: "Montant", cle: "montant" }, { label: "Mode", cle: "mode" }, { label: "Statut", cle: "statut" }], paiements)} />
        <LigneExport titre="Créances / échéances" desc={`${lignesCreances.length} échéance(s)`} disabled={lignesCreances.length === 0}
          onClick={() => exporterCSV("creances", [{ label: "Client", cle: "client" }, { label: "N° échéance", cle: "numero" }, { label: "Montant", cle: "montant" }, { label: "Date échéance", cle: "date_echeance" }, { label: "Statut", cle: "statut" }], lignesCreances)} />
        <LigneExport titre="Dépenses" desc={`${depenses.length} enregistrement(s)`} disabled={depenses.length === 0}
          onClick={() => exporterCSV("depenses", [{ label: "Date", cle: "date" }, { label: "Catégorie", cle: "categorie" }, { label: "Description", cle: "description" }, { label: "Montant", cle: "montant" }], depenses)} />
        <div style={{ padding: "12px 0" }}>
          <LigneExport titre="Stock" desc={`${produits.length} produit(s)`} disabled={produits.length === 0}
            onClick={() => exporterCSV("stock", [{ label: "Produit", cle: "nom" }, { label: "Stock actuel", cle: "stock_actuel" }, { label: "Prix", cle: "prix" }, { label: "Prix d'achat", cle: "prix_achat" }], produits)} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PARAMÈTRES
// ============================================================
const TEXTE_CONFIDENTIALITE = `Politique de Confidentialité — PolyFinance GF

1. Responsable du traitement
PolyFinance GF est édité par Amazou Nogbou Emmanuel Vianney (contact : amazouemmanuel274@gmail.com).

2. Données collectées
- Données de votre compte : nom de l'entreprise, ville, nom du responsable, téléphone, email, mot de passe (jamais stocké en clair).
- Données que vous saisissez vous-même dans l'application : vos clients, vos ventes, votre stock, vos dépenses et vos créances.

3. Pourquoi ces données sont collectées
Elles servent uniquement à faire fonctionner votre espace de gestion, activer votre abonnement Premium après paiement, et vous apporter un support en cas de besoin.

4. Hébergement et sous-traitants
Vos données sont hébergées par Supabase. L'envoi des emails (confirmation de compte, réinitialisation de mot de passe) passe par un service tiers (Brevo ou Gmail selon la configuration active). Aucune donnée n'est vendue ni partagée à des fins commerciales avec d'autres tiers.

5. Durée de conservation
Les comptes en formule Gratuite non renouvelés sont supprimés automatiquement après leur période d'essai. Une sauvegarde interne de sécurité est conservée 14 jours glissants.

6. Vos droits
Conformément à la loi ivoirienne n°2013-450 relative à la protection des données à caractère personnel, vous pouvez à tout moment demander l'accès, la rectification ou la suppression de vos données en écrivant à amazouemmanuel274@gmail.com.`;

const TEXTE_CONDITIONS = `Conditions d'Utilisation — PolyFinance GF

1. Objet
PolyFinance GF est un outil de gestion (clients, ventes, stock, dépenses) destiné aux entreprises, commerces et restaurants.

2. Compte utilisateur
Vous êtes responsable de l'exactitude des informations fournies et de la confidentialité de votre mot de passe. Toute activité effectuée depuis votre compte est présumée faite par vous.

3. Formules et paiement
La formule Gratuite donne accès au service pendant 2 jours. La formule Premium (8 000 FCFA / 30 jours) est activée manuellement après réception et vérification du paiement (Wave, Orange Money). Aucun remboursement n'est effectué une fois l'accès Premium activé.

4. Vos données de gestion
Vous restez seul responsable de l'exactitude des données que vous saisissez (vos clients, vos ventes, votre stock, vos dépenses). PolyFinance GF n'intervient pas dans vos relations commerciales avec vos propres clients.

5. Disponibilité du service
Le service est fourni "en l'état", sans garantie de disponibilité continue. Des interruptions ponctuelles pour maintenance peuvent survenir.

6. Limitation de responsabilité
PolyFinance GF ne peut être tenu responsable des décisions de gestion prises sur la base des données affichées, ni des litiges entre vous et vos propres clients ou fournisseurs.

7. Résiliation
Vous pouvez cesser d'utiliser le service à tout moment. La suppression définitive de votre compte peut être demandée par email.

8. Droit applicable
Les présentes conditions sont régies par le droit ivoirien.`;

function ParametresView({ entreprise, onProfilMisAJour }) {
  const [sousMenu, setSousMenu] = useState(null);

  const [nom, setNom] = useState(entreprise.nom || "");
  const [ville, setVille] = useState(entreprise.ville || "");
  const [telephone, setTelephone] = useState(entreprise.telephone || "");
  const [nouvelEmail, setNouvelEmail] = useState(entreprise.email || "");
  const [erreurProfil, setErreurProfil] = useState("");
  const [succesProfil, setSuccesProfil] = useState("");
  const [chargementProfil, setChargementProfil] = useState(false);

  const [ancienMdp, setAncienMdp] = useState("");
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [confirmMdp, setConfirmMdp] = useState("");
  const [erreurMdp, setErreurMdp] = useState("");
  const [succesMdp, setSuccesMdp] = useState(false);
  const [chargementMdp, setChargementMdp] = useState(false);

  const profilComplet = !!(entreprise.nom && entreprise.ville && entreprise.email && entreprise.telephone && entreprise.responsable);

  const enregistrerProfil = async () => {
    setErreurProfil(""); setSuccesProfil("");
    if (!nom || !ville) { setErreurProfil("Le nom et la ville sont obligatoires."); return; }
    setChargementProfil(true);

    const { error } = await supabase.from("entreprises").update({ nom, ville, telephone }).eq("id", entreprise.id);
    if (error) { setChargementProfil(false); setErreurProfil("Erreur : " + error.message); return; }

    if (nouvelEmail && nouvelEmail !== entreprise.email) {
      const { error: erreurEmail } = await supabase.auth.updateUser({ email: nouvelEmail });
      if (erreurEmail) { setChargementProfil(false); setErreurProfil("Nom/ville/téléphone enregistrés, mais erreur email : " + erreurEmail.message); return; }
      await supabase.from("entreprises").update({ email: nouvelEmail }).eq("id", entreprise.id);
      setSuccesProfil("Enregistré. Un email de confirmation a été envoyé à ta nouvelle adresse — clique dessus pour valider le changement.");
    } else {
      setSuccesProfil("Profil mis à jour.");
    }

    setChargementProfil(false);
    onProfilMisAJour();
  };

  const modifierMotDePasse = async () => {
    setErreurMdp(""); setSuccesMdp(false);
    if (!ancienMdp || !nouveauMdp || !confirmMdp) { setErreurMdp("Remplis tous les champs."); return; }
    if (nouveauMdp !== confirmMdp) { setErreurMdp("Les nouveaux mots de passe ne correspondent pas."); return; }
    if (!MDP_REGEX.test(nouveauMdp)) { setErreurMdp(MDP_AIDE); return; }
    setChargementMdp(true);

    const { error: erreurVerif } = await supabase.auth.signInWithPassword({ email: entreprise.email, password: ancienMdp });
    if (erreurVerif) { setChargementMdp(false); setErreurMdp("Ancien mot de passe incorrect."); return; }

    const { error } = await supabase.auth.updateUser({ password: nouveauMdp });
    setChargementMdp(false);
    if (error) { setErreurMdp("Erreur : " + error.message); return; }
    setSuccesMdp(true);
    setAncienMdp(""); setNouveauMdp(""); setConfirmMdp("");
  };

  const partager = async () => {
    const texte = "Découvrez PolyFinance GF, une solution simple pour gérer votre activité, vos ventes, votre stock et vos dépenses.";
    const url = "https://polyfinance.vercel.app";
    if (navigator.share) {
      try { await navigator.share({ title: "PolyFinance GF", text: texte, url }); } catch {}
    } else {
      navigator.clipboard?.writeText(`${texte} ${url}`);
      alert("Lien copié — colle-le dans WhatsApp, SMS ou où tu veux le partager.");
    }
  };

  const ASTUCES = [
    ["Enregistrez vos ventes au fur et à mesure", "Cela permet de garder un suivi précis de votre activité."],
    ["Consultez régulièrement votre stock", "Vous évitez ainsi les ruptures et vous savez quels produits se vendent le mieux."],
    ["Suivez vos dépenses", "Cela permet de mieux comprendre la rentabilité réelle de votre activité."],
    ["Consultez le tableau de bord", "Utilisez les indicateurs pour suivre l'évolution de votre entreprise."],
    ["Complétez votre profil", "Un profil complet facilite la gestion de votre compte."],
  ];

  const Carte = ({ titre, children, onClick }) => (
    <div onClick={onClick} className={onClick ? "gf-card-link" : ""} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 12, cursor: onClick ? "pointer" : "default" }}>
      <div style={{ fontWeight: 700, color: C.navy, fontSize: T.sub, marginBottom: children ? 8 : 0 }}>{titre}</div>
      {children}
    </div>
  );

  if (sousMenu === "confidentialite" || sousMenu === "conditions") {
    const texte = sousMenu === "confidentialite" ? TEXTE_CONFIDENTIALITE : TEXTE_CONDITIONS;
    return (
      <div style={{ maxWidth: 600 }}>
        <div onClick={() => setSousMenu(null)} style={{ color: C.teal, fontWeight: 700, fontSize: T.small, cursor: "pointer", marginBottom: 14 }}>← Retour aux paramètres</div>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, whiteSpace: "pre-line", fontSize: T.body, lineHeight: 1.6, color: C.text }}>
          {texte}
        </div>
      </div>
    );
  }

  if (sousMenu === "profil") {
    return (
      <div style={{ maxWidth: 500 }}>
        <div onClick={() => setSousMenu(null)} style={{ color: C.teal, fontWeight: 700, fontSize: T.small, cursor: "pointer", marginBottom: 14 }}>← Retour aux paramètres</div>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 700, color: C.navy, fontSize: T.h3, marginBottom: 14 }}>Modifier mon profil</div>
          <Input label="Nom de l'entreprise" value={nom} onChange={e => setNom(e.target.value)} />
          <Input label="Ville" value={ville} onChange={e => setVille(e.target.value)} />
          <Input label="Téléphone" value={telephone} onChange={e => setTelephone(e.target.value)} />
          <Input label="Email" type="email" value={nouvelEmail} onChange={e => setNouvelEmail(e.target.value)} />
          <div style={{ color: C.textMuted, fontSize: T.small, marginBottom: 12 }}>
            Changer l'email demandera une confirmation par lien envoyé à la nouvelle adresse.
          </div>
          {erreurProfil && <div style={{ color: C.red, fontSize: T.small, marginBottom: 10 }}>{erreurProfil}</div>}
          {succesProfil && <div style={{ color: C.green, fontSize: T.small, marginBottom: 10 }}>{succesProfil}</div>}
          <Btn onClick={enregistrerProfil} disabled={chargementProfil}>{chargementProfil ? "Enregistrement..." : "Enregistrer"}</Btn>
        </div>
      </div>
    );
  }

  if (sousMenu === "motdepasse") {
    return (
      <div style={{ maxWidth: 500 }}>
        <div onClick={() => setSousMenu(null)} style={{ color: C.teal, fontWeight: 700, fontSize: T.small, cursor: "pointer", marginBottom: 14 }}>← Retour aux paramètres</div>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 700, color: C.navy, fontSize: T.h3, marginBottom: 14 }}>Modifier mon mot de passe</div>
          <Input label="Ancien mot de passe" type="password" value={ancienMdp} onChange={e => setAncienMdp(e.target.value)} />
          <Input label="Nouveau mot de passe" type="password" value={nouveauMdp} onChange={e => setNouveauMdp(e.target.value)} />
          <Input label="Confirmer le nouveau mot de passe" type="password" value={confirmMdp} onChange={e => setConfirmMdp(e.target.value)} />
          <div style={{ color: C.textMuted, fontSize: T.small, marginBottom: 12 }}>{MDP_AIDE}</div>
          {erreurMdp && <div style={{ color: C.red, fontSize: T.small, marginBottom: 10 }}>{erreurMdp}</div>}
          {succesMdp && <div style={{ color: C.green, fontSize: T.small, marginBottom: 10 }}>Votre mot de passe a été modifié avec succès.</div>}
          <Btn onClick={modifierMotDePasse} disabled={chargementMdp}>{chargementMdp ? "Modification..." : "Modifier le mot de passe"}</Btn>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        .gf-parametres { display: block; max-width: 700px; }
        @media (min-width: 820px) {
          .gf-parametres { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; max-width: 1000px; align-items: start; }
        }
      `}</style>
      <div className="gf-parametres">
        <Carte titre="Profil" onClick={() => setSousMenu("profil")}>
          <div style={{ fontSize: T.body, color: C.textMuted, marginBottom: 8 }}>
            {entreprise.nom} · {entreprise.ville}<br />{entreprise.email} · {entreprise.telephone}
          </div>
          <Badge text={profilComplet ? "Profil complet" : "Profil à compléter"} color={profilComplet ? "vert" : "ambre"} />
        </Carte>

        <Carte titre="Confidentialité" onClick={() => setSousMenu("confidentialite")}>
          <div style={{ fontSize: T.body, color: C.textMuted }}>Comment vos données sont protégées et utilisées</div>
        </Carte>

        <Carte titre="Conditions d'utilisation" onClick={() => setSousMenu("conditions")}>
          <div style={{ fontSize: T.body, color: C.textMuted }}>Les règles d'usage de PolyFinance GF</div>
        </Carte>

        <Carte titre="Service client">
          <div style={{ fontSize: T.body, color: C.textMuted, marginBottom: 10 }}>
            Besoin d'aide ? Notre service client est disponible pour vous accompagner.<br />amazouemmanuel274@gmail.com
          </div>
          <a href="mailto:amazouemmanuel274@gmail.com" style={{ textDecoration: "none" }}>
            <Btn>Contacter le service client</Btn>
          </a>
        </Carte>

        <Carte titre="Mise à jour">
          <Badge text="PolyFinance GF est à jour" color="vert" />
        </Carte>

        <Carte titre="Modifier mon mot de passe" onClick={() => setSousMenu("motdepasse")}>
          <div style={{ fontSize: T.body, color: C.textMuted }}>Sécurisez votre compte</div>
        </Carte>

        <Carte titre="Inviter quelqu'un">
          <div style={{ fontSize: T.body, color: C.textMuted, marginBottom: 10 }}>
            Vous connaissez un entrepreneur, un restaurateur ou un commerçant qui pourrait utiliser PolyFinance GF ? Invitez-le à découvrir la plateforme.
          </div>
          <Btn onClick={partager}>Inviter quelqu'un</Btn>
        </Carte>
      </div>

      <div style={{ fontWeight: 700, color: C.navy, fontSize: T.sub, margin: "20px 0 12px" }}>Guide — Astuces pour mieux utiliser PolyFinance GF</div>
      <div className="gf-parametres">
        {ASTUCES.map(([titre, texte], i) => (
          <Carte key={i} titre={titre}>
            <div style={{ fontSize: T.body, color: C.textMuted }}>{texte}</div>
          </Carte>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// ESPACE ENTREPRISE — sidebar desktop, barre fixe mobile
// ============================================================
const ONGLETS = [
  ["dashboard", "Tableau de bord", "dashboard"],
  ["clients", "Clients", "clients"],
  ["paiements", "Paiements", "paiements"],
  ["creances", "Créances", "creances"],
  ["ventes", "Caisse", "caisse"],
  ["stock", "Stock", "stock"],
  ["depenses", "Dépenses", "depenses"],
  ["rapports", "Rapports", "rapports"],
  ["parametres", "Paramètres", "parametres"],
];

// Sous-ensemble prioritaire pour la barre mobile fixe (5 max, le reste dans Paramètres/plus)
const ONGLETS_MOBILE_PRINCIPAUX = ["dashboard", "ventes", "clients", "stock", "parametres"];

function EspaceEntreprise({ entreprise, onLogout }) {
  const [tab, setTab] = useState("dashboard");
  const [clients, setClients] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [creances, setCreances] = useState([]);
  const [produits, setProduits] = useState([]);
  const [ventes, setVentes] = useState([]);
  const [depenses, setDepenses] = useState([]);
  const [entrepriseLocale, setEntrepriseLocale] = useState(entreprise);

  const recharger = async () => {
    const { data: c } = await supabase.from("clients").select("*").eq("entreprise_id", entrepriseLocale.id).order("created_at", { ascending: false });
    const { data: p } = await supabase.from("paiements").select("*").eq("entreprise_id", entrepriseLocale.id).order("date", { ascending: false });
    const { data: cr } = await supabase.from("creances").select("*, echeances(*)").eq("entreprise_id", entrepriseLocale.id).order("created_at", { ascending: false });
    setClients(c || []);
    setPaiements(p || []);
    setCreances(cr || []);
    const { data: prod } = await supabase.from("produits").select("*").eq("entreprise_id", entrepriseLocale.id).order("created_at", { ascending: false });
    const { data: vte } = await supabase.from("ventes").select("*").eq("entreprise_id", entrepriseLocale.id).order("created_at", { ascending: false });
    const { data: dep } = await supabase.from("depenses").select("*").eq("entreprise_id", entrepriseLocale.id).order("date", { ascending: false });
    setProduits(prod || []);
    setVentes(vte || []);
    setDepenses(dep || []);
    const { data: e } = await supabase.from("entreprises").select("*").eq("id", entrepriseLocale.id).single();
    if (e) setEntrepriseLocale(e);
  };

  useEffect(() => { recharger(); }, []);

  const contenu = (
    <>
      {tab === "dashboard" && <TableauDeBord entreprise={entrepriseLocale} clients={clients} paiements={paiements} creances={creances} ventes={ventes} produits={produits} depenses={depenses} allerA={setTab} recharger={recharger} />}
      {tab === "clients" && <ClientsView entreprise={entrepriseLocale} clients={clients} paiements={paiements} creances={creances} recharger={recharger} />}
      {tab === "paiements" && <PaiementsView entreprise={entrepriseLocale} clients={clients} paiements={paiements} recharger={recharger} />}
      {tab === "creances" && <CreancesView entreprise={entrepriseLocale} clients={clients} creances={creances} recharger={recharger} />}
      {tab === "ventes" && <VentesView entreprise={entrepriseLocale} produits={produits} ventes={ventes} recharger={recharger} />}
      {tab === "stock" && <StockView entreprise={entrepriseLocale} produits={produits} recharger={recharger} />}
      {tab === "depenses" && <DepensesView entreprise={entrepriseLocale} depenses={depenses} recharger={recharger} />}
      {tab === "rapports" && <RapportsView clients={clients} paiements={paiements} creances={creances} ventes={ventes} produits={produits} depenses={depenses} />}
      {tab === "parametres" && <ParametresView entreprise={entrepriseLocale} onProfilMisAJour={recharger} />}
    </>
  );

  const ongletsMobilePrincipaux = ONGLETS.filter(([id]) => ONGLETS_MOBILE_PRINCIPAUX.includes(id));
  const ongletsMobilePlus = ONGLETS.filter(([id]) => !ONGLETS_MOBILE_PRINCIPAUX.includes(id) && id !== "parametres");
  const [plusOuvert, setPlusOuvert] = useState(false);

  return (
    <div>
      <style>{`
        .gf-layout { display: block; max-width: 1300px; margin: 0 auto; }
        .gf-sidebar { display: none; }
        .gf-navbar-mobile { display: flex; position: fixed; bottom: 0; left: 0; right: 0; background: ${C.white}; border-top: 1px solid ${C.border}; padding: 6px 4px calc(6px + env(safe-area-inset-bottom,0px)); z-index: 40; }
        .gf-content-mobile-pad { padding-bottom: 72px; }
        @media (min-width: 900px) {
          .gf-layout { display: flex; align-items: flex-start; }
          .gf-sidebar { display: flex; flex-direction: column; width: 220px; flex-shrink: 0; min-height: calc(100vh - 20px); background: ${C.navyDark}; }
          .gf-navbar-mobile { display: none; }
          .gf-content-mobile-pad { padding-bottom: 0; }
          .gf-main { flex: 1; min-width: 0; }
        }
      `}</style>

      <div className="gf-layout">
        <div className="gf-sidebar">
          <div style={{ padding: "22px 18px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ color: C.white, fontWeight: 800, fontSize: T.sub, letterSpacing: 0.3 }}>PolyFinance <span style={{ color: C.tealLight }}>GF</span></div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: T.small, marginTop: 6, lineHeight: 1.4 }}>{entrepriseLocale.nom}</div>
            <div style={{ marginTop: 6 }}><Badge text={entrepriseLocale.statut} color={entrepriseLocale.statut === "Premium" ? "vert" : "ambre"} /></div>
          </div>
          <nav style={{ flex: 1, padding: "12px 10px" }}>
            {ONGLETS.map(([id, label, icone]) => (
              <div key={id} onClick={() => setTab(id)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, marginBottom: 2, cursor: "pointer", fontSize: T.body, fontWeight: tab === id ? 700 : 500, color: tab === id ? C.white : "rgba(255,255,255,0.6)", background: tab === id ? C.teal : "transparent" }}>
                <Icon name={icone} size={17} />
                {label}
              </div>
            ))}
          </nav>
          <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <span onClick={onLogout} style={{ color: "rgba(255,255,255,0.55)", fontSize: T.small, cursor: "pointer" }}>Déconnexion</span>
          </div>
        </div>

        <div className="gf-main">
          <div style={{ background: `linear-gradient(135deg,${C.navyDark},${C.navy})`, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: C.white, fontWeight: 700, fontSize: T.sub }}>{entrepriseLocale.nom}</div>
              <div style={{ color: C.tealLight, fontSize: T.micro }}>{entrepriseLocale.statut} {entrepriseLocale.date_expiration ? `· jusqu'au ${entrepriseLocale.date_expiration}` : ""}</div>
            </div>
            <span onClick={onLogout} style={{ color: "rgba(255,255,255,0.7)", fontSize: T.small, cursor: "pointer" }}>Déconnexion</span>
          </div>

          <div className="gf-content-mobile-pad" style={{ padding: 16 }}>
            {contenu}
          </div>
        </div>
      </div>

      <div className="gf-navbar-mobile">
        {ongletsMobilePrincipaux.map(([id, label, icone]) => (
          <div key={id} onClick={() => { setTab(id); setPlusOuvert(false); }}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 2px", color: tab === id ? C.teal : C.textMuted, cursor: "pointer" }}>
            <Icon name={icone} size={20} />
            <span style={{ fontSize: "10px", fontWeight: tab === id ? 700 : 500 }}>{label}</span>
          </div>
        ))}
        <div onClick={() => setPlusOuvert(o => !o)}
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 2px", color: plusOuvert ? C.teal : C.textMuted, cursor: "pointer" }}>
          <Icon name="rapports" size={20} />
          <span style={{ fontSize: "10px", fontWeight: 500 }}>Plus</span>
        </div>
      </div>

      {plusOuvert && (
        <div onClick={() => setPlusOuvert(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,46,66,0.4)", zIndex: 45, display: "flex", alignItems: "flex-end" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, width: "100%", borderRadius: "16px 16px 0 0", padding: "20px 16px calc(20px + env(safe-area-inset-bottom,0px))" }}>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: T.sub, marginBottom: 12 }}>Plus d'options</div>
            {ongletsMobilePlus.map(([id, label, icone]) => (
              <div key={id} onClick={() => { setTab(id); setPlusOuvert(false); }}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 4px", borderBottom: `1px solid ${C.border}`, color: C.text, cursor: "pointer" }}>
                <Icon name={icone} size={18} />
                <span style={{ fontSize: T.body, fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
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

  useEffect(() => {
    chargerEntreprise();
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setEcran("reinitialiser-mdp");
    });
    return () => listener?.subscription?.unsubscribe();
  }, []);

  const seDeconnecter = async () => {
    await supabase.auth.signOut();
    setEntreprise(null);
    setEcran("login");
  };

  let contenu = null;
  if (ecran === "chargement") contenu = <div style={{ padding: 40, textAlign: "center", color: C.textMuted }}>Chargement...</div>;
  else if (ecran === "login") contenu = <Connexion onGoSignup={() => setEcran("signup")} onLoggedIn={chargerEntreprise} onGoForgot={() => setEcran("mdp-oublie")} />;
  else if (ecran === "mdp-oublie") contenu = <MotDePasseOublie onGoLogin={() => setEcran("login")} />;
  else if (ecran === "reinitialiser-mdp") contenu = <ReinitialiserMotDePasse onTermine={() => { setEcran("login"); }} />;
  else if (ecran === "signup") contenu = <Inscription onGoLogin={() => setEcran("login")} onInscrit={(plan) => setEcran(plan === "gratuit" ? "login" : "attente")} />;
  else if (ecran === "attente") contenu = <EnAttente onGoLogin={() => setEcran("login")} />;
  else if (ecran === "attente-connecte") contenu = <EnAttenteConnecte entreprise={entreprise} onLogout={seDeconnecter} />;
  else if (ecran === "expire") contenu = <AccesExpire entreprise={entreprise} onLogout={seDeconnecter} />;
  else if (ecran === "admin") contenu = <AdminDashboard onLogout={seDeconnecter} />;
  else if (ecran === "app" && entreprise) contenu = <EspaceEntreprise entreprise={entreprise} onLogout={seDeconnecter} />;

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {contenu}
    </>
  );
}
