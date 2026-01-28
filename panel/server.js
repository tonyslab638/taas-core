import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4000;
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PANEL_PRIVATE_KEY;
const CONTRACT_ADDR = process.env.CONTRACT_ADDR;

if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDR) {
  console.error("❌ Missing environment variables.");
  console.error("Required: RPC_URL, PANEL_PRIVATE_KEY, CONTRACT_ADDR");
  process.exit(1);
}

let abi;
try {
  const abiPath = path.join(__dirname, "..", "abi", "TaaSProductBirth.json");
  abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
} catch (e) {
  console.error("❌ ABI file not found at /abi/TaaSProductBirth.json");
  console.error(e.message);
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDR, abi, wallet);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get("/health", (req, res) => {
  res.send("ASJUJ Panel Online");
});

app.post("/create", async (req, res) => {
  try {
    const { gpid, brand, model, category, factory, batch } = req.body;
    const hash = ethers.id(`${gpid}-${Date.now()}`);

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

    res.json({ ok: true, tx: tx.hash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Brand Panel running on port ${PORT}`);
  console.log(`Connected to chain via RPC`);
});