// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

interface IHumanId {
    function ownerOf(uint256 tokenId) external view returns (address);
}

contract AirdropClaim is Ownable, EIP712 {
    using ECDSA for bytes32;

    IERC20 public rewardToken;
    IHumanId public humanIdContract;
    address public signer;
    uint256 public rewardPool;
    uint256 public claimAmount;

    mapping(uint256 => bool) public claimedByFid;
    mapping(uint256 => mapping(uint256 => bool)) public nonceUsedByFid;

    bytes32 public constant CLAIM_TYPEHASH =
        keccak256("AirdropClaim(address to,uint256 fid,uint256 nonce,uint256 amount,uint256 deadline)");

    event Claimed(address indexed to, uint256 indexed fid, uint256 amount, uint256 nonce);
    event RewardTokenUpdated(address indexed token);
    event HumanIdUpdated(address indexed humanId);
    event SignerUpdated(address indexed signer);
    event RewardPoolUpdated(uint256 amount);
    event ClaimAmountUpdated(uint256 amount);

    constructor(address tokenAddress, address humanIdAddress, address signer_, uint256 claimAmount_)
        Ownable(msg.sender)
        EIP712("CaptchaAirdrop", "1")
    {
        require(tokenAddress != address(0), "AirdropClaim: token required");
        require(humanIdAddress != address(0), "AirdropClaim: humanId required");
        require(signer_ != address(0), "AirdropClaim: signer required");
        rewardToken = IERC20(tokenAddress);
        humanIdContract = IHumanId(humanIdAddress);
        signer = signer_;
        claimAmount = claimAmount_;
    }

    function setRewardToken(address tokenAddress) external onlyOwner {
        require(tokenAddress != address(0), "AirdropClaim: token required");
        rewardToken = IERC20(tokenAddress);
        emit RewardTokenUpdated(tokenAddress);
    }

    function setHumanIdContract(address humanIdAddress) external onlyOwner {
        require(humanIdAddress != address(0), "AirdropClaim: humanId required");
        humanIdContract = IHumanId(humanIdAddress);
        emit HumanIdUpdated(humanIdAddress);
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

    function claim(
        uint256 fid,
        uint256 nonce,
        uint256 amount,
        uint256 deadline,
        bytes calldata signature
    ) external {
        require(block.timestamp <= deadline, "AirdropClaim: signature expired");
        require(!nonceUsedByFid[fid][nonce], "AirdropClaim: nonce used");
        require(!claimedByFid[fid], "AirdropClaim: already claimed");
        require(amount == claimAmount, "AirdropClaim: invalid amount");
        require(rewardPool >= amount, "AirdropClaim: pool empty");

        address owner = humanIdContract.ownerOf(fid);
        require(owner == msg.sender, "AirdropClaim: not humanId owner");

        bytes32 structHash = keccak256(
            abi.encode(CLAIM_TYPEHASH, msg.sender, fid, nonce, amount, deadline)
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        address recovered = digest.recover(signature);
        require(recovered == signer, "AirdropClaim: invalid signature");

        nonceUsedByFid[fid][nonce] = true;
        claimedByFid[fid] = true;
        rewardPool -= amount;
        require(rewardToken.transfer(msg.sender, amount), "AirdropClaim: transfer failed");

        emit Claimed(msg.sender, fid, amount, nonce);
    }
}
