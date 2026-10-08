"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

export interface Transaction {
  id: string;
  status: string;
  amount: number | string;
  currency: string;
  description: string | null;
  created_at: string;
}

interface ApiResponse {
  success?: boolean;
  data?: Transaction[];
  transactions?: Transaction[];
  error?: string;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/transactions`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Backend responded with status: ${res.status}`);
      }

      const json: ApiResponse = await res.json();

      if (json.error) {
        throw new Error(json.error);
      }

      const list = json.transactions || json.data || [];
      setTransactions(list);
    } catch (err: any) {
      setError(
        err?.message || "Failed to connect to backend server. Make sure it is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const getStatusBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === "completed" || s === "settled" || s === "success") return "badge-completed";
    if (s === "pending") return "badge-pending";
    if (s === "flagged" || s === "declined" || s === "reversed" || s === "failed") return "badge-flagged";
    return "badge-pending";
  };

  return (
    <div>
      <header className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span className="status-badge">Backend Connected</span>
            <h1 className="page-title">Transactions</h1>
            <p className="page-subtitle">
              Live payment transaction feed fetched directly from the backend API.
            </p>
          </div>
          <button
            onClick={fetchTransactions}
            className="btn-secondary"
            disabled={loading}
            style={{ marginTop: "0.5rem" }}
          >
            &#x21bb; Refresh
          </button>
        </div>
      </header>

      <section className="content-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2>Transaction Feed</h2>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Source: <code>{BACKEND_URL}/api/transactions</code>
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="state-box state-loading">
            <p style={{ fontWeight: 500 }}>Loading transactions from backend...</p>
            <p style={{ fontSize: "0.85rem" }}>Querying Express API &rarr; Supabase</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="state-box state-error">
            <p style={{ fontWeight: 600 }}>Error loading transactions</p>
            <p style={{ fontSize: "0.875rem" }}>{error}</p>
            <button onClick={fetchTransactions} className="btn-primary" style={{ marginTop: "0.5rem" }}>
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && transactions.length === 0 && (
          <div className="state-box state-empty">
            <p style={{ fontWeight: 600, color: "var(--text-main)" }}>No Transactions Recorded</p>
            <p style={{ fontSize: "0.9rem", maxWidth: "450px" }}>
              The backend returned an empty transactions list from Supabase. Any incoming payments will appear in this table.
            </p>
          </div>
        )}

        {/* Loaded Table */}
        {!loading && !error && transactions.length > 0 && (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Date &amp; Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <code style={{ fontSize: "0.75rem", background: "#f1f5f9", padding: "0.2rem 0.4rem", borderRadius: "4px" }}>
                        {tx.id}
                      </code>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {tx.currency} {typeof tx.amount === "number" ? tx.amount.toFixed(2) : tx.amount}
                    </td>
                    <td>
                      <span className={`badge-status ${getStatusBadgeClass(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>
                      {tx.description || "N/A"}
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="content-card">
        <h3>Quick Navigation</h3>
        <p style={{ color: "var(--text-muted)", margin: "0.5rem 0 1rem" }}>
          Navigate to related modules:
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/dashboard" className="nav-item-link" style={{ border: "1px solid var(--border-light)" }}>
            &larr; Back to Dashboard
          </Link>
          <Link href="/policies" className="nav-item-link" style={{ border: "1px solid var(--border-light)" }}>
            &rarr; View Policies
          </Link>
          <Link href="/disputes" className="nav-item-link" style={{ border: "1px solid var(--border-light)" }}>
            &rarr; View Disputes
          </Link>
        </div>
      </section>
    </div>
  );
}
