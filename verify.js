import express from "express";
import fs from "fs";
import { ethers } from "ethers";

const app = express();

// ================= CONFIG =================
const PORT = process.env.PORT || 10000;

// Polygon Amoy RPC (Alchemy)
const RPC_URL = "https://polygon-amoy.g.alchemy.com/v2/jyVOlegRibEBpVE-2bOHV";

// Your latest deployed contract on Amoy
const CONTRACT_ADDRESS = "0xF8b9d16B11aE782ACe9519711c4F1101d6c9EB3a";

// Load ABI correctly
const artifact = JSON.parse(
  fs.readFileSync("./abi/TaaSProductBirth.json", "utf8")
);
const ABI = artifact.abi;

// Setup provider & contract
const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

// ================= ROUTES =================
app.get("/", (req, res) => {
  res.send("TaaS Verifier Running");
});

app.get("/product/:gpid", async (req, res) => {
  const { gpid } = req.params;

  try {
    const p = await contract.getProduct(gpid);

    if (!p || !p[0]) {
      return res.status(404).send("Product not found or invalid");
    }

    const html = `
      <html>
        <head>
          <title>TaaS Verification</title>
          <style>
            body { font-family: Arial; padding: 40px; background: #0f172a; color: #e5e7eb; }
            .box { max-width: 600px; margin: auto; background: #020617; padding: 24px; border-radius: 12px; }
            h1 { color: #22c55e; }
            p { line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>Product Verified</h1>
            <p><b>GPID:</b> ${p[0]}</p>
            <p><b>Brand:</b> ${p[1]}</p>
            <p><b>Model:</b> ${p[2]}</p>
            <p><b>Category:</b> ${p[3]}</p>
            <p><b>Factory:</b> ${p[4]}</p>
            <p><b>Batch:</b> ${p[5]}</p>
            <p><b>Born:</b> ${new Date(Number(p[6]) * 1000).toUTCString()}</p>
            <p><b>Issuer:</b> ${p[7]}</p>
            <p><b>Hash:</b> ${p[8]}</p>
          </div>
        </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Product not found or invalid");
  }
});

// ================= START =================
app.listen(PORT, () => {
  console.log(`Verification server running on port ${PORT}`);
});