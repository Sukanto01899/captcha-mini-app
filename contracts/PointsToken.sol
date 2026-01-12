// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PointsToken is ERC20, Ownable {
    address public minter;

    event MinterUpdated(address indexed minter);

    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) Ownable(msg.sender) {}

    function setMinter(address minter_) external onlyOwner {
        require(minter_ != address(0), "PointsToken: minter required");
        minter = minter_;
        emit MinterUpdated(minter_);
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == minter, "PointsToken: not minter");
        _mint(to, amount);
    }

    function burnFrom(address account, uint256 amount) external {
        uint256 currentAllowance = allowance(account, msg.sender);
        require(currentAllowance >= amount, "PointsToken: insufficient allowance");
        _approve(account, msg.sender, currentAllowance - amount);
        _burn(account, amount);
    }

    function _update(address from, address to, uint256 value) internal override {
        if (from != address(0) && to != address(0)) {
            revert("PointsToken: non-transferable");
        }
        super._update(from, to, value);
    }
}
