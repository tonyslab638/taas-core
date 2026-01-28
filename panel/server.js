import express from "express";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===================== CONFIG =====================

// 🔴 PUT YOUR AMOY WALLET PRIVATE KEY HERE (WITH 0x)
const PRIVATE_KEY = "0xad622e40696eeb98115816682d004bfda83d2555d87b664e8a56aa4bb787b7fe";

// Polygon Amoy RPC (Alchemy or public)
const RPC_URL = "https://polygon-mainnet.g.alchemy.com/v2/jyVOlegRibEBpVE-2bOHV";

// Your deployed contract on Amoy
const CONTRACT_ADDRESS = "0xF8b9d16B11aE782ACe9519711c4F1101d6c9EB3a";

// Load ABI safely
const ABI_PATH = path.join(__dirname, "../abi/TaaSProductBirth.json");
const ABI = JSON.parse(fs.readFileSync(ABI_PATH, "utf8"));

// ===================== SETUP =====================

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

console.log("Panel wallet address:", wallet.address);

// ===================== ROUTES =====================

// Serve panel UI
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Create product
app.post("/api/create", async (req, res) => {
  try {
    const { gpid, brand, model, category, factory, batch } = req.body;

    const tx = await contract.createProduct(
      gpid,
      brand,
      model,
      category,
      factory,
      batch
    );

    await tx.wait();

    res.json({
      success: true,
      tx: tx.hash,
      wallet: wallet.address
    });
  } catch (e) {
    res.json({ error: e.message });
  }
});

// ===================== START =====================

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Brand Panel running on port", PORT);
  console.log("Connected to contract", CONTRACT_ADDRESS);
});