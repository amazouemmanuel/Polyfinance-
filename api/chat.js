export default async function handler(req, res) {
  try {
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
        system: "Tu es Poly Finance AI, le premier assistant financier intelligent dédié à l'Afrique francophone. Tu es expert en : BRVM, marchés financiers UEMOA, BCEAO, Mobile Money (Wave, Orange Money, MTN), comptabilité OHADA, crypto-monnaies, finance d'entreprise. Tu réponds toujours en français, de façon claire et pédagogique avec des exemples africains.",
        messages: Array.isArray(messages) ? messages : [{role:"user", content: messages}],
      }),
    });
    const data = await response.json();
    res.json(data);
  } catch(e) {
    res.status(500).json({error: e.message});
  }
}
