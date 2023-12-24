import LineByLine from "n-readlines";

const liner = new LineByLine("./wallets.txt");

export async function readWalletsFile() {
  const wallets: string[] = [];
  let line;
  while ((line = liner.next())) {
    wallets.push(line.toString("utf8").trim());
  }

  return wallets;
}
