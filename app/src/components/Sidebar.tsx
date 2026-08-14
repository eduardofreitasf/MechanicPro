import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Car, Wrench, Receipt, PanelLeftClose, Settings } from "lucide-react";
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
        <NavLink to="/expenses" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} title="Despesas">
          <Receipt size={20} />
          <span className="nav-text">Despesas</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} title="Definições">
          <Settings size={20} />
          <span className="nav-text">Definições</span>
        </NavLink>
      </nav>
    </aside>
  );
}

