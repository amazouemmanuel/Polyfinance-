import { useState, useRef, useEffect } from "react";
import Fondateur from "./Fondateur";
import PolyFinanceGF from "./PolyFinanceGF";
import { supabase } from "./lib/supabaseClient";

const C = {
  navy: "#1B4D6E", navyDark: "#0F2E42", navyLight: "#245f85",
  teal: "#2AABAA", tealLight: "#3ECFCE", orange: "#F47B2A",
  bg: "#F5F8FA", white: "#FFFFFF", text: "#1a2a35",
  textMuted: "#6B8FA8", border: "rgba(27,77,110,0.12)"
};

const AGENTS = [
  { id: "chat", icon: "🤖", label: "Assistant", desc: "Questions financières générales", placeholder: "Posez votre question financière..." },
  { id: "script", icon: "🎬", label: "Script", desc: "Génère tes scripts TikTok/Instagram", placeholder: "Ex: Génère un script sur le blanchiment d'argent" },
  { id: "recherche", icon: "🔍", label: "Recherche", desc: "Analyse un sujet financier", placeholder: "Ex: Analyse le marché obligataire UEMOA 2025" },
  { id: "brainstorming", icon: "💡", label: "Idées", desc: "Idées de contenu par pilier", placeholder: "Ex: Donne-moi des idées sur l'entrepreneuriat africain" },
  { id: "revision", icon: "✏️", label: "Révision", desc: "Améliore ton script existant", placeholder: "Colle ton script ici pour l'améliorer..." }
];

const S = [
  { icon: "📈", label: "Investir BRVM", q: "Comment investir à la BRVM ?" },
  { icon: "💹", label: "Trading", q: "Comment débuter le trading ?" },
  { icon: "📋", label: "Bilan", q: "Comment lire un bilan comptable ?" },
  { icon: "📱", label: "Mobile money", q: "Impact du mobile money sur les PME ?" },
  { icon: "₿", label: "Crypto", q: "C'est quoi les cryptomonnaies ?" },
  { icon: "🏦", label: "Finance islamique", q: "Explique la finance islamique." }
];

const TOOLS = [
  { id: "composes", label: "Intérêts composés", emoji: "📈" },
  { id: "epargne", label: "Capacité d'épargne", emoji: "💰" },
  { id: "brvm", label: "Rendement BRVM", emoji: "📊" },
  { id: "credit", label: "Coût crédit", emoji: "🏦" },
  { id: "objectif", label: "Objectif épargne", emoji: "🎯" },
];

function formater(v) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(v)) + " FCFA";
}

function CalcInput({ label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ color: C.textMuted, fontSize: "0.75rem", display: "block", marginBottom: 5 }}>{label}</label>
      <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "10px 13px", boxSizing: "border-box", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: "0.9rem", outline: "none" }} />
    </div>
  );
}

function CalcBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ width: "100%", padding: 13, marginBottom: 16, background: `linear-gradient(135deg,${C.teal},${C.tealLight})`, border: "none", borderRadius: 11, color: C.white, fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" }}>
      Calculer
    </button>
  );
}

function CalcResultat({ principal, label, children, alerte }) {
  return (
    <div style={{ background: `linear-gradient(135deg,${C.navy}10,${C.teal}08)`, border: `1px solid ${C.teal}40`, borderRadius: 13, padding: 18, textAlign: "center" }}>
      {alerte && <div style={{ background: "#fef3c7", border: "1px solid #fbbf24", borderRadius: 8, padding: "7px 11px", color: "#92400e", fontSize: "0.75rem", marginBottom: 10 }}>{alerte}</div>}
      <p style={{ color: C.textMuted, fontSize: "0.65rem", letterSpacing: 1, margin: "0 0 3px", textTransform: "uppercase" }}>{label}</p>
      <p style={{ color: C.teal, fontSize: "1.7rem", fontWeight: 800, margin: "0 0 14px" }}>{principal}</p>
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, display: "flex", flexDirection: "column", gap: 7 }}>{children}</div>
    </div>
  );
}

function CalcLigne({ titre, valeur, vert, rouge }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: C.textMuted, fontSize: "0.75rem" }}>{titre}</span>
      <span style={{ color: rouge ? "#ef4444" : vert ? "#10b981" : C.text, fontWeight: 700, fontSize: "0.85rem" }}>{valeur}</span>
    </div>
  );
}

