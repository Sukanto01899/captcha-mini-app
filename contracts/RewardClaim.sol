// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract RewardClaim is Ownable, EIP712 {
    using ECDSA for bytes32;

    IERC20 public immutable rewardToken;
    address public signer;
    uint256 public rewardAmount;
    uint256 public claimCooldown;

    mapping(uint256 => uint256) public lastClaimAtByFid;
    mapping(uint256 => mapping(uint256 => bool)) public nonceUsedByFid;

    bytes32 public constant CLAIM_TYPEHASH =
        keccak256("Claim(address to,uint256 fid,uint256 nonce,uint256 amount,uint256 deadline)");

    event Claimed(address indexed to, uint256 indexed fid, uint256 amount, uint256 nonce);
    event SignerUpdated(address indexed signer);
    event RewardAmountUpdated(uint256 amount);
    event ClaimCooldownUpdated(uint256 seconds_);

    constructor(address tokenAddress, address signer_, uint256 rewardAmount_)
        Ownable(msg.sender)
        EIP712("CaptchaReward", "1")
    {
        require(tokenAddress != address(0), "RewardClaim: token required");
        require(signer_ != address(0), "RewardClaim: signer required");
        rewardToken = IERC20(tokenAddress);
        signer = signer_;
        rewardAmount = rewardAmount_;
        claimCooldown = 6 hours;
    }

    function setSigner(address signer_) external onlyOwner {
        require(signer_ != address(0), "RewardClaim: signer required");
        signer = signer_;
        emit SignerUpdated(signer_);
    }

    function setRewardAmount(uint256 amount) external onlyOwner {
        rewardAmount = amount;
        emit RewardAmountUpdated(amount);
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
        require(block.timestamp <= deadline, "RewardClaim: signature expired");
        require(!nonceUsedByFid[fid][nonce], "RewardClaim: nonce used");
        require(amount == rewardAmount, "RewardClaim: invalid amount");
        uint256 lastClaimAt = lastClaimAtByFid[fid];
        require(block.timestamp >= lastClaimAt + claimCooldown, "RewardClaim: cooldown");

        bytes32 structHash = keccak256(
            abi.encode(CLAIM_TYPEHASH, msg.sender, fid, nonce, amount, deadline)
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        address recovered = digest.recover(signature);
        require(recovered == signer, "RewardClaim: invalid signature");

        nonceUsedByFid[fid][nonce] = true;
        lastClaimAtByFid[fid] = block.timestamp;
        require(rewardToken.transfer(msg.sender, amount), "RewardClaim: transfer failed");

        emit Claimed(msg.sender, fid, amount, nonce);
    }
}
