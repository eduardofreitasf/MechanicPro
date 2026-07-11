import { Download } from "lucide-react";
import { GithubIcon as Github } from "./GithubIcon";
import "./Hero.css";

// Place your own image in the public/ folder and name it 'dashboard-mockup.png'
export function Hero() {
  return (
    <section className="hero">
      <div className="container hero-container">
        <div className="hero-content animate-fade-up">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Tauri v2 Powered
          </div>

          <h1 className="hero-title">
            The Ultimate Desktop <br />
            <span className="text-gradient-blue">Management System</span>
            <br />
            for Mechanic Shops
          </h1>

          <p className="hero-subtitle">
            Streamline your operations, manage clients, vehicles, and services
            effectively. All your data secured locally with zero cloud
            subscription fees.
          </p>

          <div className="hero-actions">
            <a
              href="https://github.com/eduardofreitasf/MechanicPro/releases"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary btn-lg"
            >
              <Download size={20} />
              Download Free
            </a>
            <a
              href="https://github.com/eduardofreitasf/MechanicPro"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-lg"
            >
              <Github size={20} />
              View Source
            </a>
          </div>

          <div className="hero-tech-stack">
            <p>Built with modern technologies</p>
            <div className="tech-badges">
              <span className="tech-badge">React 19</span>
              <span className="tech-badge">TypeScript</span>
              <span className="tech-badge">Vite</span>
              <span className="tech-badge">Tauri</span>
            </div>
          </div>
        </div>

        <div className="hero-image-wrapper animate-fade-up delay-2">
          <div className="mockup-container hero-mockup">
            <img
              src="/MechanicPro/dashboard.jpeg"
              alt="MechanicPro Dashboard Interface"
            />
          </div>
          {/* Decorative glow behind the image */}
          <div className="mockup-glow"></div>
        </div>
      </div>
    </section>
  );
}
