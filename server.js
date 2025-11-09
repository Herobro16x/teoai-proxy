import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Test route
app.get("/", (req, res) => {
  res.send("✅ TeoAI Proxy is running.");
});

// Main Hugging Face proxy route
app.post("/api/hf", async (req, res) => {
  try {
    const { model, inputs, parameters } = req.body;
    if (!model || !inputs) {
      return res.status(400).json({ error: "Missing model or inputs" });
    }

    const response = await fetch("https://router.huggingface.co/hf-inference", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_KEY || ""}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        inputs,
        parameters: parameters || { max_new_tokens: 512, temperature: 0.7 }
      })
    });

    const data = await response.text();
    res.setHeader("Content-Type", "application/json");
    res.status(response.status).send(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// Health check (OPTIONS)
app.options("/api/hf", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.status(200).send("OK");
});

// Listen on Render port
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 TeoAI Proxy listening on port ${PORT}`));
        
