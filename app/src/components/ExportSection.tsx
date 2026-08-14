import { useState } from "react";
import { Users, Car, Wrench, Download, CheckCircle, FileSpreadsheet, Receipt } from "lucide-react";
import { exportService } from "../services/exportService";

interface ExportOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  exportFn: () => Promise<{ count: number }>;
}

export function ExportSection() {
  const [exporting, setExporting] = useState<string | null>(null);
  const [lastExported, setLastExported] = useState<{ id: string; count: number } | null>(null);

  const exportOptions: ExportOption[] = [
    {
      id: "clients",
      label: "Clientes",
      description: "Exportar todos os clientes registados com nome, telefone e data de criação.",
      icon: <Users size={24} color="var(--primary)" />,
      exportFn: exportService.exportClients,
    },
    {
      id: "vehicles",
      label: "Veículos",
      description: "Exportar todos os veículos com matrícula, marca, modelo, ano e cliente associado.",
      icon: <Car size={24} color="var(--primary)" />,
      exportFn: exportService.exportVehicles,
    },
    {
      id: "services",
      label: "Serviços",
      description: "Exportar todas as ordens de serviço com cliente, veículo, preço total e data.",
      icon: <Wrench size={24} color="var(--primary)" />,
      exportFn: exportService.exportServices,
    },
    {
      id: "expenses",
      label: "Despesas",
      description: "Exportar todas as despesas registadas com data, descrição, custo e nº de recibo.",
      icon: <Receipt size={24} color="var(--primary)" />,
      exportFn: exportService.exportExpenses,
    },
  ];

  const handleExport = async (option: ExportOption) => {
    setExporting(option.id);
    setLastExported(null);
    try {
      const result = await option.exportFn();
      setLastExported({ id: option.id, count: result.count });
    } catch (err) {
      console.error("Erro ao exportar", err);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="settings-data-section">
      <div className="settings-section-header">
        <h3 className="settings-section-title">Exportar Dados</h3>
        <p className="settings-section-desc">Exporte os dados do sistema em formato CSV.</p>
      </div>

      <div className="settings-grid-cards">
        {exportOptions.map((option) => {
          const isExporting = exporting === option.id;
          const wasExported = lastExported?.id === option.id;

          return (
            <div
              key={option.id}
              className="card data-card"
              style={{
                border: wasExported ? "1px solid var(--primary)" : undefined,
              }}
            >
              <div className="data-card-header">
                <div className="data-card-icon-wrap">
                  {option.icon}
                </div>
                <div>
                  <h3 className="data-card-title">{option.label}</h3>
                  <div className="data-card-badge-wrap">
                    <FileSpreadsheet size={13} color="var(--text-muted)" />
                    <span>CSV</span>
                  </div>
                </div>
              </div>

              <p className="data-card-desc">
                {option.description}
              </p>

              {wasExported && (
                <div className="success-banner-compact flex-row">
                  <CheckCircle size={16} />
                  <span>{lastExported.count} registos exportados</span>
                </div>
              )}

              <button
                className="btn btn-full"
                onClick={() => handleExport(option)}
                disabled={isExporting}
                style={{
                  opacity: isExporting ? 0.6 : 1,
                }}
              >
                <Download size={18} />
                <span>{isExporting ? "A exportar..." : "Exportar"}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
