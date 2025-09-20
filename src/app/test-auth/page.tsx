"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function TestAuth() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("admin@xaab.org");
  const [password, setPassword] = useState("admin123");
  const [result, setResult] = useState<any>(null);

  const handleTestLogin = async () => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setResult(result);
  };

  if (status === "loading") {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Current Session:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Test Login:</h2>
        <div className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Password"
          />
          <button
            onClick={handleTestLogin}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Login
          </button>
        </div>
      </div>

      {result && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Login Result:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {session && (
        <div className="mb-4">
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Test Credentials:</h2>
        <div className="space-y-1 text-sm">
          <div><strong>Admin:</strong> admin@xaab.org / admin123</div>
          <div><strong>User:</strong> user@xaab.org / password123</div>
        </div>
      </div>
    </div>
  );
}

