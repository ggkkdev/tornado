import {ethers} from "hardhat";
import inputJson from '../circom/mimc5sponge/input.json';
import outputJson from '../circom/mimc5sponge/output.json';
import {expect} from "chai";
import {MiMC, MiMC5Sponge, MiMC5Sponge__factory, MiMC__factory} from "../typechain";


describe('test MiMC Sponge hash function', () => {
    let contract: MiMC5Sponge;
    before(async () => {
        const contractFactory = await ethers.getContractFactory("MiMC5Sponge") as MiMC5Sponge__factory;
        contract = await contractFactory.deploy();
    });
    it('should hash correct output', async () => {
        // @ts-ignore
        const result = await contract.sponge(inputJson.ins, inputJson.k);
        expect(result).to.equal(outputJson.at(1))
    });
});
