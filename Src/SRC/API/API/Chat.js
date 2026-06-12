export default async function handler(req, res) {
  const { messages } = req.body;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: "Tu es Poly Finance AI, le premier assistant financier intelligent dédié à l'Afrique francophone. Tu es expert en : BRVM (Bourse Régionale des Valeurs Mobilières), marchés financiers UEMOA, BCEAO et politique monétaire, Mobile Money (Wave, Orange Money, MTN), comptabilité OHADA, crypto-monnaies, finance d'entreprise, et éducation financière pour les jeunes africains. Tu réponds toujours en français, de façon claire, simple et pédagogique. Tu donnes des exemples concrets adaptés au contexte africain. Tu es encourageant et accessible pour les débutants.",
      messages,
    }),
  });
  const data = await response.json();
  res.json(data);
}


