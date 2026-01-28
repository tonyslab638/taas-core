import express from "express";
import fs from "fs";
import { ethers } from "ethers";

const app = express();

const RPC = "https://polygon-amoy.g.alchemy.com/v2/jyVOlegRibEBpVE-2bOHV";
const CONTRACT_ADDRESS = "0xF8b9d16B11aE782ACe9519711c4F1101d6c9EB3a";

const provider = new ethers.JsonRpcProvider(RPC);
const abi = JSON.parse(fs.readFileSync("./abi/TaaSProductBirth.json", "utf8"));
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

(async () => {
  const net = await provider.getNetwork();
  console.log("VERIFY USING CONTRACT:", CONTRACT_ADDRESS);
  console.log("VERIFY CHAIN ID:", net.chainId.toString());
})();

app.get("/product/:id", async (req, res) => {
  try {
    const p = await contract.getProduct(req.params.id);

    if (!p || !p[0]) throw new Error("Not found");

    res.send(`
      <h2>Product Verified</h2>
      <b>GPID:</b> ${p[0]}<br/>
      <b>Brand:</b> ${p[1]}<br/>
      <b>Model:</b> ${p[2]}<br/>
      <b>Category:</b> ${p[3]}<br/>
      <b>Factory:</b> ${p[4]}<br/>
      <b>Batch:</b> ${p[5]}<br/>
      <b>Born:</b> ${new Date(Number(p[6]) * 1000).toUTCString()}<br/>
      <b>Issuer:</b> ${p[7]}<br/>
      <b>Hash:</b> ${p[8]}<br/>
    `);
  } catch {
    res.send("Product not found or invalid");
  }
});

app.listen(process.env.PORT || 10000, () => {
  console.log("Verification server running");
});