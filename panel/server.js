import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4000;
const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDR = process.env.CONTRACT_ADDR;
const PRIVATE_KEY = process.env.PANEL_PRIVATE_KEY;

if (!RPC_URL || !CONTRACT_ADDR || !PRIVATE_KEY) {
  console.error("❌ Missing environment variables.");
  console.error("Required: RPC_URL, CONTRACT_ADDR, PANEL_PRIVATE_KEY");
  process.exit(1);
}

// Load ABI safely
let abi;
try {
  const abiPath = path.join(__dirname, "..", "abi", "TaaSProductBirth.json");
  const artifact = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  abi = artifact.abi;
  if (!Array.isArray(abi)) throw new Error("ABI is not an array");
} catch (err) {
  console.error("❌ Failed to load ABI:", err.message);
  process.exit(1);
}

// Blockchain setup
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDR, abi, wallet);

// Express app
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post("/create", async (req, res) => {
  try {
    const {
      gpid,
      brand,
      model,
      category,
      factory,
      batch
    } = req.body;

    const hash = ethers.id(`${brand}-${model}-${gpid}`);

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
  } catch (e) {
    res.status(400).json({
      success: false,
      error: e.reason || e.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Brand Panel running on port ${PORT}`);
  console.log(`Connected to contract ${CONTRACT_ADDR}`);
});