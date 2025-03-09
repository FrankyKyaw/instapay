'use client';

import Image from "next/image";
import { useState } from 'react';

export default function Home() {
  const [amount, setAmount] = useState('');
  const [tokenType, setTokenType] = useState<'ETH' | 'USDC'>('ETH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount: parseFloat(amount),
          tokenType
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setSuccess(`Payment successful!\nFrom: ${data.from}\nTo: ${data.to}\nAmount: ${data.amount} ${data.token}\nTransaction: ${data.txHash}`);
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
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
          <h1 className="text-2xl font-bold mb-6">Company to User Payment</h1>
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
            <p>Select token type and enter amount</p>
            <p className="text-sm mt-1">Make sure the company wallet has sufficient balance</p>
          </div>
          <form onSubmit={handlePayment} className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Token Type</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="ETH"
                    checked={tokenType === 'ETH'}
                    onChange={(e) => setTokenType(e.target.value as 'ETH')}
                    className="mr-2"
                  />
                  ETH
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="USDC"
                    checked={tokenType === 'USDC'}
                    onChange={(e) => setTokenType(e.target.value as 'USDC')}
                    className="mr-2"
                  />
                  USDC
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium mb-1">
                Amount ({tokenType})
              </label>
              <div className="relative">
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Enter amount in ${tokenType}`}
                  className="w-full p-2 border rounded pr-16"
                  required
                  min="0"
                  step={tokenType === 'ETH' ? "0.000000000000000001" : "0.000001"} // 18 decimals for ETH, 6 for USDC
                />
                <span className="absolute right-3 top-2 text-gray-500">{tokenType}</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Processing Payment...' : `Send ${tokenType} Payment`}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded whitespace-pre-line">
              {success}
            </div>
          )}
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
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
