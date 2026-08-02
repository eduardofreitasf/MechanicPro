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

export function ExportPage() {
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
    <div className="main-content">
      <header className="header">
        <div>
          <h1>Exportar Dados</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "4px", fontSize: "0.95rem" }}>
            Exporte os dados do sistema em formato CSV.
          </p>
        </div>
      </header>

      <div className="grid-3-col">
        {exportOptions.map((option) => {
          const isExporting = exporting === option.id;
          const wasExported = lastExported?.id === option.id;

          return (
            <div
              key={option.id}
              className="card"
              style={{
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                transition: "all 0.2s ease",
                border: wasExported ? "1px solid var(--primary)" : undefined,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {option.icon}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>{option.label}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                    <FileSpreadsheet size={13} color="var(--text-muted)" />
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>CSV</span>
                  </div>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                {option.description}
              </p>

              {wasExported && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    background: "#f0fdf4",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    color: "#16a34a",
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle size={16} />
                  <span>{lastExported.count} registos exportados com sucesso</span>
                </div>
              )}

              <button
                className="btn"
                onClick={() => handleExport(option)}
                disabled={isExporting}
                style={{
                  marginTop: "auto",
                  opacity: isExporting ? 0.6 : 1,
                  width: "100%",
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
