import {
    Account,
    Address,
    AddressFromHex,
    Client,
    NewClient,
    NewAccount,
    Receipt,
    withPrivateKey,
  } from '@radiustechsystems/sdk';
  
  // Replace the following values with your own
  const RADIUS_ENDPOINT = "https://rpc.testnet.tryradi.us/62036b877e733bbcb08289075fc546fe4bce2658ec1537e4";
  const PRIVATE_KEY = "82e5c2442f81da6d860398560743b041557608b1489310749e4867b89aff0c8f";
  
  async function main() {
    const client: Client = await NewClient(RADIUS_ENDPOINT);
    const account: Account = await NewAccount(withPrivateKey(PRIVATE_KEY, client));
    const recipient: Address = AddressFromHex('0x...'); // Replace with recipient address
    const amount: bigint = BigInt(100);
    const receipt: Receipt = await account.send(client, recipient, amount);
  
    console.log('Transaction hash:', receipt.txHash.hex());
  }
  
  main().catch(console.error);
  