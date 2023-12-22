import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { PromisePool } from "@supercharge/promise-pool";
import readline from "readline";
import * as fs from "fs";
import * as fsPromise from "fs/promises";

const fileStream = fs.createReadStream("./wallets.txt");
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity,
});

const wallets: string[] = [];
await new Promise((resolve, reject) => {
  rl.on("line", (line) => {
    wallets.push(line.trim());
  });

  rl.on("close", () => {
    console.log("Finished reading the file.");
    resolve(true);
  });

  rl.on("error", (err) => {
    console.error(err);
    reject(false);
  });
});

const privateKey = process.env.PRIVATE_KEY as string;
const signer = await DirectSecp256k1Wallet.fromKey(
  new Uint8Array(
    privateKey.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  ),
  "sei"
);
const walletAddress = (await signer.getAccounts())[0].address;
const contractAddress = process.env.CONTRACT_ADDRESS as string;
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

async function airdrop() {
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

airdrop();