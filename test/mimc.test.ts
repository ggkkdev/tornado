import {ethers} from "hardhat";
import inputJson from '../circom/input.json';
import outputJson from '../circom/output.json';
import {expect} from "chai";
import {MiMC, MiMC__factory} from "../typechain";


describe('test MiMC hash function', () => {
    let contract: MiMC;
    before(async () => {
        const contractFactory = await ethers.getContractFactory("MiMC") as MiMC__factory;
        contract = await contractFactory.deploy();
    });
    it('should hash correct output', async () => {
        const result = await contract.hash(inputJson.x, inputJson.k);
        expect(result).to.equal(outputJson.at(1))
    });
});
