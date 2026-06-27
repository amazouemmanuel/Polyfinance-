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
              <span style={styles.avatarInitials}>SE</span>
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
