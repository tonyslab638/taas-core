const QRCode = require("qrcode");

const url = "https://taas.verify/product/TAAS-ROLEX-0001";

QRCode.toFile("TAAS-ROLEX-0001.png", url, {
  width: 500,
}, function (err) {
  if (err) throw err;
  console.log("QR created: TAAS-ROLEX-0001.png");
});