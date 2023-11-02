import {ethers} from "hardhat";
import inputJson from '../circom/input.json';
import outputJson from '../circom/output.json';
import {expect} from "chai";
import {Groth16Verifier, Groth16Verifier__factory, MiMC__factory} from "../typechain";


describe('test verifier mimc contract', () => {
    let contract: Groth16Verifier;
    before(async () => {
        const contractFactory = await ethers.getContractFactory("Groth16Verifier") as Groth16Verifier__factory;
        contract = await contractFactory.deploy();
    });
    it('should verify successfully', async () => {
        //run : snarkjs zkey export soliditycalldata public.json proof.json
        const result = await contract.verifyProof(["0x06a01352bb6212b7210143c3f4f6319ec83bfa32857370618b248b6e57e7eaf0", "0x08aebc2981374718e781a4056163913a600844434d38d7570e26ae9750c27489"], [["0x28983551668c6b277171a988e1bc28ead95f678c08447fa41c51de6eb7765177", "0x26c16039ed97e52c6686411253126d82e027151021b5aba2f32eb097d588b0c7"], ["0x24d132d89b83e5c2d74d964f6acd5d1c194f417319c3a2465364b3fd526e3fb4", "0x1d344b0fe3214eb6e080e7e00a968d6e69e43fbb73050d916dbb89f5dbc5acf7"]], ["0x10796d151d4afb11243c975385ab11439e6f518ea374a0293cc4cc7e4e3da9a8", "0x17277dfd041a9177c987094cfb957e3ced0df0d7d54ee3810d793c62cc2c76eb"], ["0x1e68a85fd6df20aad09e9ce3df3f48c19e080c085a23299b7cc5435a7b4addc0"]
        );
        expect(result).to.equal(true)
    });
});
