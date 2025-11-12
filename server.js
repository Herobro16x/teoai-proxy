import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Hugging Face router endpoint (the correct one)
const HF_ROUTER = "https://router.huggingface.co/hf-inference";
const HF_API_KEY = process.env.HF_API_KEY;

// --- CORS setup ---
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// --- Health check route (optional) ---
app.get("/", (req, res) => {
  res.json({ status: "✅ TeoAI proxy online" });
});

// --- Main proxy route ---
app.post("/api/hf", async (req, res) => {
  try {
    const { model, inputs, parameters } = req.body;
    if (!model || !inputs)
      return res.status(400).json({ error: "model and inputs required" });

    const response = await fetch(`${HF_ROUTER}/${encodeURIComponent(model)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs, parameters: parameters || {} }),
    });

    const contentType = response.headers.get("content-type") || "";
    const buffer = await response.arrayBuffer();

    if (contentType.includes("json") || contentType.includes("text")) {
      const text = Buffer.from(buffer).toString("utf8");
      res.status(response.status).type("json").send(text);
    } else {
      res.status(response.status).set("Content-Type", contentType);
      res.send(Buffer.from(buffer));
    }
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: err.message || "proxy error" });
  }
});

// --- Listen on Render-provided port ---
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ TeoAI proxy running on port ${port}`));
    
