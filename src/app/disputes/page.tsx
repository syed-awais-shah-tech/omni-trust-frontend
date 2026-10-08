import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disputes - OmniTrust",
  description: "Dispute resolution and chargeback claim management",
};

export default function DisputesPage() {
  return (
    <div>
      <header className="page-header">
        <span className="status-badge">Module Shell</span>
        <h1 className="page-title">Disputes</h1>
        <p className="page-subtitle">
          Manage buyer disputes, chargeback claims, evidence submission, and resolution workflows.
        </p>
      </header>

      <section className="content-card">
        <h2>Disputes Management Shell</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
          This page shell will provide case evidence timelines and automated response assistance.
        </p>

        <div className="card-grid">
          <div className="feature-card" style={{ cursor: "default" }}>
            <div className="feature-title">Action Required</div>
            <p className="feature-description">Disputes requiring merchant evidence before the deadline.</p>
          </div>
          <div className="feature-card" style={{ cursor: "default" }}>
            <div className="feature-title">Under Review</div>
            <p className="feature-description">Cases currently undergoing PayPal or payment network review.</p>
          </div>
          <div className="feature-card" style={{ cursor: "default" }}>
            <div className="feature-title">Resolved Cases</div>
            <p className="feature-description">Completed dispute outcomes, settlements, and resolutions.</p>
          </div>
        </div>
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
          <Link href="/transactions" className="nav-item-link" style={{ border: "1px solid var(--border-light)" }}>
            &rarr; View Transactions
          </Link>
        </div>
      </section>
    </div>
  );
}
