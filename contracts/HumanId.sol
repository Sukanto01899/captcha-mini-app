// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract HumanId is ERC721, Ownable {
    using Strings for uint256;

    string private baseTokenURI;
    mapping(uint256 => bool) private mintedByFid;
    mapping(address => bool) private mintedByAddress;
    mapping(uint256 => string) private humanIdByFid;

    event HumanIdMinted(address indexed to, uint256 indexed fid, string humanId, uint256 pricePaid);
    event BaseURIUpdated(string newBaseURI);
    event Withdrawn(address indexed to, uint256 amount);

    constructor(string memory name_, string memory symbol_, string memory baseURI_)
        ERC721(name_, symbol_)
        Ownable(msg.sender)
    {
        baseTokenURI = baseURI_;
    }

    function mintSelf(uint256 fid, string calldata humanId) external payable {
        require(msg.value == 0.0001 ether, "HumanId: price is 0.0001 ETH");
        _mintWithFid(msg.sender, fid, humanId, msg.value);
    }

    function mintFor(address to, uint256 fid, string calldata humanId) external onlyOwner {
        _mintWithFid(to, fid, humanId, 0);
    }

    function humanIdOf(uint256 fid) external view returns (string memory) {
        return humanIdByFid[fid];
    }

    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    function withdraw(address payable to) external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "HumanId: no balance");
        (bool success, ) = to.call{value: balance}("");
        require(success, "HumanId: withdraw failed");
        emit Withdrawn(to, balance);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "HumanId: token not minted");
        return string(abi.encodePacked(baseTokenURI, tokenId.toString()));
    }

    function _mintWithFid(address to, uint256 fid, string calldata humanId, uint256 pricePaid) internal {
        require(!mintedByFid[fid], "HumanId: fid already minted");
        require(!mintedByAddress[to], "HumanId: address already minted");
        mintedByFid[fid] = true;
        mintedByAddress[to] = true;
        humanIdByFid[fid] = humanId;
        _safeMint(to, fid);
        emit HumanIdMinted(to, fid, humanId, pricePaid);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("HumanId: soulbound");
        }
        return super._update(to, tokenId, auth);
    }
}
