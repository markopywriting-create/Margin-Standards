export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });
    const text = await response.text();
    console.log("Anthropic response:", text);
    res.status(200).json(JSON.parse(text));
  } catch (e) {
    console.log("Error:", e.message);
    res.status(500).json({ error: e.message });
  }
}