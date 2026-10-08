"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

type CheckoutState = "loading" | "ready" | "processing" | "capturing" | "success" | "cancelled" | "error";

interface CaptureResult {
  orderId?: string;
  captureId?: string;
  status?: string;
  message?: string;
  transaction?: any;
}

export default function CheckoutPage() {
  const [status, setStatus] = useState<CheckoutState>("loading");
  const [statusMessage, setStatusMessage] = useState<string>("Initializing PayPal SDK v6...");
  const [isEligible, setIsEligible] = useState<boolean>(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [captureResult, setCaptureResult] = useState<CaptureResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sdkError, setSdkError] = useState<string | null>(null);

  const sessionRef = useRef<any>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  useEffect(() => {
    let isMounted = true;

    async function loadPayPalV6() {
      try {
        setStatus("loading");
        setStatusMessage("Loading PayPal Web SDK v6 (Sandbox)...");

        // 1. Dynamically load PayPal JavaScript SDK v6 (Sandbox)
        const scriptId = "paypal-sdk-v6-script";
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;

        if (!script) {
          script = document.createElement("script");
          script.id = scriptId;
          script.src = "https://www.sandbox.paypal.com/web-sdk/v6/core";
          script.async = true;
          document.body.appendChild(script);

          await new Promise<void>((resolve, reject) => {
            if (!script) return reject(new Error("Script element missing"));
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load PayPal SDK v6 from Sandbox CDN"));
          });
        } else if (!(window as any).paypal) {
          await new Promise<void>((resolve) => {
            if (!script) return resolve();
            script.addEventListener("load", () => resolve(), { once: true });
          });
        }

        if (!isMounted) return;

        const paypal = (window as any).paypal;
        if (!paypal || typeof paypal.createInstance !== "function") {
          throw new Error("PayPal SDK v6 loaded, but createInstance is unavailable.");
        }

        setStatusMessage("Initializing PayPal v6 instance...");

        // 2. Initialize using v6 createInstance (Client ID only, NEVER client secret)
        const effectiveClientId = CLIENT_ID && CLIENT_ID !== "your_paypal_sandbox_client_id"
          ? CLIENT_ID
          : "test";

        const sdkInstance = await paypal.createInstance({
          clientId: effectiveClientId,
          components: ["paypal-payments"],
        });

        if (!isMounted) return;

        setStatusMessage("Checking payment eligibility with PayPal v6...");

        // 3. Explicit v6 eligibility check
        let eligible = true;
        try {
          if (typeof sdkInstance.findEligibleMethods === "function") {
            const eligibility = await sdkInstance.findEligibleMethods({
              currencyCode: "USD",
              amount: "100.00",
            });
            eligible = typeof eligibility?.isEligible === "function" ? eligibility.isEligible("paypal") : true;
          }
        } catch (eligErr) {
          console.warn("Eligibility check warning (proceeding with standard availability):", eligErr);
          eligible = true;
        }

        if (!isMounted) return;

        setIsEligible(eligible);

        if (!eligible) {
          setStatus("error");
          setErrorMessage("PayPal payment method is not eligible for this transaction.");
          return;
        }

        // 4. Create v6 one-time payment session with onApprove / onCancel / onError
        if (typeof sdkInstance.createPayPalOneTimePaymentSession === "function") {
          const session = await sdkInstance.createPayPalOneTimePaymentSession({
            onApprove: async (data: { orderId: string }) => {
              if (!isMounted) return;
              await handleCaptureOrder(data.orderId);
            },
            onCancel: () => {
              if (!isMounted) return;
              setStatus("cancelled");
              setStatusMessage("Payment was cancelled by the buyer in PayPal.");
            },
            onError: (err: any) => {
              if (!isMounted) return;
              setStatus("error");
              setErrorMessage(err?.message || "PayPal checkout encountered an error.");
            },
          });

          sessionRef.current = session;
        }

        setStatus("ready");
        setStatusMessage("Ready to checkout with PayPal Sandbox.");
      } catch (err: any) {
        if (!isMounted) return;
        console.warn("PayPal SDK v6 initialization notice:", err?.message);
        setSdkError(err?.message || "SDK initialization notice");
        // Still allow ready state for simulation/testing if live SDK keys are unconfigured
        setIsEligible(true);
        setStatus("ready");
        setStatusMessage("PayPal Sandbox integration ready.");
      }
    }

    loadPayPalV6();

    return () => {
      isMounted = false;
    };
  }, [CLIENT_ID]);

  // Handler to capture order through our backend capture endpoint
  const handleCaptureOrder = async (orderId: string) => {
    setStatus("capturing");
    setStatusMessage(`Buyer approved order ${orderId}! Capturing via backend...`);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_URL}/api/paypal/orders/${encodeURIComponent(orderId)}/capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: "OmniTrust Test Product",
          quantity: 1,
          amount: 100.0,
          currency: "USD",
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCaptureResult(data);
        setStatus("success");
        setStatusMessage("Payment successfully captured by backend!");
      } else {
        setStatus("error");
        setErrorMessage(data.error || data.message || "Backend capture request failed.");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err?.message || "Network error while calling backend capture endpoint.");
    }
  };

  // Handler when user clicks PayPal button
  const handlePayPalButtonClick = async () => {
    setStatus("processing");
    setStatusMessage("Creating order via OmniTrust backend (POST /api/paypal/orders)...");
    setErrorMessage(null);

    try {
      // Step A: Call backend to create order with CAPTURE intent
      const orderRes = await fetch(`${API_URL}/api/paypal/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: "OmniTrust Test Product",
          quantity: 1,
          amount: 100.0,
          currency: "USD",
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success || !orderData.orderId) {
        throw new Error(orderData.error || orderData.message || "Failed to create order on backend.");
      }

      const orderId = orderData.orderId;
      setCreatedOrderId(orderId);
      setStatusMessage(`Order created with ID: ${orderId}. Starting PayPal session...`);

      // Step B: Start PayPal v6 session if live session is active
      if (sessionRef.current && typeof sessionRef.current.start === "function") {
        await sessionRef.current.start(
          { presentationMode: "auto" },
          async () => ({ orderId })
        );
      } else {
        // Fallback / simulation flow when live credentials are not yet supplied
        setStatusMessage(`Order ${orderId} created. Simulating buyer approval...`);
        setTimeout(() => {
          handleCaptureOrder(orderId);
        }, 1200);
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err?.message || "Failed to process PayPal checkout.");
    }
  };

  // Reset checkout for another test
  const handleReset = () => {
    setStatus("ready");
    setStatusMessage("Ready to checkout with PayPal Sandbox.");
    setCreatedOrderId(null);
    setCaptureResult(null);
    setErrorMessage(null);
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <header className="page-header">
        <span className="status-badge">PayPal Sandbox &bull; SDK v6</span>
        <h1 className="page-title">Test Checkout</h1>
        <p className="page-subtitle">
          Demonstrating PayPal JavaScript SDK v6 integration with OmniTrust backend order creation and capture.
        </p>
      </header>

      {/* Product Summary Card */}
      <section className="content-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>OmniTrust Test Product</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.2rem" }}>
              Test purchase item for Sandbox verification
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--color-primary)" }}>$100.00</span>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>USD &bull; Qty: 1</p>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
            <span>Subtotal</span>
            <span>$100.00</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
            <span>Payment Method</span>
            <span>PayPal Sandbox</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.05rem", fontWeight: 700, marginTop: "0.5rem" }}>
            <span>Total Due</span>
            <span>$100.00 USD</span>
          </div>
        </div>
      </section>

      {/* Checkout States & Actions Card */}
      <section className="content-card">
        <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.85rem" }}>
          Payment & SDK Status
        </h3>

        {/* State Indicators */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span
              style={{
                display: "inline-block",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor:
                  status === "ready"
                    ? "#10b981"
                    : status === "success"
                    ? "#059669"
                    : status === "processing" || status === "capturing" || status === "loading"
                    ? "#3b82f6"
                    : status === "cancelled"
                    ? "#f59e0b"
                    : "#ef4444",
              }}
            />
            <span style={{ fontSize: "0.9rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Status: {status}
            </span>
          </div>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{statusMessage}</p>

          {sdkError && status !== "error" && (
            <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.35rem", fontStyle: "italic" }}>
              Note: Using test mode. Once your actual Sandbox Client ID is added to .env.local, live PayPal modal will trigger.
            </p>
          )}
        </div>

        {/* Success State */}
        {status === "success" && (
          <div
            style={{
              padding: "1.25rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#065f46",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1.3rem" }}>✅</span>
              <h4 style={{ fontWeight: 700, fontSize: "1.05rem" }}>Payment Captured Successfully!</h4>
            </div>
            <p style={{ fontSize: "0.9rem", marginBottom: "0.75rem" }}>
              The PayPal order was approved and captured via the OmniTrust backend.
            </p>
            <div style={{ fontSize: "0.85rem", background: "#ffffff", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid #d1fae5" }}>
              {createdOrderId && <p><strong>PayPal Order ID:</strong> {createdOrderId}</p>}
              {captureResult?.captureId && <p><strong>PayPal Capture ID:</strong> {captureResult.captureId}</p>}
              {captureResult?.status && <p><strong>Status:</strong> {captureResult.status}</p>}
              {captureResult?.transaction?.id && <p><strong>Database Record ID:</strong> {captureResult.transaction.id}</p>}
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
              <Link
                href="/transactions"
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#059669",
                  color: "#ffffff",
                  textDecoration: "none",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                View in Transactions Table &rarr;
              </Link>
              <button
                onClick={handleReset}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#ffffff",
                  color: "#059669",
                  border: "1px solid #059669",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                Test Another Purchase
              </button>
            </div>
          </div>
        )}

        {/* Cancel State */}
        {status === "cancelled" && (
          <div
            style={{
              padding: "1.25rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "#fffbeb",
              border: "1px solid #fde68a",
              color: "#92400e",
              marginBottom: "1.5rem",
            }}
          >
            <h4 style={{ fontWeight: 700, marginBottom: "0.4rem" }}>Payment Cancelled</h4>
            <p style={{ fontSize: "0.9rem" }}>The transaction was cancelled before approval.</p>
            <button
              onClick={handleReset}
              style={{
                marginTop: "0.75rem",
                padding: "0.45rem 0.9rem",
                backgroundColor: "#d97706",
                color: "#ffffff",
                border: "none",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div
            style={{
              padding: "1.25rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              marginBottom: "1.5rem",
            }}
          >
            <h4 style={{ fontWeight: 700, marginBottom: "0.4rem" }}>Checkout Error</h4>
            <p style={{ fontSize: "0.9rem" }}>{errorMessage || "An unexpected error occurred."}</p>
            <button
              onClick={handleReset}
              style={{
                marginTop: "0.75rem",
                padding: "0.45rem 0.9rem",
                backgroundColor: "#dc2626",
                color: "#ffffff",
                border: "none",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Retry Checkout
            </button>
          </div>
        )}

        {/* Action Button: Visible when ready or eligible */}
        {(status === "ready" || status === "processing" || status === "capturing" || status === "loading") && (
          <div>
            <button
              id="paypal-v6-checkout-button"
              onClick={handlePayPalButtonClick}
              disabled={status === "processing" || status === "capturing" || !isEligible}
              style={{
                width: "100%",
                padding: "0.9rem 1.5rem",
                backgroundColor: status === "processing" || status === "capturing" ? "#94a3b8" : "#ffc439",
                color: "#111827",
                border: "none",
                borderRadius: "var(--radius-md)",
                fontSize: "1.05rem",
                fontWeight: 700,
                cursor: status === "processing" || status === "capturing" ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.6rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                transition: "background-color 0.15s ease",
              }}
            >
              {status === "processing" ? (
                <span>Creating Order on Backend...</span>
              ) : status === "capturing" ? (
                <span>Capturing Payment...</span>
              ) : (
                <>
                  <span style={{ fontStyle: "italic", fontWeight: 800 }}>PayPal</span>
                  <span>Pay with PayPal (Sandbox)</span>
                </>
              )}
            </button>

            <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.75rem" }}>
              PayPal JavaScript SDK v6 &bull; Sandbox Mode &bull; Safe Client ID Only
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
