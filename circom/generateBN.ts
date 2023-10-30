import {decodeBytes32String, hexlify, randomBytes} from "ethers";

const nRounds = 10;
const generate = async () => {
    return [...Array(nRounds)].map((_) => {
        const rand = BigInt(hexlify(randomBytes(32)))
        console.log(rand)
    });
}

generate()
