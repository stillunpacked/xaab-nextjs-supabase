"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SupabaseExample() {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const testConnection = async () => {
    setLoading(true);
    setMessage("Testing connection...");
    
    if (!supabase) {
      setMessage("❌ Supabase not configured. Please set environment variables in .env.local");
      setLoading(false);
      return;
    }
    
    try {
      // Test connection by querying our projects table
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, status')
        .limit(1);
      
      if (error) {
        setMessage(`❌ Error: ${error.message}`);
      } else {
        setMessage("✅ Supabase is connected! Database tables are ready.");
        if (data && data.length > 0) {
          setMessage(`✅ Found ${data.length} project(s) in database!`);
        } else {
          setMessage("✅ Database connected! No projects yet - ready for your first data!");
        }
      }
    } catch {
      setMessage("❌ Connection failed. Check your environment variables.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Supabase Connection Test
      </h3>
      
      <button
        onClick={testConnection}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {loading ? "Testing..." : "Test Connection"}
      </button>
      
      {message && (
        <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>Make sure to configure your Supabase credentials in <code>.env.local</code></p>
      </div>
    </div>
  );
}
