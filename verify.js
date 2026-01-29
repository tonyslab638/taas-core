import express from "express";
import { ethers } from "ethers";

// ================== CONFIG ==================
const RPC_URL = "https://polygon-amoy.g.alchemy.com/v2/jyVOlegRibEBpVE-2bOHV";
const CONTRACT_ADDRESS = "0xF8b9d16B11aE782ACe9519711c4F1101d6c9EB3a";
// ===========================================

// Minimal, truth ABI (only what we actually use)
const ABI = [
  "function exists(string gpid) view returns (bool)",
  "function getCore(string gpid) view returns (string,string,string,string,string,string)",
  "function getMeta(string gpid) view returns (uint256,address,bytes32)"
];

// Blockchain
const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

// Boot diagnostics
(async () => {
  const net = await provider.getNetwork();
  console.log("========== TAAS VERIFY BOOT ==========");
  console.log("RPC:", RPC_URL);
  console.log("Chain ID:", net.chainId.toString());
  console.log("Contract:", CONTRACT_ADDRESS);
  console.log("=====================================");
})();

// Server
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send(`
    <html>
      <body style="font-family:Arial;padding:40px;background:#0b0f1a;color:#fff">
        <h1>ASJUJ Trust Network</h1>
        <form method="GET" action="/verify">
          <input name="gpid" placeholder="ASJUJ-LIVE-0010" style="padding:10px;font-size:16px"/>
          <button style="padding:10px 16px;font-size:16px">Verify</button>
        </form>
      </body>
    </html>
  `);
});

app.get("/verify", async (req, res) => {
  const gpid = (req.query.gpid || "").trim();
  if (!gpid) return res.send("<h2>Invalid GPID</h2>");

  try {
    const exists = await contract.exists(gpid);

    if (!exists) {
      return res.send(`
        <html>
          <body style="font-family:Arial;padding:40px;background:#1a0b0b;color:#fff">
            <h1>❌ Product Not Found</h1>
            <pre>exists("${gpid}") = false</pre>
          </body>
        </html>
      `);
    }

    const core = await contract.getCore(gpid);
    const meta = await contract.getMeta(gpid);

    res.send(`
      <html>
        <body style="font-family:Arial;padding:40px;background:#0b0f1a;color:#fff">
          <h1>✔ ASJUJ Verified Product</h1>
          <p><b>GPID:</b> ${core[0]}</p>
          <p><b>Brand:</b> ${core[1]}</p>
          <p><b>Model:</b> ${core[2]}</p>
          <p><b>Category:</b> ${core[3]}</p>
          <p><b>Factory:</b> ${core[4]}</p>
          <p><b>Batch:</b> ${core[5]}</p>
          <p><b>Issuer:</b> ${meta[1]}</p>
          <p><b>Born:</b> ${new Date(Number(meta[0]) * 1000).toUTCString()}</p>
        </body>
      </html>
    `);
  } catch (e) {
    res.send(`
      <html>
        <body style="font-family:Arial;padding:40px;background:#1a0b0b;color:#fff">
          <h1>❌ Verifier Error</h1>
          <pre>${e.message}</pre>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log("ASJUJ Verifier running on port", PORT);
});
