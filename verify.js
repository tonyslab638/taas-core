import express from "express";
import fs from "fs";
import { ethers } from "ethers";

const app = express();
const PORT = process.env.PORT || 3000;

// Polygon Amoy via Alchemy
const RPC_URL = "https://polygon-amoy.g.alchemy.com/v2/jyVOlegRibEBpVE-2bOHV";
const CONTRACT_ADDRESS = "0xF8b9d16B11aE782ACe9519711c4F1101d6c9EB3a";

// Load ABI from /abi folder
const artifact = JSON.parse(
  fs.readFileSync("./abi/TaaSProductBirth.json", "utf8")
);

const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  artifact.abi,
  provider
);

app.get("/", (req, res) => {
  res.send("TaaS Verifier is running");
});

app.get("/product/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const p = await contract.getProduct(id);

    res.send(`
      <html>
        <head>
          <title>TaaS Verification</title>
          <style>
            body { font-family: Arial; background:#0f172a; color:#e5e7eb; padding:40px }
            .card { background:#111827; padding:24px; border-radius:12px; max-width:520px; margin:auto }
            h1 { color:#22c55e }
            .row { margin:8px 0 }
            .k { color:#9ca3af }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Product Verified</h1>
            <div class="row"><span class="k">GPID:</span> ${p[0]}</div>
            <div class="row"><span class="k">Brand:</span> ${p[1]}</div>
            <div class="row"><span class="k">Model:</span> ${p[2]}</div>
            <div class="row"><span class="k">Category:</span> ${p[3]}</div>
            <div class="row"><span class="k">Factory:</span> ${p[4]}</div>
            <div class="row"><span class="k">Batch:</span> ${p[5]}</div>
            <div class="row"><span class="k">Born:</span> ${new Date(Number(p[6]) * 1000).toUTCString()}</div>
            <div class="row"><span class="k">Issuer:</span> ${p[7]}</div>
            <div class="row"><span class="k">Hash:</span> ${p[8]}</div>
          </div>
        </body>
      </html>
    `);
  } catch (e) {
    res.status(404).send("Product not found or invalid");
  }
});

app.listen(PORT, () => {
  console.log(`Verification server running on port ${PORT}`);
});