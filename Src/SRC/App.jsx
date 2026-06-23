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

export default function App() {
  const [page, setPage] = useState("home");
  const [activeAgent, setActiveAgent] = useState("chat");
  const [chats, setChats] = useState({
    chat: [], script: [], recherche: [], brainstorming: [], revision: []
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const bottomRefChat = useRef(null);

  const currentMessages = chats[activeAgent] || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, loading]);

  useEffect(() => {
    bottomRefChat.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, loading]);

  const sendMessage = async (text, isDirectChat = false) => {
    const userMsg = { role: "user", content: text };

    if (isDirectChat) {
      setChatMessages(prev => [...prev, userMsg]);
      setLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ agentType: "chat", messages: [...chatMessages, userMsg] })
        });
        const data = await res.json();
        const reply = data.content?.[0]?.text || "Erreur de réponse.";
        setChatMessages(prev => [...prev, { role: "assistant", content: reply }]);
      } catch {
        setChatMessages(prev => [...prev, { role: "assistant", content: "Erreur de connexion." }]);
      }
      setLoading(false);
      return;
    }

    setChats(prev => ({ ...prev, [activeAgent]: [...prev[activeAgent], userMsg] }));
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ agentType: activeAgent, messages: [...chats[activeAgent], userMsg] })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Erreur de réponse.";
      setChats(prev => ({ ...prev, [activeAgent]: [...prev[activeAgent], userMsg, { role: "assistant", content: reply }] }));
    } catch {
      setChats(prev => ({ ...prev, [activeAgent]: [...prev[activeAgent], userMsg, { role: "assistant", content: "Erreur de connexion." }] }));
    }
    setLoading(false);
  };

  const agent = AGENTS.find(a => a.id === activeAgent);

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
            {[["home","Accueil"],["chat","Chat"],["agents","Agents"]].map(([p,label]) => (
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {S.map((s, i) => (
              <button key={i} onClick={() => { setPage("chat"); setTimeout(() => sendMessage(s.q, true), 100); }}
                style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 10px", cursor: "pointer", textAlign: "left" }}>
                <div style={{ fontSize: "1.4rem" }}>{s.icon}</div>
                <div style={{ color: C.navy, fontWeight: 600, fontSize: "0.78rem", marginTop: 4 }}>{s.label}</div>
              </button>
            ))}
          </div>
          <button onClick={() => setPage("agents")} style={{ width: "100%", padding: "13px", background: `linear-gradient(135deg,${C.teal},${C.tealLight})`, border: "none", borderRadius: 13, color: C.white, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>
            🤖 Accéder aux 5 Agents IA
          </button>
        </div>
      )}

      {/* PAGE CHAT DIRECT */}
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
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "14px 14px 14px 3px", padding: "10px 14px" }}>
                  <Dots />
                </div>
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
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "14px 14px 14px 3px", padding: "10px 14px" }}>
                  <Dots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <Input onSend={sendMessage} placeholder={agent?.placeholder} />
        </div>
      )}
    </div>
  );
}


  
              
