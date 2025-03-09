import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { initiateRadiusPayment } from '@/utils/pollBalance';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskId, status } = body;

    if (!taskId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: taskId and status' },
        { status: 400 }
      );
    }

    // Get the task details
    const { data: task, error: taskError } = await supabase
      .from('Tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Update the task status
    const { error: updateError } = await supabase
  .from('Tasks')
  .update({ status})
  .eq('id', taskId);

if (updateError) {
  console.error('Supabase update error:', updateError);
  return NextResponse.json(
    { error: 'Failed to update task status: ' + updateError.message },
    { status: 500 }
  );
}

    // If task is completed, process payment or update balances
    if (status === 'completed') {
      // Get employee details
      const { data: employee, error: employeeError } = await supabase
        .from('Employees')
        .select('*')
        .eq('id', task.assigned_user)
        .single();

      if (employeeError || !employee) {
        return NextResponse.json(
          { error: 'Employee not found' },
          { status: 404 }
        );
      }

      // Get Doordash record
      const { data: doordashRecord, error: doordashError } = await supabase
        .from('Doordash_database')
        .select('*')
        .eq('id', task.assigned_user)
        .single();

      if (doordashError) {
        return NextResponse.json(
          { error: 'Doordash record not found' },
          { status: 404 }
        );
      }

      const rewardAmount = parseFloat(task.reward_amount);

      // If pay_it_now_status is true, make immediate payment
      if (employee.pay_it_now_status) {
        try {
          // Make payment
          const txHash = await initiateRadiusPayment(
            employee.crypto_wallet_address,
            rewardAmount
          );

          // Update task with payment details
          await supabase
            .from('Tasks')
            .update({
              payment_status: 'paid',
              payment_tx_hash: txHash,
              payment_timestamp: new Date().toISOString()
            })
            .eq('id', taskId);

          return NextResponse.json({
            success: true,
            message: 'Task completed and payment processed',
            txHash
          });
        } catch (paymentError) {
          console.error('Payment error:', paymentError);
          return NextResponse.json(
            { error: 'Payment processing failed' },
            { status: 500 }
          );
        }
      } else {
        // Update balances without payment
        const newEmployeeBalance = (parseFloat(employee.credit_balance) || 0) + rewardAmount;
        const newDoordashBalance = (parseFloat(doordashRecord?.balance) || 0) + rewardAmount;

        // Update employee balance
        const { error: empUpdateError } = await supabase
          .from('Employees')
          .update({ credit_balance: newEmployeeBalance })
          .eq('id', task.assigned_user);

        if (empUpdateError) {
          return NextResponse.json(
            { error: 'Failed to update employee balance' },
            { status: 500 }
          );
        }

        // Update Doordash balance
        const { error: ddUpdateError } = await supabase
          .from('Doordash_database')
          .update({ balance: newDoordashBalance })
          .eq('id', task.assigned_user);

        if (ddUpdateError) {
          return NextResponse.json(
            { error: 'Failed to update Doordash balance' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Task completed and balances updated',
          newEmployeeBalance,
          newDoordashBalance
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Task status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}