function Composes() {
  const [capital, setCapital] = useState(""); const [taux, setTaux] = useState(""); const [duree, setDuree] = useState(""); const [res, setRes] = useState(null);
  function calculer() { const C2 = parseFloat(capital), r = parseFloat(taux) / 100, n = parseInt(duree); if (!C2 || !r || !n) return; const final = C2 * Math.pow(1 + r, n); setRes({ final, interets: final - C2 }); }
  return (<div><p style={{ color: C.textMuted, fontSize: "0.78rem", marginBottom: 16 }}>Combien vaut ton argent après N ans avec des intérêts qui s'accumulent ?</p><CalcInput label="Capital initial (FCFA)" value={capital} onChange={setCapital} placeholder="ex: 500 000" /><CalcInput label="Taux annuel (%)" value={taux} onChange={setTaux} placeholder="ex: 8" /><CalcInput label="Durée (années)" value={duree} onChange={setDuree} placeholder="ex: 10" /><CalcBtn onClick={calculer} />{res && (<CalcResultat principal={formater(res.final)} label="Montant final"><CalcLigne titre="Capital de départ" valeur={formater(parseFloat(capital))} /><CalcLigne titre="Intérêts gagnés" valeur={formater(res.interets)} vert /></CalcResultat>)}</div>);
}

function Epargne() {
  const [revenus, setRevenus] = useState(""); const [depenses, setDepenses] = useState(""); const [res, setRes] = useState(null);
  function calculer() { const R = parseFloat(revenus), D = parseFloat(depenses); if (!R || !D) return; const capacite = R - D; setRes({ capacite, taux: (capacite / R) * 100 }); }
  return (<div><p style={{ color: C.textMuted, fontSize: "0.78rem", marginBottom: 16 }}>Combien peux-tu mettre de côté chaque mois ?</p><CalcInput label="Revenus mensuels (FCFA)" value={revenus} onChange={setRevenus} placeholder="ex: 150 000" /><CalcInput label="Dépenses mensuelles (FCFA)" value={depenses} onChange={setDepenses} placeholder="ex: 100 000" /><CalcBtn onClick={calculer} />{res && (<CalcResultat principal={formater(Math.max(0, res.capacite))} label="Épargne possible / mois" alerte={res.capacite <= 0 ? "⚠️ Dépenses supérieures aux revenus" : null}><CalcLigne titre="Taux d'épargne" valeur={res.taux.toFixed(1) + "%"} vert={res.taux >= 20} /><CalcLigne titre="Taux conseillé" valeur="≥ 20%" /></CalcResultat>)}</div>);
}

function BRVM() {
  const [pa, setPa] = useState(""); const [pv, setPv] = useState(""); const [div, setDiv] = useState(""); const [duree, setDuree] = useState(""); const [res, setRes] = useState(null);
  function calculer() { const PA = parseFloat(pa), PV = parseFloat(pv), D = parseFloat(div) || 0, N = parseInt(duree) || 1; if (!PA || !PV) return; const pv2 = PV - PA; const gain = pv2 + D; const rend = (gain / PA) * 100; setRes({ pv2, gain, rend, rendAnnuel: rend / N }); }
  return (<div><p style={{ color: C.textMuted, fontSize: "0.78rem", marginBottom: 16 }}>Calcule ton rendement réel sur une action BRVM.</p><CalcInput label="Prix d'achat / action (FCFA)" value={pa} onChange={setPa} placeholder="ex: 12 500" /><CalcInput label="Prix de vente / action (FCFA)" value={pv} onChange={setPv} placeholder="ex: 15 000" /><CalcInput label="Dividendes reçus / action (FCFA)" value={div} onChange={setDiv} placeholder="ex: 500 (optionnel)" /><CalcInput label="Durée de détention (années)" value={duree} onChange={setDuree} placeholder="ex: 2" /><CalcBtn onClick={calculer} />{res && (<CalcResultat principal={res.rend.toFixed(2) + "%"} label="Rendement total"><CalcLigne titre="Plus-value" valeur={formater(res.pv2)} vert={res.pv2 > 0} /><CalcLigne titre="Gain total" valeur={formater(res.gain)} vert /><CalcLigne titre="Rendement annuel" valeur={res.rendAnnuel.toFixed(2) + "%"} /></CalcResultat>)}</div>);
}

function Credit() {
  const [montant, setMontant] = useState(""); const [taux, setTaux] = useState(""); const [duree, setDuree] = useState(""); const [res, setRes] = useState(null);
  function calculer() { const P = parseFloat(montant), r = parseFloat(taux) / 100 / 12, n = parseInt(duree); if (!P || !r || !n) return; const m = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1); const total = m * n; setRes({ m, total, cout: total - P }); }
  return (<div><p style={{ color: C.textMuted, fontSize: "0.78rem", marginBottom: 16 }}>Combien ce crédit te coûte vraiment au total ?</p><CalcInput label="Montant emprunté (FCFA)" value={montant} onChange={setMontant} placeholder="ex: 1 000 000" /><CalcInput label="Taux annuel (%)" value={taux} onChange={setTaux} placeholder="ex: 12" /><CalcInput label="Durée (mois)" value={duree} onChange={setDuree} placeholder="ex: 24" /><CalcBtn onClick={calculer} />{res && (<CalcResultat principal={formater(res.m)} label="Mensualité"><CalcLigne titre="Total remboursé" valeur={formater(res.total)} /><CalcLigne titre="Coût des intérêts" valeur={formater(res.cout)} rouge /></CalcResultat>)}</div>);
}

function Objectif() {
  const [cible, setCible] = useState(""); const [actuel, setActuel] = useState(""); const [taux, setTaux] = useState(""); const [duree, setDuree] = useState(""); const [res, setRes] = useState(null);
  function calculer() { const FV = parseFloat(cible), PV = parseFloat(actuel) || 0, r = parseFloat(taux) / 100 / 12, n = parseInt(duree); if (!FV || !n) return; const fvActuel = PV * Math.pow(1 + r, n); const reste = FV - fvActuel; const m = r > 0 ? (reste * r) / (Math.pow(1 + r, n) - 1) : reste / n; setRes({ m: Math.max(0, m), fvActuel }); }
  return (<div><p style={{ color: C.textMuted, fontSize: "0.78rem", marginBottom: 16 }}>Combien épargner chaque mois pour atteindre ton objectif ?</p><CalcInput label="Objectif à atteindre (FCFA)" value={cible} onChange={setCible} placeholder="ex: 5 000 000" /><CalcInput label="Épargne déjà disponible (FCFA)" value={actuel} onChange={setActuel} placeholder="ex: 200 000 (optionnel)" /><CalcInput label="Taux de placement annuel (%)" value={taux} onChange={setTaux} placeholder="ex: 5" /><CalcInput label="Délai (mois)" value={duree} onChange={setDuree} placeholder="ex: 36" /><CalcBtn onClick={calculer} />{res && (<CalcResultat principal={formater(res.m)} label="À épargner / mois"><CalcLigne titre="Valeur future de ton épargne actuelle" valeur={formater(res.fvActuel)} vert /></CalcResultat>)}</div>);
}

