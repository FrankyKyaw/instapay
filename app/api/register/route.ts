import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    // Correctly destructure request body
    const { name, crypto_wallet_address, pay_it_now_status } = await request.json();

    if (!name || !crypto_wallet_address) {
      return NextResponse.json({ error: 'Name and wallet address required' }, { status: 400 });
    }

    if (!crypto_wallet_address.startsWith('0x') || crypto_wallet_address.length !== 42) {
      return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 });
    }

    // Explicitly generate UUID
    const generatedUUID = crypto.randomUUID();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Insert into Employees table
    const { data: employeeData, error: employeeError } = await supabase
      .from('Employees')
      .insert({
        id: generatedUUID,
        name: name,
        crypto_wallet_address: crypto_wallet_address,
        pay_it_now_status: !!pay_it_now_status,
        credit_balance: 0,
      })
      .select()
      .single();

    if (employeeError) {
      console.error('Error inserting employee:', employeeError);
      return NextResponse.json({ error: employeeError.message }, { status: 500 });
    }

    // Insert into doordash_employees table
    const { error: ddError } = await supabase
      .from('Doordash_database')
      .insert({
        id: generatedUUID,
        balance: 0
      });

    if (ddError) {
      console.error('Error inserting DoorDash employee:', ddError);
      // Optional rollback logic here
      return NextResponse.json({ error: ddError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'User registered successfully in both tables',
      user: employeeData
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
