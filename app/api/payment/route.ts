import { NextResponse } from 'next/server';
import {
  Account,
  Address,
  AddressFromHex,
  Client,
  NewClient,
  NewAccount,
  withPrivateKey,
} from '@radiustechsystems/sdk';

if (!process.env.NEXT_PUBLIC_RPC_PROVIDER_URL || !process.env.COMPANY_PRIVATE_KEY || !process.env.USER_ADDRESS || !process.env.COMPANY_ADDRESS) {
  throw new Error('Missing required environment variables');
}

// Convert ETH to Wei (1 ETH = 1e18 Wei)
function ethToWei(eth: number): bigint {
  return BigInt(Math.floor(eth * 1e6)) * BigInt(1e12); // Convert to Wei with better precision
}

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Initialize Radius client and company account
    const client: Client = await NewClient(process.env.NEXT_PUBLIC_RPC_PROVIDER_URL || '');
    const companyAccount: Account = await NewAccount(
      withPrivateKey(process.env.COMPANY_PRIVATE_KEY || '', client)
    );

    // Convert user address
    const recipientAddress: Address = AddressFromHex(process.env.USER_ADDRESS || '');

    // Convert amount to Wei (using much smaller amounts for testing)
    // Now sending amount in milliETH (1 milliETH = 0.001 ETH)
    const paymentAmount = ethToWei(amount * 0.001);

    console.log(`Sending ${amount} milliETH (${paymentAmount} Wei)`);

    // Send payment
    const receipt = await companyAccount.send(
      client,
      recipientAddress,
      paymentAmount
    );

    return NextResponse.json({
      success: true,
      txHash: receipt.txHash.hex(),
      from: process.env.COMPANY_ADDRESS,
      to: process.env.USER_ADDRESS,
      amount: `${amount} milliETH`,
      amountInWei: paymentAmount.toString()
    });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Payment failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}