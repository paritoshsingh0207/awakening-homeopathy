import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import Layout from "../components/Layout";
import { careAreas, learningCards } from "../data/content";
import { useSEO } from "../lib/seo";
import { getActivePractitioners, getActiveServices } from "../services/publicService";
import type { Practitioner, Service } from "../types";
import { formatMoney } from "../lib/utils";

export default function Home() {
  useSEO({
    title: "Awakening Homoeopathy | Consultation & Follow-up in Varanasi",
    description:
      "Awakening Homoeopathy provides structured homoeopathic consultation, case-taking and follow-up appointments in Varanasi.",
    path: "/",
  });

  const [services, setServices] = useState<Service[]>([]);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);

  useEffect(() => {
    void Promise.all([getActiveServices(), getActivePractitioners()])
      .then(([serviceRows, practitionerRows]) => {
        setServices(serviceRows);
        setPractitioners(practitionerRows);
      })
      .catch(() => {
        // The core public page remains usable even if practice data is temporarily unavailable.
      });
  }, []);

  return (
    <Layout>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow"><Sparkles size={16} /> Dedicated homoeopathy practice</span>
            <h1>Care begins with a <span>careful clinical history.</span></h1>
            <p>
              Awakening Homoeopathy is a focused consultation practice for structured case-taking,
              documented follow-up and responsible referral when a concern needs investigation,
              emergency care or another form of treatment.
            </p>
            <div className="hero-actions">
              <Link to="/booking" className="button"><CalendarCheck size={18} /> View appointments</Link>
              <Link to="/about" className="button secondary">Practice & practitioner <ArrowRight size={18} /></Link>
            </div>
            <div className="trust-row">
              <span><ShieldCheck size={17} /> Safety and referral boundaries</span>
              <span><ClipboardList size={17} /> Structured case-taking</span>
              <span><CheckCircle2 size={17} /> Documented follow-up</span>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="orb orb-a" /><div className="orb orb-b" />
            <div className="glass-card hero-card">
              <div className="remedy-dots"><i /><i /><i /><i /><i /></div>
              <span className="eyebrow">Appointment pathway</span>
              <h3>Know what happens before you submit.</h3>
              <ol>
                <li><b>1</b><span>Choose a consultation and practitioner</span></li>
                <li><b>2</b><span>Select a live 15-minute appointment window</span></li>
                <li><b>3</b><span>Share only the basic information needed to arrange the visit</span></li>
                <li><b>4</b><span>Follow the payment and confirmation status on your booking page</span></li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="section soft-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Consultation options</span>
            <h2>Clear appointment types, fees and availability.</h2>
            <p>
              The options below are controlled from the clinic dashboard, so the website reflects the
              currently active consultation services rather than fixed promotional packages.
            </p>
          </div>

          {services.length ? (
            <div className="service-grid">
              {services.map((service) => (
                <article className="glass-card service-card" key={service.id}>
                  <span className="service-kicker">15-minute appointment</span>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <div className="service-meta">
                    <b>{formatMoney(service.price, service.currency)}</b>
                    <Link to="/booking">Availability <ArrowRight size={15} /></Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty">Consultation types and fees will appear here once published by the clinic.</div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">How the practice works</span>
            <h2>Detailed enough to be useful. Clear enough to know the limits.</h2>
            <p>
              Homoeopathy is presented here as a clinical consultation service. It does not replace
              emergency care, necessary investigation or ongoing treatment for serious disease.
            </p>
          </div>
          <div className="three-grid">
            <article className="glass-card feature"><span className="feature-number">01</span><h3>History first</h3><p>Current symptoms, chronology, triggers, previous treatment, medicines, reports and general health are recorded before decisions are made.</p></article>
            <article className="glass-card feature"><span className="feature-number">02</span><h3>Individual context</h3><p>The consultation documents the person’s own symptom pattern and relevant context rather than relying on a generic disease list.</p></article>
            <article className="glass-card feature"><span className="feature-number">03</span><h3>Review and referral</h3><p>Follow-up compares change over time. New red flags, investigations or treatment needs can change the plan or prompt referral.</p></article>
          </div>
        </div>
      </section>

      <section className="section practitioner-home">
        <div className="container split-panel">
          <div>
            <span className="eyebrow">Practitioner information</span>
            <h2>Professional details should be visible, factual and verifiable.</h2>
            <p>
              Practitioner profiles include the designation, recognised qualifications and registration
              number entered by the clinic. We do not use patient testimonials or guaranteed-outcome claims
              as substitutes for professional information.
            </p>
            <Link className="text-link" to="/about#practitioners">View practitioner details <ArrowRight size={17} /></Link>
          </div>
          <div className="mini-list">
            {practitioners.length ? practitioners.slice(0, 2).map((practitioner) => (
              <div className="mini-card practitioner-mini" key={practitioner.id}>
                <UserRound />
                <div>
                  <h3>{practitioner.name}</h3>
                  <p>{practitioner.designation}</p>
                  {practitioner.qualifications && <small>{practitioner.qualifications}</small>}
                  {practitioner.registrationNumber && <small>Registration: {practitioner.registrationNumber}</small>}
                </div>
              </div>
            )) : (
              <div className="empty">The active practitioner profile will appear here when published.</div>
            )}
          </div>
        </div>
      </section>

      <section className="section soft-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Common reasons for consultation</span>
            <h2>Start with the concern. Keep the clinical context visible.</h2>
          </div>
          <div className="card-grid">
            {careAreas.map(({ title, description, icon: Icon }) => (
              <article className="care-card" key={title}>
                <span className="icon-badge"><Icon /></span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
          <div className="center"><Link to="/care" className="text-link">Read the care boundaries <ArrowRight size={17} /></Link></div>
        </div>
      </section>

      <section className="section">
        <div className="container split-panel">
          <div>
            <span className="eyebrow">Learn</span>
            <h2>Give short-form content a responsible destination.</h2>
            <p>
              Reels can introduce a topic. These pages provide the longer explanation: consultation process,
              preparation, safety limits and when self-treatment is not appropriate.
            </p>
            <Link className="button secondary" to="/learn">Explore patient guides <ArrowRight size={17} /></Link>
          </div>
          <div className="mini-list">
            {learningCards.slice(0, 3).map(({ slug, title, summary, icon: Icon }) => (
              <Link to={`/learn/${slug}`} key={slug} className="mini-card linked-card">
                <Icon /><div><h3>{title}</h3><p>{summary}</p></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section cta-section">
        <div className="container cta-card">
          <div>
            <span className="eyebrow light">Appointments</span>
            <h2>Check the live clinic schedule.</h2>
            <p>
              Select the consultation, practitioner and available time. A submitted booking remains provisional
              until the clinic confirms it according to the configured workflow.
            </p>
          </div>
          <Link to="/booking" className="button light"><CalendarCheck size={18} /> View appointments</Link>
        </div>
      </section>
    </Layout>
  );
}
