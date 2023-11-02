import {ethers, hexlify, randomBytes} from "ethers";

const nRounds = 10;
const main = async () => {
    return [...Array(nRounds)].map((_) => {
        const rand = ethers.getBigInt(hexlify(randomBytes(32)))
        console.log(rand)
    });
}

main()
