# Mixer
From https://www.youtube.com/watch?v=4wyRZc_tKjw&list=PL_SqG412uYVYtEM8B8xNccFyhrGsMV1MG&index=12
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

### Same for feistel 
```shell
circom MiMC5Sponge.circom --wasm
node ./MiMC5Sponge_js/generate_witness.js ./MiMC5Sponge_js/MiMC5Sponge.wasm input.json output.wtns
snarkjs wtns export json output.wtns output.json
```

### Same for pedersen
```shell
circom generate_basis.circom --wasm
node generate_basis_js/generate_witness.js generate_basis_js/generate_basis.wasm input.json output.wtns
snarkjs wtns export json output.wtns output.json
```

### Compile solidity files
```shell
npx hardhat compile
```

### Tests
```shell
npx hardhat test
```


