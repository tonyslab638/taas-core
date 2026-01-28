// verify.js – ASJUJ Trust Verifier (Read-Only)

import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== CONFIG =====
const RPC_URL = process.env.RPC_URL || "https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY";
const CONTRACT_ADDR = process.env.CONTRACT_ADDR || "0xYourContract";

// ===== LOAD ABI SAFELY =====
const abiPath = path.join(__dirname, "abi", "TaaSProductBirth.json");
const raw = JSON.parse(fs.readFileSync(abiPath, "utf8"));
const ABI = Array.isArray(raw) ? raw : raw.abi; // supports both formats

// ===== ETHERS SETUP (READ ONLY) =====
const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDR, ABI, provider);

// ===== SERVER =====
const app = express();

app.get("/", (_, res) => {
  res.send(`
    <html>
      <head><title>ASJUJ Verify</title></head>
      <body style="font-family:Arial;text-align:center;margin-top:80px">
        <h1>ASJUJ Network</h1>
        <p>Append a Product ID in URL</p>
        <p>Example: <code>/TAAS-LIVE-9003</code></p>
      </body>
    </html>
  `);
});

app.get("/:gpid", async (req, res) => {
  const gpid = req.params.gpid;

  try {
    const data = await contract.getProduct(gpid);

    const html = `
      <html>
      <head>
        <title>ASJUJ – ${gpid}</title>
      </head>
      <body style="font-family:Arial;background:#0a0a0a;color:white;text-align:center;padding:40px">
        <h1 style="color:#00ff99">AUTHENTIC PRODUCT</h1>
        <h2>${gpid}</h2>
        <hr style="margin:30px 0"/>

        <p><b>Brand:</b> ${data.brand}</p>
        <p><b>Model:</b> ${data.model}</p>
        <p><b>Category:</b> ${data.category}</p>
        <p><b>Factory:</b> ${data.factoryUnit}</p>
        <p><b>Batch:</b> ${data.batch}</p>
        <p><b>Born:</b> ${new Date(Number(data.birth) * 1000).toUTCString()}</p>
        <p><b>Issuer:</b> ${data.issuer}</p>

        <br/>
        <h3 style="color:#00ff99">Verified by ASJUJ Network</h3>
      </body>
      </html>
    `;

    res.send(html);
  } catch (e) {
    res.send(`
      <html>
        <body style="font-family:Arial;text-align:center;margin-top:80px">
          <h1 style="color:red">FAKE / INVALID PRODUCT</h1>
          <p>No such product exists on ASJUJ Network</p>
        </body>
      </html>
    `);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("ASJUJ Verifier running on port", PORT);
});