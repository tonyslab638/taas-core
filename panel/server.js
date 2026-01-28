import express from "express";
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
  console.error("Missing environment variables");
  process.exit(1);
}

// ---- ABI LOAD (safe) ----
const abiPath = path.join(__dirname, "..", "abi", "TaaSProductBirth.json");

let abi;
try {
  const raw = fs.readFileSync(abiPath, "utf8");
  const parsed = JSON.parse(raw);
  abi = parsed.abi || parsed; // supports both formats
} catch (e) {
  console.error("Failed to load ABI:", e.message);
  process.exit(1);
}

// ---- CHAIN ----
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDR, abi, wallet);

// ---- SERVER ----
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Serve panel UI
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Create product
app.post("/api/create", async (req, res) => {
  try {
    const { gpid, brand, model, category, factory, batch } = req.body;

    if (!gpid || !brand || !model) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const tx = await contract.createProduct(
      gpid,
      brand,
      model,
      category || "",
      factory || "",
      batch || ""
    );

    await tx.wait();

    res.json({
      success: true,
      gpid,
      tx: tx.hash
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Health
app.get("/health", (_, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Brand Panel running on port ${PORT}`);
  console.log(`Connected to contract ${CONTRACT_ADDR}`);
});