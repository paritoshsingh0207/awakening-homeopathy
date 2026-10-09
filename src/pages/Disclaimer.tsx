import Layout from "../components/Layout";
import { useSEO } from "../lib/seo";

export default function Disclaimer() {
  useSEO({
    title: "Medical Disclaimer | Awakening Homoeopathy",
    description: "Medical and educational-content disclaimer for Awakening Homoeopathy.",
    path: "/disclaimer",
  });

  return (
    <Layout>
      <section className="page-hero">
        <div className="container narrow">
          <span className="eyebrow">Medical disclaimer</span>
          <h1>Website information is not a diagnosis or a substitute for necessary medical care.</h1>
          <p>The purpose of this site is to explain the practice, provide patient education and manage appointments.</p>
        </div>
      </section>
      <section className="section">
        <article className="container prose">
          <h2>No guaranteed outcomes</h2>
          <p>Nothing on this website should be read as a promise that homoeopathy will cure, prevent or produce a guaranteed result for a disease or symptom.</p>

          <h2>Do not delay necessary care</h2>
          <p>Do not stop prescribed medicines, delay recommended investigations, postpone specialist review or avoid emergency treatment on the basis of website or social-media content. Discuss treatment changes with the relevant qualified clinician.</p>

          <h2>Individual assessment matters</h2>
          <p>General articles cannot account for your diagnosis, examination findings, medicines, pregnancy status, age, allergies, test results or other individual risk factors. Personal clinical decisions require an appropriate consultation.</p>

          <h2>Emergency symptoms</h2>
          <p>For severe breathlessness, chest pain, stroke-like symptoms, major bleeding, loss of consciousness, seizures, serious injury, suicidal thoughts or rapidly worsening illness, seek appropriate emergency medical help immediately.</p>

          <h2>Professional boundaries</h2>
          <p>The practice aims to present factual professional information and avoid testimonials, miracle claims or promotional statements that could misrepresent likely outcomes.</p>
        </article>
      </section>
    </Layout>
  );
}
