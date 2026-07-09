import { Wrench } from "lucide-react";
import "./Navbar.css";

export function Navbar() {
  return (
    <nav className="navbar glass-nav">
      <div className="container nav-container">
        <a href="#" className="nav-logo">
          <Wrench className="logo-icon" size={28} />
          <span className="logo-text">
            Mechanic<span className="logo-highlight">Pro</span>
          </span>
        </a>

        <div className="nav-links">
          <a href="#features" className="nav-link">
            Features
          </a>
          <a href="#showcase" className="nav-link">
            Showcase
          </a>
          <a
            href="https://github.com/eduardofreitasf/MechanicPro/tree/main/docs"
            target="_blank"
            rel="noreferrer"
            className="nav-link"
          >
            Docs
          </a>
        </div>

        <a
          href="https://github.com/eduardofreitasf/MechanicPro/releases"
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary nav-cta"
        >
          Download Now
        </a>
      </div>
    </nav>
  );
}