function F({ text }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {text.split("\n").map((l, i) => {
        if (l.match(/^#{2,3}\s/)) return <div key={i} style={{ color: C.teal, fontWeight: 700, marginTop: 8 }}>{l.replace(/^#{2,3}\s/, "")}</div>;
        if (l.match(/^[-•]\s/)) return <div key={i} style={{ display: "flex", gap: 8 }}><span style={{ color: C.orange }}>▸</span><span dangerouslySetInnerHTML={{ __html: l.replace(/^[-•]\s/, "").replace(/\*\*(.*?)\*\*/g, `<strong>$1</strong>`) }} /></div>;
        if (!l.trim()) return <div key={i} style={{ height: 6 }} />;
        return <div key={i} dangerouslySetInnerHTML={{ __html: l.replace(/\*\*(.*?)\*\*/g, `<strong>$1</strong>`) }} />;
      })}
    </div>
  );
}

function Logo({ s = 32 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
      <rect x="8" y="62" width="14" height="28" rx="2" fill={C.navyDark} />
      <rect x="28" y="44" width="14" height="46" rx="2" fill={C.teal} />
      <rect x="48" y="30" width="14" height="60" rx="2" fill={C.teal} />
      <rect x="68" y="16" width="14" height="74" rx="2" fill={C.orange} />
      <path d="M12 68 Q40 20 82 8" stroke={C.navyDark} strokeWidth="4" strokeLinecap="round" fill="none" />
      <polygon points="82,4 92,14 78,12" fill={C.navyDark} />
    </svg>
  );
}

function Dots() {
  return (
    <div style={{ display: "flex", gap: 5 }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: C.teal, display: "inline-block", animation: `db 1.2s ${i * 0.2}s infinite` }} />
      ))}
    </div>
  );
}

function Input({ onSend, placeholder }) {
  const [v, setV] = useState("");
  const r = useRef(null);
  const go = () => {
    if (!v.trim()) return;
    onSend(v.trim());
    setV("");
    setTimeout(() => r.current && r.current.focus(), 50);
  };
  return (
    <div style={{ padding: "10px 14px 16px", background: C.white, borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 9, background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "8px 11px" }}>
        <textarea ref={r} value={v} onChange={e => setV(e.target.value)} placeholder={placeholder || "Posez votre question..."} style={{ flex: 1, background: "none", border: "none", outline: "none", color: C.text, fontFamily: "inherit", fontSize: "0.86rem", resize: "none", minHeight: 24, maxHeight: 120, lineHeight: 1.5 }} rows={1}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); go(); } }} />
        <button onClick={go} disabled={!v.trim()} style={{ width: 34, height: 34, borderRadius: 9, border: "none", background: !v.trim() ? "#ddd" : `linear-gradient(135deg,${C.teal},${C.tealLight})`, cursor: !v.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill={!v.trim() ? "#999" : C.white}><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
        </button>
      </div>
      <div style={{ textAlign: "center", fontSize: "0.66rem", color: C.textMuted, marginTop: 6 }}>Poly Finance AI · 100% Gratuit</div>
    </div>
  );
}

// ============================================================
// BOUTON RETOUR AU MENU PRINCIPAL
// ============================================================
function BoutonRetourMenu({ onClick, sombre }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: sombre ? "rgba(255,255,255,0.12)" : C.white,
      border: sombre ? "1px solid rgba(255,255,255,0.3)" : `1px solid ${C.border}`,
      borderRadius: 9, padding: "7px 13px", cursor: "pointer",
      color: sombre ? C.white : C.navy, fontSize: "0.78rem", fontWeight: 700,
    }}>
      ← Retour au menu principal
    </button>
  );
}

