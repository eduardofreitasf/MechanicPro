import {
  Users,
  Car,
  ClipboardList,
  Download,
  ShieldCheck,
  Database,
} from "lucide-react";
import "./Features.css";

const featuresData = [
  {
    icon: <Users size={24} />,
    title: "Client Management",
    description:
      "Easily add, edit, and keep track of your clients' contact information and service history all in one place.",
  },
  {
    icon: <Car size={24} />,
    title: "Vehicle Tracking",
    description:
      "Manage multiple vehicles per client, track VINs, license plates, and detailed vehicle specifications.",
  },
  {
    icon: <ClipboardList size={24} />,
    title: "Service Orders",
    description:
      "Create detailed service orders with parts, labor costs, and real-time status tracking.",
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Local & Secure",
    description:
      "Your data stays on your machine. Powered by Tauri's local SQL plugin for maximum privacy and speed.",
  },
  {
    icon: <Database size={24} />,
    title: "Import & Export",
    description:
      "Seamlessly backup your data to CSV format or import existing records with just a few clicks.",
  },
  {
    icon: <Download size={24} />,
    title: "Document Generation",
    description:
      "Instantly generate and download professional PDF invoices and service detail reports for your clients.",
  },
];

export function Features() {
  return (
    <section id="features" className="features">
      <div className="container">
        <div className="features-header animate-fade-up delay-1">
          <h2 className="section-title">
            Everything you need to{" "}
            <span className="text-gradient">run your shop</span>
          </h2>
          <p className="section-subtitle">
            MechanicPro replaces messy spreadsheets and expensive cloud
            subscriptions with a fast, reliable desktop application.
          </p>
        </div>

        <div className="features-grid">
          {featuresData.map((feature, index) => (
            <div
              key={index}
              className={`feature-card glass-panel animate-fade-up delay-${(index % 3) + 1}`}
            >
              <div className="feature-icon-wrapper">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
