import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, Clock3, IndianRupee, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import { createBooking, getAvailableSlots } from "../services/bookingService";
import { getActivePractitioners, getActiveServices } from "../services/publicService";
import type { Booking as BookingType, Practitioner, Service, Slot } from "../types";
import { formatDate, formatMoney, formatTimeRange } from "../lib/utils";
import { useSEO } from "../lib/seo";

export default function Booking() {
  useSEO({
    title: "Book Consultation | Awakening Homoeopathy",
    description: "Choose a consultation type, practitioner and available 15-minute appointment at Awakening Homoeopathy.",
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
    void (async () => {
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

  const slotGroups = useMemo(() => {
    const groups = new Map<string, Slot[]>();
    filteredSlots.forEach((slot) => {
      const label = formatDate(slot.startTime);
      groups.set(label, [...(groups.get(label) || []), slot]);
    });
    return Array.from(groups.entries());
  }, [filteredSlots]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!user || !selectedService || !selectedSlot || !selectedPractitioner) {
      setError("Please select a consultation, practitioner and appointment slot.");
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
          <div className="container"><Loading label="Preparing appointments…" /></div>
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
          <span className="eyebrow">Appointments</span>
          <h1>Choose a consultation and a clear 15-minute appointment window.</h1>
          <p>
            Available times are live. Every appointment is shown as a start–end range, with a 15-minute
            buffer between consecutive appointments.
          </p>
        </div>
      </section>

      <section className="section booking-intro-section">
        <div className="container booking-intro">
          <div><b>1</b><span><strong>Choose</strong><small>Consultation and practitioner</small></span></div>
          <div><b>2</b><span><strong>Select</strong><small>An available appointment time</small></span></div>
          <div><b>3</b><span><strong>Share</strong><small>Basic details and main concern</small></span></div>
          <div><b>4</b><span><strong>Confirm</strong><small>Payment/clinic review if configured</small></span></div>
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
                <div className="empty">Consultation services have not been published yet.</div>
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
                      <span>15-minute appointment · {formatMoney(service.price, service.currency)}</span>
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
                <div className="empty">Practitioner selection will appear after a consultation service is available.</div>
              ) : !hasOpenSlots ? (
                <div className="empty">This consultation is configured, but no future appointment times are open yet.</div>
              ) : !hasAvailablePractitioners ? (
                <div className="empty">No active practitioner is attached to the currently open times.</div>
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
                      {practitioner.qualifications && <small>{practitioner.qualifications}</small>}
                      {practitioner.registrationNumber && <small>Registration: {practitioner.registrationNumber}</small>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card form-card">
              <span className="step">3</span>
              <h2>Available appointment</h2>
              {!hasServices ? (
                <div className="empty">Appointment times will appear after services are configured.</div>
              ) : !hasOpenSlots ? (
                <div className="empty">No future appointment times are currently available for this consultation.</div>
              ) : !practitionerId ? (
                <div className="empty">Choose a practitioner to see their appointment times.</div>
              ) : slotGroups.length === 0 ? (
                <div className="empty">No future times are available for this practitioner.</div>
              ) : (
                <div className="slot-days">
                  {slotGroups.map(([dateLabel, dateSlots]) => (
                    <div className="slot-day" key={dateLabel}>
                      <h3><CalendarDays size={18} /> {dateLabel}</h3>
                      <div className="slot-grid">
                        {dateSlots.map((slot) => (
                          <button
                            type="button"
                            key={slot.id}
                            className={`slot-button ${slotId === slot.id ? "selected" : ""}`}
                            onClick={() => {
                              setSlotId(slot.id);
                              setPractitionerId(slot.practitionerId);
                            }}
                          >
                            <Clock3 />
                            <span>{formatTimeRange(slot.startTime, slot.endTime)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card form-card">
              <span className="step">4</span>
              <h2>Your details</h2>
              <p className="muted small">
                Share only what is needed to arrange the appointment. A full clinical history belongs in the consultation.
              </p>
              <div className="form-grid">
                <label>Full name<input required autoComplete="name" value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })} /></label>
                <label>Email<input required type="email" autoComplete="email" value={form.userEmail} onChange={(e) => setForm({ ...form, userEmail: e.target.value })} /></label>
                <label>Phone<input required inputMode="tel" autoComplete="tel" value={form.userPhone} onChange={(e) => setForm({ ...form, userPhone: e.target.value })} /></label>
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
                  <textarea
                    required
                    rows={5}
                    value={form.concern}
                    onChange={(e) => setForm({ ...form, concern: e.target.value })}
                    placeholder="Briefly describe what you would like to discuss. Do not use this form for emergencies."
                  />
                </label>
              </div>

              <div className="notice booking-warning">
                <AlertTriangle />
                <div>
                  <b>This is not an emergency service.</b>
                  <p>Urgent, severe or rapidly worsening symptoms should be assessed through appropriate emergency or medical services.</p>
                </div>
              </div>

              <label className="check">
                <input type="checkbox" checked={form.consentAccepted} onChange={(e) => setForm({ ...form, consentAccepted: e.target.checked })} />
                <span>I consent to the information I submit being used to manage this appointment and understand that the booking remains provisional until the clinic confirms it.</span>
              </label>
            </div>

            <button className="button submit-booking" disabled={saving || !slotId || !form.consentAccepted}>
              {saving ? "Creating booking…" : "Create provisional booking"}
            </button>
          </form>

          <aside className="glass-card summary-card">
            <h3>Appointment summary</h3>
            <div><Clock3 /><span><small>Consultation</small><b>{selectedService?.name || "Not selected"}</b></span></div>
            <div><UserRound /><span><small>Practitioner</small><b>{selectedPractitioner?.name || "Not selected"}</b></span></div>
            <div><CalendarDays /><span><small>Appointment</small><b>{selectedSlot ? `${formatDate(selectedSlot.startTime)} · ${formatTimeRange(selectedSlot.startTime, selectedSlot.endTime)}` : "Not selected"}</b></span></div>
            <div><IndianRupee /><span><small>Fee</small><b>{selectedService ? formatMoney(selectedService.price, selectedService.currency) : "—"}</b></span></div>
            <p className="muted">
              Creating the booking reserves the selected time. Follow the next-page payment instructions if enabled; final clinic confirmation is shown separately.
            </p>
          </aside>
        </div>
      </section>
    </Layout>
  );
}
