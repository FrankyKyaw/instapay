'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Employee {
  id: string;
  name: string;
  crypto_wallet_address: string;
}

export default function CreateTask() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingEmployees, setFetchingEmployees] = useState(true);
  const [employeesError, setEmployeesError] = useState('');
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [assignedUser, setAssignedUser] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch employees when component mounts
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch employees: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setEmployees(data.employees);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setEmployeesError(err instanceof Error ? err.message : 'Failed to load employees');
      } finally {
        setFetchingEmployees(false);
      }
    };
    
    fetchEmployees();
  }, []);

  // Update assigned user when employee selection changes
  useEffect(() => {
    if (selectedEmployeeId) {
      const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
      if (selectedEmployee) {
        setAssignedUser(selectedEmployee.crypto_wallet_address);
      }
    }
  }, [selectedEmployeeId, employees]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Submitting task:', { 
        assigned_user: assignedUser, 
        task_description: taskDescription, 
        reward_amount: rewardAmount, 
        company_id: companyId, 
        status 
      });

      const response = await fetch('/api/create-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          assigned_user: assignedUser,
          task_description: taskDescription,
          reward_amount: rewardAmount,
          company_id: companyId,
          status
        }),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Task creation response:', data);
      
      // Get employee name for success message
      const employeeName = selectedEmployeeId ? 
        (employees.find(emp => emp.id === selectedEmployeeId)?.name || assignedUser) : 
        assignedUser;
      
      setSuccess(`Task created successfully! Task "${taskDescription}" has been assigned to ${employeeName}.`);
      // Reset form fields except employee and company
      setTaskDescription('');
      setRewardAmount('');
    } catch (err) {
      console.error('Task creation error:', err);
      setError(err instanceof Error ? err.message : 'Task creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <div className="max-w-md mx-auto mt-10">
          <h1 className="text-2xl font-bold mb-6">Create New Task</h1>
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
            <p>Enter task details to create a new assignment</p>
            <p className="text-sm mt-1">All fields are required except status (defaults to pending)</p>
          </div>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label htmlFor="selectedEmployeeId" className="block text-sm font-medium mb-1">
                Select Employee
              </label>
              {fetchingEmployees ? (
                <div className="text-sm text-gray-500">Loading employees...</div>
              ) : employeesError ? (
                <div className="text-sm text-red-500">{employeesError}</div>
              ) : (
                <select
                  id="selectedEmployeeId"
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">-- Select an employee --</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} ({employee.crypto_wallet_address.substring(0, 6)}...{employee.crypto_wallet_address.substring(38)})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label htmlFor="assignedUser" className="block text-sm font-medium mb-1">
                Assigned User (Wallet Address)
              </label>
              <input
                id="assignedUser"
                type="text"
                value={assignedUser}
                onChange={(e) => setAssignedUser(e.target.value)}
                placeholder="0x..."
                className="w-full p-2 border rounded"
                required
                pattern="0x[a-fA-F0-9]{40}"
                title="Wallet address must start with 0x followed by 40 hexadecimal characters"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be automatically filled when you select an employee, or you can enter manually
              </p>
            </div>
            <div>
              <label htmlFor="taskDescription" className="block text-sm font-medium mb-1">
                Task Description
              </label>
              <textarea
                id="taskDescription"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Enter detailed task description"
                className="w-full p-2 border rounded h-24"
                required
              />
            </div>
            <div>
              <label htmlFor="rewardAmount" className="block text-sm font-medium mb-1">
                Reward Amount (USDC)
              </label>
              <input
                id="rewardAmount"
                type="number"
                step="0.01"
                min="0"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
                placeholder="0.00"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="companyId" className="block text-sm font-medium mb-1">
                Company ID
              </label>
              <input
                id="companyId"
                type="text"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                placeholder="Enter company identifier"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Creating Task...' : 'Create Task'}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
              {success}
            </div>
          )}
          <div className="mt-6 text-center">
            <Link href="/" className="text-blue-500 hover:underline mr-4">
              Back to Payment Page
            </Link>
            <Link href="/register" className="text-blue-500 hover:underline">
              Register Employee
            </Link>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
      </footer>
    </div>
  );
}