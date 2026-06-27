import { useState } from "react";

const TOOLS = [
  { id: "composes", label: "Intérêts composés", emoji: "📈" },
  { id: "epargne", label: "Capacité d'épargne", emoji: "💰" },
  { id: "brvm", label: "Rendement BRVM", emoji: "📊" },
  { id: "credit", label: "Coût réel crédit", emoji: "🏦" },
  { id: "objectif", label: "Objectif épargne", emoji: "🎯" },
];

function formater(v) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(v)) + " FCFA";
}

// ─── 1. Intérêts composés ───────────────────────────────────────────────────
function Composes() {
  const [capital, setCapital] = useState("");
  const [taux, setTaux] = useState("");
  const [duree, setDuree] = useState("");
  const [res, setRes] = useState(null);

  function calculer() {
    const C = parseFloat(capital), r = parseFloat(taux) / 100, n = parseInt(duree);
    if (!C || !r || !n) return;
    const final = C * Math.pow(1 + r, n);
    setRes({ final, interets: final - C });
  }

  return (
    <div>
      <p style={styles.desc}>Combien vaut ton argent après N ans avec des intérêts qui s'accumulent ?</p>
      <Input label="Capital initial (FCFA)" value={capital} onChange={setCapital} placeholder="ex: 500 000" />
      <Input label="Taux annuel (%)" value={taux} onChange={setTaux} placeholder="ex: 8" />
      <Input label="Durée (années)" value={duree} onChange={setDuree} placeholder="ex: 10" />
      <Btn onClick={calculer} />
      {res && (
        <Resultat principal={formater(res.final)} label="Montant final">
          <Ligne titre="Capital de départ" valeur={formater(parseFloat(capital))} />
          <Ligne titre="Intérêts gagnés" valeur={formater(res.interets)} vert />
        </Resultat>
      )}
    </div>
  );
}

// ─── 2. Capacité d'épargne mensuelle ───────────────────────────────────────
function Epargne() {
  const [revenus, setRevenus] = useState("");
  const [depenses, setDepenses] = useState("");
  const [res, setRes] = useState(null);

  function calculer() {
    const R = parseFloat(revenus), D = parseFloat(depenses);
    if (!R || !D) return;
    const capacite = R - D;
    const taux = (capacite / R) * 100;
    setRes({ capacite, taux });
  }

  return (
    <div>
      <p style={styles.desc}>Combien peux-tu mettre de côté chaque mois selon tes revenus et dépenses ?</p>
      <Input label="Revenus mensuels (FCFA)" value={revenus} onChange={setRevenus} placeholder="ex: 150 000" />
      <Input label="Dépenses mensuelles (FCFA)" value={depenses} onChange={setDepenses} placeholder="ex: 100 000" />
      <Btn onClick={calculer} />
      {res && (
        <Resultat
          principal={formater(Math.max(0, res.capacite))}
          label="Épargne possible / mois"
          alerte={res.capacite <= 0 ? "⚠️ Tes dépenses dépassent tes revenus" : null}
        >
          <Ligne titre="Taux d'épargne" valeur={res.taux.toFixed(1) + "%"} vert={res.taux >= 20} />
          <Ligne titre="Conseillé" valeur="≥ 20%" />
        </Resultat>
      )}
    </div>
  );
}

