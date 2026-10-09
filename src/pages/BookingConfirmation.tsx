import { useEffect, useState } from "react";
import { CheckCircle2, Copy, CreditCard, FileUp, ListChecks, Smartphone } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import Loading from "../components/Loading";
import { formatDate, formatMoney, formatTimeRange } from "../lib/utils";
import { getBooking, getPaymentSettings, submitPaymentClaim } from "../services/bookingService";
import type { Booking, PaymentSettings } from "../types";
import { useSEO } from "../lib/seo";

export default function BookingConfirmation() {
  const { id = "" } = useParams();
  useSEO({
    title: "Booking | Awakening Homoeopathy",
    description: "Private booking status page for an Awakening Homoeopathy appointment.",
    path: `/booking/${id}`,
    noIndex: true,
  });

  const [booking, setBooking] = useState<Booking | null>(null);
  const [payment, setPayment] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [reference, setReference] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    try {
      const [bookingRow, paymentSettings] = await Promise.all([getBooking(id), getPaymentSettings()]);
      setBooking(bookingRow);
      setPayment(paymentSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load booking.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [id]);

  async function claim(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await submitPaymentClaim(id, reference, file);
      setMessage("Payment information submitted for verification.");
      setReference("");
      setFile(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit payment information.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Layout><section className="section"><div className="container"><Loading label="Loading booking…" /></div></section></Layout>;
  }

  if (!booking) {
    return <Layout><section className="section"><div className="container narrow"><div className="notice">Booking not found or you do not have permission to view it.</div></div></section></Layout>;
  }

  const paymentDone = booking.paymentStatus === "claimed" || booking.paymentStatus === "verified";
  const upiLink = payment?.upiId
    ? `upi://pay?pa=${encodeURIComponent(payment.upiId)}&pn=${encodeURIComponent(payment.payeeName || "Awakening Homoeopathy")}&am=${encodeURIComponent(String(booking.amount || ""))}&cu=INR&tn=${encodeURIComponent(`Booking ${booking.id}`)}`
    : "";

  return (
    <Layout>
      <section className="page-hero compact">
        <div className="container narrow">
          <span className="eyebrow"><CheckCircle2 size={16} /> Booking recorded</span>
          <h1>Your appointment time is reserved provisionally.</h1>
          <p>Keep the booking reference. Payment verification and final clinic confirmation are separate statuses.</p>
        </div>
      </section>

      <section className="section">
        <div className="container confirmation-grid">
          <div className="stack">
            <div className="glass-card confirmation-card">
              <div className="booking-id">
                <span>Booking reference</span>
                <b>{booking.id}</b>
                <button type="button" aria-label="Copy booking reference" onClick={() => navigator.clipboard.writeText(booking.id)}><Copy size={15} /></button>
              </div>
              <dl>
                <div><dt>Consultation</dt><dd>{booking.serviceName}</dd></div>
                <div><dt>Practitioner</dt><dd>{booking.practitionerName}</dd></div>
                <div><dt>Date</dt><dd>{formatDate(booking.appointmentStart)}</dd></div>
                <div><dt>Time</dt><dd>{formatTimeRange(booking.appointmentStart, booking.appointmentEnd)}</dd></div>
                <div><dt>Fee</dt><dd>{formatMoney(booking.amount, booking.currency)}</dd></div>
                <div><dt>Booking status</dt><dd><span className={`status ${booking.status}`}>{booking.status}</span></dd></div>
                <div><dt>Payment status</dt><dd><span className={`status ${booking.paymentStatus}`}>{booking.paymentStatus}</span></dd></div>
              </dl>
            </div>

            <div className="glass-card next-steps-card">
              <ListChecks />
              <h2>What happens next</h2>
              <ol>
                <li><b>1</b><span>If payment instructions are enabled, complete payment and submit the reference/proof below.</span></li>
                <li><b>2</b><span>The clinic reviews the booking and payment information.</span></li>
                <li><b>3</b><span>Your booking status changes to <strong>confirmed</strong> when the appointment is finalised.</span></li>
              </ol>
              <p className="muted small">If you need to change the appointment, contact the clinic and quote your booking reference.</p>
            </div>
          </div>

          <div className="glass-card form-card">
            <CreditCard />
            <h2>Payment</h2>
            {payment?.enabled ? <>
              <p>Use the configured clinic details below, then submit a transaction reference or payment proof for verification.</p>
              <div className="payment-box">
                <span>UPI ID</span><b>{payment.upiId || "Not configured"}</b>
                <span>Payee</span><b>{payment.payeeName || "Not configured"}</b>
                {payment.qrImageUrl && <img src={payment.qrImageUrl} alt="Payment QR code" />}
                <small>{payment.instructions}</small>
              </div>

              {upiLink && booking.amount > 0 && (
                <a className="button secondary" href={upiLink}>
                  <Smartphone size={17} /> Open UPI app
                </a>
              )}

              {paymentDone ? (
                <div className="form-success">
                  Payment information has been submitted. Current status: <b>{booking.paymentStatus}</b>.
                </div>
              ) : (
                <form onSubmit={claim}>
                  <label>Transaction / UTR reference
                    <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Optional if uploading proof" />
                  </label>
                  <label className="file-label">
                    <FileUp />Payment proof (image/PDF, optional)
                    <input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    <span>{file?.name || "Choose file"}</span>
                  </label>
                  {error && <div className="form-error">{error}</div>}
                  {message && <div className="form-success">{message}</div>}
                  <button className="button" disabled={saving}>{saving ? "Submitting…" : "Submit payment information"}</button>
                </form>
              )}
            </> : (
              <div className="notice">
                Payment instructions are not enabled. The clinic can contact you with payment or confirmation details.
              </div>
            )}
            <p className="muted small">Do not send sensitive medical documents as payment proof.</p>
          </div>
        </div>
        <div className="container center top-gap"><Link className="text-link" to="/">Return to homepage</Link></div>
      </section>
    </Layout>
  );
}
