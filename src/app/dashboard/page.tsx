import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security Dashboard - OmniTrust",
  description: "Security and threat overview",
};

export default function DashboardPage() {
  return (
    <div>
      <header className="page-header">
        <span className="status-badge">Module Shell</span>
        <h1 className="page-title">Security Dashboard</h1>
        <p className="page-subtitle">
          High-level overview of payment safety metrics, threat monitoring, and policy posture.
        </p>
      </header>

      <section className="content-card">
        <h2>Dashboard Overview</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
          This page shell will host real-time security alerts, transaction risk scoring, and activity trends.
        </p>

        <div className="card-grid">
          <div className="feature-card" style={{ cursor: "default" }}>
            <div className="feature-title">Security Posture</div>
            <p className="feature-description">Active protection rules and baseline health checks.</p>
          </div>
          <div className="feature-card" style={{ cursor: "default" }}>
            <div className="feature-title">Flagged Payments</div>
            <p className="feature-description">Transactions requiring manual review or multi-factor verification.</p>
          </div>
          <div className="feature-card" style={{ cursor: "default" }}>
            <div className="feature-title">Active Disputes</div>
            <p className="feature-description">Open cases pending evidence submission or automated defense.</p>
          </div>
        </div>
      </section>

      <section className="content-card">
        <h3>Quick Navigation</h3>
        <p style={{ color: "var(--text-muted)", margin: "0.5rem 0 1rem" }}>
          Navigate to related modules:
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/policies" className="nav-item-link" style={{ border: "1px solid var(--border-light)" }}>
            &rarr; View Payment Policies
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
