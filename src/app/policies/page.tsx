"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

export interface Policy {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface ApiResponse {
  success?: boolean;
  data?: Policy[];
  policies?: Policy[];
  error?: string;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/policies`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Backend responded with status: ${res.status}`);
      }

      const json: ApiResponse = await res.json();

      if (json.error) {
        throw new Error(json.error);
      }

      const list = json.policies || json.data || [];
      setPolicies(list);
    } catch (err: any) {
      setError(
        err?.message || "Failed to connect to backend server. Make sure it is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  return (
    <div>
      <header className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span className="status-badge">Backend Connected</span>
            <h1 className="page-title">Payment Policies</h1>
            <p className="page-subtitle">
              Configured security rules fetched live from the backend API.
            </p>
          </div>
          <button
            onClick={fetchPolicies}
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
          <h2>Active Policies</h2>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Source: <code>{BACKEND_URL}/api/policies</code>
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="state-box state-loading">
            <p style={{ fontWeight: 500 }}>Loading policies from backend...</p>
            <p style={{ fontSize: "0.85rem" }}>Querying Express API &rarr; Supabase</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="state-box state-error">
            <p style={{ fontWeight: 600 }}>Error loading policies</p>
            <p style={{ fontSize: "0.875rem" }}>{error}</p>
            <button onClick={fetchPolicies} className="btn-primary" style={{ marginTop: "0.5rem" }}>
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && policies.length === 0 && (
          <div className="state-box state-empty">
            <p style={{ fontWeight: 600, color: "var(--text-main)" }}>No Policies Configured</p>
            <p style={{ fontSize: "0.9rem", maxWidth: "450px" }}>
              The backend returned an empty policies list from Supabase. Once policies are added to the database, they will appear here.
            </p>
          </div>
        )}

        {/* Loaded Policies List */}
        {!loading && !error && policies.length > 0 && (
          <div className="policy-list">
            {policies.map((policy) => (
              <article key={policy.id} className="policy-item">
                <div className="policy-header">
                  <h3 className="policy-name">{policy.name}</h3>
                  <span className="policy-id">ID: {policy.id}</span>
                </div>
                {policy.description && (
                  <p className="policy-desc">{policy.description}</p>
                )}
                <div className="policy-date">
                  Created: {new Date(policy.created_at).toLocaleString()}
                </div>
              </article>
            ))}
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
          <Link href="/transactions" className="nav-item-link" style={{ border: "1px solid var(--border-light)" }}>
            &rarr; View Transactions
          </Link>
          <Link href="/disputes" className="nav-item-link" style={{ border: "1px solid var(--border-light)" }}>
            &rarr; View Disputes
          </Link>
        </div>
      </section>
    </div>
  );
}
