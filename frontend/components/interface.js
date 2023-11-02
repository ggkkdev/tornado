import {useState} from "react";
import utils from "../utils/utils";
import {ethers, hexlify} from "ethers";

const wc = require("../circuit/witness_calculator")
const tornadoAddress = "0x162A433068F51e18b7d13932F27e66a3f99E6890";
const tornadoJson = require("../json/Tornado.json");
const tornadoABI = tornadoJson.abi
const tornadoInterface = new ethers.Interface(tornadoABI)
const Interface = () => {
    const [account, updateAccount] = useState(null);
    const [proofElements, updateProofElements] = useState(null);
    const [proofStringEl, updateProofStringEl] = useState(null);
    const [textArea, updateTextArea] = useState(null);
    const connectMetamask = async () => {
        try {
            if (!window.ethereum) {
                alert("Please install metamask");
                throw "no-metamask";
            }
            const accounts = await window.ethereum.request({method: "eth_requestAccounts"});
            const chainId = window.ethereum.networkVersion;
            const activeAccount = accounts[0];
            const _balance = await window.ethereum.request({
                method: "eth_getBalance",
                params: [activeAccount, "latest"]
            });
            const balance = utils.moveDecimalLeft(ethers.getBigInt(_balance).toString(), 18)
            const newAccountState = {
                chainId: chainId,
                address: activeAccount,
                balance: balance
            }
            updateAccount(newAccountState)

        } catch (e) {
            console.log(e)
        }
    }

    const copyProof = async () => {
        if (proofStringEl) {
            console.log(proofStringEl.innerHTML)
            await navigator.clipboard.writeText(proofStringEl.innerHTML)
        }
    }
    const depositEther = async () => {
        const secret = ethers.getBigInt(hexlify(ethers.randomBytes(32))).toString();
        const nullifier = ethers.getBigInt(hexlify(ethers.randomBytes(32))).toString();
        const input = {
            secret: utils.BN256ToBin(secret).split(""),
            nullifier: utils.BN256ToBin(nullifier).split("")
        }
        let res = await fetch("./deposit.wasm");
        let buffer = await res.arrayBuffer();
        let depositWC = await wc(buffer);
        const r = await depositWC.calculateWitness(input, 0)
        const commitment = r[1]
        const nullifierHash = r[2]
        console.log(commitment)
        const value = BigInt(ethers.formatUnits(10n ** 17n, "wei")).toString(16)
        const tx = {
            to: tornadoAddress,
            from: account.address,
            value: value,
            data: tornadoInterface.encodeFunctionData("deposit", [commitment])
        }

        try {
            const txHash = await window.ethereum.request({method: "eth_sendTransaction", params: [tx]})
            const proofElements = {
                nullifierHash: `${nullifierHash}`,
                secret: secret,
                nullifier: nullifier,
                commitment: `${commitment}`,
                txHash: txHash
            }
            updateProofElements(btoa(JSON.stringify(proofElements)))
        } catch (e) {
            console.log(e)
        }
    }

    const withdraw = async () => {
        if (!textArea || !textArea.value) {
            alert("please input the proof of deposit")
        }
        try {
            const proofString = textArea.value;
            const proofElements = JSON.parse(atob(proofString))
            console.log(proofElements)
            const receipt1 = await window.ethereum.request({ method: "eth_getTransactionReceipt", params: [proofElements.txHash] });
            if(!receipt1){ throw "empty-receipt"; }

            const log = receipt1.logs[0];
            const decodedData = tornadoInterface.decodeEventLog("Deposit", log.data, log.topics);
            const SnarkJs = window["snarkjs"]

            const proofInput = {
                "root": utils.BNToDecimal(decodedData.root),
                "nullifierHash": proofElements.nullifierHash,
                "recipient": utils.BNToDecimal(account.address),
                "secret": utils.BN256ToBin(proofElements.secret).split(""),
                "nullifier": utils.BN256ToBin(proofElements.nullifier).split(""),
                "hashPairings": decodedData.hashPairs.map((n) => (utils.BNToDecimal(n))),
                "hashDirections": decodedData.pairDirections.map(utils.BNToDecimal)
            }
            const {
                proof,
                publicSignals
            } = await SnarkJs.groth16.fullProve(proofInput, "/withdraw.wasm", "/setup_final.zkey")
            const callInputs = [
                proof.pi_a.slice(0, 2).map(utils.BNToHex),
                proof.pi_b.slice(0, 2).map((row) => utils.reverseCoordinate(row.map(utils.BNToHex))),
                proof.pi_c.slice(0, 2).map(utils.BNToHex),
                publicSignals.slice(0, 2).map(utils.BNToHex)];
            console.log(callInputs)
            const callData=tornadoInterface.encodeFunctionData("withdraw",callInputs);
            const tx= {to:tornadoAddress, from: account.address, data:callData};
            const txHash = await window.ethereum.request({method: "eth_sendTransaction", params: [tx]})
            const receipt = await window.ethereum.request({method: "eth_getTransactionReceipt", params: [txHash]})
            console.log(receipt)
        } catch (e) {
            console.log(e)
        }

    }
    return (<div>
        {
            !!account ? (<div>
                <p>ChainId:{account.chainId}</p>
                <p>Wallet address:{account.address}</p>
                <p>Balance:{account.balance} ETH</p>
            </div>) : (<div>
                <button onClick={connectMetamask}>Connect Metamask</button>
            </div>)
        }

        {
            !!account ? (<div>
                    {!!proofElements ? (<div>
                        <p><strong>Proof of deposit</strong></p>
                        <div style={{maxWidth: "100vw", overflowWrap: "break-word"}}>
                            <span ref={(proofStringEl) => {
                                updateProofStringEl(proofStringEl)
                            }}>{proofElements}</span>
                        </div>
                        {!!proofStringEl
                            &&
                            <button onClick={copyProof}>Copy proof string</button>}
                    </div>) : (<button onClick={depositEther}>Deposit 0.1 Eth</button>)}</div>) :
                <div>
                    <p>You need to connect metamask to use this section</p></div>
        }
        <div>
            <hr/>
        </div>
        {!!account ? (<div>
            <textarea ref={(ta) => {
                updateTextArea(ta)
            }}></textarea>
            <button onClick={withdraw}>Withdraw 0.1 ether</button>
        </div>) : <div>
            <p>You need to connect metamask to use this section</p></div>

        }
    </div>)
}

export default Interface;
