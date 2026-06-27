import { useState, useRef, useEffect } from "react";

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

// ─── Formatage ───────────────────────────────────────────────────────────────
function formater(v) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(v)) + " FCFA";
}

// ─── Composants calculateurs ─────────────────────────────────────────────────
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

// ─── Autres composants ───────────────────────────────────────────────────────
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

// ─── App principale ───────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [activeAgent, setActiveAgent] = useState("chat");
  const [activeTool, setActiveTool] = useState("composes");
  const [chats, setChats] = useState({ chat: [], script: [], recherche: [], brainstorming: [], revision: [] });
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const bottomRefChat = useRef(null);

  const currentMessages = chats[activeAgent] || [];

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

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter',sans-serif", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column" }}>
      <style>{`@keyframes db{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}*{box-sizing:border-box}body{margin:0}`}</style>

      {/* HEADER */}
      <div style={{ background: `linear-gradient(135deg,${C.navyDark},${C.navy})`, padding: "14px 16px 10px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <Logo s={30} />
            <div>
              <div style={{ color: C.white, fontWeight: 700, fontSize: "1rem" }}>Poly Finance AI</div>
              <div style={{ color: C.tealLight, fontSize: "0.65rem" }}>Finance africaine · 5 agents IA</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {[["home","Accueil"],["chat","Chat"],["agents","Agents"],["outils","Outils"]].map(([p,label]) => (
              <button key={p} onClick={() => setPage(p)} style={{ background: page === p ? C.teal : "rgba(255,255,255,0.1)", border: "none", borderRadius: 7, padding: "5px 9px", color: C.white, fontSize: "0.70rem", cursor: "pointer", fontWeight: page === p ? 700 : 400 }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* PAGE ACCUEIL */}
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

      {/* PAGE CHAT */}
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

      {/* PAGE AGENTS */}
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

      {/* PAGE OUTILS */}
      {page === "outils" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          {/* Onglets outils */}
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
          {/* Contenu calculateur */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            <ActiveTool />
          </div>
        </div>
      )}
    </div>
  );
}
