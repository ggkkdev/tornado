import {hexlify, randomBytes} from "ethers";

const fs = require("fs");
import results from '../output.json';

const main = () => {
    let coordinates = results.slice(1, -1);
    let result: any[] = [];

    for (let i = 0; i < 50; i++) {
        result.push([]);

        for (let j = 0; j < 8; j++) {
            result[i].push([coordinates[j * 100 + i * 2], coordinates[j * 100 + i * 2 + 1]]);
        }
    }
    fs.writeFileSync('circom/pedersen/P3.json', JSON.stringify(result, null, 4));

};

main();
