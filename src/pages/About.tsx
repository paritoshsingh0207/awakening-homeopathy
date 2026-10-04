import { BookOpenCheck, ClipboardList, HeartHandshake, ShieldCheck } from "lucide-react";
import Layout from "../components/Layout";
import { useSEO } from "../lib/seo";

export default function About() {
  useSEO({ title: "About | Awakening Homoeopathy", description: "Learn about the consultation philosophy and responsible-care approach at Awakening Homoeopathy.", path: "/about" });
  return <Layout><section className="page-hero"><div className="container narrow"><span className="eyebrow">About the practice</span><h1>Focused homoeopathic care within the Awakening family.</h1><p>This website is intentionally dedicated to homoeopathic consultation. Yoga, counselling, nutrition and other therapies remain separate so each visitor gets a clearer care pathway.</p></div></section>
    <section className="section"><div className="container two-grid">
      <div><h2>Our consultation philosophy</h2><p>We begin by understanding the sequence and character of symptoms, relevant medical history, current medicines, investigations, lifestyle context and the person’s priorities. The aim is to make the consultation structured, transparent and easy to follow.</p><p>Homoeopathic care should not delay urgent diagnosis, emergency treatment, necessary investigations or evidence-based management of serious disease. Referral and co-management are part of responsible practice.</p></div>
      <div className="glass-card checklist"><div><ClipboardList/><span><b>Structured history</b><small>Timeline, triggers, modalities, treatment history and current medicines.</small></span></div><div><BookOpenCheck/><span><b>Documented plan</b><small>A clear record of the consultation and what should happen next.</small></span></div><div><ShieldCheck/><span><b>Safety first</b><small>Red flags and situations needing urgent medical review are not treated as routine self-care.</small></span></div><div><HeartHandshake/><span><b>Continuity</b><small>Follow-up focuses on changes over time rather than isolated impressions.</small></span></div></div>
    </div></section>
  </Layout>;
}
