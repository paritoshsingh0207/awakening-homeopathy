import Layout from "../components/Layout";
import { useSEO } from "../lib/seo";

export default function Privacy() {
  useSEO({
    title: "Privacy | Awakening Homoeopathy",
    description: "Privacy information for the Awakening Homoeopathy website, enquiries and appointment system.",
    path: "/privacy",
  });

  return (
    <Layout>
      <section className="page-hero">
        <div className="container narrow"><span className="eyebrow">Privacy</span><h1>Privacy notice</h1><p>How information submitted through this website is used in the appointment workflow.</p></div>
      </section>
      <section className="section">
        <article className="container prose">
          <h2>Information submitted through the site</h2>
          <p>When you book or contact the practice, the website may collect your name, contact details, age, appointment information and the brief health concern you choose to share. If payment verification is enabled, a transaction reference or proof may also be stored.</p>

          <h2>Why the information is used</h2>
          <p>The information is used to arrange appointments, respond to enquiries, manage booking and payment status, and support the administrative record of the consultation. Booking health information is not intended for advertising use.</p>

          <h2>Service providers and storage</h2>
          <p>The application uses Firebase services for authentication, database, hosting and—when enabled—file storage. Access to administrative records is restricted through the application’s authentication and security rules.</p>

          <h2>Data minimisation</h2>
          <p>The public booking form asks for a brief concern rather than a complete medical history. Detailed clinical information should be shared through the appropriate consultation or record process, not through public contact forms.</p>

          <h2>Correction, access and deletion</h2>
          <p>Contact the practice if information needs correction or if you wish to ask about access or deletion. Some records may need to be retained where clinical, legal, regulatory, payment or accounting obligations apply.</p>

          <h2>Security limitations</h2>
          <p>No online service can guarantee absolute security. Avoid sending unnecessary identity documents, full medical records or other sensitive material through general enquiry fields.</p>
        </article>
      </section>
    </Layout>
  );
}
