# sei-airdrop-sender

To install dependencies:

```bash
bun install
```

**Creating a .env File**

- Navigate to the Root Directory:
- Create a new file in the root directory and name it .env. Make sure the file is at the same level as your package.json file.
- Inside the .env file, define the necessary environment variables using the KEY=VALUE syntax. Each variable should be on a new line.

Example .env file:

```
RPC_ENDPOINT=
TOKEN_CONTRACT_ADDRESS=
AMOUNT=1000000
TOKEN_HOLDER_PRIVATE_KEY=
```

**Populating Environment Variables**

_RPC_ENDPOINT_:
Replace the value of RPC_ENDPOINT with the appropriate RPC (Remote Procedure Call) endpoint for the SEI Network. See [https://docs.sei.io/develop/resources](https://docs.sei.io/develop/resources)

_TOKEN_CONTRACT_ADDRESS_:
Set the TOKEN_CONTRACT_ADDRESS to the address of the token contract.

_AMOUNT_:
Adjust the AMOUNT variable to the desired amount you want to airdrop. This value should simulate the decimal part by adding six zeros to the end of the number. For example, if you want to send 1000, populate it as 1000000000. So, for any value you want to send, remember to set it followed by the decimal part.

_TOKEN_HOLDER_PRIVATE_KEY_:
Fill in the TOKEN_HOLDER_PRIVATE_KEY with the private key of the token holder. Ensure that this sensitive information is kept secure and not shared publicly.

To run:

```bash
bun start
```

This project was created using `bun init` in bun v1.0.0. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
