const express = require("express");
const { ethers } = require("ethers");
const QRCode = require("qrcode");
const path = require("path");

const app = express();
app.use(express.json());

// Serve the panel UI (index.html)
app.use(express.static(__dirname));

// ====== BLOCKCHAIN CONFIG ======
const RPC_URL = "https://rpc-amoy.polygon.technology";
const CONTRACT_ADDRESS = "0xF8b9d16B11aE782ACe9519711c4F1101d6c9EB3a";

// Use your MetaMask Amoy private key here (ONLY LOCALLY)
const PRIVATE_KEY = "ad622e40696eeb98115816682d004bfda83d2555d87b664e8a56aa4bb787b7fe";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const ABI = [
  "function birthProduct(string,string,string,string,string,string,bytes32)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

// ====== API ======
app.post("/api/create", async (req, res) => {
  const { gpid, brand, model, category, factory, batch } = req.body;

  if (!gpid || !brand || !model) {
    return res.status(400).send("Missing required fields");
  }

  try {
    const tx = await contract.birthProduct(
      gpid,
      brand,
      model,
      category,
      factory,
      batch,
      ethers.id(gpid)
    );

    await tx.wait(); // wait for confirmation

    const verifyUrl = `http://localhost:3000/product/${gpid}`;
    const qrPath = path.join(__dirname, `${gpid}.png`);

    await QRCode.toFile(qrPath, verifyUrl, { width: 400 });

    res.send(`Product created on Polygon. QR saved as ${gpid}.png`);
  } catch (e) {
    if (e.reason) {
      res.status(400).send(`Error: ${e.reason}`);
    } else {
      res.status(500).send("Blockchain error: " + e.message);
    }
  }
});

// ====== START SERVER ======
app.listen(4000, () => {
  console.log("Brand Panel running at http://localhost:4000");
  console.log("Connected to Polygon Amoy");
});