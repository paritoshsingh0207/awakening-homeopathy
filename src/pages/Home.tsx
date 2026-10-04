import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, CheckCircle2, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import Layout from "../components/Layout";
import { careAreas, learningCards } from "../data/content";
import { useSEO } from "../lib/seo";

export default function Home() {
  useSEO({
    title: "Awakening Homoeopathy — Individualised Consultation",
    description: "Thoughtful homoeopathic consultation, case-taking and follow-up care from Awakening Homoeopathy in Varanasi.",
    path: "/",
  });
  return <Layout>
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={16}/> A focused homoeopathy practice</span>
          <h1>Care that starts by <span>listening to the whole story.</span></h1>
          <p>Awakening Homoeopathy is a dedicated consultation website for structured case-taking, individualized homoeopathic care and planned follow-up—kept separate from our other integrative therapy services.</p>
          <div className="hero-actions">
            <Link to="/booking" className="button"><CalendarCheck size={18}/> Book consultation</Link>
            <Link to="/about" className="button secondary">Our approach <ArrowRight size={18}/></Link>
          </div>
          <div className="trust-row"><span><ShieldCheck size={17}/> Responsible referral</span><span><HeartHandshake size={17}/> Individualised case-taking</span><span><CheckCircle2 size={17}/> Clear follow-up</span></div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orb orb-a"/><div className="orb orb-b"/>
          <div className="glass-card hero-card">
            <div className="remedy-dots"><i/><i/><i/><i/><i/></div>
            <h3>Consultation pathway</h3>
            <ol><li><b>1</b><span>Choose a service and available slot</span></li><li><b>2</b><span>Share your history and current concerns</span></li><li><b>3</b><span>Receive consultation and follow-up plan</span></li></ol>
          </div>
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="section-heading"><span className="eyebrow">How we work</span><h2>A clinical journey designed around clarity, not claims.</h2><p>Homoeopathy is presented here as a consultation service. Emergency symptoms and conditions requiring urgent investigation should always receive appropriate conventional medical care.</p></div>
        <div className="three-grid">
          <article className="glass-card feature"><span className="feature-number">01</span><h3>Detailed case-taking</h3><p>Symptoms, chronology, triggers, previous treatment, general health and individual context are documented systematically.</p></article>
          <article className="glass-card feature"><span className="feature-number">02</span><h3>Individualised consultation</h3><p>The consultation is based on your own presentation rather than a one-size-fits-all disease list.</p></article>
          <article className="glass-card feature"><span className="feature-number">03</span><h3>Follow-up & review</h3><p>Progress, changes, investigations and the need for referral or modification are reviewed over time.</p></article>
        </div>
      </div>
    </section>

    <section className="section soft-section">
      <div className="container">
        <div className="section-heading"><span className="eyebrow">Common reasons for consultation</span><h2>Start with your concern. We start with the complete context.</h2></div>
        <div className="card-grid">{careAreas.slice(0,6).map(({title,description,icon:Icon})=><article className="care-card" key={title}><span className="icon-badge"><Icon/></span><h3>{title}</h3><p>{description}</p></article>)}</div>
        <div className="center"><Link to="/care" className="text-link">See our care approach <ArrowRight size={17}/></Link></div>
      </div>
    </section>

    <section className="section">
      <div className="container split-panel">
        <div><span className="eyebrow">Educational content</span><h2>From social reel to reliable next step.</h2><p>Our social media can introduce an idea in under a minute. The website gives viewers a safer place to understand the context, limits, when to seek medical care and how to book a consultation.</p><div className="social-row"><a target="_blank" rel="noreferrer" href="https://www.instagram.com/awakeningintegralhealth">Instagram</a><a target="_blank" rel="noreferrer" href="https://youtube.com/@awakeningintegralhealth">YouTube</a><a target="_blank" rel="noreferrer" href="https://x.com/to_be_awakened">X</a></div></div>
        <div className="mini-list">{learningCards.map(({title,summary,icon:Icon})=><div key={title} className="mini-card"><Icon/><div><h3>{title}</h3><p>{summary}</p></div></div>)}</div>
      </div>
    </section>

    <section className="section cta-section"><div className="container cta-card"><div><span className="eyebrow light">Appointments</span><h2>Ready to schedule your consultation?</h2><p>Select the consultation type, practitioner and an available slot. You will receive a booking reference immediately.</p></div><Link to="/booking" className="button light"><CalendarCheck size={18}/> Book now</Link></div></section>
  </Layout>;
}
