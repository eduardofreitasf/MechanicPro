import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Car, Wrench, FileDown, Upload, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useLayoutStore } from "../store/useLayoutStore";

export function Sidebar() {
  const { isSidebarCollapsed, toggleSidebar } = useLayoutStore();

  return (
    <aside className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div 
          className={`sidebar-brand ${isSidebarCollapsed ? "clickable" : ""}`}
          onClick={() => isSidebarCollapsed && toggleSidebar()}
          title={isSidebarCollapsed ? "Expandir" : ""}
        >
          <Wrench size={28} color="var(--primary)" className="brand-icon" />
          <span className="brand-text">Oficina</span>
        </div>
        {!isSidebarCollapsed && (
          <button 
            className="collapse-btn" 
            onClick={toggleSidebar}
            title="Recolher"
          >
            <PanelLeftClose size={20} />
          </button>
        )}
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} title="Início">
          <LayoutDashboard size={20} />
          <span className="nav-text">Início</span>
        </NavLink>
        <NavLink to="/clients" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} title="Clientes">
          <Users size={20} />
          <span className="nav-text">Clientes</span>
        </NavLink>
        <NavLink to="/vehicles" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} title="Veículos">
          <Car size={20} />
          <span className="nav-text">Veículos</span>
        </NavLink>
        <NavLink to="/services" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} title="Serviços">
          <Wrench size={20} />
          <span className="nav-text">Serviços</span>
        </NavLink>
        <NavLink to="/import" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} title="Importar">
          <Upload size={20} />
          <span className="nav-text">Importar</span>
        </NavLink>
        <NavLink to="/export" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} title="Exportar">
          <FileDown size={20} />
          <span className="nav-text">Exportar</span>
        </NavLink>
      </nav>
    </aside>
  );
}
