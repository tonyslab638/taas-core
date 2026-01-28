import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { ethers } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Serve panel UI
app.use(express.static(__dirname));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ================== CONFIG (EDIT ONLY THESE) ==================
const RPC_URL = "https://polygon-amoy.g.alchemy.com/v2/jyVOlegRibEBpVE-2bOHV";
const PRIVATE_KEY = "0xad622e40696eeb98115816682d004bfda83d2555d87b664e8a56aa4bb787b7fe";
const CONTRACT_ADDR = "0xF8b9d16B11aE782ACe9519711c4F1101d6c9EB3a";
// ===============================================================

// Blockchain setup
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
console.log("Panel wallet:", wallet.address);

// Load ABI correctly
const abiPath = path.join(__dirname, "..", "abi", "TaaSProductBirth.json");
const abiJson = JSON.parse(fs.readFileSync(abiPath, "utf8"));
const abi = abiJson.abi;

const contract = new ethers.Contract(CONTRACT_ADDR, abi, wallet);

// API
app.post("/api/create", async (req, res) => {
  try {
    const { gpid, brand, model, category, factory, batch } = req.body;

    const tx = await contract.birthProduct(
      gpid,
      brand,
      model,
      category,
      factory,
      batch,
      ethers.id(gpid)
    );

    await tx.wait();
    res.json({ success: true, tx: tx.hash });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Brand Panel running on port", PORT);
  console.log("Connected to contract", CONTRACT_ADDR);
});