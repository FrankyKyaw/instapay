import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Check if environment variables are defined
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    console.log('Fetch Employees API called');
    
    // Fetch all employees from the Employees table
    const { data, error } = await supabase
      .from('Employees')
      .select('id, name, crypto_wallet_address')
      .order('name');

    if (error) {
      console.error('Error fetching employees:', error);
      return NextResponse.json(
        { error: 'Failed to fetch employees: ' + error.message },
        { status: 500 }
      );
    }

    console.log(`Successfully fetched ${data.length} employees`);
    
    return NextResponse.json({
      success: true,
      employees: data
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}