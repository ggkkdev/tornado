// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./MiMC5Sponge.sol";

interface IVerifier {
    function verifyProof(uint[2] memory a, uint[2][2] memory b, uint[2] memory c, uint[3] memory input) external;
}

contract Tornado is ReentrancyGuard {
    MiMC5Sponge hasher;
    address verifier;
    uint8 public treeLevel = 10;
    uint public denomination = 0.1 ether;
    uint public nextLeafIdx = 0;

    mapping(uint => bool) public roots;
    mapping(uint8 => uint) public lastLevelHash;
    mapping(uint => bool) public nullifierHashes;
    mapping(uint => bool) public commitments;

    uint[10] levelDefaults = [
    19729955335077860970107866017616460838199735221322329776918395163920686917069,
    104255075540522145618331943361024342758988546496481242040442712329009193010501,
    97485515814148363913479842005729830652408185159446481241121390561383491431638,
    68098527342867086981616729096609610768309538400818100889402599285833770492413,
    21743515567936950466319793834715377909249924383648342436430972735084528551791,
    95370788340647817975034647011360878976216530470008600142283489424078906790853,
    36206511698266332910781118060939638383185652751304881946562389106775648226095,
    16206229617995565390235517671323354285009127158956778406623253903785487873296,
    42451320328409263254624800585546082510415007578833429793059807060631200085834,
    7176179120594642825636564913176410255655066817571054061324477144257084815736
    ];

    event Deposit(uint root, uint[10] hashPairs, uint8[10] pairDirections);
    event Withdraw(address to, uint nullifierHash);

    constructor(address _hasher, address _verifier){
        hasher = MiMC5Sponge(_hasher);
        verifier = _verifier;
    }

    function deposit(uint _commitment) external payable nonReentrant {
        require(msg.value == denomination, "incorrect-amount");
        require(!commitments[_commitment], "duplicate-commitment-hash");
        require(nextLeafIdx < 2 ** treeLevel, "tree full");
        uint newRoot;
        uint[10] memory hashPairs;
        uint8[10] memory hashDirections;
        uint currentIdx = nextLeafIdx;
        uint currentHash = _commitment;
        uint left;
        uint right;

        for (uint8 i = 0; i < treeLevel; i++) {
            lastLevelHash[treeLevel] = currentHash;
            if (currentIdx % 2 == 0) {
                left = currentHash;
                right = levelDefaults[i];
                hashPairs[i] = levelDefaults[i];
                hashDirections[i] = 0;
            }
            else {
                left = lastLevelHash[i];
                right = currentHash;
                hashPairs[i] = lastLevelHash[i];
                hashDirections[i] = 1;
            }

            (uint h) = hasher.sponge{gas : 150000}([left, right], _commitment);
            currentHash = h;
            currentIdx /= 2;
        }
        newRoot = currentHash;
        roots[newRoot] = true;
        nextLeafIdx += 1;
        commitments[_commitment] = true;
        emit Deposit(newRoot, hashPairs, hashDirections);
    }

    function withdraw(uint[2] memory a, uint[2][2] memory b, uint[2] memory c, uint[2] memory input) external payable nonReentrant {
        uint _root = input[0];
        uint _nullifierHash = input[1];
        require(!nullifierHashes[_nullifierHash], "already-spent");
        require(roots[_root], "not-root");
        uint _addr = uint(uint160(msg.sender));
        (bool verifyOk,) = verifier.call(abi.encodeCall(IVerifier.verifyProof, (a, b, c, [_root, _nullifierHash, _addr])));
        require(verifyOk, "invalid-proof");
        nullifierHashes[_nullifierHash] = true;
        address payable target = payable(msg.sender);
        (bool ok,) = target.call{value : denomination}("");
        require(ok,"payment-failed");
        emit Withdraw(msg.sender, _nullifierHash);
    }

}
