# Mixer

### Compile circuit 
```shell
circom circom/mimc.circom --r1cs --wasm -o circom/
```

### Generate witness
```shell
node ./circom/mimc_js/generate_witness.js ./circom/mimc_js/mimc.wasm ./circom/input.json ./circom/output.wtns
```

### Convert result to json 
```shell
snarkjs wtns export json ./circom/output.wtns ./circom/output.json 
```

### Compile solidity files
```shell
npx hardhat compile
```

### Tests
```shell
npx hardhat test
```


