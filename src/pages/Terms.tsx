import Layout from "../components/Layout";
import { useSEO } from "../lib/seo";

export default function Terms() {
  useSEO({
    title: "Terms | Awakening Homoeopathy",
    description: "Website and appointment terms for Awakening Homoeopathy.",
    path: "/terms",
  });

  return (
    <Layout>
      <section className="page-hero">
        <div className="container narrow"><span className="eyebrow">Terms</span><h1>Website & appointment terms</h1></div>
      </section>
      <section className="section">
        <article className="container prose">
          <h2>Provisional appointments</h2>
          <p>Submitting the booking form reserves the selected appointment time in the system. The booking remains provisional until the clinic marks it confirmed. Payment verification, when enabled, is a separate status.</p>

          <h2>Appointment times</h2>
          <p>The live booking page is the source of currently published availability. If the clinic needs to change an appointment, it may contact you using the details supplied with the booking.</p>

          <h2>Payments</h2>
          <p>Where payment instructions are enabled, use only the payment details displayed on your private booking page and keep your booking reference. A submitted transaction reference does not by itself mean that payment has been verified.</p>

          <h2>Clinical information</h2>
          <p>Educational pages, social-media posts and website descriptions are general information. They do not create a diagnosis, prescribe treatment for an individual reader or guarantee a clinical outcome.</p>

          <h2>Emergencies and urgent care</h2>
          <p>This website is not an emergency service. Seek appropriate urgent or emergency medical care for severe, rapidly worsening or potentially life-threatening symptoms.</p>

          <h2>Changes</h2>
          <p>Services, fees, practitioners, policies and published appointment times may be updated. Material changes should be reflected on the relevant live page.</p>
        </article>
      </section>
    </Layout>
  );
}
