'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Register() {
  const [name, setName] = useState('');
  const [cryptoWalletAddress, setCryptoWalletAddress] = useState('');
  const [payItNowStatus, setPayItNowStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name,
          crypto_wallet_address: cryptoWalletAddress,
          pay_it_now_status: payItNowStatus
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setSuccess(`Registration successful! User ${data.user.name} has been registered.`);
      // Reset form
      setName('');
      setCryptoWalletAddress('');
      setPayItNowStatus(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
          <h1 className="text-2xl font-bold mb-6">Register Employee</h1>
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
            <p>Enter employee details to register</p>
            <p className="text-sm mt-1">Wallet address must start with 0x and be 42 characters long</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter employee name"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="cryptoWalletAddress" className="block text-sm font-medium mb-1">
                Crypto Wallet Address
              </label>
              <input
                id="cryptoWalletAddress"
                type="text"
                value={cryptoWalletAddress}
                onChange={(e) => setCryptoWalletAddress(e.target.value)}
                placeholder="0x..."
                className="w-full p-2 border rounded"
                required
                pattern="0x[a-fA-F0-9]{40}"
                title="Wallet address must start with 0x followed by 40 hexadecimal characters"
              />
            </div>
            <div className="flex items-center">
              <input
                id="payItNowStatus"
                type="checkbox"
                checked={payItNowStatus}
                onChange={(e) => setPayItNowStatus(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="payItNowStatus" className="text-sm font-medium">
                Pay It Now Status
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register Employee'}
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
            <Link href="/" className="text-blue-500 hover:underline">
              Back to Payment Page
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