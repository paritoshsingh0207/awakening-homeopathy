import { AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { careAreas } from "../data/content";
import { useSEO } from "../lib/seo";

export default function CareAreas() {
  useSEO({ title: "Care Approach | Awakening Homoeopathy", description: "See common reasons people seek homoeopathic consultation and how Awakening approaches case-taking and referral.", path: "/care" });
  return <Layout><section className="page-hero"><div className="container narrow"><span className="eyebrow">Care approach</span><h1>Consultation areas, explained without over-promising.</h1><p>The categories below describe common reasons people may seek a consultation. They are not claims that homoeopathy cures or replaces standard treatment for any particular disease.</p></div></section>
    <section className="section"><div className="container"><div className="card-grid">{careAreas.map(({title,description,icon:Icon})=><article className="care-card" key={title}><span className="icon-badge"><Icon/></span><h3>{title}</h3><p>{description}</p></article>)}</div>
    <div className="notice"><AlertTriangle/><div><b>Urgent symptoms need urgent care.</b><p>Chest pain, severe breathlessness, stroke symptoms, major bleeding, loss of consciousness, serious injury, suicidal thoughts or rapidly worsening illness should be assessed through appropriate emergency/medical services rather than waiting for an online appointment.</p></div></div>
    <div className="center"><Link className="button" to="/booking">Book a consultation <ArrowRight size={17}/></Link></div></div></section>
  </Layout>;
}
