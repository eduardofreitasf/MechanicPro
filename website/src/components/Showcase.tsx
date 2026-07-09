import "./Showcase.css";

// Place your own image in the public/ folder and name it 'service-order-mockup.png'
export function Showcase() {
  return (
    <section id="showcase" className="showcase">
      <div className="container">
        <div className="showcase-header animate-fade-up">
          <h2 className="section-title">
            Designed for <span className="text-gradient">Efficiency</span>
          </h2>
          <p className="section-subtitle">
            A beautiful, intuitive interface that lets you focus on fixing cars,
            not fighting with software.
          </p>
        </div>

        <div className="showcase-content animate-fade-up delay-1">
          <div className="mockup-container showcase-mockup">
            <img
              src="/service-order-mockup.png"
              alt="MechanicPro Service Order Details"
            />
            <div className="mockup-overlay">
              <div className="overlay-text">
                <h3>Detailed Service Orders</h3>
                <p>Track parts, labor, and status with ease.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
