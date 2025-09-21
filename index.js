// Install dependencies first:
// npm init -y
// npm install express bytez.js dotenv

const express = require("express");
const path = require("path");
const Bytez = require("bytez.js");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
const API_KEY = process.env.KEY;

// Check for API key
if (!API_KEY) {
  console.error("❌ Missing Bytez API key. Set KEY in your .env file");
  process.exit(1);
}

// Initialize Bytez SDK
const sdk = new Bytez(API_KEY);
const model = sdk.model("facebook/detr-resnet-50");

// Serve static files (index.html + style.css)
app.use(express.static(path.join(__dirname, "public")));

// API Endpoint: /api/detect?image=ImageURL
app.get("/api/detect", async (req, res) => {
  try {
    const imageUrl = req.query.image;

    if (!imageUrl) {
      return res.status(400).json({
        status: false,
        error: "Missing image query parameter (?image=ImageURL)",
      });
    }

    const { error, output } = await model.run(imageUrl);

    if (error) {
      return res.status(500).json({
        status: false,
        error: error.message || error,
      });
    }

    // Return only labels
    const labels = output.map((item) => item.label);

    res.json({
      status: true,
      labels,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      error: err.message,
    });
  }
});

// Redirect all other routes (except API) to homepage
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      status: false,
      error: "Not Found",
    });
  }
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});