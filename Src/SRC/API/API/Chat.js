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
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: "Tu es Poly Finance AI, expert finance pour l'Afrique francophone créé par Stony. Tu réponds uniquement aux questions financières en français : BRVM, trading, crypto, comptabilité OHADA, mobile money, épargne, UEMOA, PME, forex. Réponses claires avec exemples africains.",
      messages,
    }),
  });
  const data = await response.json();
  res.json(data);
}
