import readline from "readline";
import fs from "fs";

const fileStream = fs.createReadStream("../wallets.txt");
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity,
});

export async function readWalletsFile() {
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

  return wallets;
}
