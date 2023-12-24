import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { readWalletsFile } from "./file-reader";
import * as fsPromise from "fs/promises";
import * as dotenv from "dotenv";
dotenv.config();

const privateKey = parsePrivateKey(
  process.env.TOKEN_HOLDER_PRIVATE_KEY as string
);
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

export async function airdrop() {
  const wallets: string[] = await readWalletsFile();

  const received: string[] = [];
  const instructions = [];
  for (const wallet of wallets) {
    const msg = {
      transfer: {
        recipient: wallet,
        amount: process.env.AMOUNT as string,
      },
    };
    instructions.push({ contractAddress, msg });
  }

  const messagesToExecuteEachRun = 30;
  for (
    let i = 0;
    i < Math.ceil(instructions.length / messagesToExecuteEachRun);
    i++
  ) {
    const currentInstructions = instructions.slice(
      i * messagesToExecuteEachRun,
      i * messagesToExecuteEachRun + messagesToExecuteEachRun
    );

    const gas = String(calculateGasCost(currentInstructions.length));
    const fee = {
      amount: [
        {
          denom: "usei",
          amount: String(currentInstructions.length * 20000),
        },
      ],
      gas,
    };

    try {
      const tx = await client.executeMultiple(
        walletAddress,
        currentInstructions,
        fee
      );

      console.log(
        `Sent to: ${wallets
          .slice(
            i * messagesToExecuteEachRun,
            i * messagesToExecuteEachRun + messagesToExecuteEachRun
          )
          .join(", ")} | Tx hash: ${tx.transactionHash}`
      );
      received.push(
        ...wallets.slice(
          i * messagesToExecuteEachRun,
          i * messagesToExecuteEachRun + messagesToExecuteEachRun
        )
      );
    } catch (error) {
      console.error(error);
    }
  }

  const errors = wallets.filter((wallet) => !received.includes(wallet));
  await fsPromise.writeFile("didnt_receive.txt", errors.join("\n"));
  await fsPromise.writeFile("received.txt", received.join("\n"));
}

function calculateGasCost(numMessages: number) {
  const baseGasCost = 200000;
  const extraGasCostPerMessage = 90000;
  const totalExtraGasCost = (numMessages - 1) * extraGasCostPerMessage;

  return baseGasCost + totalExtraGasCost;
}

function parsePrivateKey(privateKey: string) {
  if (!privateKey)
    throw new Error(
      "No private key provided, please verify if there is a .env file with a TOKEN_HOLDER_PRIVATE_KEY variable"
    );

  if (privateKey.startsWith("0x")) {
    return privateKey.slice(2);
  }

  return privateKey;
}
