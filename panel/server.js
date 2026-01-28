import fs from "fs";
import express from "express";
import { ethers } from "ethers";

const app = express();
app.use(express.json());

// CHANGE THESE THREE
const CONTRACT_ADDR = "0xF8b9d16B11aE782ACe9519711c4F1101d6c9EB3a";
const RPC_URL = "https://polygon-mainnet.g.alchemy.com/v2/jyVOlegRibEBpVE-2bOHV";
const PRIVATE_KEY = "0xad622e40696eeb98115816682d004bfda83d2555d87b664e8a56aa4bb787b7fe";

// Load Hardhat artifact
const artifact = JSON.parse(
  fs.readFileSync(new URL("../abi/TaaSProductBirth.json", import.meta.url))
);

// THIS IS THE FIX
const ABI = artifact.abi;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDR, ABI, wallet);

console.log("Panel wallet:", wallet.address);

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
    res.json({ ok: true, tx: tx.hash });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 10000, () => {
  console.log("Brand Panel running");
});