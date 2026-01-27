const express = require("express");
const { ethers } = require("ethers");

const app = express();

// ====== BLOCKCHAIN CONFIG ======
const RPC_URL = "https://rpc-amoy.polygon.technology";
const CONTRACT_ADDRESS = "0x1b6b586Fb50D442830DB5D481407fe4066c7A3BE";

const provider = new ethers.JsonRpcProvider(RPC_URL);

const ABI = [
  "function getProduct(string) view returns (string,string,string,string,string,string,uint256,address,bytes32)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

// ====== ROUTES ======
app.get("/product/:gpid", async (req, res) => {
  const { gpid } = req.params;

  try {
    const p = await contract.getProduct(gpid);

    // If product doesn't exist, brand will be empty
    if (!p[1] || p[1] === "") {
      return res.status(404).send("<h2>Product not found</h2>");
    }

    const born = new Date(Number(p[6]) * 1000).toUTCString();

    res.send(`
      <html>
        <head>
          <title>Product Verification</title>
          <style>
            body { font-family: Arial, sans-serif; background:#111; color:#fff; padding:40px; }
            .card { max-width:600px; margin:auto; background:#1c1c1c; padding:30px; border-radius:12px; }
            h1 { color:#00ff99; }
            .row { margin:10px 0; }
            .label { color:#aaa; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Product Verified</h1>
            <div class="row"><span class="label">GPID:</span> ${p[0]}</div>
            <div class="row"><span class="label">Brand:</span> ${p[1]}</div>
            <div class="row"><span class="label">Model:</span> ${p[2]}</div>
            <div class="row"><span class="label">Category:</span> ${p[3]}</div>
            <div class="row"><span class="label">Factory:</span> ${p[4]}</div>
            <div class="row"><span class="label">Batch:</span> ${p[5]}</div>
            <div class="row"><span class="label">Born:</span> ${born}</div>
            <div class="row"><span class="label">Issued By:</span> ${p[7]}</div>
            <div class="row"><span class="label">Fingerprint:</span> ${p[8]}</div>
          </div>
        </body>
      </html>
    `);
  } catch (e) {
    res.status(500).send("<h2>Error verifying product</h2><pre>" + e.message + "</pre>");
  }
});

// ====== START SERVER ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Verification server running on port ${PORT}`);
});