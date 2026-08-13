import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { ClientsPage } from "./pages/ClientsPage";
import { VehiclesPage } from "./pages/VehiclesPage";
import { ServicesPage } from "./pages/ServicesPage";
import { CreateServiceOrderPage } from "./pages/CreateServiceOrderPage";
import { ServiceOrderDetailsPage } from "./pages/ServiceOrderDetailsPage";
import { ExportPage } from "./pages/ExportPage";
import { ImportPage } from "./pages/ImportPage";
import { ExpensesPage } from "./pages/ExpensesPage";
import { SettingsPage } from "./pages/SettingsPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/new" element={<CreateServiceOrderPage />} />
          <Route path="services/edit/:id" element={<CreateServiceOrderPage />} />
          <Route path="services/:id" element={<ServiceOrderDetailsPage />} />
          <Route path="import" element={<ImportPage />} />
          <Route path="export" element={<ExportPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


export default App;

