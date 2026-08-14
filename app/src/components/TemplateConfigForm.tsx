import React from "react";
import { Upload, Palette, Building, Layout, FileText } from "lucide-react";
import { PdfTemplateConfig, PRESET_PALETTES } from "../types/config";

interface TemplateConfigFormProps {
  formData: PdfTemplateConfig;
  onChange: <K extends keyof PdfTemplateConfig>(field: K, value: PdfTemplateConfig[K]) => void;
  onApplyPalette: (paletteId: string) => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TemplateConfigForm({
  formData,
  onChange,
  onApplyPalette,
  onLogoUpload,
}: TemplateConfigFormProps) {
  return (
    <div className="template-config-form">
      {/* SECTION 1: BRANDING & COMPANY DETAILS */}
      <div className="settings-form-section">
        <div className="settings-form-section-header">
          <Building size={18} color="var(--primary)" />
          <span>Informação da Oficina</span>
        </div>
        
        <div className="fieldset-content">
          <div className="form-group">
            <label className="form-label">Nome da Oficina</label>
            <input
              type="text"
              className="form-input"
              value={formData.companyName}
              onChange={(e) => onChange("companyName", e.target.value)}
              placeholder="ex: Garagem Central"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Slogan</label>
            <input
              type="text"
              className="form-input"
              value={formData.tagline}
              onChange={(e) => onChange("tagline", e.target.value)}
              placeholder="ex: Manutenção e Reparação Automóvel"
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">NIF</label>
              <input
                type="text"
                className="form-input"
                value={formData.vatNumber}
                onChange={(e) => onChange("vatNumber", e.target.value)}
                placeholder="500 000 000"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contacto</label>
              <input
                type="text"
                className="form-input"
                value={formData.phone}
                onChange={(e) => onChange("phone", e.target.value)}
                placeholder="+351 910 000 000"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Morada</label>
            <input
              type="text"
              className="form-input"
              value={formData.address}
              onChange={(e) => onChange("address", e.target.value)}
              placeholder="Rua Principal nº 123, Lisboa"
            />
          </div>

            <div className="logo-upload-controls">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.showLogo}
                  onChange={(e) => onChange("showLogo", e.target.checked)}
                  className="checkbox-input"
                />
                <span>Exibir Logótipo</span>
              </label>

              <label className="btn-secondary btn-sm-upload">
                <Upload size={16} />
                <span>Carregar Imagem</span>
                <input type="file" accept="image/*" onChange={onLogoUpload} style={{ display: "none" }} />
              </label>

              {formData.logoUrl && (
                <button
                  type="button"
                  className="btn-secondary danger-text"
                  onClick={() => onChange("logoUrl", "")}
                >
                  Remover Logo
                </button>
              )}
            </div>
        </div>
      </div>

      {/* SECTION 2: COLORS & PRESETS */}
      <div className="settings-form-section">
        <div className="settings-form-section-header">
          <Palette size={18} color="var(--primary)" />
          <span>Paleta de Cores e Temas</span>
        </div>

        <div className="fieldset-content">
          <div style={{ marginBottom: "8px" }}>
            <label className="form-label" style={{ marginBottom: "10px", display: "block" }}>
              Temas Rápidos
            </label>
            <div className="preset-palettes-grid">
              {PRESET_PALETTES.map((palette) => (
                <button
                  type="button"
                  key={palette.id}
                  onClick={() => onApplyPalette(palette.id)}
                  className="preset-palette-btn"
                >
                  <div
                    className="preset-palette-color"
                    style={{ background: palette.primaryColor }}
                  />
                  <span>{palette.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="colors-manual-inputs">
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Cor Principal</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => onChange("primaryColor", e.target.value)}
                    className="color-picker-input"
                  />
                  <input
                    type="text"
                    className="form-input color-text-input"
                    value={formData.primaryColor}
                    onChange={(e) => onChange("primaryColor", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Fundo de Destaque</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    value={formData.headerBgColor}
                    onChange={(e) => onChange("headerBgColor", e.target.value)}
                    className="color-picker-input"
                  />
                  <input
                    type="text"
                    className="form-input color-text-input"
                    value={formData.headerBgColor}
                    onChange={(e) => onChange("headerBgColor", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: LAYOUT & DENSITY */}
      <div className="settings-form-section">
        <div className="settings-form-section-header">
          <Layout size={18} color="var(--primary)" />
          <span>Estrutura e Visibilidade</span>
        </div>

        <div className="fieldset-content">
          <div style={{ marginBottom: "12px" }}>
            <label className="form-label" style={{ marginBottom: "10px", display: "block" }}>
              Estilo do Layout do PDF
            </label>
            <div className="layout-styles-grid">
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
                  type="button"
                  key={mode.id}
                  onClick={() => onChange("layoutStyle", mode.id as any)}
                  className={`layout-style-btn ${formData.layoutStyle === mode.id ? "active" : ""}`}
                >
                  <span className="layout-style-title">{mode.label}</span>
                  <span className="layout-style-desc">{mode.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "12px" }}>
            <label className="form-label">Densidade da Tabela</label>
            <select
              className="form-input"
              value={formData.tableDensity}
              onChange={(e) => onChange("tableDensity", e.target.value as any)}
            >
              <option value="compact">Compacta</option>
              <option value="normal">Normal</option>
              <option value="spacious">Espaçosa</option>
            </select>
          </div>

          <div className="visibility-checkboxes-section">
            <label className="form-label" style={{ marginBottom: "12px", display: "block" }}>
              Visibilidade dos Elementos
            </label>

            <div className="checkboxes-grid">
              <label className="checkbox-label-dense">
                <input
                  type="checkbox"
                  checked={formData.showOrderNumber}
                  onChange={(e) => onChange("showOrderNumber", e.target.checked)}
                />
                <span>Número da Ordem</span>
              </label>

              <label className="checkbox-label-dense">
                <input
                  type="checkbox"
                  checked={formData.showShopAddress}
                  onChange={(e) => onChange("showShopAddress", e.target.checked)}
                />
                <span>Morada da Oficina</span>
              </label>

              <label className="checkbox-label-dense">
                <input
                  type="checkbox"
                  checked={formData.showShopPhone}
                  onChange={(e) => onChange("showShopPhone", e.target.checked)}
                />
                <span>Contacto da Oficina</span>
              </label>

              <label className="checkbox-label-dense">
                <input
                  type="checkbox"
                  checked={formData.showShopVat}
                  onChange={(e) => onChange("showShopVat", e.target.checked)}
                />
                <span>NIF da Oficina</span>
              </label>

              <label className="checkbox-label-dense">
                <input
                  type="checkbox"
                  checked={formData.showClientPhone}
                  onChange={(e) => onChange("showClientPhone", e.target.checked)}
                />
                <span>Contacto do Cliente</span>
              </label>

              <label className="checkbox-label-dense">
                <input
                  type="checkbox"
                  checked={formData.showVehicleMileage}
                  onChange={(e) => onChange("showVehicleMileage", e.target.checked)}
                />
                <span>Quilómetros</span>
              </label>

              <label className="checkbox-label-dense">
                <input
                  type="checkbox"
                  checked={formData.showItemizedPrices}
                  onChange={(e) => onChange("showItemizedPrices", e.target.checked)}
                />
                <span>Preços das Peças</span>
              </label>

              <label className="checkbox-label-dense">
                <input
                  type="checkbox"
                  checked={formData.showLaborBreakdown}
                  onChange={(e) => onChange("showLaborBreakdown", e.target.checked)}
                />
                <span>Mão de Obra</span>
              </label>

              {formData.showLaborBreakdown && (
                <label className="checkbox-label-dense">
                  <input
                    type="checkbox"
                    checked={formData.showLaborDetails !== false}
                    onChange={(e) => onChange("showLaborDetails", e.target.checked)}
                  />
                  <span>Tempo e Preço</span>
                </label>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: FOOTER / TERMS */}
      <div className="settings-form-section">
        <div className="settings-form-section-header">
          <FileText size={18} color="var(--primary)" />
          <span>Nota e Rodapé</span>
        </div>

        <div className="fieldset-content">
          <label className="checkbox-label" style={{ marginBottom: "12px" }}>
            <input
              type="checkbox"
              checked={formData.showFooter}
              onChange={(e) => onChange("showFooter", e.target.checked)}
              className="checkbox-input"
            />
            <span>Exibir Rodapé no PDF</span>
          </label>

          {formData.showFooter && (
            <div className="form-group">
              <label className="form-label">Nota do Rodapé</label>
              <textarea
                className="form-input"
                rows={4}
                value={formData.footerNote}
                onChange={(e) => onChange("footerNote", e.target.value)}
                placeholder="ex: Obrigado pela preferência! Pagamento a 30 dias. IBAN: PT50 0000 0000..."
                style={{ width: "100%", resize: "vertical" }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
