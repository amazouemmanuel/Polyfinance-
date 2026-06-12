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
      max_tokens: 1024,
      system: "Tu es Poly Finance AI, expert en finance africaine et internationale. Réponds en français.",
      messages,
    }),
  });
  const data = await response.json();
  res.json(data);
}

