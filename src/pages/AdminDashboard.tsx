import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import {
  CalendarPlus,
  Check,
  CircleDollarSign,
  Clock3,
  LogOut,
  MessageSquare,
  RefreshCw,
  Settings2,
  Stethoscope,
  UserRoundCog,
  WandSparkles,
  X,
} from "lucide-react";
import Layout from "../components/Layout";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import { getPaymentSettings } from "../services/bookingService";
import {
  createDailySlots,
  getAdminBookings,
  getAllPractitioners,
  getAllServices,
  getInquiries,
  getUpcomingSlots,
  markInquiryReviewed,
  removeSlot,
  savePaymentSettings,
  savePractitioner,
  saveService,
  setBookingState,
  SLOT_DURATION_MINUTES,
  SLOT_GAP_MINUTES,
  SLOT_START_INTERVAL_MINUTES,
} from "../services/adminService";
import type { Booking, Inquiry, PaymentSettings, Practitioner, Service, Slot } from "../types";
import { formatDateTime, formatMoney, formatTimeRange } from "../lib/utils";

type Tab = "bookings" | "services" | "practitioners" | "slots" | "messages" | "payment";

const emptyService: Omit<Service, "id"> = {
  name: "",
  description: "",
  duration: SLOT_DURATION_MINUTES,
  price: 0,
  currency: "INR",
  isActive: true,
  displayOrder: 10,
};

const emptyPractitioner: Omit<Practitioner, "id"> = {
  name: "",
  designation: "",
  qualifications: "",
  registrationNumber: "",
  experience: "",
  languages: "",
  bio: "",
  isActive: true,
};

const emptyPayment: PaymentSettings = {
  enabled: false,
  upiId: "",
  payeeName: "",
  qrImageUrl: "",
  instructions: "",
};

const serviceTemplates: Array<Pick<Service, "name" | "description" | "displayOrder">> = [
  {
    name: "Initial Homoeopathic Consultation",
    description:
      "First appointment for a structured review of the main concern, relevant history, current medicines, reports and next steps.",
    displayOrder: 10,
  },
  {
    name: "Follow-up Homoeopathic Consultation",
    description:
      "Review of changes since the previous consultation, new symptoms, investigations, medicine changes and the ongoing plan.",
    displayOrder: 20,
  },
];

function minutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading, logoutAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>("bookings");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [messages, setMessages] = useState<Inquiry[]>([]);
  const [payment, setPayment] = useState<PaymentSettings>(emptyPayment);

  const [serviceForm, setServiceForm] = useState<Omit<Service, "id">>(emptyService);
  const [serviceEditId, setServiceEditId] = useState<string>();
  const [practitionerForm, setPractitionerForm] = useState<Omit<Practitioner, "id">>(emptyPractitioner);
  const [practitionerEditId, setPractitionerEditId] = useState<string>();
  const [slotForm, setSlotForm] = useState({
    serviceId: "",
    practitionerId: "",
    date: "",
    startTime: "09:00",
    endTime: "15:00",
  });

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const [bookingRows, serviceRows, practitionerRows, slotRows, inquiryRows, paymentSettings] =
        await Promise.all([
          getAdminBookings(),
          getAllServices(),
          getAllPractitioners(),
          getUpcomingSlots(),
          getInquiries(),
          getPaymentSettings(),
        ]);

      setBookings(bookingRows);
      setServices(serviceRows);
      setPractitioners(practitionerRows);
      setSlots(slotRows);
      setMessages(inquiryRows);
      setPayment(paymentSettings);

      setSlotForm((current) => ({
        ...current,
        serviceId: current.serviceId || serviceRows.find((service) => service.isActive)?.id || "",
        practitionerId:
          current.practitionerId || practitionerRows.find((practitioner) => practitioner.isActive)?.id || "",
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAdmin) void refresh();
  }, [isAdmin]);

  const serviceMap = useMemo(
    () => Object.fromEntries(services.map((service) => [service.id, service])),
    [services]
  );
  const practitionerMap = useMemo(
    () => Object.fromEntries(practitioners.map((practitioner) => [practitioner.id, practitioner])),
    [practitioners]
  );

  const scheduleCount = useMemo(() => {
    const total = minutes(slotForm.endTime) - minutes(slotForm.startTime);
    if (total < SLOT_DURATION_MINUTES) return 0;
    return Math.floor((total - SLOT_DURATION_MINUTES) / SLOT_START_INTERVAL_MINUTES) + 1;
  }, [slotForm.startTime, slotForm.endTime]);

  if (authLoading) {
    return (
      <Layout>
        <section className="section"><Loading /></section>
      </Layout>
    );
  }

  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  async function changeBooking(
    id: string,
    status?: Booking["status"],
    paymentStatus?: Booking["paymentStatus"]
  ) {
    try {
      setError("");
      await setBookingState(id, status, paymentStatus);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    }
  }

  async function submitService(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await saveService(serviceForm, serviceEditId);
      setServiceForm(emptyService);
      setServiceEditId(undefined);
      setNotice("Service saved.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save service.");
    }
  }

  async function submitPractitioner(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await savePractitioner(practitionerForm, practitionerEditId);
      setPractitionerForm(emptyPractitioner);
      setPractitionerEditId(undefined);
      setNotice("Practitioner profile saved.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save practitioner.");
    }
  }

  async function submitSlots(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");

    const service = serviceMap[slotForm.serviceId];
    const practitioner = practitionerMap[slotForm.practitionerId];
    if (!service || !practitioner) {
      setError("Choose an active service and practitioner first.");
      return;
    }

    try {
      const result = await createDailySlots({
        service,
        practitioner,
        date: slotForm.date,
        startTime: slotForm.startTime,
        endTime: slotForm.endTime,
      });
      setNotice(
        `${result.created} appointment slot${result.created === 1 ? "" : "s"} created${result.skipped ? `; ${result.skipped} existing time${result.skipped === 1 ? "" : "s"} skipped` : ""}.`
      );
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create appointment schedule.");
    }
  }

  async function submitPayment(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await savePaymentSettings(payment);
      setNotice("Payment settings saved.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save payment settings.");
    }
  }

  const tabs: [Tab, string, ReactNode][] = [
    ["bookings", "Bookings", <Stethoscope />],
    ["services", "Services", <Settings2 />],
    ["practitioners", "Practitioners", <UserRoundCog />],
    ["slots", "Slots", <CalendarPlus />],
    ["messages", "Messages", <MessageSquare />],
    ["payment", "Payment", <CircleDollarSign />],
  ];

  return (
    <Layout>
      <section className="admin-shell">
        <div className="container admin-head">
          <div>
            <span className="eyebrow">Admin</span>
            <h1>Homoeopathy practice dashboard</h1>
            <p className="muted">Manage appointment information, practitioner profiles, schedules and payment instructions.</p>
          </div>
          <div className="admin-actions">
            <button className="button secondary" onClick={refresh}><RefreshCw size={16} /> Refresh</button>
            <button className="button secondary" onClick={logoutAdmin}><LogOut size={16} /> Logout</button>
          </div>
        </div>

        <div className="container admin-tabs">
          {tabs.map(([key, label, icon]) => (
            <button key={key} onClick={() => { setTab(key); setNotice(""); }} className={tab === key ? "active" : ""}>
              {icon}{label}
            </button>
          ))}
        </div>

        <div className="container admin-content">
          {error && <div className="form-error">{error}</div>}
          {notice && <div className="form-success">{notice}</div>}

          {loading ? <Loading label="Loading practice data…" /> : <>
            {tab === "bookings" && (
              <div className="stack">
                <div className="section-row"><h2>Bookings</h2><span>{bookings.length} total</span></div>
                {bookings.length === 0 ? <div className="empty">No bookings yet.</div> : bookings.map((booking) => (
                  <article className="admin-card" key={booking.id}>
                    <div className="admin-card-main">
                      <div>
                        <span className="booking-ref">{booking.id}</span>
                        <h3>{booking.userName}</h3>
                        <p>{booking.serviceName} · {booking.practitionerName}</p>
                        <p>{formatDateTime(booking.appointmentStart)} · {formatTimeRange(booking.appointmentStart, booking.appointmentEnd)} · {formatMoney(booking.amount, booking.currency)}</p>
                        <p className="muted">{booking.userEmail} · {booking.userPhone}</p>
                        <p className="concern">{booking.concern}</p>
                      </div>
                      <div className="status-column">
                        <span className={`status ${booking.status}`}>{booking.status}</span>
                        <span className={`status ${booking.paymentStatus}`}>payment: {booking.paymentStatus}</span>
                        {booking.paymentReference && <small>Ref: {booking.paymentReference}</small>}
                        {booking.paymentProofUrl && <a href={booking.paymentProofUrl} target="_blank" rel="noreferrer">View payment proof</a>}
                      </div>
                    </div>
                    <div className="row-actions">
                      <button onClick={() => changeBooking(booking.id, undefined, "verified")}><Check />Verify payment</button>
                      <button onClick={() => changeBooking(booking.id, undefined, "rejected")}><X />Reject payment</button>
                      <button onClick={() => changeBooking(booking.id, "confirmed")}>Confirm</button>
                      <button onClick={() => changeBooking(booking.id, "completed")}>Complete</button>
                      <button onClick={() => changeBooking(booking.id, "cancelled")}>Cancel</button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {tab === "services" && (
              <div className="admin-two">
                <form className="glass-card form-card" onSubmit={submitService}>
                  <h2>{serviceEditId ? "Edit" : "Add"} consultation service</h2>
                  {!serviceEditId && (
                    <div className="template-box">
                      <span><WandSparkles size={16} /> Quick templates</span>
                      <div className="template-actions">
                        {serviceTemplates.map((template) => (
                          <button
                            type="button"
                            key={template.name}
                            onClick={() => setServiceForm({
                              ...emptyService,
                              name: template.name,
                              description: template.description,
                              displayOrder: template.displayOrder,
                            })}
                          >
                            {template.name.replace(" Homoeopathic Consultation", "")}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <label>Name<input required value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} /></label>
                  <label>Description<textarea required rows={4} value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} /></label>
                  <div className="form-grid">
                    <label>Fee (₹)<input type="number" min="0" required value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })} /></label>
                    <label>Display order<input type="number" value={serviceForm.displayOrder ?? 10} onChange={(e) => setServiceForm({ ...serviceForm, displayOrder: Number(e.target.value) })} /></label>
                  </div>
                  <div className="schedule-rule"><Clock3 size={17} /><span>Booking appointments are fixed at <b>15 minutes</b>. The schedule generator automatically keeps a <b>15-minute buffer</b> after every appointment.</span></div>
                  <label className="check"><input type="checkbox" checked={serviceForm.isActive} onChange={(e) => setServiceForm({ ...serviceForm, isActive: e.target.checked })} /><span>Active</span></label>
                  <button className="button">Save service</button>
                  {serviceEditId && <button type="button" className="button secondary" onClick={() => { setServiceEditId(undefined); setServiceForm(emptyService); }}>Cancel edit</button>}
                </form>

                <div className="stack">
                  {services.length === 0 && <div className="empty">Create the initial and follow-up consultation services here.</div>}
                  {services.map((service) => (
                    <div className="admin-card compact-card" key={service.id}>
                      <div>
                        <h3>{service.name}</h3>
                        <p>15 min appointment · {formatMoney(service.price, service.currency)} · {service.isActive ? "Active" : "Inactive"}</p>
                        <small className="muted">{service.description}</small>
                      </div>
                      <button onClick={() => {
                        setServiceEditId(service.id);
                        setServiceForm({
                          name: service.name,
                          description: service.description,
                          duration: SLOT_DURATION_MINUTES,
                          price: service.price,
                          currency: service.currency,
                          isActive: service.isActive,
                          displayOrder: service.displayOrder,
                        });
                      }}>Edit</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "practitioners" && (
              <div className="admin-two">
                <form className="glass-card form-card" onSubmit={submitPractitioner}>
                  <h2>{practitionerEditId ? "Edit" : "Add"} practitioner</h2>
                  <label>Name<input required value={practitionerForm.name} onChange={(e) => setPractitionerForm({ ...practitionerForm, name: e.target.value })} /></label>
                  <label>Professional designation<input required value={practitionerForm.designation} onChange={(e) => setPractitionerForm({ ...practitionerForm, designation: e.target.value })} placeholder="Use the exact professional designation you are entitled to display" /></label>
                  <label>Recognised qualifications<input value={practitionerForm.qualifications || ""} onChange={(e) => setPractitionerForm({ ...practitionerForm, qualifications: e.target.value })} placeholder="Enter exact recognised qualification(s)" /></label>
                  <label>Registration number<input value={practitionerForm.registrationNumber || ""} onChange={(e) => setPractitionerForm({ ...practitionerForm, registrationNumber: e.target.value })} placeholder="Professional registration number" /></label>
                  <div className="form-grid">
                    <label>Experience / role<input value={practitionerForm.experience || ""} onChange={(e) => setPractitionerForm({ ...practitionerForm, experience: e.target.value })} placeholder="Optional factual description" /></label>
                    <label>Languages<input value={practitionerForm.languages || ""} onChange={(e) => setPractitionerForm({ ...practitionerForm, languages: e.target.value })} placeholder="e.g. Hindi, English" /></label>
                  </div>
                  <label>Professional bio<textarea rows={5} value={practitionerForm.bio || ""} onChange={(e) => setPractitionerForm({ ...practitionerForm, bio: e.target.value })} placeholder="Keep this factual and avoid testimonials or outcome claims." /></label>
                  <label className="check"><input type="checkbox" checked={practitionerForm.isActive} onChange={(e) => setPractitionerForm({ ...practitionerForm, isActive: e.target.checked })} /><span>Active</span></label>
                  <button className="button">Save practitioner</button>
                  {practitionerEditId && <button type="button" className="button secondary" onClick={() => { setPractitionerEditId(undefined); setPractitionerForm(emptyPractitioner); }}>Cancel edit</button>}
                </form>

                <div className="stack">
                  {practitioners.length === 0 && <div className="empty">Add the practitioner profile that should appear on the About and booking pages.</div>}
                  {practitioners.map((practitioner) => (
                    <div className="admin-card compact-card" key={practitioner.id}>
                      <div>
                        <h3>{practitioner.name}</h3>
                        <p>{practitioner.designation} · {practitioner.isActive ? "Active" : "Inactive"}</p>
                        {practitioner.qualifications && <small className="muted">{practitioner.qualifications}</small>}
                        {practitioner.registrationNumber && <small className="muted">Registration: {practitioner.registrationNumber}</small>}
                      </div>
                      <button onClick={() => {
                        setPractitionerEditId(practitioner.id);
                        setPractitionerForm({
                          name: practitioner.name,
                          designation: practitioner.designation,
                          qualifications: practitioner.qualifications || "",
                          registrationNumber: practitioner.registrationNumber || "",
                          experience: practitioner.experience || "",
                          languages: practitioner.languages || "",
                          bio: practitioner.bio || "",
                          isActive: practitioner.isActive,
                        });
                      }}>Edit</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "slots" && (
              <div className="admin-two">
                <form className="glass-card form-card" onSubmit={submitSlots}>
                  <h2>Generate a clinic day</h2>
                  <p className="muted small">Create the full day in one step instead of entering individual hour/minute values.</p>
                  <label>Service
                    <select required value={slotForm.serviceId} onChange={(e) => setSlotForm({ ...slotForm, serviceId: e.target.value })}>
                      <option value="">Choose service</option>
                      {services.map((service) => <option disabled={!service.isActive} value={service.id} key={service.id}>{service.name}{!service.isActive ? " (inactive)" : ""}</option>)}
                    </select>
                  </label>
                  <label>Practitioner
                    <select required value={slotForm.practitionerId} onChange={(e) => setSlotForm({ ...slotForm, practitionerId: e.target.value })}>
                      <option value="">Choose practitioner</option>
                      {practitioners.map((practitioner) => <option disabled={!practitioner.isActive} value={practitioner.id} key={practitioner.id}>{practitioner.name}{!practitioner.isActive ? " (inactive)" : ""}</option>)}
                    </select>
                  </label>
                  <label>Date<input required type="date" value={slotForm.date} onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })} /></label>
                  <div className="form-grid">
                    <label>Clinic starts<input required type="time" step="900" value={slotForm.startTime} onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })} /></label>
                    <label>Clinic closes<input required type="time" step="900" value={slotForm.endTime} onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })} /></label>
                  </div>

                  <div className="schedule-preview">
                    <Clock3 />
                    <div>
                      <b>{SLOT_DURATION_MINUTES}-minute appointment + {SLOT_GAP_MINUTES}-minute buffer</b>
                      <span>
                        Example: 9:00–9:15 AM, 9:30–9:45 AM, 10:00–10:15 AM.
                        {scheduleCount > 0 && <> This window will create up to <b>{scheduleCount}</b> slots.</>}
                      </span>
                    </div>
                  </div>
                  <button className="button" disabled={!scheduleCount}>Generate appointment slots</button>
                </form>

                <div className="stack">
                  <div className="section-row"><h2>Upcoming slots</h2><span>{slots.length} shown</span></div>
                  {slots.length === 0 ? <div className="empty">No future slots yet.</div> : slots.map((slot) => (
                    <div className="admin-card compact-card" key={slot.id}>
                      <div>
                        <h3>{serviceMap[slot.serviceId]?.name || slot.serviceId}</h3>
                        <p>{practitionerMap[slot.practitionerId]?.name || slot.practitionerId}</p>
                        <p>{formatDateTime(slot.startTime)} · {formatTimeRange(slot.startTime, slot.endTime)} · {slot.isBooked ? "Booked" : "Available"}</p>
                      </div>
                      {!slot.isBooked && <button onClick={async () => { await removeSlot(slot); await refresh(); }}>Delete</button>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "messages" && (
              <div className="stack">
                <div className="section-row"><h2>Enquiries</h2><span>{messages.filter((message) => message.status === "new").length} new</span></div>
                {messages.length === 0 ? <div className="empty">No enquiries yet.</div> : messages.map((message) => (
                  <article className="admin-card" key={message.id}>
                    <div className="admin-card-main">
                      <div>
                        <h3>{message.name}</h3>
                        <p>{message.email} · {message.phone}</p>
                        <p>{message.message}</p>
                        <small>{formatDateTime(message.createdAt)}</small>
                      </div>
                      <div>
                        {message.status === "new"
                          ? <button className="button secondary" onClick={async () => { await markInquiryReviewed(message.id); await refresh(); }}>Mark reviewed</button>
                          : <span className="status completed">reviewed</span>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {tab === "payment" && (
              <form className="glass-card form-card admin-settings" onSubmit={submitPayment}>
                <h2>Payment settings</h2>
                <p className="muted small">These details appear only after a patient creates a provisional booking.</p>
                <label className="check"><input type="checkbox" checked={payment.enabled} onChange={(e) => setPayment({ ...payment, enabled: e.target.checked })} /><span>Show payment instructions after booking</span></label>
                <label>UPI ID<input value={payment.upiId} onChange={(e) => setPayment({ ...payment, upiId: e.target.value })} placeholder="name@bank" /></label>
                <label>Payee name<input value={payment.payeeName} onChange={(e) => setPayment({ ...payment, payeeName: e.target.value })} /></label>
                <label>QR image URL<input value={payment.qrImageUrl} onChange={(e) => setPayment({ ...payment, qrImageUrl: e.target.value })} placeholder="Optional HTTPS image URL" /></label>
                <label>Instructions<textarea rows={5} value={payment.instructions} onChange={(e) => setPayment({ ...payment, instructions: e.target.value })} placeholder="Explain when the clinic verifies payment and confirms the appointment." /></label>
                <button className="button">Save payment settings</button>
              </form>
            )}
          </>}
        </div>
      </section>
    </Layout>
  );
}