// ============================================================
// VITRINE — écran d'accueil (choix entre PolyFinance AI et GF)
// ============================================================
const LANDING_CSS = `
  @keyframes pfFadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
  @keyframes pfDraw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
  @keyframes pfAire { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pfGrow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
  @keyframes pfFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }

  .pf-in { opacity: 0; animation: pfFadeUp .7s ease-out forwards; }
  .pf-ligne { stroke-dasharray: 1; stroke-dashoffset: 1; animation: pfDraw 2.8s ease-out .5s forwards; }
  .pf-aire { opacity: 0; animation: pfAire 1.6s ease-out 1.8s forwards; }
  .pf-barre { transform-origin: bottom; transform: scaleY(0); animation: pfGrow .9s cubic-bezier(.2,.8,.2,1) forwards; }
  .pf-logo { animation: pfFloat 6s ease-in-out infinite; }
  .pf-flotte { animation: pfFloat 7s ease-in-out infinite; }

  .pf-hero { display: grid; grid-template-columns: 1fr; gap: 36px; align-items: center; }
  .pf-mock { display: none; }
  .pf-navlinks { display: none; gap: 8px; }
  @media (min-width: 640px) { .pf-navlinks { display: flex; } }
  @media (min-width: 960px) {
    .pf-hero { grid-template-columns: 1.1fr 0.9fr; gap: 48px; }
    .pf-mock { display: block; }
  }

  .pf-lien-nav { background: transparent; border: 1px solid rgba(255,255,255,0.28); color: ${C.white}; border-radius: 9px; padding: 8px 14px; font-size: 0.8rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: background .15s ease; }
  .pf-lien-nav:hover { background: rgba(255,255,255,0.12); }

  .pf-sel-carte { background: ${C.white}; border-radius: 14px; padding: 12px; max-width: 640px; box-shadow: 0 16px 36px rgba(0,0,0,0.28); }
  .pf-onglets { display: inline-flex; background: #eaf0f4; border-radius: 999px; padding: 3px; margin-bottom: 12px; }
  .pf-onglet { border: none; background: transparent; color: ${C.navy}; font-weight: 700; font-size: 0.85rem; padding: 8px 22px; border-radius: 999px; cursor: pointer; font-family: inherit; transition: background .15s ease, color .15s ease; }
  .pf-onglet.actif { background: ${C.orange}; color: ${C.white}; }
  .pf-sel-rangee { display: flex; flex-direction: column; gap: 10px; }
  @media (min-width: 600px) { .pf-sel-rangee { flex-direction: row; align-items: flex-end; } }
  .pf-sel-champ { flex: 1; min-width: 0; }
  .pf-sel-etiquette { display: block; font-size: 0.72rem; color: ${C.textMuted}; margin-bottom: 4px; font-weight: 600; }
  .pf-select { width: 100%; padding: 11px 12px; border: 1px solid ${C.border}; border-radius: 10px; background: ${C.bg}; color: ${C.text}; font-size: 0.9rem; font-family: inherit; }
  .pf-texte-gf { font-size: 0.88rem; color: ${C.text}; line-height: 1.4; min-height: 44px; display: flex; align-items: center; }
  .pf-cta { background: ${C.orange}; color: ${C.white}; border: none; border-radius: 10px; padding: 12px 28px; font-weight: 800; font-size: 0.92rem; cursor: pointer; font-family: inherit; white-space: nowrap; transition: filter .15s ease, transform .05s ease; }
  .pf-cta:hover { filter: brightness(1.07); }
  .pf-cta:active { transform: translateY(1px); }

  .pf-carte { transition: transform .2s ease, box-shadow .2s ease; }
  .pf-carte:hover { transform: translateY(-4px); box-shadow: 0 16px 36px rgba(27,77,110,0.2); }
  .pf-carte:active { transform: translateY(-1px); }
  .pf-fleche { display: inline-block; transition: transform .2s ease; }
  .pf-carte:hover .pf-fleche { transform: translateX(5px); }

  .pf-grille { display: grid; grid-template-columns: 1fr; gap: 16px; }
  @media (min-width: 760px) { .pf-grille { grid-template-columns: 1fr 1fr; gap: 20px; } }

  .pf-rail { display: flex; gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 4px 2px 12px; scrollbar-width: none; }
  .pf-rail::-webkit-scrollbar { display: none; }
  .pf-tuile { flex: 0 0 176px; scroll-snap-align: start; background: ${C.white}; border: 1px solid ${C.border}; border-radius: 14px; overflow: hidden; cursor: pointer; padding: 0; text-align: left; font-family: inherit; display: flex; flex-direction: column; transition: transform .2s ease, box-shadow .2s ease; }
  .pf-tuile:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(27,77,110,0.16); }
  .pf-fleche-rail { width: 38px; height: 38px; border-radius: 50%; border: 1px solid ${C.border}; background: ${C.white}; color: ${C.navy}; cursor: pointer; font-size: 1rem; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; font-family: inherit; transition: border-color .15s ease; }
  .pf-fleche-rail:hover { border-color: ${C.teal}; }

  .pf-cta:focus-visible, .pf-onglet:focus-visible, .pf-select:focus-visible, .pf-carte:focus-visible, .pf-tuile:focus-visible, .pf-lien-nav:focus-visible, .pf-fleche-rail:focus-visible { outline: 2px solid ${C.tealLight}; outline-offset: 2px; }

  @media (prefers-reduced-motion: reduce) {
    .pf-in, .pf-ligne, .pf-aire, .pf-barre, .pf-logo, .pf-flotte { animation: none !important; opacity: 1 !important; stroke-dashoffset: 0 !important; transform: none !important; }
    .pf-carte, .pf-tuile { transition: none; }
  }
`;

const LIGNE_CROISSANCE = "M0,250 L80,222 L160,236 L240,182 L320,198 L400,142 L480,158 L560,104 L640,118 L720,62 L800,38";

const MODULES = [
  { espace: "ia", icone: "chat", label: "Assistant IA", sous: "Posez vos questions financières", page: "chat" },
  { espace: "ia", icone: "agents", label: "5 agents IA", sous: "Script, recherche, idées, révision", page: "agents" },
  { espace: "ia", icone: "calcul", label: "Calculateurs", sous: "Épargne, crédit, BRVM, intérêts", page: "outils" },
  { espace: "gf", icone: "caisse", label: "Caisse", sous: "Tickets, paiement, impression" },
  { espace: "gf", icone: "stock", label: "Stock", sous: "Entrées, sorties, alertes" },
  { espace: "gf", icone: "creances", label: "Créances", sous: "Échéanciers et suivi des retards" },
  { espace: "gf", icone: "depenses", label: "Dépenses", sous: "Sorties d'argent par catégorie" },
  { espace: "gf", icone: "rapports", label: "Rapports", sous: "Exports CSV et résumé du mois" },
  { espace: "gf", icone: "dashboard", label: "Tableau de bord", sous: "CA, bénéfice estimé, trésorerie" },
];

function Pictogramme({ nom, taille = 34 }) {
  const chemins = {
    chat: <><path d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" /><path d="M8 10h8M8 13h5" /></>,
    agents: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14.2c2.6.2 5 2.3 5 5.8" /></>,
    calcul: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8" /><path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" /></>,
    caisse: <><path d="M4 9h16l-1.5 10.5a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 9Z" /><path d="M8 9V7a4 4 0 0 1 8 0v2" /></>,
    stock: <><path d="M3 7l9-4 9 4-9 4-9-4Z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></>,
    creances: <><path d="M6 3h9l4 4v14H6z" /><path d="M9 11h6M9 15h6" /></>,
    depenses: <><circle cx="12" cy="12" r="9" /><path d="M8 12h8" /></>,
    rapports: <><path d="M4 20V10M12 20V4M20 20v-7" /><path d="M2 20h20" /></>,
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  };
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {chemins[nom] || null}
    </svg>
  );
}

