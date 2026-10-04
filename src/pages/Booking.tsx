import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, IndianRupee, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import { createBooking, getAvailableSlots } from "../services/bookingService";
import { getActivePractitioners, getActiveServices } from "../services/publicService";
import type { Booking as BookingType, Practitioner, Service, Slot } from "../types";
import { formatDateTime, formatMoney } from "../lib/utils";
import { useSEO } from "../lib/seo";

export default function Booking() {
  useSEO({
    title: "Book Consultation | Awakening Homoeopathy",
    description: "Choose a homoeopathy consultation, practitioner and available appointment slot.",
    path: "/booking",
  });

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [practitionerId, setPractitionerId] = useState("");
  const [slotId, setSlotId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    userName: "",
    userEmail: "",
    userPhone: "",
    userAge: "",
    userSex: "prefer_not_to_say" as BookingType["userSex"],
    concern: "",
    consentAccepted: false,
  });

  useEffect(() => {
    (async () => {
      try {
        const [serviceRows, practitionerRows] = await Promise.all([
          getActiveServices(),
          getActivePractitioners(),
        ]);
        setServices(serviceRows);
        setPractitioners(practitionerRows);
        if (serviceRows[0]) setServiceId(serviceRows[0].id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load booking options.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!serviceId) {
      setSlots([]);
      setSlotId("");
      setPractitionerId("");
      return;
    }

    setSlotId("");
    setPractitionerId("");
    getAvailableSlots(serviceId)
      .then(setSlots)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load slots."));
  }, [serviceId]);

  const selectedService = services.find((service) => service.id === serviceId);
  const slotPractitionerIds = useMemo(
    () => new Set(slots.map((slot) => slot.practitionerId)),
    [slots]
  );
  const availablePractitioners = practitioners.filter((practitioner) =>
    slotPractitionerIds.has(practitioner.id)
  );
  const filteredSlots = practitionerId
    ? slots.filter((slot) => slot.practitionerId === practitionerId)
    : slots;
  const selectedSlot = slots.find((slot) => slot.id === slotId);
  const selectedPractitioner = practitioners.find(
    (practitioner) => practitioner.id === (practitionerId || selectedSlot?.practitionerId)
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!user || !selectedService || !selectedSlot || !selectedPractitioner) {
      setError("Please select a service, practitioner and appointment slot.");
      return;
    }

    const age = Number(form.userAge);
    if (!Number.isInteger(age) || age < 1 || age > 120) {
      setError("Please enter a valid age.");
      return;
    }

    setSaving(true);
    try {
      const id = await createBooking({
        slot: selectedSlot,
        service: selectedService,
        practitioner: selectedPractitioner,
        userName: form.userName,
        userEmail: form.userEmail,
        userPhone: form.userPhone,
        userAge: age,
        userSex: form.userSex,
        concern: form.concern,
        consentAccepted: form.consentAccepted,
      });
      navigate(`/booking/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create booking.");
      setSaving(false);
    }
  }

  if (loading || authLoading) {
    return (
      <Layout>
        <section className="section">
          <div className="container">
            <Loading label="Preparing booking…" />
          </div>
        </section>
      </Layout>
    );
  }

  const hasServices = services.length > 0;
  const hasOpenSlots = hasServices && slots.length > 0;
  const hasAvailablePractitioners = hasOpenSlots && availablePractitioners.length > 0;

  return (
    <Layout>
      <section className="page-hero">
        <div className="container narrow">
          <span className="eyebrow">Book consultation</span>
          <h1>Choose a service, practitioner and live appointment slot.</h1>
          <p>Slots are claimed atomically in Firestore, so two people cannot successfully book the same slot.</p>
        </div>
      </section>

      <section className="section">
        <div className="container booking-layout">
          <form className="booking-form" onSubmit={submit}>
            {error && <div className="form-error">{error}</div>}

            <div className="glass-card form-card">
              <span className="step">1</span>
              <h2>Consultation type</h2>
              {!hasServices ? (
                <div className="empty">No services are configured yet. An administrator can add the first consultation service from the admin dashboard.</div>
              ) : (
                <div className="option-grid">
                  {services.map((service) => (
                    <button
                      type="button"
                      key={service.id}
                      className={`option-card ${serviceId === service.id ? "selected" : ""}`}
                      onClick={() => setServiceId(service.id)}
                    >
                      <b>{service.name}</b>
                      <span>{service.duration} min · {formatMoney(service.price, service.currency)}</span>
                      <small>{service.description}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card form-card">
              <span className="step">2</span>
              <h2>Practitioner</h2>
              {!hasServices ? (
                <div className="empty">Practitioner selection will appear after a consultation service has been configured.</div>
              ) : !hasOpenSlots ? (
                <div className="empty">This service is configured, but no future appointment slots are open yet.</div>
              ) : !hasAvailablePractitioners ? (
                <div className="empty">No active practitioner is attached to the currently open slots.</div>
              ) : (
                <div className="option-grid">
                  {availablePractitioners.map((practitioner) => (
                    <button
                      type="button"
                      key={practitioner.id}
                      className={`option-card ${practitionerId === practitioner.id ? "selected" : ""}`}
                      onClick={() => {
                        setPractitionerId(practitioner.id);
                        setSlotId("");
                      }}
                    >
                      <UserRound />
                      <b>{practitioner.name}</b>
                      <span>{practitioner.designation}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card form-card">
              <span className="step">3</span>
              <h2>Available slot</h2>
              {!hasServices ? (
                <div className="empty">Appointment slots will appear after the practice setup is complete.</div>
              ) : !hasOpenSlots ? (
                <div className="empty">No future slots are currently available for this service.</div>
              ) : practitionerId && filteredSlots.length === 0 ? (
                <div className="empty">No future slots are available for this practitioner.</div>
              ) : (
                <div className="slot-grid">
                  {filteredSlots.map((slot) => (
                    <button
                      type="button"
                      key={slot.id}
                      className={`slot-button ${slotId === slot.id ? "selected" : ""}`}
                      onClick={() => {
                        setSlotId(slot.id);
                        setPractitionerId(slot.practitionerId);
                      }}
                    >
                      <CalendarDays />
                      <span>{formatDateTime(slot.startTime)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card form-card">
              <span className="step">4</span>
              <h2>Your details</h2>
              <div className="form-grid">
                <label>Full name<input required value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })} /></label>
                <label>Email<input required type="email" value={form.userEmail} onChange={(e) => setForm({ ...form, userEmail: e.target.value })} /></label>
                <label>Phone<input required value={form.userPhone} onChange={(e) => setForm({ ...form, userPhone: e.target.value })} /></label>
                <label>Age<input required type="number" min="1" max="120" value={form.userAge} onChange={(e) => setForm({ ...form, userAge: e.target.value })} /></label>
                <label>Sex / gender
                  <select value={form.userSex} onChange={(e) => setForm({ ...form, userSex: e.target.value as BookingType["userSex"] })}>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className="full">Main concern
                  <textarea required rows={5} value={form.concern} onChange={(e) => setForm({ ...form, concern: e.target.value })} placeholder="Briefly describe what you would like to discuss. Do not use this form for emergencies." />
                </label>
              </div>
              <label className="check">
                <input type="checkbox" checked={form.consentAccepted} onChange={(e) => setForm({ ...form, consentAccepted: e.target.checked })} />
                <span>I consent to the information I submit being used to manage this appointment and understand this service is not for emergencies.</span>
              </label>
            </div>

            <button className="button submit-booking" disabled={saving || !slotId || !form.consentAccepted}>
              {saving ? "Creating booking…" : "Confirm provisional booking"}
            </button>
          </form>

          <aside className="glass-card summary-card">
            <h3>Booking summary</h3>
            <div><Clock3 /><span><small>Service</small><b>{selectedService?.name || "Not selected"}</b></span></div>
            <div><UserRound /><span><small>Practitioner</small><b>{selectedPractitioner?.name || "Not selected"}</b></span></div>
            <div><CalendarDays /><span><small>Appointment</small><b>{selectedSlot ? formatDateTime(selectedSlot.startTime) : "Not selected"}</b></span></div>
            <div><IndianRupee /><span><small>Fee</small><b>{selectedService ? formatMoney(selectedService.price, selectedService.currency) : "—"}</b></span></div>
            <p className="muted">Your booking remains provisional until the clinic verifies payment or confirms the appointment according to the configured workflow.</p>
          </aside>
        </div>
      </section>
    </Layout>
  );
}
