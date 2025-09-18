import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
console.log("Loaded API key:", process.env.OPENAI_API_KEY ? "✅ Found" : "❌ Missing");

const app = express();
app.use(express.json());
app.use(express.static("public")); // serve frontend

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // or "gpt-4o"
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const data = await response.json();

    // 🔎 Debug log
    console.log("API Response:", JSON.stringify(data, null, 2));

    // 🔎 Handle API errors
    if (!response.ok) {
      return res
        .status(response.status)
        .json({ reply: `⚠️ API Error: ${data.error?.message || JSON.stringify(data)}` });
    }

    // ✅ Ensure choices exist
    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ reply: "⚠️ No response from AI" });
    }

    // ✅ Success
    res.json({ reply: data.choices[0].message.content });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ reply: "Server error: " + err.message });
  }
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
