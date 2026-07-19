import { useState, useRef } from "react";
import { Users, Car, Wrench, Upload, CheckCircle, AlertCircle, FileText, Receipt } from "lucide-react";
import { importService } from "../services/importService";

interface ImportOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  importFn: (csv: string) => Promise<{ imported: number; skipped: number }>;
}

export function ImportPage() {
  const [importing, setImporting] = useState<string | null>(null);
  const [results, setResults] = useState<{ id: string; imported: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeOption, setActiveOption] = useState<ImportOption | null>(null);

  const importOptions: ImportOption[] = [
    {
      id: "clients",
      label: "Importar Clientes",
      description: "Carregue um CSV com 'Nome' e 'Telefone'. Ignora duplicados.",
      icon: <Users size={24} color="var(--primary)" />,
      importFn: importService.importClients,
    },
    {
      id: "vehicles",
      label: "Importar Veículos",
      description: "Carregue um CSV com 'Matrícula', 'Marca', 'Modelo', 'Ano' e 'Cliente'.",
      icon: <Car size={24} color="var(--primary)" />,
      importFn: importService.importVehicles,
    },
    {
      id: "services",
      label: "Importar Serviços",
      description: "Carregue um CSV com 'Matrícula', 'Quilometragem', 'Horas', 'Preço/Hora' e 'Operações'.",
      icon: <Wrench size={24} color="var(--primary)" />,
      importFn: importService.importServices,
    },
    {
      id: "expenses",
      label: "Importar Despesas",
      description: "Carregue um CSV com 'Data' e 'Custo' (obrigatórios) e 'Descrição', 'Nº Recibo' (opcionais).",
      icon: <Receipt size={24} color="var(--primary)" />,
      importFn: importService.importExpenses,
    },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeOption) return;

    setImporting(activeOption.id);
    setResults(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csv = event.target?.result as string;
      try {
        const result = await activeOption.importFn(csv);
        setResults({ id: activeOption.id, ...result });
      } catch (err: any) {
        setError(err.message || "Erro ao processar o ficheiro CSV.");
      } finally {
        setImporting(null);
        setActiveOption(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.onerror = () => {
      setError("Erro ao ler o ficheiro.");
      setImporting(null);
    };
    reader.readAsText(file);
  };

  const triggerUpload = (option: ImportOption) => {
    setActiveOption(option);
    fileInputRef.current?.click();
  };

  return (
    <div className="main-content">
      <header className="header">
        <div>
          <h1>Importar Dados</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "4px", fontSize: "0.95rem" }}>
            Importe dados para o sistema através de ficheiros CSV.
          </p>
        </div>
      </header>

      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {error && (
        <div style={{ 
          background: "#fef2f2", 
          border: "1px solid #fee2e2", 
          padding: "16px", 
          borderRadius: "12px", 
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          color: "#b91c1c"
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="card" style={{ marginBottom: "24px", padding: "24px", background: "#f8fafc" }}>
        <h4 style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
          <FileText size={18} color="var(--text-muted)" /> Notas sobre o formato
        </h4>
        <ul style={{ fontSize: "0.85rem", color: "var(--text-muted)", paddingLeft: "20px", lineHeight: "1.6" }}>
          <li>O ficheiro deve ser um CSV separado por vírgulas.</li>
          <li>A primeira linha deve conter os cabeçalhos.</li>
          <li>Ao importar veículos, o cliente já deve estar registado com o nome exato.</li>
          <li>Ao importar serviços, a matrícula do veículo já deve estar registada.</li>
          <li>Ao importar despesas: colunas obrigatórias <strong>Data</strong> e <strong>Custo</strong>; data aceite em <code>YYYY-MM-DD</code> ou <code>DD-MM-YYYY</code>.</li>
        </ul>
      </div>

      <div className="grid-3-col">
        {importOptions.map((option) => {
          const isImporting = importing === option.id;
          const showResult = results?.id === option.id;

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
                opacity: importing && !isImporting ? 0.5 : 1,
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
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>{option.label}</h3>
              </div>

              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                {option.description}
              </p>

              {showResult && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    padding: "12px",
                    background: "#f0fdf4",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#16a34a", fontWeight: 600 }}>
                    <CheckCircle size={16} />
                    <span>Importação concluída</span>
                  </div>
                  <div style={{ color: "var(--text-muted)", paddingLeft: "24px" }}>
                    {results.imported} registos criados | {results.skipped} ignorados
                  </div>
                </div>
              )}

              <button
                className="btn"
                onClick={() => triggerUpload(option)}
                disabled={!!importing}
                style={{
                  marginTop: "auto",
                  width: "100%",
                }}
              >
                <Upload size={18} />
                <span>{isImporting ? "A processar..." : "Selecionar Ficheiro"}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
