import { useEffect, useState } from "react";
import {
  Palette,
  Layout,
  Building,
  FileText,
  Save,
  RotateCcw,
  CheckCircle,
  Upload,
  Eye,
} from "lucide-react";
import { useSettingsStore } from "../store/useSettingsStore";
import { PRESET_PALETTES, PdfTemplateConfig } from "../types/config";
import { PrintTemplate } from "../components/PrintTemplate";
import { ServiceOrder } from "../db";

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

export function SettingsPage() {
  const { pdfConfig, loadSettings, updatePdfConfig, resetPdfConfig } = useSettingsStore();

  const [formData, setFormData] = useState<PdfTemplateConfig>(pdfConfig);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [activeTab, setActiveTab] = useState<"branding" | "colors" | "layout" | "footer">("branding");

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    setFormData(pdfConfig);
  }, [pdfConfig]);

  const handleChange = <K extends keyof PdfTemplateConfig>(
    field: K,
    value: PdfTemplateConfig[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyPalette = (paletteId: string) => {
    const palette = PRESET_PALETTES.find((p) => p.id === paletteId);
    if (palette) {
      setFormData((prev) => ({
        ...prev,
        primaryColor: palette.primaryColor,
        accentColor: palette.accentColor,
        headerBgColor: palette.headerBgColor,
        textColor: palette.textColor,
      }));
    }
  };

  const handleSave = async () => {
    await updatePdfConfig(formData);
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
    <div className="settings-page-container" style={{ padding: "0 0 40px 0" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: 800 }}>
            Definições
          </h1>
          <p style={{ color: "var(--text-muted)", margin: "4px 0 0 0", fontSize: "0.95rem" }}>
            Personalização do Template PDF.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
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
              }}
            >
              <CheckCircle size={18} />
              <span>Guardado com sucesso!</span>
            </div>
          )}

          <button
            className="btn-secondary"
            onClick={handleReset}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <RotateCcw size={18} />
            <span>Repor Padrão</span>
          </button>

          <button
            className="btn"
            onClick={handleSave}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--primary)" }}
          >
            <Save size={18} />
            <span>Guardar Alterações</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Customizer Panel vs Live Real-time PDF Preview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.15fr",
          gap: "28px",
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: Controls & Tabs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Navigation Tabs */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              background: "#f1f5f9",
              padding: "6px",
              borderRadius: "12px",
            }}
          >
            <button
              onClick={() => setActiveTab("branding")}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: "8px",
                border: "none",
                background: activeTab === "branding" ? "#ffffff" : "transparent",
                fontWeight: activeTab === "branding" ? 700 : 500,
                color: activeTab === "branding" ? "var(--primary)" : "var(--text-muted)",
                boxShadow: activeTab === "branding" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontSize: "0.85rem",
              }}
            >
              <Building size={16} />
              <span>Empresa</span>
            </button>

            <button
              onClick={() => setActiveTab("colors")}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: "8px",
                border: "none",
                background: activeTab === "colors" ? "#ffffff" : "transparent",
                fontWeight: activeTab === "colors" ? 700 : 500,
                color: activeTab === "colors" ? "var(--primary)" : "var(--text-muted)",
                boxShadow: activeTab === "colors" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontSize: "0.85rem",
              }}
            >
              <Palette size={16} />
              <span>Cores</span>
            </button>

            <button
              onClick={() => setActiveTab("layout")}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: "8px",
                border: "none",
                background: activeTab === "layout" ? "#ffffff" : "transparent",
                fontWeight: activeTab === "layout" ? 700 : 500,
                color: activeTab === "layout" ? "var(--primary)" : "var(--text-muted)",
                boxShadow: activeTab === "layout" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontSize: "0.85rem",
              }}
            >
              <Layout size={16} />
              <span>Layout</span>
            </button>

            <button
              onClick={() => setActiveTab("footer")}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: "8px",
                border: "none",
                background: activeTab === "footer" ? "#ffffff" : "transparent",
                fontWeight: activeTab === "footer" ? 700 : 500,
                color: activeTab === "footer" ? "var(--primary)" : "var(--text-muted)",
                boxShadow: activeTab === "footer" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontSize: "0.85rem",
              }}
            >
              <FileText size={16} />
              <span>Rodapé</span>
            </button>
          </div>

          {/* TAB 1: BRANDING & COMPANY DETAILS */}
          {activeTab === "branding" && (
            <div className="card" style={{ padding: "24px" }}>
              <h3 style={{ marginTop: 0, marginBottom: "18px" }}>Informação da Oficina</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label className="form-label">Nome da Oficina: </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.companyName}
                    onChange={(e) => handleChange("companyName", e.target.value)}
                    placeholder="ex: Garagem Central"
                  />
                </div>

                <div>
                  <label className="form-label">Slogan: </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.tagline}
                    onChange={(e) => handleChange("tagline", e.target.value)}
                    placeholder="ex: Manutenção e Reparação Automóvel"
                  />
                </div>

                <div>
                  <label className="form-label">NIF: </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.vatNumber}
                    onChange={(e) => handleChange("vatNumber", e.target.value)}
                    placeholder="500 000 000"
                  />
                </div>
                <div>
                  <label className="form-label">Contacto: </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+351 910 000 000"
                  />
                </div>

                <div>
                  <label className="form-label">Morada: </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="Rua Principal nº 123, Lisboa"
                  />
                </div>

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                  <label className="form-label" style={{ marginBottom: "8px", display: "block" }}>
                    Logótipo no PDF
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.showLogo}
                        onChange={(e) => handleChange("showLogo", e.target.checked)}
                        style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
                      />
                      <span>Exibir Logótipo</span>
                    </label>

                    <label
                      className="btn-secondary"
                      style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}
                    >
                      <Upload size={16} />
                      <span>Carregar Imagem</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
                    </label>

                    {formData.logoUrl && (
                      <button
                        className="btn-secondary"
                        onClick={() => handleChange("logoUrl", "")}
                        style={{ fontSize: "0.8rem", color: "var(--danger)" }}
                      >
                        Remover Logo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COLORS & PRESETS */}
          {activeTab === "colors" && (
            <div className="card" style={{ padding: "24px" }}>
              <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Paleta de Cores</h3>

              <div style={{ marginBottom: "20px" }}>
                <label className="form-label" style={{ marginBottom: "10px", display: "block" }}>
                  Temas de Cores Rápidos
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {PRESET_PALETTES.map((palette) => (
                    <button
                      key={palette.id}
                      onClick={() => handleApplyPalette(palette.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background: "#ffffff",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          background: palette.primaryColor,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}
                      />
                      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{palette.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label className="form-label">Cor Principal</label>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => handleChange("primaryColor", e.target.value)}
                        style={{ width: "40px", height: "38px", padding: 0, border: "none", cursor: "pointer" }}
                      />
                      <input
                        type="text"
                        className="input-field"
                        value={formData.primaryColor}
                        onChange={(e) => handleChange("primaryColor", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Fundo de Destaque</label>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input
                        type="color"
                        value={formData.headerBgColor}
                        onChange={(e) => handleChange("headerBgColor", e.target.value)}
                        style={{ width: "40px", height: "38px", padding: 0, border: "none", cursor: "pointer" }}
                      />
                      <input
                        type="text"
                        className="input-field"
                        value={formData.headerBgColor}
                        onChange={(e) => handleChange("headerBgColor", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LAYOUT & DENSITY */}
          {activeTab === "layout" && (
            <div className="card" style={{ padding: "24px" }}>
              <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Estrutura</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label className="form-label" style={{ marginBottom: "8px", display: "block" }}>
                    Estilo do Layout do PDF
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    {[
                      { id: "original", label: "Original", desc: "Layout original minimalista com caixa de total destacada" },
                      { id: "paystub", label: "Corporativo", desc: "Estilo folha de vencimento com grelhas e campos de assinatura" },
                      { id: "formal-table", label: "Fatura", desc: "Moldura formal com 4 quadrantes e tabela com linhas completas" },
                      { id: "standard", label: "Padrão", desc: "Layout tradicional e limpo" },
                      { id: "modern-split", label: "Banner Superior", desc: "Cabeçalho com cor de destaque" },
                      { id: "minimal", label: "Minimalista", desc: "Design leve sem caixas" },
                      { id: "sidebar", label: "Coluna Lateral", desc: "Coluna esquerda com dados da oficina" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => handleChange("layoutStyle", mode.id as any)}
                        style={{
                          padding: "12px",
                          borderRadius: "8px",
                          border: formData.layoutStyle === mode.id ? "2px solid var(--primary)" : "1px solid var(--border)",
                          background: formData.layoutStyle === mode.id ? "var(--header-bg, #f0f4ff)" : "#ffffff",
                          fontWeight: formData.layoutStyle === mode.id ? 700 : 500,
                          cursor: "pointer",
                          textAlign: "left",
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                        }}
                      >
                        <span style={{ fontSize: "0.9rem", color: formData.layoutStyle === mode.id ? "var(--primary)" : "var(--text)" }}>
                          {mode.label}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 400 }}>
                          {mode.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ marginBottom: "8px", display: "block" }}>
                    Densidade da Tabela
                  </label>
                  <select
                    className="input-field"
                    value={formData.tableDensity}
                    onChange={(e) => handleChange("tableDensity", e.target.value as any)}
                  >
                    <option value="compact">Compacta</option>
                    <option value="normal">Normal</option>
                    <option value="spacious">Espaçosa</option>
                  </select>
                </div>

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                  <label className="form-label" style={{ marginBottom: "12px", display: "block" }}>
                    Visibilidade
                  </label>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.88rem", fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={formData.showOrderNumber}
                        onChange={(e) => handleChange("showOrderNumber", e.target.checked)}
                        style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
                      />
                      <span>Número da Ordem</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.88rem", fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={formData.showShopAddress}
                        onChange={(e) => handleChange("showShopAddress", e.target.checked)}
                        style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
                      />
                      <span>Morada da Oficina</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.88rem", fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={formData.showShopPhone}
                        onChange={(e) => handleChange("showShopPhone", e.target.checked)}
                        style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
                      />
                      <span>Contacto da Oficina</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.88rem", fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={formData.showShopVat}
                        onChange={(e) => handleChange("showShopVat", e.target.checked)}
                        style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
                      />
                      <span>NIF da Oficina</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.88rem", fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={formData.showClientPhone}
                        onChange={(e) => handleChange("showClientPhone", e.target.checked)}
                        style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
                      />
                      <span>Contacto do Cliente</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.88rem", fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={formData.showVehicleMileage}
                        onChange={(e) => handleChange("showVehicleMileage", e.target.checked)}
                        style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
                      />
                      <span>Quilómetros do Veículo</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.88rem", fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={formData.showItemizedPrices}
                        onChange={(e) => handleChange("showItemizedPrices", e.target.checked)}
                        style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
                      />
                      <span>Preços das Peças</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.88rem", fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={formData.showLaborBreakdown}
                        onChange={(e) => handleChange("showLaborBreakdown", e.target.checked)}
                        style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
                      />
                      <span>Mão de Obra</span>
                    </label>

                    {formData.showLaborBreakdown && (
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.88rem", fontWeight: 500 }}>
                        <input
                          type="checkbox"
                          checked={formData.showLaborDetails !== false}
                          onChange={(e) => handleChange("showLaborDetails", e.target.checked)}
                          style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
                        />
                        <span>Detalhes de Mão de Obra</span>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FOOTER / TERMS */}
          {activeTab === "footer" && (
            <div className="card" style={{ padding: "24px" }}>
              <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Rodapé</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formData.showFooter}
                    onChange={(e) => handleChange("showFooter", e.target.checked)}
                    style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
                  />
                  <span>Exibir Rodapé no PDF</span>
                </label>

                {formData.showFooter && (
                  <div>
                    <label className="form-label" style={{ marginBottom: "8px", display: "block" }}>
                      Nota do Rodapé
                    </label>
                    <textarea
                      className="input-field"
                      rows={5}
                      value={formData.footerNote}
                      onChange={(e) => handleChange("footerNote", e.target.value)}
                      placeholder="ex: Obrigado pela preferência! Pagamento a 30 dias. IBAN: PT50 0000 0000..."
                      style={{ width: "100%", resize: "vertical" }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>


        {/* RIGHT COLUMN: Real-time Live PDF Preview */}
        <div style={{ position: "sticky", top: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
              color: "var(--text-muted)",
              fontWeight: 700,
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            <Eye size={16} />
            <span>Pré-Visualização</span>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
              overflow: "hidden",
              transform: "scale(0.95)",
              transformOrigin: "top left",
              width: "105%",
            }}
          >
            <PrintTemplate order={MOCK_PREVIEW_ORDER} configOverride={formData} previewMode={true} />

          </div>
        </div>
      </div>
    </div>
  );
}
