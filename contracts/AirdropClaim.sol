// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

interface IPointsToken {
    function burnFrom(address account, uint256 amount) external;
}

contract AirdropClaim is Ownable, EIP712 {
    using ECDSA for bytes32;

    IERC20 public rewardToken;
    IPointsToken public pointsToken;
    address public signer;
    uint256 public rewardPool;
    uint256 public claimAmount;
    uint256 public minPointsRequired;
    uint256 public minHumanScore;
    uint256 public claimEpoch;

    mapping(uint256 => uint256) public claimedEpochByFid;
    mapping(uint256 => mapping(uint256 => bool)) public nonceUsedByFid;

    bytes32 public constant CLAIM_TYPEHASH =
        keccak256(
            "AirdropClaim(address to,uint256 fid,uint256 nonce,uint256 amount,uint256 burnPoints,uint256 humanScore,uint256 deadline)"
        );

    event Claimed(address indexed to, uint256 indexed fid, uint256 amount, uint256 nonce);
    event RewardTokenUpdated(address indexed token);
    event PointsTokenUpdated(address indexed token);
    event SignerUpdated(address indexed signer);
    event RewardPoolUpdated(uint256 amount);
    event ClaimAmountUpdated(uint256 amount);
    event MinPointsUpdated(uint256 amount);
    event MinHumanScoreUpdated(uint256 score);
    event AirdropReset(uint256 newEpoch);

    constructor(
        address tokenAddress,
        address pointsTokenAddress,
        address signer_,
        uint256 claimAmount_
    )
        Ownable(msg.sender)
        EIP712("CaptchaAirdrop", "1")
    {
        require(tokenAddress != address(0), "AirdropClaim: token required");
        require(pointsTokenAddress != address(0), "AirdropClaim: points token required");
        require(signer_ != address(0), "AirdropClaim: signer required");
        rewardToken = IERC20(tokenAddress);
        pointsToken = IPointsToken(pointsTokenAddress);
        signer = signer_;
        claimAmount = claimAmount_;
        claimEpoch = 1;
    }

    function setRewardToken(address tokenAddress) external onlyOwner {
        require(tokenAddress != address(0), "AirdropClaim: token required");
        rewardToken = IERC20(tokenAddress);
        emit RewardTokenUpdated(tokenAddress);
    }

    function setPointsToken(address pointsTokenAddress) external onlyOwner {
        require(pointsTokenAddress != address(0), "AirdropClaim: points token required");
        pointsToken = IPointsToken(pointsTokenAddress);
        emit PointsTokenUpdated(pointsTokenAddress);
    }

    function setSigner(address signer_) external onlyOwner {
        require(signer_ != address(0), "AirdropClaim: signer required");
        signer = signer_;
        emit SignerUpdated(signer_);
    }

    function setRewardPool(uint256 amount) external onlyOwner {
        rewardPool = amount;
        emit RewardPoolUpdated(amount);
    }

    function setClaimAmount(uint256 amount) external onlyOwner {
        claimAmount = amount;
        emit ClaimAmountUpdated(amount);
    }

    function setMinPointsRequired(uint256 amount) external onlyOwner {
        minPointsRequired = amount;
        emit MinPointsUpdated(amount);
    }

    function setMinHumanScore(uint256 score) external onlyOwner {
        minHumanScore = score;
        emit MinHumanScoreUpdated(score);
    }

    function resetAirdrop() external onlyOwner {
        claimEpoch += 1;
        emit AirdropReset(claimEpoch);
    }

    function isClaimed(uint256 fid) public view returns (bool) {
        return claimedEpochByFid[fid] == claimEpoch;
    }

    function claim(
        uint256 fid,
        uint256 nonce,
        uint256 amount,
        uint256 burnPoints,
        uint256 humanScore,
        uint256 deadline,
        bytes calldata signature
    ) external {
        require(block.timestamp <= deadline, "AirdropClaim: signature expired");
        require(!nonceUsedByFid[fid][nonce], "AirdropClaim: nonce used");
        require(!isClaimed(fid), "AirdropClaim: already claimed");
        require(amount == claimAmount, "AirdropClaim: invalid amount");
        require(burnPoints >= minPointsRequired, "AirdropClaim: min points not met");
        require(humanScore >= minHumanScore, "AirdropClaim: min score not met");
        require(rewardPool >= amount, "AirdropClaim: pool empty");

        bytes32 structHash = keccak256(
            abi.encode(
                CLAIM_TYPEHASH,
                msg.sender,
                fid,
                nonce,
                amount,
                burnPoints,
                humanScore,
                deadline
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        address recovered = digest.recover(signature);
        require(recovered == signer, "AirdropClaim: invalid signature");

        nonceUsedByFid[fid][nonce] = true;
        claimedEpochByFid[fid] = claimEpoch;
        rewardPool -= amount;
        if (burnPoints > 0) {
            pointsToken.burnFrom(msg.sender, burnPoints);
        }
        require(rewardToken.transfer(msg.sender, amount), "AirdropClaim: transfer failed");

        emit Claimed(msg.sender, fid, amount, nonce);
    }
}
