import { useState } from 'react';

export default function Landing() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-orange-100 to-pink-100 text-gray-700">
      <h1 className="text-4xl font-bold">✨ Welcome, PrepPal Dev! ✨</h1>
      <p className="text-lg">
        Hope you&apos;re having a good day. You got this 🤝
      </p>

      <button
        onClick={() => setCount((count) => count + 1)}
        className="rounded bg-blue-500 px-4 py-2 text-white shadow hover:bg-blue-600"
      >
        Click me → {count}
      </button>

      <p className="text-sm opacity-70">Every click = +1 dev energy ⚡</p>
    </div>
  );
}
