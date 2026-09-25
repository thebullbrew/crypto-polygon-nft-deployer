import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  createPublicClient,
  createWalletClient,
  http,
  type Abi,
  type Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { chain, config } from "./config";

// Produced by `npx hardhat compile` — this script assumes the artifact exists.
const ARTIFACT_PATH = join(
  __dirname,
  "..",
  "artifacts",
  "contracts",
  "BullBrewNFT.sol",
  "BullBrewNFT.json"
);

async function main(): Promise<void> {
  if (!existsSync(ARTIFACT_PATH)) {
    throw new Error("Contract artifact not found — run `npx hardhat compile` first, then retry.");
  }
  if (!config.contractAddress) {
    throw new Error("CONTRACT_ADDRESS is not set — run `npm run deploy` first and add it to .env.");
  }

  const artifact = JSON.parse(readFileSync(ARTIFACT_PATH, "utf8")) as { abi: Abi };
  const address: Address = config.contractAddress;

  const account = privateKeyToAccount(config.privateKey);
  const transport = http(config.rpcUrl);
  const publicClient = createPublicClient({ chain, transport });
  const walletClient = createWalletClient({ account, chain, transport });

  const to: Address = config.mintTo ?? account.address;
  const quantity = config.mintQuantity;
  if (quantity < 1n) {
    throw new Error("MINT_QUANTITY must be at least 1.");
  }

  // Read the on-chain limits first so we fail with a clear error
  // instead of sending a transaction that is guaranteed to revert.
  const readBigInt = async (functionName: string, args: readonly unknown[] = []): Promise<bigint> =>
    (await publicClient.readContract({ address, abi: artifact.abi, functionName, args })) as bigint;

  const [minted, limit, price, totalMinted, maxSupply] = await Promise.all([
    readBigInt("mintedPerWallet", [to]),
    readBigInt("maxPerWallet"),
    readBigInt("mintPrice"),
    readBigInt("totalMinted"),
    readBigInt("maxSupply"),
  ]);

  if (minted + quantity > limit) {
    throw new Error(
      `Wallet limit exceeded: ${to} already minted ${minted.toString()} of ${limit.toString()} allowed.`
    );
  }
  if (totalMinted + quantity > maxSupply) {
    throw new Error(
      `Not enough supply left: ${(maxSupply - totalMinted).toString()} of ${maxSupply.toString()} remaining.`
    );
  }

  const value = price * quantity;
  console.log(`Minting ${quantity.toString()} token(s) to ${to} for ${value.toString()} wei...`);

  const hash = await walletClient.writeContract({
    address,
    abi: artifact.abi,
    functionName: "mint",
    args: [quantity],
    value,
  });

  console.log(`Mint tx: ${hash}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") {
    throw new Error("Mint transaction failed — inspect it at the explorer link above.");
  }

  console.log(`Minted! Explorer: ${config.explorerUrl}/tx/${hash}`);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
