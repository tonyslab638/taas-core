async function main() {
  const TaaS = await ethers.getContractFactory("TaaSProductBirth");
  const taas = await TaaS.deploy();
  await taas.waitForDeployment();

  console.log("TaaS deployed to:", await taas.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });