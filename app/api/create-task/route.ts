import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Check if environment variables are defined
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    console.log('Create Task API called');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { 
      assigned_user, 
      task_description, 
      reward_amount, 
      status = 'pending' // Default status if not provided
    } = body;

    // Validate required fields
    if (!assigned_user || !task_description || !reward_amount ) {
      return NextResponse.json(
        { 
          error: 'Missing required fields. Please provide assigned_user, task_description, reward_amount' 
        },
        { status: 400 }
      );
    }

    // Validate reward amount is a number
    if (isNaN(parseFloat(reward_amount))) {
      return NextResponse.json(
        { error: 'Reward amount must be a valid number' },
        { status: 400 }
      );
    }

    console.log('Attempting to create task:', { 
      assigned_user, 
      task_description, 
      reward_amount, 
      status 
    });
    
    // Insert new task record
    const { data, error } = await supabase
      .from('Tasks')
      .insert([
        {
          assigned_user,
          task_description,
          reward_amount: parseFloat(reward_amount),
          status,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Error creating task:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      
      return NextResponse.json(
        { error: 'Failed to create task: ' + error.message },
        { status: 500 }
      );
    }

    console.log('Task creation successful:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Task created successfully',
      task: data[0]
    });
  } catch (error) {
    console.error('Task creation error:', error);
    return NextResponse.json(
      { error: 'Task creation failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}