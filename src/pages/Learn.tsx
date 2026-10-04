import { ExternalLink, ShieldCheck } from "lucide-react";
import Layout from "../components/Layout";
import { learningCards } from "../data/content";
import { useSEO } from "../lib/seo";

export default function Learn() {
  useSEO({ title: "Learn | Awakening Homoeopathy", description: "Patient education, consultation preparation and responsible homoeopathy information from Awakening Homoeopathy.", path: "/learn" });
  return <Layout><section className="page-hero"><div className="container narrow"><span className="eyebrow">Learn</span><h1>Short-form content should lead to deeper context.</h1><p>This section is designed to support the reels and educational posts you publish on social media, while keeping medical limitations and safety information visible.</p></div></section>
    <section className="section"><div className="container three-grid">{learningCards.map(({title,summary,icon:Icon})=><article className="glass-card learn-card" key={title}><Icon/><h2>{title}</h2><p>{summary}</p><span className="article-status">Editorial article slot — ready for your final content</span></article>)}</div></section>
    <section className="section soft-section"><div className="container split-panel"><div><ShieldCheck size={38}/><h2>Content policy for the site</h2><p>Educational posts should avoid guaranteed cure claims, distinguish information from medical advice, and clearly indicate when urgent or conventional medical assessment is appropriate.</p></div><div><h3>Follow Awakening Integral Health</h3><p className="muted">Use the same social channels while each reel can link to the most relevant website.</p><div className="social-row"><a href="https://www.instagram.com/awakeningintegralhealth" target="_blank" rel="noreferrer">Instagram <ExternalLink size={14}/></a><a href="https://youtube.com/@awakeningintegralhealth" target="_blank" rel="noreferrer">YouTube <ExternalLink size={14}/></a><a href="https://x.com/to_be_awakened" target="_blank" rel="noreferrer">X <ExternalLink size={14}/></a></div></div></div></section>
  </Layout>;
}
