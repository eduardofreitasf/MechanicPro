import { Wrench, BookOpen } from "lucide-react";
import { GithubIcon as Github } from "./GithubIcon";
import "./Footer.css";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <a href="#" className="nav-logo">
              <Wrench className="logo-icon" size={24} />
              <span className="logo-text">
                Mechanic<span className="logo-highlight">Pro</span>
              </span>
            </a>
            <p className="footer-desc">
              The modern desktop management system for mechanic shops. Built
              with performance and local security in mind.
            </p>
          </div>

          <div className="footer-links-group">
            <h4>Resources</h4>
            <div className="footer-links">
              <a
                href="https://github.com/eduardofreitasf/MechanicPro/tree/main/docs"
                target="_blank"
                rel="noreferrer"
              >
                <BookOpen size={16} /> User Manual
              </a>
              <a
                href="https://github.com/eduardofreitasf/MechanicPro/tree/main/docs"
                target="_blank"
                rel="noreferrer"
              >
                <BookOpen size={16} /> Technical Report
              </a>
            </div>
          </div>

          <div className="footer-links-group">
            <h4>Project</h4>
            <div className="footer-links">
              <a
                href="https://github.com/eduardofreitasf/MechanicPro"
                target="_blank"
                rel="noreferrer"
              >
                <Github size={16} /> Source Code
              </a>
              <a
                href="https://github.com/eduardofreitasf/MechanicPro/releases"
                target="_blank"
                rel="noreferrer"
              >
                Releases
              </a>
              <a
                href="https://github.com/eduardofreitasf/MechanicPro/issues"
                target="_blank"
                rel="noreferrer"
              >
                Report an Issue
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {year} MechanicPro. Open Source under the MIT License.</p>
        </div>
      </div>
    </footer>
  );
}
