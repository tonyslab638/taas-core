import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== CONFIG =====
const RPC_URL = "https://polygon-amoy.g.alchemy.com/v2/jyVOlegRibEBpVE-2bOHV";
const CONTRACT_ADDRESS = "0xF8b9d16B11aE782ACe9519711c4F1101d6c9EB3a";

// Load ABI
const abiPath = path.join(__dirname, "abi", "TaaSProductBirth.json");
const abiJson = JSON.parse(fs.readFileSync(abiPath, "utf8"));
const ABI = abiJson.abi ?? abiJson;

// Blockchain
const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

// Server
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head><title>ASJUJ Verifier</title></head>
      <body style="font-family:Arial;padding:40px;background:#0b0f1a;color:#fff">
        <h1>ASJUJ Trust Network</h1>
        <p>Verify any ASJUJ product by GPID:</p>
        <form method="GET" action="/verify">
          <input name="gpid" placeholder="ASJUJ-REAL-0001" style="padding:10px;font-size:16px"/>
          <button style="padding:10px 16px;font-size:16px">Verify</button>
        </form>
      </body>
    </html>
  `);
});

app.get("/verify", async (req, res) => {
  const gpid = (req.query.gpid || "").trim();
  if (!gpid) return res.send("<h2>Invalid GPID</h2>");

  try {
    const core = await contract.getCore(gpid);
    const meta = await contract.getMeta(gpid);

    const product = {
      gpid: core[0],
      brand: core[1],
      model: core[2],
      category: core[3],
      factory: core[4],
      batch: core[5],
      bornAt: meta[0],
      issuer: meta[1],
      hash: meta[2],
    };

    res.send(`
      <html>
        <body style="font-family:Arial;padding:40px;background:#0b0f1a;color:#fff">
          <h1>✔ ASJUJ Verified Product</h1>
          <p><b>GPID:</b> ${product.gpid}</p>
          <p><b>Brand:</b> ${product.brand}</p>
          <p><b>Model:</b> ${product.model}</p>
          <p><b>Category:</b> ${product.category}</p>
          <p><b>Factory:</b> ${product.factory}</p>
          <p><b>Batch:</b> ${product.batch}</p>
          <p><b>Issuer:</b> ${product.issuer}</p>
          <p><b>Born:</b> ${new Date(Number(product.bornAt) * 1000).toUTCString()}</p>
          <hr/>
          <p style="color:#4cff4c">Authentic product on ASJUJ Network</p>
        </body>
      </html>
    `);
  } catch (e) {
    res.send(`
      <html>
        <body style="font-family:Arial;padding:40px;background:#1a0b0b;color:#fff">
          <h1>❌ Product Not Found</h1>
          <p>This GPID is not registered on ASJUJ Network.</p>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log("ASJUJ Verifier running on port", PORT);
  console.log("RPC:", RPC_URL);
  console.log("Contract:", CONTRACT_ADDRESS);
});
