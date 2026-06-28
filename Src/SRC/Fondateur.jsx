import { useState } from "react";

const twitterX = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.265 5.634L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
);

const tiktokIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
  </svg>
);

const globeIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

const stats = [
  { value: "Master 2", label: "CAC · UAO Bouaké · 2025" },
  { value: "2024", label: "Prix d'Excellence CROU" },
  { value: "5", label: "Agents IA intégrés" },
];

const timeline = [
  {
    period: "Aujourd'hui",
    title: "Fondateur de Poly Finance",
    desc: "Plateforme d'éducation financière IA pour l'Afrique francophone — 5 agents, entièrement gratuite.",
  },
  {
    period: "2024",
    title: "Prix d'Excellence CROU-Bouaké",
    desc: "Reconnaissance académique nationale pour résultats exceptionnels en Master.",
  },
  {
    period: "2025",
    title: "Master 2 CAC · UAO Bouaké",
    desc: "Comptabilité, Audit et Contrôle. Spécialisation en finance d'entreprise et marchés UEMOA.",
  },
  {
    period: "En parallèle",
    title: "Créateur de contenu finance · TikTok",
    desc: "Vulgarisation financière pour la jeunesse africaine francophone.",
  },
];

export default function Fondateur() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("polyfinance.vercel.app");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.page}>
      {/* ── HERO ── */}
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.avatarWrap}>
            <div style={styles.avatarRing} />
            <div style={styles.avatar}>
              <img
                src="data:image/jpeg;base64,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"
                alt="Amazou Emmanuel - Stony"
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
              />
            </div>
            <span style={styles.badge}>Fondateur</span>
          </div>

          <div style={styles.heroText}>
            <p style={styles.eyebrow}>À propos du fondateur</p>
            <h1 style={styles.name}>Amazou Emmanuel</h1>
            <p style={styles.alias}>alias <strong>Stony</strong></p>
            <p style={styles.tagline}>
              Étudiant, entrepreneur & créateur — qui construit depuis Bouaké
              pour l'Afrique francophone.
            </p>

            <div style={styles.links}>
              <a
                href="https://www.tiktok.com/@polyfinance"
                target="_blank"
                rel="noreferrer"
                style={styles.linkBtn}
              >
                {tiktokIcon}
                @polyfinance
              </a>
              <button onClick={handleCopy} style={styles.linkBtnGhost}>
                {globeIcon}
                {copied ? "Copié !" : "polyfinance.vercel.app"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={styles.statsBar}>
          {stats.map((s, i) => (
            <div key={i} style={styles.statItem}>
              <span style={styles.statValue}>{s.value}</span>
              <span style={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── STORY ── */}
      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionTitle}>Pourquoi Poly Finance ?</h2>
          <div style={styles.storyGrid}>
            <blockquote style={styles.pullQuote}>
              "L'éducation financière en Afrique ne devrait pas dépendre d'exemples pris à Wall Street."
            </blockquote>
            <div style={styles.storyText}>
              <p style={styles.para}>
                Tout est parti d'un constat simple : en Afrique francophone,
                comprendre la finance ça s'apprend dans des livres écrits pour
                Paris ou New York. Les outils numériques sont en anglais, les
                exemples parlent de marchés qui ne ressemblent pas à notre
                réalité UEMOA, et les frais bancaires n'ont rien à voir avec ce
                qu'on vit avec Wave ou Orange Money.
              </p>
              <p style={styles.para}>
                J'ai grandi dans cette réalité. Alors plutôt que d'attendre
                qu'un grand groupe vienne régler ça, j'ai décidé de construire
                la solution moi-même — avec l'IA, depuis Bouaké, pour nous.
              </p>
              <p style={styles.para}>
                La jeunesse africaine n'a pas besoin qu'on lui explique la
                finance avec des exemples de New York. Elle a besoin d'outils
                pensés pour elle, accessibles, en français, maintenant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section style={{ ...styles.section, background: "var(--surface)" }}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionTitle}>Mon parcours</h2>
          <div style={styles.timeline}>
            {timeline.map((t, i) => (
              <div key={i} style={styles.timelineItem}>
                <div style={styles.timelineDot} />
                <div style={styles.timelineContent}>
                  <span style={styles.timelinePeriod}>{t.period}</span>
                  <h3 style={styles.timelineTitle}>{t.title}</h3>
                  <p style={styles.timelineDesc}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VISION ── */}
      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionTitle}>Ma vision</h2>
          <div style={styles.visionCard}>
            <p style={styles.visionText}>
              Faire de Poly Finance la plateforme de référence en éducation
              financière pour l'Afrique francophone. Pas une copie de ce qui
              existe ailleurs — quelque chose de local, de concret, construit
              pour notre contexte, notre génération, nos ambitions.
            </p>
            <div style={styles.visionAccent} />
          </div>
        </div>
      </section>

      <style>{`
        :root {
          --bg: #0b0f1a;
          --surface: #111827;
          --card: #1a2235;
          --accent: #3b82f6;
          --accent2: #06b6d4;
          --text: #f1f5f9;
          --muted: #94a3b8;
          --border: #1e293b;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "'Inter', sans-serif",
    background: "#0b0f1a",
    color: "#f1f5f9",
    minHeight: "100vh",
  },

  /* HERO */
  hero: {
    background: "linear-gradient(160deg, #0b0f1a 0%, #0f1e38 100%)",
    borderBottom: "1px solid #1e293b",
    padding: "60px 24px 0",
  },
  heroInner: {
    maxWidth: 760,
    margin: "0 auto",
    display: "flex",
    gap: 36,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  avatarWrap: {
    position: "relative",
    flexShrink: 0,
  },
  avatarRing: {
    position: "absolute",
    inset: -4,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
    zIndex: 0,
  },
  avatar: {
    position: "relative",
    zIndex: 1,
    width: 96,
    height: 96,
    borderRadius: "50%",
    background: "#1a2235",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "3px solid #0b0f1a",
  },
  avatarInitials: {
    fontFamily: "'Sora', sans-serif",
    fontSize: 28,
    fontWeight: 800,
    background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  badge: {
    position: "absolute",
    bottom: -8,
    left: "50%",
    transform: "translateX(-50%)",
    background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
    color: "#fff",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "3px 10px",
    borderRadius: 99,
    whiteSpace: "nowrap",
  },
  heroText: {
    flex: 1,
    minWidth: 220,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#3b82f6",
    marginBottom: 8,
  },
  name: {
    fontFamily: "'Sora', sans-serif",
    fontSize: 36,
    fontWeight: 800,
    lineHeight: 1.1,
    color: "#f1f5f9",
  },
  alias: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 16,
    color: "#cbd5e1",
    lineHeight: 1.6,
    marginBottom: 24,
    maxWidth: 480,
  },
  links: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  linkBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
    color: "#fff",
    fontWeight: 600,
    fontSize: 13,
    padding: "10px 18px",
    borderRadius: 8,
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
  },
  linkBtnGhost: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "transparent",
    color: "#94a3b8",
    fontWeight: 600,
    fontSize: 13,
    padding: "10px 18px",
    borderRadius: 8,
    border: "1px solid #1e293b",
    cursor: "pointer",
  },

  /* STATS */
  statsBar: {
    maxWidth: 760,
    margin: "40px auto 0",
    display: "flex",
    borderTop: "1px solid #1e293b",
  },
  statItem: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px 8px",
    borderRight: "1px solid #1e293b",
  },
  statValue: {
    fontFamily: "'Sora', sans-serif",
    fontSize: 22,
    fontWeight: 800,
    background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
    textAlign: "center",
    letterSpacing: "0.04em",
  },

  /* SECTIONS */
  section: {
    padding: "72px 24px",
  },
  sectionInner: {
    maxWidth: 760,
    margin: "0 auto",
  },
  sectionTitle: {
    fontFamily: "'Sora', sans-serif",
    fontSize: 26,
    fontWeight: 800,
    color: "#f1f5f9",
    marginBottom: 36,
  },

  /* STORY */
  storyGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: 40,
    alignItems: "start",
  },
  pullQuote: {
    fontFamily: "'Sora', sans-serif",
    fontSize: 17,
    fontWeight: 700,
    color: "#3b82f6",
    lineHeight: 1.5,
    borderLeft: "3px solid #3b82f6",
    paddingLeft: 16,
    fontStyle: "normal",
  },
  storyText: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  para: {
    fontSize: 15,
    color: "#cbd5e1",
    lineHeight: 1.75,
  },

  /* TIMELINE */
  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    borderLeft: "2px solid #1e293b",
    paddingLeft: 24,
  },
  timelineItem: {
    position: "relative",
    paddingBottom: 32,
  },
  timelineDot: {
    position: "absolute",
    left: -31,
    top: 6,
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
    border: "2px solid #0b0f1a",
  },
  timelineContent: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  timelinePeriod: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#3b82f6",
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#f1f5f9",
  },
  timelineDesc: {
    fontSize: 14,
    color: "#94a3b8",
    lineHeight: 1.6,
  },

  /* VISION */
  visionCard: {
    background: "#111827",
    border: "1px solid #1e293b",
    borderRadius: 16,
    padding: 40,
    position: "relative",
    overflow: "hidden",
  },
  visionText: {
    fontSize: 18,
    lineHeight: 1.8,
    color: "#e2e8f0",
    position: "relative",
    zIndex: 1,
    maxWidth: 600,
  },
  visionAccent: {
    position: "absolute",
    right: -40,
    bottom: -40,
    width: 200,
    height: 200,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
  },
};

    
    
