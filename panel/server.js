import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- ENV ----
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PANEL_PRIVATE_KEY;
const CONTRACT_ADDR = process.env.CONTRACT_ADDR;

if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDR) {
  console.error("Missing environment variables.");
  process.exit(1);
}

// ---- LOAD ABI ----
const abiPath = path.join(__dirname, "../abi/TaaSProductBirth.json");
if (!fs.existsSync(abiPath)) {
  console.error("ABI file not found at:", abiPath);
  process.exit(1);
}

const abiJson = JSON.parse(fs.readFileSync(abiPath, "utf8"));
const ABI = abiJson.abi || abiJson;

// ---- ETHERS ----
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDR, ABI, wallet);

// ---- APP ----
const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

app.post("/api/create", async (req, res) => {
  try {
    const {
      gpid,
      brand,
      model,
      category,
      factory,
      batch
    } = req.body;

    if (!gpid || !brand || !model || !category || !factory || !batch) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const hash = ethers.id(gpid + brand + model + Date.now());

    const tx = await contract.birthProduct(
      gpid,
      brand,
      model,
      category,
      factory,
      batch,
      hash
    );

    await tx.wait();

    res.json({
      success: true,
      gpid,
      tx: tx.hash
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.reason || err.message || "Transaction failed"
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Brand Panel running on port", PORT);
  console.log("Connected to contract", CONTRACT_ADDR);
});