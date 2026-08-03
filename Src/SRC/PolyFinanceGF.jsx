import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";

const C = {
  navy: "#1B4D6E", navyDark: "#0F2E42", navyLight: "#245f85",
  teal: "#2AABAA", tealLight: "#3ECFCE", orange: "#F47B2A",
  bg: "#F5F8FA", white: "#FFFFFF", text: "#1a2a35",
  textMuted: "#6B8FA8", border: "rgba(27,77,110,0.12)",
  red: "#ef4444", green: "#10b981", amber: "#f59e0b"
};

const ADMIN_EMAIL = "amazouemmanuel274@gmail.com";

const PLANS = [
  { id: "gratuit", nom: "Gratuit", prix: "0 F", periode: "2 jours d'essai", jours: 2 },
  { id: "premium", nom: "Premium", prix: "8 000 F", periode: "/ 30 jours", jours: 30 },
];

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
  const map = { vert: C.green, rouge: C.red, ambre: C.amber, gris: C.textMuted };
  const c = map[color] || C.textMuted;
  return <span style={{ fontSize: "0.68rem", fontWeight: 700, color: c, background: `${c}18`, padding: "3px 8px", borderRadius: 20 }}>{text}</span>;
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
    <div style={{ padding: 20 }}>
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
// ÉCRAN : Inscription (infos + choix du plan)
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
  const pretEtape1 = nomEntreprise && ville && responsable && telephone && emailValide && motDePasse.length >= 6 && motDePasse === confirmMotDePasse;

  const creerCompte = async () => {
    setErreur("");
    setChargement(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password: motDePasse });
    if (authError) {
      setChargement(false);
      setErreur(authError.message.includes("already registered") ? "Cet email a déjà un compte." : "Erreur : " + authError.message);
      return;
    }

    const planChoisi = PLANS.find(p => p.id === plan);
    const statutInitial = plan === "gratuit" ? "Gratuit" : "En attente";
    const dateExpiration = plan === "gratuit" ? ajouterJours(new Date().toISOString().slice(0, 10), planChoisi.jours) : null;

    const { error: dbError } = await supabase.from("entreprises").insert({
      auth_user_id: authData.user.id,
      nom: nomEntreprise,
      ville,
      responsable,
      telephone,
      email,
      plan,
      statut: statutInitial,
      date_expiration: dateExpiration,
      objectif: 0,
    });

    setChargement(false);
    if (dbError) { setErreur("Compte créé mais erreur d'enregistrement : " + dbError.message); return; }

    onInscrit(plan);
  };

  if (etape === 1) {
    return (
      <div style={{ padding: 20 }}>
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
        {erreur && <div style={{ color: C.red, fontSize: "0.78rem", marginBottom: 12 }}>{erreur}</div>}
        <Btn onClick={() => pretEtape1 ? setEtape(2) : setErreur("Vérifie tous les champs et les mots de passe.")}>Continuer</Btn>
        <div style={{ textAlign: "center", marginTop: 16, fontSize: "0.82rem", color: C.textMuted }}>
          Déjà un compte ? <span onClick={onGoLogin} style={{ color: C.teal, fontWeight: 700, cursor: "pointer" }}>Se connecter</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
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
// ÉCRAN : Attente de vérification (juste après inscription)
// ============================================================
function EnAttente({ onGoLogin }) {
  return (
    <div style={{ padding: 24, textAlign: "center" }}>
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
    <div style={{ padding: 24, textAlign: "center" }}>
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
    <div>
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
// APPLICATION PRINCIPALE — côté entreprise
// ============================================================
function TableauDeBord({ clients, paiements, creances }) {
  const encaisse = paiements.filter(p => p.statut === "Payé").reduce((s, p) => s + Number(p.montant), 0);
  const enAttentePaiements = paiements.filter(p => p.statut !== "Payé").reduce((s, p) => s + Number(p.montant), 0);
  const enAttenteCreances = creances.reduce((s, cr) => s + (cr.echeances || []).filter(e => !e.paye).reduce((s2, e) => s2 + Number(e.montant), 0), 0);
  const enAttente = enAttentePaiements + enAttenteCreances;
  const aujourdHui = new Date().toISOString().slice(0, 10);
  const encaisseAujourdhui = paiements.filter(p => p.statut === "Payé" && p.date === aujourdHui).reduce((s, p) => s + Number(p.montant), 0);
  const enRetard = clients.filter(c =>
    paiements.some(p => p.client_id === c.id && p.statut !== "Payé" && p.date < aujourdHui) ||
    creances.some(cr => cr.client_id === c.id && (cr.echeances || []).some(e => statutEcheance(e) === "En retard"))
  ).length;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[
          ["Aujourd'hui", fmt(encaisseAujourdhui), C.green],
          ["Ce mois", fmt(encaisse), C.green],
          ["Reste à encaisser", fmt(enAttente), C.amber],
          ["Clients à relancer", enRetard, C.red],
        ].map(([label, val, color], i) => (
          <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
            <div style={{ color: C.textMuted, fontSize: "0.68rem", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
            <div style={{ fontWeight: 800, fontSize: "1.15rem", color }}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
        <div style={{ fontWeight: 700, color: C.navy, fontSize: "0.85rem", marginBottom: 10 }}>Derniers paiements</div>
        {paiements.slice(0, 5).map(p => {
          const client = clients.find(c => c.id === p.client_id);
          return (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: "0.8rem" }}>
              <span>{client?.nom || "Client supprimé"}</span>
              <span style={{ fontWeight: 700 }}>{fmt(p.montant)}</span>
            </div>
          );
        })}
        {paiements.length === 0 && <div style={{ color: C.textMuted, fontSize: "0.8rem" }}>Aucun paiement encore.</div>}
      </div>
    </div>
  );
}

function ClientsView({ entreprise, clients, recharger }) {
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");

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

  return (
    <div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontWeight: 700, color: C.navy, fontSize: "0.85rem", marginBottom: 10 }}>Ajouter un client</div>
        <Input placeholder="Nom du client" value={nom} onChange={e => setNom(e.target.value)} />
        <Input placeholder="Téléphone" value={telephone} onChange={e => setTelephone(e.target.value)} />
        <Btn onClick={ajouter}>Ajouter</Btn>
      </div>
      {clients.map(c => (
        <div key={c.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", color: C.text }}>{c.nom}</div>
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
    <div>
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
      <div>
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
    <div>
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

function EspaceEntreprise({ entreprise, onLogout }) {
  const [tab, setTab] = useState("dashboard");
  const [clients, setClients] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [creances, setCreances] = useState([]);

  const recharger = async () => {
    const { data: c } = await supabase.from("clients").select("*").eq("entreprise_id", entreprise.id).order("created_at", { ascending: false });
    const { data: p } = await supabase.from("paiements").select("*").eq("entreprise_id", entreprise.id).order("date", { ascending: false });
    const { data: cr } = await supabase.from("creances").select("*, echeances(*)").eq("entreprise_id", entreprise.id).order("created_at", { ascending: false });
    setClients(c || []);
    setPaiements(p || []);
    setCreances(cr || []);
  };

  useEffect(() => { recharger(); }, []);

  return (
    <div>
      <div style={{ background: `linear-gradient(135deg,${C.navyDark},${C.navy})`, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: C.white, fontWeight: 700, fontSize: "0.95rem" }}>{entreprise.nom}</div>
          <div style={{ color: C.tealLight, fontSize: "0.68rem" }}>{entreprise.statut} {entreprise.date_expiration ? `· jusqu'au ${entreprise.date_expiration}` : ""}</div>
        </div>
        <span onClick={onLogout} style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", cursor: "pointer" }}>Déconnexion</span>
      </div>
      <div style={{ display: "flex", background: C.white, borderBottom: `1px solid ${C.border}`, overflowX: "auto" }}>
        {[["dashboard", "Tableau de bord"], ["clients", "Clients"], ["paiements", "Paiements"], ["creances", "Créances"]].map(([id, label]) => (
          <div key={id} onClick={() => setTab(id)}
            style={{ flex: 1, textAlign: "center", padding: "10px 4px", fontSize: "0.7rem", fontWeight: 700, color: tab === id ? C.teal : C.textMuted, borderBottom: tab === id ? `2px solid ${C.teal}` : "2px solid transparent", cursor: "pointer", whiteSpace: "nowrap" }}>
            {label}
          </div>
        ))}
      </div>
      <div style={{ padding: 16 }}>
        {tab === "dashboard" && <TableauDeBord clients={clients} paiements={paiements} creances={creances} />}
        {tab === "clients" && <ClientsView entreprise={entreprise} clients={clients} recharger={recharger} />}
        {tab === "paiements" && <PaiementsView entreprise={entreprise} clients={clients} paiements={paiements} recharger={recharger} />}
        {tab === "creances" && <CreancesView entreprise={entreprise} clients={clients} creances={creances} recharger={recharger} />}
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT RACINE — à importer dans App.jsx
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
    if (data.statut === "En attente") {
      setEcran("attente-connecte");
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
  if (ecran === "admin") return <AdminDashboard onLogout={seDeconnecter} />;
  if (ecran === "app" && entreprise) return <EspaceEntreprise entreprise={entreprise} onLogout={seDeconnecter} />;
  return null;
}

