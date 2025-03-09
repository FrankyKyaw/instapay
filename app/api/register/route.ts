import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const { name, crypto_wallet_address, pay_it_now_status } = await request.json();
    console.log(name, crypto_wallet_address, pay_it_now_status)
    if (!name || !crypto_wallet_address) {
      return NextResponse.json(
        { error: 'Name and wallet address are required' },
        { status: 400 }
      );
    }

    // Validate wallet address format (simple check for 0x prefix and length)
    if (!crypto_wallet_address.startsWith('0x') || crypto_wallet_address.length !== 42) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('Employees')
      .insert([
        {
          name,
          crypto_wallet_address,
          pay_it_now_status: pay_it_now_status === true, // Convert to boolean if not already
          credit_balance: 0
        }
      ])
      .select();

    if (error) {
      console.error('Error registering user:', error);
      return NextResponse.json(
        { error: 'Failed to register user: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: data[0]
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}