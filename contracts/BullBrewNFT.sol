// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title BullBrewNFT
/// @notice Minimal ERC-721 collection: fixed max supply, per-wallet mint limit,
///         configurable base URI, and owner withdrawals.
contract BullBrewNFT is ERC721, Ownable {
    uint256 public immutable maxSupply;
    uint256 public immutable maxPerWallet;
    uint256 public immutable mintPrice;

    string private _baseTokenURI;
    uint256 private _nextTokenId = 1;
    mapping(address => uint256) public mintedPerWallet;

    error InvalidQuantity();
    error MaxSupplyReached();
    error WalletLimitExceeded();
    error IncorrectPayment();
    error WithdrawFailed();

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        uint256 maxPerWallet_,
        uint256 mintPrice_,
        string memory baseURI_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        maxSupply = maxSupply_;
        maxPerWallet = maxPerWallet_;
        mintPrice = mintPrice_;
        _baseTokenURI = baseURI_;
    }

    /// @notice Mint `quantity` tokens. Requires exact payment of mintPrice * quantity.
    function mint(uint256 quantity) external payable {
        if (quantity == 0) revert InvalidQuantity();
        if (_nextTokenId + quantity - 1 > maxSupply) revert MaxSupplyReached();
        if (mintedPerWallet[msg.sender] + quantity > maxPerWallet) revert WalletLimitExceeded();
        if (msg.value != mintPrice * quantity) revert IncorrectPayment();

        mintedPerWallet[msg.sender] += quantity;
        for (uint256 i = 0; i < quantity; i++) {
            _safeMint(msg.sender, _nextTokenId++);
        }
    }

    /// @notice Number of tokens minted so far.
    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    /// @notice Update the base URI (e.g. after uploading final metadata).
    function setBaseURI(string calldata baseURI_) external onlyOwner {
        _baseTokenURI = baseURI_;
    }

    /// @notice Withdraw all collected mint proceeds to the owner.
    function withdraw() external onlyOwner {
        (bool ok, ) = owner().call{value: address(this).balance}("");
        if (!ok) revert WithdrawFailed();
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}
