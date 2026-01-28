import express from "express";
import { JsonRpcProvider, Contract } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === CONFIG ===
const RPC_URL = "https://polygon-amoy.g.alchemy.com/v2/jyVOlegRibEBpVE-2bOHV";
const CONTRACT_ADDR = "0xF8b9d16B11aE782ACe9519711c4F1101d6c9EB3a";

// Load ABI safely
const abiPath = path.join(__dirname, "abi", "TaaSProductBirth.json");
const abiJson = JSON.parse(fs.readFileSync(abiPath, "utf8"));
const ABI = abiJson.abi || abiJson;

// Setup blockchain
const provider = new JsonRpcProvider(RPC_URL);
const contract = new Contract(CONTRACT_ADDR, ABI, provider);

// Server
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send(`
    <html>
      <body style="font-family:sans-serif;background:#0f0f14;color:white;padding:40px">
        <h1>ASJUJ Verifier</h1>
        <p>Scan a product QR or open /GPID</p>
      </body>
    </html>
  `);
});

app.get("/:gpid", async (req, res) => {
  const gpid = req.params.gpid;

  try {
    const data = await contract.getProduct(gpid);

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
  } catch (err) {
    res.send(`
      <html>
        <body style="font-family:sans-serif;background:#0f0f14;color:white;padding:40px">
          <h1>❌ Product Not Found</h1>
          <p>This GPID is not registered on ASJUJ Network.</p>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log("ASJUJ Verifier running on port", PORT);
});