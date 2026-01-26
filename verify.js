const express = require("express");
const { ethers } = require("ethers");

const app = express();
const PORT = 3000;

// Local Hardhat node
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// Your deployed contract
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// ABI (only what we need)
const ABI = [
  "function getProduct(string _gpid) view returns (tuple(string,string,string,string,string,string,uint256,address,bytes32))"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

app.get("/product/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const p = await contract.getProduct(id);

    res.send(`
      <html>
        <head>
          <title>${p[1]} – Verification</title>
          <style>
            body { font-family: Arial; background:#111; color:#fff; padding:40px; }
            .card { max-width:500px; margin:auto; padding:30px; border-radius:16px; background:#1c1c1c; }
            h1 { color:#00ffcc; }
            .ok { color:#00ff66; font-weight:bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Product Verified</h1>
            <p class="ok">Authentic</p>
            <p><b>GPID:</b> ${p[0]}</p>
            <p><b>Brand:</b> ${p[1]}</p>
            <p><b>Model:</b> ${p[2]}</p>
            <p><b>Category:</b> ${p[3]}</p>
            <p><b>Factory:</b> ${p[4]}</p>
            <p><b>Batch:</b> ${p[5]}</p>
            <p><b>Born:</b> ${new Date(Number(p[6]) * 1000).toUTCString()}</p>
          </div>
        </body>
      </html>
    `);
  } catch (e) {
    res.send("<h1>Product not found or invalid</h1>");
  }
});

app.listen(PORT, () => {
  console.log(`Verification server running at http://localhost:${PORT}`);
});