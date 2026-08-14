import { useEffect, useState } from "react";
import {
  Save,
  RotateCcw,
  CheckCircle,
  Database,
  Eye,
  FileText,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { useSettingsStore } from "../store/useSettingsStore";
import { PdfTemplateConfig, BackupConfig, PRESET_PALETTES } from "../types/config";
import { PrintTemplate } from "../components/PrintTemplate";
import { ServiceOrder } from "../db";
import { TemplateConfigForm } from "../components/TemplateConfigForm";
import { BackupConfigForm } from "../components/BackupConfigForm";
import { ImportSection } from "../components/ImportSection";
import { ExportSection } from "../components/ExportSection";
import "./SettingsPage.css";

// Mock Service Order for the real-time Live PDF Preview
const MOCK_PREVIEW_ORDER: ServiceOrder = {
  id: 1042,
  vehicle_id: 1,
  client_name: "João Carlos Silva",
  client_phone: "+351 912 345 678",
  vehicle_plate: "AA-24-XX",
  vehicle_brand: "Volkswagen",
  vehicle_model: "Golf 2.0 TDI",
  mileage: 145200,
  hours: 2.5,
  hourly_rate: 35.0,
  observations: "Substituição de óleo do motor, filtro de óleo e calços de travão dianteiros. Verificação geral de níveis.",
  total_price: 197.5,
  created_at: new Date().toISOString(),
  deleted_at: null,
  operations: [
    { id: 1, description: "Óleo Sintético 5W30 (5L)", price: 55.0 },
    { id: 2, description: "Filtro de Óleo Bosch", price: 15.0 },
    { id: 3, description: "Jogo de Calços de Travão Dianteiros TRW", price: 40.0 },
  ],
};

type ActiveTab = "pdf_template" | "backup_data";

export function SettingsPage() {
  const { pdfConfig, backupConfig, loadSettings, updatePdfConfig, updateBackupConfig, resetPdfConfig } = useSettingsStore();

  const [formData, setFormData] = useState<PdfTemplateConfig>(pdfConfig);
  const [backupData, setBackupData] = useState<BackupConfig>(backupConfig);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("pdf_template");
  const [zoom, setZoom] = useState(0.45);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.35));
  const handleZoomReset = () => setZoom(0.45);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    setFormData(pdfConfig);
    setBackupData(backupConfig);
  }, [pdfConfig, backupConfig]);

  const handleChange = <K extends keyof PdfTemplateConfig>(
    field: K,
    value: PdfTemplateConfig[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBackupChange = <K extends keyof BackupConfig>(
    field: K,
    value: BackupConfig[K]
  ) => {
    setBackupData((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyPalette = (paletteId: string) => {
    const targetPalette = PRESET_PALETTES.find((p) => p.id === paletteId);
    if (targetPalette) {
      setFormData((prev) => ({
        ...prev,
        primaryColor: targetPalette.primaryColor,
        accentColor: targetPalette.accentColor,
        headerBgColor: targetPalette.headerBgColor,
        textColor: targetPalette.textColor,
      }));
    }
  };

  const handleSave = async () => {
    await updatePdfConfig(formData);
    await updateBackupConfig(backupData);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const handleReset = async () => {
    if (window.confirm("Tem a certeza que deseja repor todas as definições do PDF para os valores padrão?")) {
      await resetPdfConfig();
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange("logoUrl", reader.result as string);
        handleChange("showLogo", true);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="settings-page-root">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "1.875rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Definições
          </h1>
          <p style={{ color: "var(--text-muted)", margin: "4px 0 0 0", fontSize: "0.95rem" }}>
            Altere as configurações do sistema
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          {showSavedToast && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#ecfdf5",
                color: "#047857",
                padding: "8px 16px",
                borderRadius: "8px",
                fontWeight: 600,
                border: "1px solid #a7f3d0",
                fontSize: "0.9rem",
              }}
            >
              <CheckCircle size={18} />
              <span>Guardado com sucesso!</span>
            </div>
          )}

          {activeTab === "pdf_template" && (
            <button
              className="btn-secondary"
              onClick={handleReset}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <RotateCcw size={18} />
              <span>Repor</span>
            </button>
          )}

          <button
            className="btn"
            onClick={handleSave}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Save size={18} />
            <span>Guardar</span>
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="tabs-container" style={{ flexShrink: 0 }}>
        <button
          className={`tab-btn ${activeTab === "pdf_template" ? "active" : ""}`}
          onClick={() => setActiveTab("pdf_template")}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <FileText size={18} />
          <span>PDF</span>
        </button>

        <button
          className={`tab-btn ${activeTab === "backup_data" ? "active" : ""}`}
          onClick={() => setActiveTab("backup_data")}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Database size={18} />
          <span>Backup</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "pdf_template" ? (
        <div className="settings-split-layout">
          {/* LEFT: Scrollable Consolidated Form */}
          <div className="settings-form-pane">
            <TemplateConfigForm
              formData={formData}
              onChange={handleChange}
              onApplyPalette={handleApplyPalette}
              onLogoUpload={handleLogoUpload}
            />
          </div>

          {/* RIGHT: Fixed / Sticky Live PDF Preview */}
          <div className="settings-preview-pane">
            <div className="preview-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye size={16} />
                <span>Pré-Visualização</span>
              </div>
              <div className="zoom-controls">
                <button
                  type="button"
                  className="zoom-btn"
                  onClick={handleZoomOut}
                  title="Diminuir Zoom"
                  disabled={zoom <= 0.35}
                >
                  <ZoomOut size={14} />
                </button>
                <span className="zoom-percentage">{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  className="zoom-btn"
                  onClick={handleZoomIn}
                  title="Aumentar Zoom"
                  disabled={zoom >= 1.5}
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  type="button"
                  className="zoom-btn"
                  onClick={handleZoomReset}
                  title="Repor Zoom"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            <div className="preview-frame">
              <div
                className="preview-paper"
                style={{
                  transform: `scale(${zoom})`,
                  marginBottom: `-${(1 - zoom) * 1123}px`
                }}
              >
                <PrintTemplate order={MOCK_PREVIEW_ORDER} configOverride={formData} previewMode={true} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Backup & Data Tab Panels */
        <div className="settings-data-layout">
          {/* Section 1: Automated Backups */}
          <BackupConfigForm
            backupData={backupData}
            onBackupChange={handleBackupChange}
          />

          {/* Section 2: CSV Import utility */}
          <ImportSection />

          {/* Section 3: CSV Export utility */}
          <ExportSection />
        </div>
      )}
    </div>
  );
}
