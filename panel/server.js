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

// ================== CONFIG ==================
const RPC_URL = "https://polygon-amoy.g.alchemy.com/v2/jyVOlegRibEBpVE-2bOHV";
const PRIVATE_KEY = "0xad622e40696eeb98115816682d004bfda83d2555d87b664e8a56aa4bb787b7fe";
const CONTRACT_ADDR = "0xF8b9d16B11aE782ACe9519711c4F1101d6c9EB3a";
// ===========================================

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Load ABI
const abiPath = path.join(__dirname, "..", "abi", "TaaSProductBirth.json");
const abiJson = JSON.parse(fs.readFileSync(abiPath, "utf8"));
const abi = abiJson.abi ?? abiJson;

const contract = new ethers.Contract(CONTRACT_ADDR, abi, wallet);

// Boot-time diagnostics
(async () => {
  const network = await provider.getNetwork();

  console.log("========== TAAS PANEL BOOT ==========");
  console.log("Wallet:", wallet.address);
  console.log("RPC:", RPC_URL);
  console.log("Chain ID:", network.chainId.toString());
  console.log("Contract:", CONTRACT_ADDR);
  console.log("====================================");

  if (network.chainId.toString() !== "80002") {
    console.error("FATAL: Not connected to Polygon Amoy (80002)");
    process.exit(1);
  }
})();

// Health check
app.get("/health", async (req, res) => {
  const net = await provider.getNetwork();
  res.json({
    wallet: wallet.address,
    chainId: net.chainId.toString(),
    contract: CONTRACT_ADDR,
  });
});

// API
app.post("/api/create", async (req, res) => {
  try {
    const { gpid, brand, model, category, factory, batch } = req.body;

    if (!gpid || !brand || !model) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const tx = await contract.birthProduct(
      gpid.trim(),
      brand.trim(),
      model.trim(),
      category?.trim() || "",
      factory?.trim() || "",
      batch?.trim() || "",
      ethers.id(gpid)
    );

    console.log("TX SENT:", tx.hash);

    const receipt = await tx.wait();

    console.log("TX MINED:", receipt.hash, "BLOCK:", receipt.blockNumber);

    res.json({
      success: true,
      tx: tx.hash,
      block: receipt.blockNumber,
    });
  } catch (e) {
    console.error("CREATE ERROR:", e);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("TAAS Panel running on port", PORT);
});
