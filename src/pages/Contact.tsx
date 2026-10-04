import { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { submitInquiry } from "../services/publicService";
import { useSEO } from "../lib/seo";

export default function Contact() {
  useSEO({ title: "Contact | Awakening Homoeopathy", description: "Contact Awakening Homoeopathy in Varanasi or send a consultation enquiry.", path: "/contact" });
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [state, setState] = useState<"idle"|"sending"|"sent">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setState("sending"); setError("");
    try {
      await submitInquiry({ userId: user.uid, ...form });
      setState("sent"); setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to send message."); setState("idle"); }
  }

  return <Layout><section className="page-hero"><div className="container narrow"><span className="eyebrow">Contact</span><h1>Questions before you book?</h1><p>Send a message or use the contact details below. Please do not use this form for emergencies.</p></div></section>
    <section className="section"><div className="container contact-grid"><div className="contact-details"><div><Mail/><span><b>Email</b><a href="mailto:awakeningintegralhealth@gmail.com">awakeningintegralhealth@gmail.com</a></span></div><div><Phone/><span><b>Phone</b><a href="tel:+917007658005">+91 70076 58005</a></span></div><div><MapPin/><span><b>Location</b><small>Brinda Nagar Colony, Bhojubir, Varanasi</small></span></div></div>
    <form className="glass-card form-card" onSubmit={submit}><h2>Send an enquiry</h2><label>Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Phone<input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><label>Message<textarea rows={5} required value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/></label>{error&&<div className="form-error">{error}</div>}{state==="sent"&&<div className="form-success">Your enquiry has been received.</div>}<button className="button" disabled={state==="sending"}>{state==="sending"?"Sending…":<><Send size={17}/> Send enquiry</>}</button></form></div></section>
  </Layout>;
}
