import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
});

app.options("*", (_, res) => res.sendStatus(200));

app.post("/api/hf", async (req, res) => {
  try {
    const { model, inputs } = req.body;
    const r = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: {
          "Authorization": process.env.HF_KEY
            ? `Bearer ${process.env.HF_KEY}`
            : "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs }),
      }
    );
    const buf = await r.arrayBuffer();
    res.set(
      "Content-Type",
      r.headers.get("content-type") || "application/octet-stream"
    );
    res.status(r.status).send(Buffer.from(buf));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy listening on ${PORT}`));
  
