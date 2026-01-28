import express from "express";
import { JsonRpcProvider, Contract } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ---- CONFIG (HARD WIRED FOR NOW – DEMO MODE) ----
const RPC_URL = "https://polygon-amoy.g.alchemy.com/v2/jyVOlegRibEBpVE-2bOHV";
const CONTRACT_ADDR = "0xF8b9d16B11aE782ACe9519711c4F1101d6c9EB3a";
const PORT = process.env.PORT || 10000;

// ---- LOAD ABI SAFELY ----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const abiPath = path.join(__dirname, "abi", "TaaSProductBirth.json");

const abiJson = JSON.parse(fs.readFileSync(abiPath, "utf8"));
const ABI = abiJson.abi || abiJson;

// ---- CHAIN SETUP ----
const provider = new JsonRpcProvider(RPC_URL);
const contract = new Contract(CONTRACT_ADDR, ABI, provider);

// ---- SERVER ----
const app = express();

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head><title>ASJUJ Verifier</title></head>
      <body style="font-family:sans-serif;background:#0f0f14;color:white;text-align:center;padding-top:80px">
        <h1>ASJUJ Trust Network</h1>
        <p>Append a GPID in URL</p>
        <code>https://taas-verify.onrender.com/TAAS-LIVE-9003</code>
      </body>
    </html>
  `);
});

app.get("/:gpid", async (req, res) => {
  try {
    const gpid = req.params.gpid;
    const data = await contract.getProduct(gpid);

    if (!data || !data.exists) {
      return res.send("<h2>❌ Product not found</h2>");
    }

    res.send(`
      <html>
        <body style="font-family:sans-serif;background:#0f0f14;color:white;padding:40px">
          <h1>✅ Verified Product</h1>
          <p><b>GPID:</b> ${gpid}</p>
          <p><b>Brand:</b> ${data.brand}</p>
          <p><b>Model:</b> ${data.model}</p>
          <p><b>Category:</b> ${data.category}</p>
          <p><b>Factory:</b> ${data.factory}</p>
          <p><b>Batch:</b> ${data.batch}</p>
          <p><b>Owner:</b> ${data.owner}</p>
        </body>
      </html>
    `);
  } catch (e) {
    res.send(`<h2>⚠ Error: ${e.message}</h2>`);
  }
});

app.listen(PORT, () => {
  console.log("ASJUJ Verifier running on port", PORT);
  console.log("RPC:", RPC_URL);
  console.log("Contract:", CONTRACT_ADDR);
});