import { useEffect, useState } from "react";
import {
  BookOpenCheck,
  ClipboardList,
  HeartHandshake,
  Languages,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Layout from "../components/Layout";
import { useSEO } from "../lib/seo";
import { getActivePractitioners } from "../services/publicService";
import type { Practitioner } from "../types";

export default function About() {
  useSEO({
    title: "Practice & Practitioner | Awakening Homoeopathy",
    description: "Learn about the consultation approach, practitioner details and professional boundaries at Awakening Homoeopathy.",
    path: "/about",
  });

  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);

  useEffect(() => {
    void getActivePractitioners().then(setPractitioners).catch(() => undefined);
  }, []);

  return (
    <Layout>
      <section className="page-hero">
        <div className="container narrow">
          <span className="eyebrow">About the practice</span>
          <h1>A focused clinical website for homoeopathic consultation.</h1>
          <p>
            Awakening Homoeopathy is intentionally separate from Awakening Integral Health’s other
            therapy services. That separation keeps appointment information, practitioner details and
            clinical boundaries easier to understand.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container two-grid">
          <div>
            <span className="eyebrow">Consultation philosophy</span>
            <h2>Begin with what is known, what has changed and what still needs clarification.</h2>
            <p>
              A useful first consultation starts with the sequence and character of symptoms, relevant
              medical history, current medicines, investigation reports, previous treatment and the person’s
              priorities.
            </p>
            <p>
              Homoeopathic case-taking may include general and individual symptom patterns, but it should
              not delay urgent diagnosis, recommended investigations, emergency treatment or necessary
              management of serious disease.
            </p>
          </div>

          <div className="glass-card checklist">
            <div><ClipboardList /><span><b>Structured history</b><small>Timeline, current concerns, medicines, reports, treatment history and relevant context.</small></span></div>
            <div><BookOpenCheck /><span><b>Documented plan</b><small>What is being reviewed, what to observe and what should happen next.</small></span></div>
            <div><ShieldCheck /><span><b>Professional boundaries</b><small>Red flags and situations outside the safe scope of consultation are referred appropriately.</small></span></div>
            <div><HeartHandshake /><span><b>Continuity</b><small>Follow-up compares change over time rather than relying on isolated impressions.</small></span></div>
          </div>
        </div>
      </section>

      <section className="section soft-section" id="practitioners">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Practitioner</span>
            <h2>Professional details</h2>
            <p>
              Qualifications and registration details shown here come from the clinic’s administrator profile
              and should be kept current exactly as recognised by the relevant professional authority.
            </p>
          </div>

          {practitioners.length ? (
            <div className="practitioner-grid">
              {practitioners.map((practitioner) => (
                <article className="glass-card practitioner-card" key={practitioner.id}>
                  <div className="practitioner-avatar"><UserRound /></div>
                  <div>
                    <span className="service-kicker">{practitioner.designation}</span>
                    <h2>{practitioner.name}</h2>
                    <dl className="credential-list">
                      {practitioner.qualifications && <div><dt>Qualifications</dt><dd>{practitioner.qualifications}</dd></div>}
                      {practitioner.registrationNumber && <div><dt>Registration</dt><dd>{practitioner.registrationNumber}</dd></div>}
                      {practitioner.experience && <div><dt>Experience / role</dt><dd>{practitioner.experience}</dd></div>}
                      {practitioner.languages && <div><dt><Languages size={15} /> Languages</dt><dd>{practitioner.languages}</dd></div>}
                    </dl>
                    {practitioner.bio && <p>{practitioner.bio}</p>}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty">No public practitioner profile has been published yet.</div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container split-panel">
          <div>
            <span className="eyebrow">Professional boundaries</span>
            <h2>What this practice does not promise.</h2>
            <p>
              The website does not present guaranteed cures, “miracle” outcomes, patient testimonials or
              claims that homoeopathy should replace necessary medical care. Educational material is kept
              separate from individual diagnosis and treatment decisions.
            </p>
          </div>
          <div className="glass-card boundary-card">
            <ShieldCheck />
            <h3>Seek appropriate medical care when needed</h3>
            <p>
              Emergency symptoms, rapidly worsening illness, serious injuries and conditions requiring
              investigation or specialist management should be assessed through the appropriate medical service.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
