import { AlertTriangle, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { careAreas } from "../data/content";
import { useSEO } from "../lib/seo";

export default function CareAreas() {
  useSEO({
    title: "Care Approach | Awakening Homoeopathy",
    description:
      "Common reasons people seek homoeopathic consultation, with clear scope, safety and referral boundaries.",
    path: "/care",
  });

  return (
    <Layout>
      <section className="page-hero">
        <div className="container narrow">
          <span className="eyebrow">Care approach</span>
          <h1>Reasons for consultation, without turning them into cure claims.</h1>
          <p>
            These categories describe symptom patterns and consultation contexts. They do not mean that
            homoeopathy cures, prevents or replaces standard treatment for a named disease.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="card-grid">
            {careAreas.map(({ title, description, icon: Icon }) => (
              <article className="care-card" key={title}>
                <span className="icon-badge"><Icon /></span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section soft-section">
        <div className="container scope-grid">
          <article className="glass-card scope-card positive">
            <CheckCircle2 />
            <h2>What a consultation can do</h2>
            <ul>
              <li>Organise the history and symptom timeline.</li>
              <li>Review medicines, reports and previous treatment relevant to the concern.</li>
              <li>Document a consultation and follow-up plan.</li>
              <li>Identify when another clinician, investigation or urgent assessment is appropriate.</li>
            </ul>
          </article>
          <article className="glass-card scope-card">
            <XCircle />
            <h2>What this website does not do</h2>
            <ul>
              <li>Diagnose a condition from a web page or reel.</li>
              <li>Guarantee improvement, cure or a fixed treatment outcome.</li>
              <li>Advise stopping prescribed medicines without the relevant clinician.</li>
              <li>Replace emergency, hospital or specialist care when those are needed.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="notice">
            <AlertTriangle />
            <div>
              <b>Urgent symptoms need urgent care.</b>
              <p>
                Chest pain, severe breathlessness, stroke-like symptoms, major bleeding, loss of consciousness,
                seizures, serious injury, suicidal thoughts or rapidly worsening illness should be assessed through
                appropriate emergency or medical services rather than waiting for an online appointment.
              </p>
            </div>
          </div>
          <div className="center">
            <Link className="button" to="/booking">View appointment availability <ArrowRight size={17} /></Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
