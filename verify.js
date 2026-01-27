import express from "express";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// --- CONFIG ---
const RPC_URL = "https://polygon-amoy.g.alchemy.com/v2/jyVOlegRibEBpVE-2bOHV";
const CONTRACT_ADDRESS = "0x1b6b586Fb50D442830DB5D481407fe4066c7A3BE";
const ABI = JSON.parse(
  fs.readFileSync(new URL("./artifacts/contracts/TaaSProductBirth.sol/TaaSProductBirth.json", import.meta.url))
).abi;

// --- SETUP ---
const app = express();
const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- ROUTE ---
app.get("/product/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const p = await contract.getProduct(id);

    if (!p || !p[0]) {
      return res.status(404).send("Product not found or invalid");
    }

    const born = new Date(Number(p[6]) * 1000).toUTCString();

    res.send(`
      <html>
        <head>
          <title>TaaS Verification</title>
          <style>
            body { font-family: Arial; background:#0b0b0b; color:#00ff99; padding:40px; }
            .card { max-width:600px; margin:auto; border:1px solid #00ff99; padding:30px; border-radius:12px; }
            h1 { color:#00ff99; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Product Verified</h1>
            <p><b>Status:</b> Authentic</p>
            <p><b>GPID:</b> ${p[0]}</p>
            <p><b>Brand:</b> ${p[1]}</p>
            <p><b>Model:</b> ${p[2]}</p>
            <p><b>Category:</b> ${p[3]}</p>
            <p><b>Factory:</b> ${p[4]}</p>
            <p><b>Batch:</b> ${p[5]}</p>
            <p><b>Born:</b> ${born}</p>
          </div>
        </body>
      </html>
    `);
  } catch (e) {
    console.error(e);
    res.status(500).send("Product not found or invalid");
  }
});

// --- START ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Verification server running on http://localhost:${PORT}`);
});