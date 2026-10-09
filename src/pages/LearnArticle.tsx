import { ArrowLeft, CalendarCheck, ShieldCheck } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { learningArticles } from "../data/content";
import { useSEO } from "../lib/seo";

export default function LearnArticle() {
  const { slug = "" } = useParams();
  const article = learningArticles.find((item) => item.slug === slug);

  useSEO({
    title: article ? `${article.title} | Awakening Homoeopathy` : "Patient Guide | Awakening Homoeopathy",
    description: article?.summary || "Patient education from Awakening Homoeopathy.",
    path: `/learn/${slug}`,
    noIndex: !article,
  });

  if (!article) return <Navigate to="/learn" replace />;

  const Icon = article.icon;

  return (
    <Layout>
      <section className="page-hero compact article-hero">
        <div className="container narrow">
          <Link className="back-link" to="/learn"><ArrowLeft size={16} /> All patient guides</Link>
          <span className="eyebrow"><Icon size={16} /> Patient guide</span>
          <h1>{article.title}</h1>
          <p>{article.summary}</p>
        </div>
      </section>

      <section className="section">
        <article className="container prose article-prose">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}

          <div className="notice article-notice">
            <ShieldCheck />
            <div>
              <b>General information only</b>
              <p>
                This guide does not diagnose a condition or replace individual medical assessment.
                Urgent or severe symptoms should be assessed through the appropriate medical service.
              </p>
            </div>
          </div>

          <div className="article-actions">
            <Link className="button secondary" to="/learn"><ArrowLeft size={17} /> More guides</Link>
            <Link className="button" to="/booking"><CalendarCheck size={17} /> View appointments</Link>
          </div>
        </article>
      </section>
    </Layout>
  );
}
