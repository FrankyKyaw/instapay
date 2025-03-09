import { createClient } from '@supabase/supabase-js';
import { NewClient, NewAccount, withPrivateKey, AddressFromHex } from '@radiustechsystems/sdk';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Convert ETH to Wei with precision
function ethToWei(eth: number): bigint {
  return BigInt(Math.floor(eth * 1e6)) * BigInt(1e12);
}

export async function initiateRadiusPayment(walletAddress: string, amountInMilliETH: number) {
  try {
    const client = await NewClient(process.env.NEXT_PUBLIC_RPC_PROVIDER_URL!);
    const companyAccount = await NewAccount(withPrivateKey(process.env.COMPANY_PRIVATE_KEY!, client));

    const recipient = AddressFromHex(walletAddress);

    const paymentAmount = ethToWei(amountInMilliETH * 0.001);

    const txResult = await companyAccount.send(client, recipient, paymentAmount);

    return txResult.txHash.hex();
  } catch (error) {
    console.error('Error initiating Radius payment:', error);
    throw error;
  }
}