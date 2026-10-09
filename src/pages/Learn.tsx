import { ExternalLink, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { learningArticles } from "../data/content";
import { useSEO } from "../lib/seo";

export default function Learn() {
  useSEO({
    title: "Patient Guides | Awakening Homoeopathy",
    description:
      "Patient guides on consultation preparation, follow-up, safety and responsible use of homoeopathy information.",
    path: "/learn",
  });

  return (
    <Layout>
      <section className="page-hero">
        <div className="container narrow">
          <span className="eyebrow">Learn</span>
          <h1>Patient guides designed to add context, not replace a consultation.</h1>
          <p>
            These pages give reels and short posts a more responsible destination: what to expect,
            what to bring, what follow-up means and when self-treatment is not appropriate.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container learn-grid">
          {learningArticles.map(({ slug, title, summary, icon: Icon }) => (
            <Link className="glass-card learn-card linked-card" to={`/learn/${slug}`} key={slug}>
              <Icon />
              <span className="service-kicker">Patient guide</span>
              <h2>{title}</h2>
              <p>{summary}</p>
              <span className="text-link">Read guide →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section soft-section">
        <div className="container split-panel">
          <div>
            <ShieldCheck size={38} />
            <h2>Editorial boundary</h2>
            <p>
              Educational posts should not make guaranteed cure claims, prescribe for an individual reader,
              encourage stopping necessary treatment or blur the line between general information and a clinical consultation.
            </p>
          </div>
          <div>
            <h3>Awakening social channels</h3>
            <p className="muted">Short-form posts can link to the most relevant guide on this website.</p>
            <div className="social-row">
              <a href="https://www.instagram.com/awakeningintegralhealth" target="_blank" rel="noreferrer">Instagram <ExternalLink size={14} /></a>
              <a href="https://youtube.com/@awakeningintegralhealth" target="_blank" rel="noreferrer">YouTube <ExternalLink size={14} /></a>
              <a href="https://x.com/to_be_awakened" target="_blank" rel="noreferrer">X <ExternalLink size={14} /></a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