// ─── 3. Rendement BRVM ─────────────────────────────────────────────────────
function BRVM() {
  const [prixAchat, setPrixAchat] = useState("");
  const [prixVente, setPrixVente] = useState("");
  const [dividende, setDividende] = useState("");
  const [duree, setDuree] = useState("");
  const [res, setRes] = useState(null);

  function calculer() {
    const pa = parseFloat(prixAchat), pv = parseFloat(prixVente);
    const div = parseFloat(dividende) || 0, n = parseInt(duree) || 1;
    if (!pa || !pv) return;
    const plusValue = pv - pa;
    const gainTotal = plusValue + div;
    const rendement = (gainTotal / pa) * 100;
    const rendementAnnuel = rendement / n;
    setRes({ plusValue, gainTotal, rendement, rendementAnnuel });
  }

  return (
    <div>
      <p style={styles.desc}>Calcule ton rendement réel sur une action BRVM (plus-value + dividendes).</p>
      <Input label="Prix d'achat / action (FCFA)" value={prixAchat} onChange={setPrixAchat} placeholder="ex: 12 500" />
      <Input label="Prix de vente / action (FCFA)" value={prixVente} onChange={setPrixVente} placeholder="ex: 15 000" />
      <Input label="Dividendes reçus / action (FCFA)" value={dividende} onChange={setDividende} placeholder="ex: 500 (optionnel)" />
      <Input label="Durée de détention (années)" value={duree} onChange={setDuree} placeholder="ex: 2" />
      <Btn onClick={calculer} />
      {res && (
        <Resultat principal={res.rendement.toFixed(2) + "%"} label="Rendement total">
          <Ligne titre="Plus-value" valeur={formater(res.plusValue)} vert={res.plusValue > 0} />
          <Ligne titre="Gain total" valeur={formater(res.gainTotal)} vert />
          <Ligne titre="Rendement annuel" valeur={res.rendementAnnuel.toFixed(2) + "%"} />
        </Resultat>
      )}
    </div>
  );
}

// ─── 4. Coût réel d'un crédit ──────────────────────────────────────────────
function Credit() {
  const [montant, setMontant] = useState("");
  const [taux, setTaux] = useState("");
  const [duree, setDuree] = useState("");
  const [res, setRes] = useState(null);

  function calculer() {
    const P = parseFloat(montant), r = parseFloat(taux) / 100 / 12, n = parseInt(duree);
    if (!P || !r || !n) return;
    const mensualite = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalRembourse = mensualite * n;
    const coutTotal = totalRembourse - P;
    setRes({ mensualite, totalRembourse, coutTotal });
  }

  return (
    <div>
      <p style={styles.desc}>Combien ce crédit te coûte vraiment au total, au-delà du capital emprunté ?</p>
      <Input label="Montant emprunté (FCFA)" value={montant} onChange={setMontant} placeholder="ex: 1 000 000" />
      <Input label="Taux annuel (%)" value={taux} onChange={setTaux} placeholder="ex: 12" />
      <Input label="Durée (mois)" value={duree} onChange={setDuree} placeholder="ex: 24" />
      <Btn onClick={calculer} />
      {res && (
        <Resultat principal={formater(res.mensualite)} label="Mensualité">
          <Ligne titre="Total remboursé" valeur={formater(res.totalRembourse)} />
          <Ligne titre="Coût des intérêts" valeur={formater(res.coutTotal)} rouge />
        </Resultat>
      )}
    </div>
  );
}

// ─── 5. Objectif épargne ───────────────────────────────────────────────────
function Objectif() {
  const [cible, setCible] = useState("");
  const [actuel, setActuel] = useState("");
  const [taux, setTaux] = useState("");
  const [duree, setDuree] = useState("");
  const [res, setRes] = useState(null);

  function calculer() {
    const FV = parseFloat(cible), PV = parseFloat(actuel) || 0;
    const r = parseFloat(taux) / 100 / 12, n = parseInt(duree);
    if (!FV || !n) return;
    const FV_actuel = PV * Math.pow(1 + r, n);
    const reste = FV - FV_actuel;
    const mensualite = r > 0
      ? (reste * r) / (Math.pow(1 + r, n) - 1)
      : reste / n;
    setRes({ mensualite: Math.max(0, mensualite), FV_actuel });
  }

  return (
    <div>
      <p style={styles.desc}>Combien épargner chaque mois pour atteindre ton objectif en FCFA ?</p>
      <Input label="Objectif à atteindre (FCFA)" value={cible} onChange={setCible} placeholder="ex: 5 000 000" />
      <Input label="Épargne déjà disponible (FCFA)" value={actuel} onChange={setActuel} placeholder="ex: 200 000 (optionnel)" />
      <Input label="Taux de placement annuel (%)" value={taux} onChange={setTaux} placeholder="ex: 5" />
      <Input label="Délai pour atteindre l'objectif (mois)" value={duree} onChange={setDuree} placeholder="ex: 36" />
      <Btn onClick={calculer} />
      {res && (
        <Resultat principal={formater(res.mensualite)} label="À épargner / mois">
          <Ligne titre="Valeur future de ton épargne actuelle" valeur={formater(res.FV_actuel)} vert />
        </Resultat>
      )}
    </div>
  );
}

