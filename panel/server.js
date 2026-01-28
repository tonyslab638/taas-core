import express from "express";
import fs from "fs";
import QRCode from "qrcode";
import { ethers } from "ethers";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static("panel"));

const RPC = "https://polygon-amoy.g.alchemy.com/v2/jyVOlegRibEBpVE-2bOHV";
const CONTRACT_ADDRESS = "0xF8b9d16B11aE782ACe9519711c4F1101d6c9EB3a";

const provider = new ethers.JsonRpcProvider(RPC);
const wallet = "ad622e40696eeb98115816682d004bfda83d2555d87b664e8a56aa4bb787b7fe";

const abi = JSON.parse(fs.readFileSync("./abi/TaaSProductBirth.json", "utf8"));
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

(async () => {
  const net = await provider.getNetwork();
  console.log("PANEL USING CONTRACT:", CONTRACT_ADDRESS);
  console.log("PANEL CHAIN ID:", net.chainId.toString());
})();

app.post("/create", async (req, res) => {
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

    const file = `panel/${gpid}.png`;
    await QRCode.toFile(file, `https://taas-verify.onrender.com/product/${gpid}`);

    res.send(`Product created on Polygon. QR saved as ${gpid}.png`);
  } catch (e) {
    res.send("Error: " + e.message);
  }
});

app.listen(4000, () => {
  console.log("Brand Panel running at http://localhost:4000");
});