import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { PromisePool } from "@supercharge/promise-pool";
import * as fsPromise from "fs/promises";
import { readWalletsFile } from "./file-reader";

const privateKey = process.env.TOKEN_HOLDER_PRIVATE_KEY as string;
const signer = await DirectSecp256k1Wallet.fromKey(
  new Uint8Array(
    privateKey.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  ),
  "sei"
);
const walletAddress = (await signer.getAccounts())[0].address;
const contractAddress = process.env.TOKEN_CONTRACT_ADDRESS as string;
const rpcEndpoint = process.env.RPC_ENDPOINT as string;

const client = await SigningCosmWasmClient.connectWithSigner(
  rpcEndpoint,
  signer
);

const fee = {
  amount: [
    {
      denom: "usei",
      amount: "50000",
    },
  ],
  gas: "200000",
};

export async function airdrop() {
  const wallets: string[] = await readWalletsFile();

  const received: string[] = [];
  await PromisePool.withConcurrency(5)
    .for(wallets)
    .process(async (wallet) => {
      const msg = {
        transfer: {
          recipient: wallet,
          amount: process.env.AMOUNT as string,
        },
      };
      const tx = await client.execute(walletAddress, contractAddress, msg, fee);

      console.log(`Sent to: ${wallet} | Tx hash: ${tx.transactionHash}`);
      received.push(wallet);
    });

  const errors = wallets.filter((wallet) => !received.includes(wallet));
  await fsPromise.writeFile("didnt_receive.txt", errors.join("\n"));
  await fsPromise.writeFile("received.txt", received.join("\n"));
}
