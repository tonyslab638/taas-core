import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== CONFIG =====
const RPC_URL = "https://polygon-amoy.g.alchemy.com/v2/jyVOlegRibEBpVE-2bOHV";
const CONTRACT_ADDRESS = "0xF8b9d16B11aE782ACe9519711c4F1101d6c9EB3a"; // your latest Amoy contract

// Read PRIVATE KEY from environment (Render -> Environment Variables)
const PRIVATE_KEY = process.env.PANEL_PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error("❌ PANEL_PRIVATE_KEY not set in environment variables");
  process.exit(1);
}

// Load ABI safely (from project root /abi)
const abiPath = path.join(__dirname, "../abi/TaaSProductBirth.json");
const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));

// ===== BLOCKCHAIN SETUP =====
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

// ===== SERVER =====
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Simple UI
app.get("/", (req, res) => {
  res.send(`
    <h2>Create Product</h2>
    <form method="POST" action="/create">
      <input name="gpid" placeholder="GPID" required /><br/>
      <input name="brand" placeholder="Brand" required /><br/>
      <input name="model" placeholder="Model" required /><br/>
      <input name="category" placeholder="Category" required /><br/>
      <input name="factory" placeholder="Factory" required /><br/>
      <input name="batch" placeholder="Batch" required /><br/>
      <button>Create Product</button>
    </form>
  `);
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

    res.send(`Product created on Polygon Amoy.<br/>GPID: ${gpid}`);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Brand Panel running on port ${PORT}`);
  console.log("Connected to Polygon Amoy");
});