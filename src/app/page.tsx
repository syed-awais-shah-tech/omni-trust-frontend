import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OmniTrust",
  description: "AI-Powered Payment Security & Dispute Resolution",
};

export default function HomePage() {
  return (
    <div>
      <header className="page-header">
        <span className="status-badge">System Shell Active</span>
        <h1 className="page-title">OmniTrust</h1>
        <p className="page-subtitle">
          Intelligent payment protection, policy compliance, and automated dispute handling.
        </p>
      </header>

      <section className="content-card">
        <h2>Quick Navigation</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
          Select a module below to inspect the corresponding section shell.
        </p>

        <div className="card-grid">
          <Link href="/checkout" className="feature-card" style={{ borderColor: "var(--color-primary)" }}>
            <div className="feature-title">
              <span>PayPal Checkout (Test)</span>
              <span>&rarr;</span>
            </div>
            <p className="feature-description">
              Test PayPal Sandbox checkout integration with v6 SDK and order capture.
            </p>
          </Link>

          <Link href="/dashboard" className="feature-card">
            <div className="feature-title">
              <span>Security Dashboard</span>
              <span>&rarr;</span>
            </div>
            <p className="feature-description">
              View system security metrics, risk alerts, and operational overview.
            </p>
          </Link>

          <Link href="/policies" className="feature-card">
            <div className="feature-title">
              <span>Payment Policies</span>
              <span>&rarr;</span>
            </div>
            <p className="feature-description">
              Configure transaction thresholds, fraud detection rules, and compliance criteria.
            </p>
          </Link>

          <Link href="/transactions" className="feature-card">
            <div className="feature-title">
              <span>Transactions</span>
              <span>&rarr;</span>
            </div>
            <p className="feature-description">
              Track incoming payments, customer orders, and flagged anomalies.
            </p>
          </Link>

          <Link href="/disputes" className="feature-card">
            <div className="feature-title">
              <span>Disputes</span>
              <span>&rarr;</span>
            </div>
            <p className="feature-description">
              Review chargeback notifications, customer claims, and resolution status.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
