import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const HF_ROUTER = "https://router.huggingface.co/hf-inference";
const HF_API_KEY = process.env.HF_API_KEY;

app.options("/api/hf", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});

app.post("/api/hf", async (req, res) => {
  try {
    const { model, inputs, parameters } = req.body;
    const r = await fetch(`${HF_ROUTER}/${encodeURIComponent(model)}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs, parameters: parameters || {} }),
    });
    const text = await r.text();
    res.set("Access-Control-Allow-Origin", "*");
    res.status(r.status).send(text);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Proxy running on port ${port}`));
  