function IconeAI({ s = 26 }) {
  return <Pictogramme nom="chat" taille={s} />;
}

function IconeGF({ s = 26 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20h18" />
      <rect x="5" y="11" width="3.2" height="9" rx="1" />
      <rect x="10.4" y="6" width="3.2" height="14" rx="1" />
      <rect x="15.8" y="9" width="3.2" height="11" rx="1" />
    </svg>
  );
}

function Coche({ couleur }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={couleur} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function ApercuGF() {
  const hauteurs = [38, 55, 44, 70, 52, 84, 66];
  const kpis = [["Chiffre d'affaires", C.green], ["Dépenses", C.red], ["Stock", C.teal]];
  return (
    <div className="pf-mock pf-in" style={{ animationDelay: "300ms" }} aria-hidden="true">
      <div className="pf-flotte">
        <div style={{ background: "#0b1f2d", borderRadius: 14, padding: 8, boxShadow: "0 26px 54px rgba(0,0,0,0.38)" }}>
          <div style={{ background: C.white, borderRadius: 8, display: "flex", height: 240, overflow: "hidden" }}>
            <div style={{ width: 54, background: C.navyDark, padding: "12px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <Logo s={22} />
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{ width: 26, height: 7, borderRadius: 4, background: i === 0 ? C.teal : "rgba(255,255,255,0.22)" }} />
              ))}
            </div>
            <div style={{ flex: 1, padding: 14, background: C.bg, display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.navy }}>Tableau de bord</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {kpis.map(([label, couleur]) => (
                  <div key={label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 8px 10px" }}>
                    <div style={{ fontSize: 9, color: C.textMuted, marginBottom: 7, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
                    <div style={{ height: 7, width: "62%", borderRadius: 4, background: couleur, opacity: 0.85 }} />
                  </div>
                ))}
              </div>
              <div style={{ height: 108, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 10px 8px", display: "flex", alignItems: "flex-end", gap: 7 }}>
                {hauteurs.map((h, i) => (
                  <div key={i} className="pf-barre" style={{ flex: 1, height: `${h}%`, borderRadius: 3, background: `linear-gradient(180deg,${C.tealLight},${C.teal})`, animationDelay: `${700 + i * 110}ms` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ height: 10, margin: "0 -20px", background: "linear-gradient(#cfd8de,#a9b5be)", borderRadius: "0 0 16px 16px" }} />
        <div style={{ textAlign: "center", marginTop: 12, color: "rgba(255,255,255,0.55)", fontSize: "0.72rem" }}>Aperçu de l'espace PolyFinance GF</div>
      </div>
    </div>
  );
}

function Selecteur({ onIA, onGF }) {
  const [mode, setMode] = useState("ia");
  const [cible, setCible] = useState("chat");
  const options = [
    ["chat", "Poser une question à l'assistant IA"],
    ["agents", "Choisir un agent spécialisé"],
    ["outils", "Utiliser un calculateur financier"],
    ["home", "Découvrir PolyFinance AI"],
  ];
  const aller = () => (mode === "ia" ? onIA(cible) : onGF());

  return (
    <div className="pf-sel-carte">
      <div role="tablist" aria-label="Choisir un espace" className="pf-onglets">
        {[["ia", "Apprendre"], ["gf", "Gérer"]].map(([id, libelle]) => (
          <button key={id} role="tab" aria-selected={mode === id} onClick={() => setMode(id)} className={`pf-onglet${mode === id ? " actif" : ""}`}>
            {libelle}
          </button>
        ))}
      </div>
      <div className="pf-sel-rangee">
        <div className="pf-sel-champ">
          {mode === "ia" ? (
            <>
              <label htmlFor="pf-cible" className="pf-sel-etiquette">Que souhaitez-vous faire ?</label>
              <select id="pf-cible" className="pf-select" value={cible} onChange={e => setCible(e.target.value)}>
                {options.map(([val, lib]) => <option key={val} value={val}>{lib}</option>)}
              </select>
            </>
          ) : (
            <>
              <span className="pf-sel-etiquette">PolyFinance GF</span>
              <div className="pf-texte-gf">Caisse, stock, créances, dépenses et rapports : votre activité dans un seul espace.</div>
            </>
          )}
        </div>
        <button className="pf-cta" onClick={aller}>Accéder</button>
      </div>
    </div>
  );
}

function CarteEspace({ claire, icone, etiquette, titre, description, points, cta, onClick, delai }) {
  return (
    <div className="pf-in" style={{ animationDelay: `${delai}ms` }}>
      <button onClick={onClick} className="pf-carte"
        style={{
          width: "100%", height: "100%", textAlign: "left", cursor: "pointer", border: claire ? `1px solid ${C.border}` : "none", fontFamily: "inherit",
          borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 14,
          background: claire ? C.white : `linear-gradient(145deg,${C.teal},#1f9697)`,
          color: claire ? C.text : C.white, boxShadow: claire ? "0 6px 20px rgba(27,77,110,0.08)" : "0 8px 24px rgba(42,171,170,0.28)",
        }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ width: 46, height: 46, borderRadius: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", background: claire ? `${C.navy}10` : "rgba(255,255,255,0.18)", color: claire ? C.navy : C.white }}>
            {icone}
          </span>
          <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: claire ? C.textMuted : "rgba(255,255,255,0.85)" }}>{etiquette}</span>
        </div>

        <div>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: claire ? C.navy : C.white, letterSpacing: "-0.01em" }}>{titre}</div>
          <div style={{ fontSize: "0.88rem", lineHeight: 1.5, marginTop: 6, color: claire ? C.textMuted : "rgba(255,255,255,0.9)" }}>{description}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          {points.map(p => (
            <div key={p} style={{ display: "flex", gap: 9, fontSize: "0.84rem", lineHeight: 1.4, color: claire ? C.text : C.white }}>
              <Coche couleur={claire ? C.teal : C.white} />
              <span>{p}</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: `1px solid ${claire ? C.border : "rgba(255,255,255,0.25)"}`, paddingTop: 14, fontSize: "0.9rem", fontWeight: 700, color: claire ? C.teal : C.white }}>
          {cta} <span className="pf-fleche">→</span>
        </div>
      </button>
    </div>
  );
}

function Landing({ onChoisirIA, onChoisirGF }) {
  const rail = useRef(null);
  const defiler = (sens) => rail.current && rail.current.scrollBy({ left: sens * 360, behavior: "smooth" });
  const largeur = { maxWidth: 1100, width: "100%", margin: "0 auto", padding: "0 20px", boxSizing: "border-box" };
  const stats = [["5", "agents IA"], ["5", "calculateurs financiers"], ["8", "modules de gestion"]];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter',sans-serif" }}>
      <style>{LANDING_CSS}</style>

      {/* ---------- HÉRO ---------- */}
      <section style={{ position: "relative", overflow: "hidden", background: `linear-gradient(165deg,${C.navyDark},${C.navy} 75%)` }}>
        <svg viewBox="0 0 800 300" preserveAspectRatio="none" aria-hidden="true"
          style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", height: "62%", opacity: 0.35, pointerEvents: "none", zIndex: 0 }}>
          <defs>
            <linearGradient id="pfAireDegrade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.tealLight} stopOpacity="0.3" />
              <stop offset="100%" stopColor={C.tealLight} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[60, 120, 180, 240].map(y => <line key={y} x1="0" x2="800" y1={y} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
          <path className="pf-aire" d={`${LIGNE_CROISSANCE} L800,300 L0,300 Z`} fill="url(#pfAireDegrade)" />
          <path className="pf-ligne" d={LIGNE_CROISSANCE} fill="none" stroke={C.tealLight} strokeWidth="2.5" pathLength="1" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <div style={{ position: "relative", zIndex: 1, ...largeur, paddingBottom: 64 }}>
          <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 0 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="pf-logo" style={{ display: "inline-flex" }}><Logo s={34} /></span>
              <span style={{ color: C.white, fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.01em" }}>PolyFinance</span>
            </div>
            <nav className="pf-navlinks" aria-label="Accès rapide">
              <button className="pf-lien-nav" onClick={() => onChoisirIA("home")}>PolyFinance AI</button>
              <button className="pf-lien-nav" onClick={onChoisirGF}>PolyFinance GF</button>
            </nav>
          </header>

          <div className="pf-hero" style={{ paddingTop: 48 }}>
            <div>
              <div className="pf-in" style={{ animationDelay: "0ms", color: C.tealLight, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>
                Fintech · Afrique francophone
              </div>

              <h1 className="pf-in" style={{ animationDelay: "90ms", margin: 0, color: C.white, fontWeight: 800, fontSize: "clamp(1.9rem, 5vw, 3rem)", lineHeight: 1.12, letterSpacing: "-0.025em" }}>
                Apprenez la finance et <span style={{ color: C.orange }}>pilotez votre activité</span> en quelques clics
              </h1>

              <p className="pf-in" style={{ animationDelay: "180ms", margin: "16px 0 28px", maxWidth: 540, color: "rgba(255,255,255,0.75)", fontSize: "1rem", lineHeight: 1.6 }}>
                Deux espaces sur une même plateforme : se former avec l'intelligence artificielle, ou gérer son commerce au quotidien.
              </p>

              <div className="pf-in" style={{ animationDelay: "260ms" }}>
                <Selecteur onIA={onChoisirIA} onGF={onChoisirGF} />
              </div>

              <div className="pf-in" style={{ animationDelay: "340ms", display: "flex", gap: 28, marginTop: 30, flexWrap: "wrap" }}>
                {stats.map(([n, l]) => (
                  <div key={l}>
                    <div style={{ color: C.white, fontWeight: 800, fontSize: "1.6rem", lineHeight: 1 }}>{n}</div>
                    <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.78rem", marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <ApercuGF />
          </div>
        </div>
      </section>

      {/* ---------- NOS DEUX ESPACES ---------- */}
      <section style={{ ...largeur, padding: "56px 20px 12px" }}>
        <div style={{ color: C.teal, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Choisissez votre espace</div>
        <h2 style={{ margin: "0 0 22px", color: C.navy, fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.02em" }}>Nos deux espaces</h2>
        <div className="pf-grille">
          <CarteEspace
            claire
            icone={<IconeAI />}
            etiquette="Apprendre"
            titre="PolyFinance AI"
            description="Éducation financière, assistant IA et outils — pour étudiants et particuliers."
            points={["Assistant IA et 5 agents spécialisés", "Calculateurs : épargne, crédit, BRVM, intérêts composés", "Contenus pensés pour l'Afrique francophone"]}
            cta="Accéder à PolyFinance AI"
            onClick={() => onChoisirIA("home")}
            delai={0}
          />
          <CarteEspace
            icone={<IconeGF />}
            etiquette="Gérer"
            titre="PolyFinance GF"
            description="Gestion clients, paiements et créances — pour entreprises, commerces et restaurants."
            points={["Caisse, tickets et impression", "Stock, dépenses et créances échelonnées", "Tableau de bord et exports CSV"]}
            cta="Accéder à PolyFinance GF"
            onClick={onChoisirGF}
            delai={100}
          />
        </div>
      </section>

      {/* ---------- LES MODULES ---------- */}
      <section style={{ ...largeur, padding: "44px 20px 40px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
          <div>
            <div style={{ color: C.teal, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Explorer</div>
            <h2 style={{ margin: 0, color: C.navy, fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.02em" }}>Les modules</h2>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="pf-fleche-rail" aria-label="Précédent" onClick={() => defiler(-1)}>←</button>
            <button className="pf-fleche-rail" aria-label="Suivant" onClick={() => defiler(1)}>→</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 18, marginBottom: 14, fontSize: "0.78rem", color: C.textMuted, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: C.navy }} />PolyFinance AI</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: C.orange }} />PolyFinance GF</span>
        </div>

        <div className="pf-rail" ref={rail}>
          {MODULES.map(m => {
            const estIA = m.espace === "ia";
            return (
              <button key={m.label} className="pf-tuile" onClick={() => (estIA ? onChoisirIA(m.page) : onChoisirGF())}>
                <div style={{ height: 96, display: "flex", alignItems: "center", justifyContent: "center", background: estIA ? `linear-gradient(160deg,${C.navy}12,${C.teal}14)` : `linear-gradient(160deg,${C.orange}14,${C.teal}12)`, color: estIA ? C.navy : C.orange }}>
                  <Pictogramme nom={m.icone} taille={38} />
                </div>
                <div style={{ padding: "12px 14px", flex: 1 }}>
                  <div style={{ fontWeight: 800, color: C.navy, fontSize: "0.95rem" }}>{m.label}</div>
                  <div style={{ color: C.textMuted, fontSize: "0.78rem", lineHeight: 1.4, marginTop: 4 }}>{m.sous}</div>
                </div>
                <div style={{ background: estIA ? C.navy : C.orange, color: C.white, fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "8px 14px" }}>
                  {estIA ? "PolyFinance AI" : "PolyFinance GF"}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <footer style={{ textAlign: "center", padding: "6px 20px 28px", color: C.textMuted, fontSize: "0.74rem" }}>
        Conçu à Bouaké pour l'Afrique francophone · © PolyFinance
      </footer>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("landing");
  const [verifieSession, setVerifieSession] = useState(false);
  const [activeAgent, setActiveAgent] = useState("chat");
  const [activeTool, setActiveTool] = useState("composes");
  const [chats, setChats] = useState({ chat: [], script: [], recherche: [], brainstorming: [], revision: [] });
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const bottomRefChat = useRef(null);

  const currentMessages = chats[activeAgent] || [];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setPage("gf");
      setVerifieSession(true);
    });
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chats, loading]);
  useEffect(() => { bottomRefChat.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages, loading]);

  const sendMessage = async (text, isDirectChat = false) => {
    const userMsg = { role: "user", content: text };
    if (isDirectChat) {
      setChatMessages(prev => [...prev, userMsg]);
      setLoading(true);
      try {
        const res = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ agentType: "chat", messages: [...chatMessages, userMsg] }) });
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: "assistant", content: data.content?.[0]?.text || "Erreur de réponse." }]);
      } catch { setChatMessages(prev => [...prev, { role: "assistant", content: "Erreur de connexion." }]); }
      setLoading(false);
      return;
    }
    setChats(prev => ({ ...prev, [activeAgent]: [...prev[activeAgent], userMsg] }));
    setLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ agentType: activeAgent, messages: [...chats[activeAgent], userMsg] }) });
      const data = await res.json();
      setChats(prev => ({ ...prev, [activeAgent]: [...prev[activeAgent], userMsg, { role: "assistant", content: data.content?.[0]?.text || "Erreur de réponse." }] }));
    } catch { setChats(prev => ({ ...prev, [activeAgent]: [...prev[activeAgent], userMsg, { role: "assistant", content: "Erreur de connexion." }] })); }
    setLoading(false);
  };

  const agent = AGENTS.find(a => a.id === activeAgent);
  const toolComposants = { composes: Composes, epargne: Epargne, brvm: BRVM, credit: Credit, objectif: Objectif };
  const ActiveTool = toolComposants[activeTool];

  if (!verifieSession) {
    return <div style={{ minHeight: "100vh", background: C.navyDark }} />;
  }

  if (page === "landing") {
    return <Landing onChoisirIA={(p) => setPage(typeof p === "string" ? p : "home")} onChoisirGF={() => setPage("gf")} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter',sans-serif", maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column" }}>
      <style>{`@keyframes db{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}*{box-sizing:border-box}body{margin:0}`}</style>

      {page !== "gf" && (
        <div style={{ background: `linear-gradient(135deg,${C.navyDark},${C.navy})`, padding: "14px 16px 10px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div onClick={() => setPage("landing")} style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
              <Logo s={30} />
              <div>
                <div style={{ color: C.white, fontWeight: 700, fontSize: "1rem" }}>Poly Finance AI</div>
                <div style={{ color: C.tealLight, fontSize: "0.65rem" }}>Finance africaine · 5 agents IA</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 5, overflowX: "auto" }}>
              {[["home","Accueil"],["chat","Chat"],["agents","Agents"],["outils","Outils"],["fondateur","Fondateur"]].map(([p,label]) => (
                <button key={p} onClick={() => setPage(p)} style={{ background: page === p ? C.teal : "rgba(255,255,255,0.1)", border: "none", borderRadius: 7, padding: "5px 9px", color: C.white, fontSize: "0.70rem", cursor: "pointer", fontWeight: page === p ? 700 : 400, flexShrink: 0 }}>{label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {page !== "gf" && page !== "landing" && (
        <div style={{ background: C.bg, padding: "8px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <BoutonRetourMenu onClick={() => setPage("landing")} />
        </div>
      )}

      {page === "home" && (
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          <div style={{ textAlign: "center", padding: "24px 0 20px" }}>
            <Logo s={52} />
            <div style={{ color: C.navy, fontWeight: 800, fontSize: "1.3rem", marginTop: 10 }}>Poly Finance AI</div>
            <div style={{ color: C.textMuted, fontSize: "0.8rem", marginTop: 4 }}>Premier assistant financier IA pour l'Afrique francophone</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            {S.map((s, i) => (
              <button key={i} onClick={() => { setPage("chat"); setTimeout(() => sendMessage(s.q, true), 100); }}
                style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 10px", cursor: "pointer", textAlign: "left" }}>
                <div style={{ fontSize: "1.4rem" }}>{s.icon}</div>
                <div style={{ color: C.navy, fontWeight: 600, fontSize: "0.78rem", marginTop: 4 }}>{s.label}</div>
              </button>
            ))}
          </div>
          <button onClick={() => setPage("outils")} style={{ width: "100%", padding: "12px", background: `linear-gradient(135deg,${C.orange},#f59e0b)`, border: "none", borderRadius: 13, color: C.white, fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", marginBottom: 10 }}>
            🧮 Outils Financiers
          </button>
          <button onClick={() => setPage("agents")} style={{ width: "100%", padding: "12px", background: `linear-gradient(135deg,${C.teal},${C.tealLight})`, border: "none", borderRadius: 13, color: C.white, fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>
            🤖 Accéder aux 5 Agents IA
          </button>
        </div>
      )}

      {page === "chat" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
            {chatMessages.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: C.textMuted }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>🤖</div>
                <div style={{ fontWeight: 600, color: C.navy, marginBottom: 6 }}>Poly Finance AI</div>
                <div style={{ fontSize: "0.8rem" }}>Pose-moi n'importe quelle question financière</div>
              </div>
            )}
            {chatMessages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
                <div style={{ maxWidth: "82%", background: m.role === "user" ? `linear-gradient(135deg,${C.teal},${C.tealLight})` : C.white, color: m.role === "user" ? C.white : C.text, borderRadius: m.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px", padding: "9px 13px", fontSize: "0.83rem", lineHeight: 1.5, border: m.role === "user" ? "none" : `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  {m.role === "assistant" ? <F text={m.content} /> : m.content}
                </div>
              </div>
            ))}
            {loading && page === "chat" && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "14px 14px 14px 3px", padding: "10px 14px" }}><Dots /></div>
              </div>
            )}
            <div ref={bottomRefChat} />
          </div>
          <Input onSend={(t) => sendMessage(t, true)} placeholder="Posez votre question financière..." />
        </div>
      )}

      {page === "agents" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, overflowX: "auto", flexShrink: 0 }}>
            <div style={{ display: "flex", padding: "8px 10px", gap: 6, minWidth: "max-content" }}>
              {AGENTS.map(a => (
                <button key={a.id} onClick={() => setActiveAgent(a.id)}
                  style={{ background: activeAgent === a.id ? `linear-gradient(135deg,${C.teal},${C.tealLight})` : C.bg, border: `1px solid ${activeAgent === a.id ? C.teal : C.border}`, borderRadius: 10, padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                  <span style={{ fontSize: "0.9rem" }}>{a.icon}</span>
                  <span style={{ color: activeAgent === a.id ? C.white : C.text, fontWeight: 600, fontSize: "0.75rem" }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ background: `linear-gradient(135deg,${C.navy}15,${C.teal}10)`, padding: "8px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            <div style={{ fontSize: "0.75rem", color: C.navy, fontWeight: 600 }}>{agent?.icon} {agent?.label} — <span style={{ color: C.textMuted, fontWeight: 400 }}>{agent?.desc}</span></div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
            {currentMessages.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: C.textMuted }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>{agent?.icon}</div>
                <div style={{ fontWeight: 600, color: C.navy, marginBottom: 6 }}>{agent?.label}</div>
                <div style={{ fontSize: "0.8rem" }}>{agent?.desc}</div>
              </div>
            )}
            {currentMessages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
                <div style={{ maxWidth: "82%", background: m.role === "user" ? `linear-gradient(135deg,${C.teal},${C.tealLight})` : C.white, color: m.role === "user" ? C.white : C.text, borderRadius: m.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px", padding: "9px 13px", fontSize: "0.83rem", lineHeight: 1.5, border: m.role === "user" ? "none" : `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  {m.role === "assistant" ? <F text={m.content} /> : m.content}
                </div>
              </div>
            ))}
            {loading && page === "agents" && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "14px 14px 14px 3px", padding: "10px 14px" }}><Dots /></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <Input onSend={sendMessage} placeholder={agent?.placeholder} />
        </div>
      )}

      {page === "outils" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, overflowX: "auto", flexShrink: 0 }}>
            <div style={{ display: "flex", padding: "8px 10px", gap: 6, minWidth: "max-content" }}>
              {TOOLS.map(t => (
                <button key={t.id} onClick={() => setActiveTool(t.id)}
                  style={{ background: activeTool === t.id ? `linear-gradient(135deg,${C.orange},#f59e0b)` : C.bg, border: `1px solid ${activeTool === t.id ? C.orange : C.border}`, borderRadius: 10, padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                  <span style={{ fontSize: "0.9rem" }}>{t.emoji}</span>
                  <span style={{ color: activeTool === t.id ? C.white : C.text, fontWeight: 600, fontSize: "0.75rem" }}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            <ActiveTool />
          </div>
        </div>
      )}

      {page === "gf" && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ background: C.navyDark, padding: "10px 16px" }}>
            <BoutonRetourMenu onClick={() => setPage("landing")} sombre />
          </div>
          <PolyFinanceGF />
        </div>
      )}

      {page === "fondateur" && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          <Fondateur />
        </div>
      )}

    </div>
  );
}
