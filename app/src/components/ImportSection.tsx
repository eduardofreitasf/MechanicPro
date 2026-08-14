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

export function ImportSection() {
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
    <div className="settings-data-section">
      <div className="settings-section-header">
        <h3 className="settings-section-title">Importar Dados</h3>
        <p className="settings-section-desc">Importe dados para o sistema através de ficheiros CSV.</p>
      </div>

      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="card note-card">
        <h4>
          <FileText size={18} color="var(--text-muted)" /> Notas sobre o formato
        </h4>
        <ul>
          <li>O ficheiro deve ser um CSV separado por vírgulas.</li>
          <li>A primeira linha deve conter os cabeçalhos.</li>
          <li>Ao importar veículos, o cliente já deve estar registado com o nome exato.</li>
          <li>Ao importar serviços, a matrícula do veículo já deve estar registada.</li>
          <li>Ao importar despesas: colunas obrigatórias <strong>Data</strong> e <strong>Custo</strong>; data aceite em <code>YYYY-MM-DD</code> ou <code>DD-MM-YYYY</code>.</li>
        </ul>
      </div>

      <div className="settings-grid-cards">
        {importOptions.map((option) => {
          const isImporting = importing === option.id;
          const showResult = results?.id === option.id;

          return (
            <div
              key={option.id}
              className="card data-card"
              style={{
                opacity: importing && !isImporting ? 0.5 : 1,
              }}
            >
              <div className="data-card-header">
                <div className="data-card-icon-wrap">
                  {option.icon}
                </div>
                <h3 className="data-card-title">{option.label}</h3>
              </div>

              <p className="data-card-desc">
                {option.description}
              </p>

              {showResult && (
                <div className="success-banner-compact">
                  <div className="success-banner-compact-title">
                    <CheckCircle size={16} />
                    <span>Importação concluída</span>
                  </div>
                  <div className="success-banner-compact-detail">
                    {results.imported} registos criados | {results.skipped} ignorados
                  </div>
                </div>
              )}

              <button
                className="btn btn-full"
                onClick={() => triggerUpload(option)}
                disabled={!!importing}
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
