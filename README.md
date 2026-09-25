# Polygon NFT Deployer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Polygon](https://img.shields.io/badge/Polygon-PoS-8247E5.svg)](https://polygonscan.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636.svg)](https://soliditylang.org)

A professional, script-driven toolkit for deploying an ERC-721 NFT collection to Polygon — from smart contract to deployment to minting. Built on [Hardhat](https://hardhat.org), [OpenZeppelin Contracts](https://openzeppelin.com/contracts), and [viem](https://viem.sh).

## Features

- **ERC-721 collection contract** — fixed max supply, per-wallet mint limit, configurable base URI, owner withdrawals
- **One-command deployment** — constructor args come straight from `.env`, deployed via viem
- **Mint script** — checks the on-chain wallet limit and remaining supply before sending the transaction
- **Metadata template** — ERC-721 metadata JSON example for your tokens
- **Testnet-first workflow** — rehearse on Amoy before touching mainnet
- **CI** — GitHub Actions compiles contracts and TypeScript on every push

## Prerequisites

- Node.js 18+
- A Polygon RPC endpoint (dedicated provider recommended: Alchemy, Infura, QuickNode)
- Deployer wallet private key, plus POL for gas

## Quickstart

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Edit .env: set RPC_URL and PRIVATE_KEY

# 3. Compile the contract
npx hardhat compile

# 4. Deploy (prints the contract address — save it as CONTRACT_ADDRESS in .env)
npm run deploy

# 5. Mint
npm run mint
```

> ⚠️ **Always test on Amoy first.** Point `RPC_URL` at a Amoy endpoint and fund a throwaway deployer wallet before running against Polygon mainnet.

## Project structure

```
├── contracts/
│   └── BullBrewNFT.sol      # ERC-721 collection contract
├── src/
│   ├── config.ts            # chain definition + env configuration
│   ├── deploy.ts            # deploy the contract via viem
│   └── mint.ts              # mint tokens with on-chain checks
├── assets/
│   └── metadata-template.json
├── hardhat.config.ts        # Polygon network (chain id 137)
├── .env.example
└── .github/workflows/ci.yml
```

## Usage

### 1. Compile

```bash
npx hardhat compile
```

### 2. Deploy

```bash
npm run deploy
```

Deploys `BullBrewNFT` with your collection name, symbol, max supply, per-wallet limit, mint price, and base URI. Prints the contract address and a Polygonscan link — save the address as `CONTRACT_ADDRESS` in `.env`.

To verify the contract on Polygonscan, use these constructor arguments in order: `COLLECTION_NAME`, `COLLECTION_SYMBOL`, `MAX_SUPPLY`, `MAX_PER_WALLET`, `MINT_PRICE` (in wei), `BASE_URI`.

### 3. Mint

```bash
npm run mint
```

Mints `MINT_QUANTITY` tokens to `MINT_TO` (defaults to the deployer wallet). The script reads the on-chain wallet limit and remaining supply first, and aborts with a clear error instead of sending a transaction that would revert.

## Configuration

| Variable | Description |
|---|---|
| `RPC_URL` | Polygon RPC endpoint (Amoy for testing, mainnet for launch) |
| `PRIVATE_KEY` | Hex private key of the deployer wallet (0x prefix optional) |
| `CONTRACT_ADDRESS` | Deployed contract address (set after `npm run deploy`) |
| `COLLECTION_NAME` | Collection display name (constructor arg) |
| `COLLECTION_SYMBOL` | Collection symbol (constructor arg) |
| `MAX_SUPPLY` | Max tokens that can ever be minted |
| `MAX_PER_WALLET` | Max tokens per wallet |
| `MINT_PRICE` | Price per mint in POL (decimal string, e.g. "0.05") |
| `BASE_URI` | Base URI for token metadata — token #1 resolves to `<BASE_URI>1` |
| `MINT_TO` | Recipient of minted tokens (defaults to deployer) |
| `MINT_QUANTITY` | How many tokens to mint (default 1) |

## Security

- **Never commit `.env`** — it holds your deployer private key. Use a dedicated deployer wallet, never your main wallet.
- Test the full flow on Amoy before mainnet.
- Verify the deployed contract on Polygonscan before announcing a mint.
- This contract is intentionally minimal — get an audit before putting significant value behind it.

## Roadmap

- [ ] Allow-list / merkle-tree presale phase
- [ ] EIP-2981 on-chain royalties
- [ ] Reveal mechanism (placeholder → final metadata)
- [ ] Frontend mint button component
- [ ] Contract verification script (`hardhat-verify`)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
