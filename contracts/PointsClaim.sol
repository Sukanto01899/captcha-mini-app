// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

interface IPointsToken {
    function mint(address to, uint256 amount) external;
}

contract PointsClaim is Ownable, EIP712 {
    using ECDSA for bytes32;

    IPointsToken public pointsToken;
    address public signer;
    uint256 public pointsPerClaim;
    uint256 public claimCooldown;

    mapping(uint256 => uint256) public lastClaimAtByFid;
    mapping(uint256 => mapping(uint256 => bool)) public nonceUsedByFid;

    bytes32 public constant CLAIM_TYPEHASH =
        keccak256("PointsClaim(address to,uint256 fid,uint256 nonce,uint256 amount,uint256 deadline)");

    event Claimed(address indexed to, uint256 indexed fid, uint256 amount, uint256 nonce);
    event PointsTokenUpdated(address indexed token);
    event SignerUpdated(address indexed signer);
    event PointsPerClaimUpdated(uint256 amount);
    event ClaimCooldownUpdated(uint256 seconds_);

    constructor(address tokenAddress, address signer_, uint256 pointsPerClaim_)
        Ownable(msg.sender)
        EIP712("CaptchaPoints", "1")
    {
        require(tokenAddress != address(0), "PointsClaim: token required");
        require(signer_ != address(0), "PointsClaim: signer required");
        pointsToken = IPointsToken(tokenAddress);
        signer = signer_;
        pointsPerClaim = pointsPerClaim_;
        claimCooldown = 6 hours;
    }

    function setPointsToken(address tokenAddress) external onlyOwner {
        require(tokenAddress != address(0), "PointsClaim: token required");
        pointsToken = IPointsToken(tokenAddress);
        emit PointsTokenUpdated(tokenAddress);
    }

    function setSigner(address signer_) external onlyOwner {
        require(signer_ != address(0), "PointsClaim: signer required");
        signer = signer_;
        emit SignerUpdated(signer_);
    }

    function setPointsPerClaim(uint256 amount) external onlyOwner {
        pointsPerClaim = amount;
        emit PointsPerClaimUpdated(amount);
    }

    function setClaimCooldown(uint256 seconds_) external onlyOwner {
        claimCooldown = seconds_;
        emit ClaimCooldownUpdated(seconds_);
    }

    function claim(
        uint256 fid,
        uint256 nonce,
        uint256 amount,
        uint256 deadline,
        bytes calldata signature
    ) external {
        require(block.timestamp <= deadline, "PointsClaim: signature expired");
        require(!nonceUsedByFid[fid][nonce], "PointsClaim: nonce used");
        require(amount == pointsPerClaim, "PointsClaim: invalid amount");
        uint256 lastClaimAt = lastClaimAtByFid[fid];
        require(block.timestamp >= lastClaimAt + claimCooldown, "PointsClaim: cooldown");

        bytes32 structHash = keccak256(
            abi.encode(CLAIM_TYPEHASH, msg.sender, fid, nonce, amount, deadline)
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        address recovered = digest.recover(signature);
        require(recovered == signer, "PointsClaim: invalid signature");

        nonceUsedByFid[fid][nonce] = true;
        lastClaimAtByFid[fid] = block.timestamp;
        pointsToken.mint(msg.sender, amount);

        emit Claimed(msg.sender, fid, amount, nonce);
    }
}