// ─── UI Components ──────────────────────────────────────────────────────────
function Input({ label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={styles.label}>{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />
    </div>
  );
}

function Btn({ onClick }) {
  return (
    <button onClick={onClick} style={styles.btn}>Calculer</button>
  );
}

function Resultat({ principal, label, children, alerte }) {
  return (
    <div style={styles.resultat}>
      {alerte && <div style={styles.alerte}>{alerte}</div>}
      <p style={styles.resultatLabel}>{label.toUpperCase()}</p>
      <p style={styles.resultatPrincipal}>{principal}</p>
      <div style={styles.lignes}>{children}</div>
    </div>
  );
}

function Ligne({ titre, valeur, vert, rouge }) {
  return (
    <div style={styles.ligne}>
      <span style={{ color: "#94a3b8", fontSize: 12 }}>{titre}</span>
      <span style={{ color: rouge ? "#f87171" : vert ? "#10b981" : "#fff", fontWeight: 600, fontSize: 14 }}>{valeur}</span>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = {
  desc: { color: "#94a3b8", fontSize: 13, marginBottom: 20, lineHeight: 1.5 },
  label: { color: "#cbd5e1", fontSize: 13, display: "block", marginBottom: 6 },
  input: {
    width: "100%", padding: "11px 14px", boxSizing: "border-box",
    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10, color: "#fff", fontSize: 15, outline: "none"
  },
  btn: {
    width: "100%", padding: 14, marginBottom: 20,
    background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
    border: "none", borderRadius: 12, color: "#fff",
    fontSize: 15, fontWeight: 600, cursor: "pointer"
  },
  resultat: {
    background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.25)",
    borderRadius: 14, padding: 20, textAlign: "center"
  },
  resultatLabel: { color: "#94a3b8", fontSize: 11, letterSpacing: 1, margin: "0 0 4px", textTransform: "uppercase" },
  resultatPrincipal: { color: "#3b82f6", fontSize: 30, fontWeight: 700, margin: "0 0 16px" },
  lignes: { borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 },
  ligne: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  alerte: { background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 8, padding: "8px 12px", color: "#fbbf24", fontSize: 13, marginBottom: 12 }
};

// ─── App principale ──────────────────────────────────────────────────────────
export default function CalculateursFinance() {
  const [actif, setActif] = useState("composes");

  const composants = { composes: Composes, epargne: Epargne, brvm: BRVM, credit: Credit, objectif: Objectif };
  const Actif = composants[actif];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
      fontFamily: "'Segoe UI', sans-serif",
      padding: "20px 16px"
    }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{ color: "#fff", fontSize: 22, margin: "0 0 4px" }}>Outils Financiers</h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>Poly Finance</p>
        </div>

        {/* Onglets scrollables */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 24, paddingBottom: 4 }}>
          {TOOLS.map(t => (
            <button
              key={t.id}
              onClick={() => setActif(t.id)}
              style={{
                flexShrink: 0,
                padding: "8px 14px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                background: actif === t.id ? "linear-gradient(135deg, #3b82f6, #06b6d4)" : "rgba(255,255,255,0.07)",
                color: actif === t.id ? "#fff" : "#94a3b8",
                whiteSpace: "nowrap"
              }}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* Calculateur actif */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 20,
          padding: 24
        }}>
          <Actif />
        </div>
      </div>
    </div>
  );
}
