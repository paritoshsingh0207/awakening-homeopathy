import { useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { CalendarCheck, Menu, X } from "lucide-react";

const nav = [
  ["/", "Home"],
  ["/about", "Practice"],
  ["/care", "Care"],
  ["/learn", "Patient Guides"],
  ["/contact", "Contact"],
] as const;

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="container nav-wrap">
          <Link to="/" className="brand" onClick={() => setOpen(false)}>
            <span className="brand-mark">AH</span>
            <span>
              <strong>Awakening Homoeopathy</strong>
              <small>by Awakening Integral Health</small>
            </span>
          </Link>

          <button
            className="menu-button"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>

          <nav className={`nav-links ${open ? "open" : ""}`}>
            {nav.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) => isActive ? "active" : ""}
              >
                {label}
              </NavLink>
            ))}
            <Link to="/booking" className="button button-small" onClick={() => setOpen(false)}>
              <CalendarCheck size={17} /> Appointments
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content">{children}</main>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <div className="brand footer-brand">
              <span className="brand-mark">AH</span>
              <span>
                <strong>Awakening Homoeopathy</strong>
                <small>Structured consultation. Responsible boundaries.</small>
              </span>
            </div>
            <p className="muted">
              Patient information, appointment scheduling and educational guides. This website is not an
              emergency service and does not replace necessary medical assessment or treatment.
            </p>
          </div>

          <div>
            <h4>Explore</h4>
            <Link to="/about">Practice & practitioner</Link>
            <Link to="/care">Care approach</Link>
            <Link to="/learn">Patient guides</Link>
            <Link to="/booking">Appointments</Link>
          </div>

          <div>
            <h4>Policies</h4>
            <Link to="/disclaimer">Medical disclaimer</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/admin/login">Admin</Link>
          </div>

          <div>
            <h4>Contact</h4>
            <a href="mailto:awakeningintegralhealth@gmail.com">awakeningintegralhealth@gmail.com</a>
            <a href="tel:+917007658005">+91 70076 58005</a>
            <span>Brinda Nagar Colony, Bhojubir, Varanasi</span>
            <span>Consultations by appointment</span>
          </div>
        </div>
        <div className="container footer-bottom">© {new Date().getFullYear()} Awakening Homoeopathy. All rights reserved.</div>
      </footer>

      <Link to="/booking" className="floating-book"><CalendarCheck size={18} /> Appointments</Link>
    </div>
  );
}
