const hre=require("hardhat");
async function main(){
    const Hasher=await hre.ethers.getContractFactory("MiMC5Sponge");
    const hasher=await Hasher.deploy()
    await hasher.waitForDeployment();
    const hashAddress=await hasher.getAddress()
    const Verifier=await hre.ethers.getContractFactory("Groth16Verifier");
    const verifier=await Verifier.deploy()
    await verifier.waitForDeployment();
    const verifierAddress=await verifier.getAddress()

    const Tornado=await hre.ethers.getContractFactory("Tornado");
    const tornado=await Tornado.deploy(hashAddress, verifierAddress)
    await tornado.waitForDeployment();
    console.log(await tornado.getAddress())
}

main().catch(e=>console.log(e))
