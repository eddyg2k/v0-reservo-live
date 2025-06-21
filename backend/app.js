const express = require("express");
const fetch = require("node-fetch"); // If using Node 18+, you can use the built-in fetch
const cors = require("cors");

const app = express();
app.use(cors());

// Only needed for local testing with .env. Remove or comment out if not using dotenv.
// require("dotenv").config();

app.get("/session", async (req, res) => {
  try {
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model: "gpt-4o" })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI error:", errorText);
      return res.status(500).json({ error: "Failed to create session" });
    }

    const data = await response.json();
    res.json({ id: data.id, url: data.url });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
