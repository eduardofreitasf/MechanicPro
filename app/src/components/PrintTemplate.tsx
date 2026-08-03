import { forwardRef } from "react";
import { ServiceOrder } from "../db";
import { useSettingsStore } from "../store/useSettingsStore";
import { PdfTemplateConfig, DEFAULT_PDF_CONFIG } from "../types/config";

interface PrintTemplateProps {
  order: ServiceOrder;
  configOverride?: PdfTemplateConfig;
  previewMode?: boolean;
}

export const PrintTemplate = forwardRef<HTMLDivElement, PrintTemplateProps>(
  ({ order, configOverride, previewMode }, ref) => {
    const storeConfig = useSettingsStore((state) => state.pdfConfig);
    // Ensure all default properties exist even if config is partial
    const config: PdfTemplateConfig = {
      ...DEFAULT_PDF_CONFIG,
      ...storeConfig,
      ...configOverride,
    };

    const currentFont = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

    const rowPadding =
      config.tableDensity === "compact"
        ? "8px 6px"
        : config.tableDensity === "spacious"
        ? "18px 8px"
        : "12px 6px";

    const layout = config.layoutStyle || "standard";
    const primaryColor = config.primaryColor || "#6366f1";
    const textColor = config.textColor || "#1a1a1a";
    const headerBgColor = config.headerBgColor || "#f0f4ff";

    // Helper for rendering Workshop Info Line
    const renderShopContactInfo = () => {
      const hasContent = config.showShopAddress || config.showShopVat || config.showShopPhone;
      if (!hasContent) return null;

      return (
        <div style={{ fontSize: "0.85rem", opacity: 0.85, marginTop: "8px", lineHeight: "1.4" }}>
          {config.showShopAddress && config.address && <div>{config.address}</div>}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "2px" }}>
            {config.showShopVat && config.vatNumber && <span>NIF: <strong>{config.vatNumber}</strong></span>}
            {config.showShopPhone && config.phone && <span>Tel: <strong>{config.phone}</strong></span>}
          </div>
        </div>
      );
    };

    // Helper for rendering Order Date & Number
    const renderOrderHeaderMeta = (alignRight: boolean = true, darkText: boolean = false) => {
      return (
        <div style={{ textAlign: alignRight ? "right" : "left" }}>
          {config.showOrderNumber && (
            <div
              style={{
                fontSize: "1.3rem",
                fontWeight: 800,
                color: darkText ? textColor : primaryColor,
                marginBottom: "2px",
              }}
            >
              Ordem #{order.id}
            </div>
          )}
          <div style={{ color: darkText ? "#64748b" : "inherit", fontSize: "0.85rem", opacity: darkText ? 1 : 0.9 }}>
            Data: {new Date(order.created_at).toLocaleDateString("pt-PT")}
          </div>
        </div>
      );
    };

    // ── RENDER CLIENT & VEHICLE SECTIONS ACCORDING TO LAYOUT ──────────────────
    const renderClientAndVehicle = () => {
      // 1. MODERN-SPLIT LAYOUT: Rounded Pill Cards
      if (layout === "modern-split") {
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "28px" }}>
            <div
              style={{
                background: headerBgColor,
                padding: "18px 20px",
                borderRadius: "14px",
                border: `1px solid ${primaryColor}33`,
              }}
            >
              <div style={{ textTransform: "uppercase", color: primaryColor, fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.5px", marginBottom: "4px" }}>
                Cliente
              </div>
              <div style={{ fontWeight: 800, fontSize: "1.15rem", color: textColor }}>{order.client_name}</div>
              {config.showClientPhone && order.client_phone && (
                <div style={{ fontSize: "0.85rem", color: "#475569", marginTop: "4px" }}>
                  Contacto: {order.client_phone}
                </div>
              )}
            </div>

            <div
              style={{
                background: headerBgColor,
                padding: "18px 20px",
                borderRadius: "14px",
                border: `1px solid ${primaryColor}33`,
              }}
            >
              <div style={{ textTransform: "uppercase", color: primaryColor, fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.5px", marginBottom: "4px" }}>
                Informação do Veículo
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontWeight: 800, fontSize: "1.1rem", color: primaryColor }}>{order.vehicle_plate}</span>
                <span style={{ color: "#334155", fontSize: "0.95rem", fontWeight: 600 }}>{order.vehicle_brand} {order.vehicle_model}</span>
              </div>
              {config.showVehicleMileage && (
                <div style={{ fontSize: "0.85rem", color: "#475569", marginTop: "4px" }}>
                  Km: <strong>{order.mileage} km</strong>
                </div>
              )}
            </div>
          </div>
        );
      }

      // 3. MINIMAL LAYOUT: Simple Borderless Text Columns
      if (layout === "minimal") {
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "28px", borderBottom: "1px solid #e2e8f0", paddingBottom: "20px" }}>
            <div>
              <div style={{ textTransform: "uppercase", color: "#94a3b8", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "1px", marginBottom: "4px" }}>
                Cliente
              </div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a" }}>{order.client_name}</div>
              {config.showClientPhone && order.client_phone && (
                <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Tel: {order.client_phone}</div>
              )}
            </div>
            <div>
              <div style={{ textTransform: "uppercase", color: "#94a3b8", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "1px", marginBottom: "4px" }}>
                Veículo
              </div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a" }}>
                {order.vehicle_plate} — {order.vehicle_brand} {order.vehicle_model}
              </div>
              {config.showVehicleMileage && (
                <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Quilometragem: {order.mileage} km</div>
              )}
            </div>
          </div>
        );
      }

      // 4. SIDEBAR LAYOUT: Stacked clean box on right main area
      if (layout === "sidebar") {
        return (
          <div style={{ background: "#f8fafc", padding: "18px", borderRadius: "10px", marginBottom: "28px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <div style={{ textTransform: "uppercase", color: primaryColor, fontSize: "0.7rem", fontWeight: 800, marginBottom: "4px" }}>Cliente</div>
                <div style={{ fontWeight: 700, fontSize: "1.1rem", color: textColor }}>{order.client_name}</div>
                {config.showClientPhone && order.client_phone && (
                  <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Tel: {order.client_phone}</div>
                )}
              </div>
              <div>
                <div style={{ textTransform: "uppercase", color: primaryColor, fontSize: "0.7rem", fontWeight: 800, marginBottom: "4px" }}>Veículo</div>
                <div style={{ fontWeight: 700, fontSize: "1.05rem", color: textColor }}>
                  {order.vehicle_plate} | {order.vehicle_brand} {order.vehicle_model}
                </div>
                {config.showVehicleMileage && (
                  <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Quilometragem: {order.mileage} km</div>
                )}
              </div>
            </div>
          </div>
        );
      }

      // 5. STANDARD LAYOUT: Classic 2-column grid box
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginBottom: "28px",
            padding: "16px",
            background: headerBgColor,
            borderRadius: "10px",
            border: `1px solid ${primaryColor}22`,
          }}
        >
          <div>
            <div style={{ textTransform: "uppercase", color: "#64748b", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.6px", marginBottom: "4px" }}>
              Cliente
            </div>
            <div style={{ fontWeight: 700, fontSize: "1.15rem", color: textColor, marginBottom: "4px" }}>
              {order.client_name || "Cliente Final"}
            </div>
            {config.showClientPhone && order.client_phone && (
              <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Contacto: {order.client_phone}</div>
            )}
          </div>

          <div>
            <div style={{ textTransform: "uppercase", color: "#64748b", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.6px", marginBottom: "4px" }}>
              Veículo
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "1.05rem",
                  color: primaryColor,
                  background: "#ffffff",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  border: `1px solid ${primaryColor}44`,
                }}
              >
                {order.vehicle_plate || "N/A"}
              </span>
              <span style={{ fontWeight: 600, fontSize: "1rem", color: "#334155" }}>
                {order.vehicle_brand} {order.vehicle_model}
              </span>
            </div>
            {config.showVehicleMileage && order.mileage !== undefined && (
              <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "6px" }}>
                Quilometragem: <strong>{order.mileage} km</strong>
              </div>
            )}
          </div>
        </div>
      );
    };

    // ── ORIGINAL PDF TEMPLATE LAYOUT ──────────────────────────────────────────
    if (layout === "original") {
      return (
        <div
          className="print-template"
          ref={ref}
          style={{
            display: previewMode ? "block" : undefined,
            fontFamily: currentFont,
            color: "#000000",
            backgroundColor: "#ffffff",
            padding: "24px",
            boxSizing: "border-box",
          }}
        >
          {/* Header */}
          <div className="invoice-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "20px" }}>
            <div style={{ textAlign: "left" }}>
              {config.showLogo && config.logoUrl && (
                <img src={config.logoUrl} alt="Logo" style={{ maxHeight: "50px", marginBottom: "8px" }} />
              )}
              <h1 style={{ color: primaryColor, margin: 0, fontSize: "2.5rem" }}>
                {config.companyName || "OFICINA"}
              </h1>
              {config.tagline && <div style={{ color: "#666", fontSize: "0.9rem" }}>{config.tagline}</div>}
              {config.showShopAddress && config.address && <div style={{ fontSize: "0.85rem", color: "#666" }}>{config.address}</div>}
              <div style={{ display: "flex", gap: "12px", fontSize: "0.85rem", color: "#666" }}>
                {config.showShopVat && config.vatNumber && <span>NIF: {config.vatNumber}</span>}
                {config.showShopPhone && config.phone && <span>Tel: {config.phone}</span>}
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: "1rem" }}>
              {config.showOrderNumber && (
                <div style={{ fontWeight: 800, fontSize: "1.2rem", color: primaryColor, marginBottom: "4px" }}>
                  Ordem #{order.id}
                </div>
              )}
              <div style={{ color: "#666" }}>
                Data: {new Date(order.created_at).toLocaleDateString("pt-PT")}
              </div>
            </div>
          </div>

          {/* Client & Vehicle Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginBottom: "10px", paddingBottom: "20px" }}>
            <div>
              <div style={{ textTransform: "uppercase", color: "#666", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.5px", marginBottom: "6px" }}>
                Cliente
              </div>
              <div style={{ fontWeight: 700, fontSize: "1.2rem", color: "#1a1a1a", marginBottom: "16px" }}>
                {order.client_name}
              </div>

              <div style={{ textTransform: "uppercase", color: "#666", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.5px", marginBottom: "4px", marginTop: "20px" }}>
                Informações do veículo
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontWeight: 700, fontSize: "1.1rem", color: primaryColor }}>
                  {order.vehicle_plate}
                </span>
                <span style={{ color: "#666", fontSize: "1rem" }}>
                  {order.vehicle_brand} {order.vehicle_model}
                </span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              {config.showVehicleMileage && order.mileage !== undefined && (
                <>
                  <div style={{ textTransform: "uppercase", color: "#666", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.5px", marginBottom: "8px" }}>
                    Quilometragem
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "1.2rem", color: "#1a1a1a" }}>
                    {order.mileage} km
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Table */}
          <table className="print-table" style={{ width: "100%", borderCollapse: "collapse", marginBottom: "40px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #1a1a1a" }}>
                <th style={{ textAlign: "left", padding: rowPadding, fontSize: "0.85rem", textTransform: "uppercase", color: "#666" }}>
                  Descrição dos Serviços / Peças
                </th>
                {config.showItemizedPrices && (
                  <th style={{ textAlign: "right", padding: rowPadding, fontSize: "0.85rem", textTransform: "uppercase", color: "#666" }}>
                    Preço
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {order.operations?.map((op, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: rowPadding, color: "#333" }}>{op.description}</td>
                  {config.showItemizedPrices && (
                    <td style={{ textAlign: "right", padding: rowPadding, fontWeight: 500 }}>
                      {op.hide_price_in_pdf ? "" : `${op.price.toFixed(2)}€`}
                    </td>
                  )}
                </tr>
              ))}
              {config.showLaborBreakdown && (
                <tr style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: rowPadding, color: "#333" }}>
                    {config.showLaborDetails !== false
                      ? `Mão de Obra (${order.hours}h × ${order.hourly_rate.toFixed(2)}€/h)`
                      : "Mão de Obra"}
                  </td>
                  {config.showItemizedPrices && (
                    <td style={{ textAlign: "right", padding: rowPadding, fontWeight: 500 }}>
                      {order.hide_labor_in_pdf ? "" : `${(order.hours * order.hourly_rate).toFixed(2)}€`}
                    </td>
                  )}
                </tr>
              )}
            </tbody>
          </table>

          {/* Bottom section with observations & total box */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "40px", alignItems: "end" }}>
            <div>
              <div style={{ textTransform: "uppercase", color: "#666", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.5px", marginBottom: "8px" }}>
                Observações
              </div>
              <p style={{ fontSize: "0.9rem", color: "#444", whiteSpace: "pre-wrap", lineHeight: "1.6", margin: 0 }}>
                {order.observations || "Nenhuma observação registada."}
              </p>
            </div>
            <div style={{ background: headerBgColor, padding: "24px 40px", borderRadius: "16px", textAlign: "right", border: `1px solid ${primaryColor}33`, minWidth: "300px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "32px" }}>
                <span style={{ fontSize: "1rem", color: primaryColor, fontWeight: 700, letterSpacing: "1px" }}>TOTAL</span>
                <span style={{ fontWeight: 800, fontSize: "1.5rem", color: textColor, whiteSpace: "nowrap" }}>
                  {order.total_price.toFixed(2)}€
                </span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          {config.showFooter && config.footerNote && (
            <div style={{ marginTop: "32px", paddingTop: "12px", borderTop: "1px solid #cbd5e1", fontSize: "0.75rem", textAlign: "center", color: "#64748b" }}>
              {config.footerNote}
            </div>
          )}
        </div>
      );
    }

    // ── PAYSTUB / RECIBO ESTRUTURADO LAYOUT (GRID ESTILO RECIBO VENCIMENTO) ───────
    if (layout === "paystub") {
      return (
        <div
          className="print-template"
          ref={ref}
          style={{
            display: previewMode ? "block" : undefined,
            fontFamily: currentFont,
            color: "#000000",
            backgroundColor: "#ffffff",
            padding: "24px",
            boxSizing: "border-box",
          }}
        >
          {/* Paystub Top Outer Grid Box */}
          <div style={{ border: "2px solid #000000", marginBottom: "20px" }}>
            {/* Row 1: Workshop & Document Header Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", borderBottom: "1px solid #000000" }}>
              <div style={{ padding: "12px 16px", borderRight: "1px solid #000000" }}>
                {config.showLogo && config.logoUrl && (
                  <img src={config.logoUrl} alt="Logo" style={{ maxHeight: "40px", marginBottom: "8px" }} />
                )}
                <div style={{ fontSize: "1.2rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {config.companyName || "OFICINA"}
                </div>
                {config.tagline && <div style={{ fontSize: "0.8rem", color: "#444" }}>{config.tagline}</div>}
                {config.showShopAddress && config.address && <div style={{ fontSize: "0.8rem", marginTop: "4px" }}>{config.address}</div>}
                <div style={{ fontSize: "0.8rem", marginTop: "2px" }}>
                  {config.showShopVat && config.vatNumber && <span>NIF: <strong>{config.vatNumber}</strong> </span>}
                  {config.showShopPhone && config.phone && <span>| TEL: <strong>{config.phone}</strong></span>}
                </div>
              </div>

              <div style={{ padding: "12px 16px", background: "#f8fafc", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#475569" }}>
                  FOLHA DE SERVIÇO
                </div>
                {config.showOrderNumber && (
                  <div style={{ fontSize: "1.4rem", fontWeight: 900, marginTop: "2px", color: "#000000" }}>
                    ORDEM Nº #{order.id}
                  </div>
                )}
                <div style={{ fontSize: "0.85rem", marginTop: "4px", color: "#334155" }}>
                  DATA EMISSÃO: <strong>{new Date(order.created_at).toLocaleDateString("pt-PT")}</strong>
                </div>
              </div>
            </div>

            {/* Row 2: Client & Vehicle Grid Cells */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ padding: "10px 14px", borderRight: "1px solid #000000" }}>
                <div style={{ fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", color: "#475569", letterSpacing: "0.5px" }}>
                  CLIENTE
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "#000000" }}>{order.client_name}</div>
                {config.showClientPhone && order.client_phone && (
                  <div style={{ fontSize: "0.82rem", marginTop: "2px", color: "#334155" }}>TEL: {order.client_phone}</div>
                )}
              </div>

              <div style={{ padding: "10px 14px" }}>
                <div style={{ fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", color: "#475569", letterSpacing: "0.5px" }}>
                  VEÍCULO
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#000000" }}>
                  MATRÍCULA: <span style={{ background: "#e2e8f0", padding: "1px 6px", border: "1px solid #94a3b8" }}>{order.vehicle_plate}</span>
                </div>
                <div style={{ fontSize: "0.85rem", marginTop: "3px", color: "#334155" }}>
                  {order.vehicle_brand} {order.vehicle_model}
                  {config.showVehicleMileage && order.mileage !== undefined && ` | ${order.mileage} KM`}
                </div>
              </div>
            </div>
          </div>

          {/* Paystub Grid Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", border: "2px solid #000000", marginBottom: "20px" }}>
            <thead>
              <tr style={{ background: "#f1f5f9", borderBottom: "2px solid #000000" }}>
                <th style={{ borderRight: "1px solid #000000", padding: "8px", fontSize: "0.75rem", textTransform: "uppercase", textAlign: "center", width: "40px" }}>Nº</th>
                <th style={{ borderRight: "1px solid #000000", padding: "8px", fontSize: "0.75rem", textTransform: "uppercase", textAlign: "left" }}>DESCRIÇÃO DO SERVIÇO</th>
                {config.showItemizedPrices && (
                  <th style={{ padding: "8px", fontSize: "0.75rem", textTransform: "uppercase", textAlign: "right", width: "110px" }}>VALOR</th>
                )}
              </tr>
            </thead>
            <tbody>
              {order.operations?.map((op, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #cbd5e1" }}>
                  <td style={{ borderRight: "1px solid #cbd5e1", padding: "8px", textAlign: "center", fontSize: "0.85rem", fontWeight: 600 }}>{idx + 1}</td>
                  <td style={{ borderRight: "1px solid #cbd5e1", padding: "8px", fontSize: "0.9rem" }}>{op.description}</td>
                  {config.showItemizedPrices && (
                    <td style={{ padding: "8px", textAlign: "right", fontSize: "0.9rem", fontWeight: 600 }}>
                      {op.hide_price_in_pdf ? "—" : `${op.price.toFixed(2)} €`}
                    </td>
                  )}
                </tr>
              ))}
              {config.showLaborBreakdown && (
                <tr style={{ borderBottom: "1px solid #cbd5e1", background: "#fafafa" }}>
                  <td style={{ borderRight: "1px solid #cbd5e1", padding: "8px", textAlign: "center", fontSize: "0.85rem", fontWeight: 600 }}>
                    {(order.operations?.length || 0) + 1}
                  </td>
                  <td style={{ borderRight: "1px solid #cbd5e1", padding: "8px", fontSize: "0.9rem" }}>
                    {config.showLaborDetails !== false
                      ? `Mão de Obra (${order.hours}h × ${order.hourly_rate.toFixed(2)}€/h)`
                      : "Mão de Obra"}
                  </td>
                  {config.showItemizedPrices && (
                    <td style={{ padding: "8px", textAlign: "right", fontSize: "0.9rem", fontWeight: 600 }}>
                      {order.hide_labor_in_pdf ? "—" : `${(order.hours * order.hourly_rate).toFixed(2)} €`}
                    </td>
                  )}
                </tr>
              )}
            </tbody>
          </table>

          {/* Paystub Bottom Grid Box */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: "16px", alignItems: "start", marginBottom: "20px" }}>
            <div style={{ border: "1px solid #000000", padding: "10px 12px", minHeight: "75px" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", color: "#475569" }}>NOTAS</div>
              <div style={{ fontSize: "0.85rem", marginTop: "4px", whiteSpace: "pre-wrap" }}>
                {order.observations || "Nenhuma observação registada."}
              </div>
            </div>

            <div style={{ border: "2px solid #000000", padding: "12px 16px", background: "#f8fafc", textAlign: "right" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "#334155" }}>TOTAL A PAGAR</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, marginTop: "2px", color: "#000000" }}>
                {order.total_price.toFixed(2)} €
              </div>
            </div>
          </div>


          {/* Paystub Footer Note */}
          {config.showFooter && config.footerNote && (
            <div style={{ marginTop: "24px", paddingTop: "12px", borderTop: "1px solid #cbd5e1", fontSize: "0.75rem", textAlign: "center", color: "#64748b" }}>
              {config.footerNote}
            </div>
          )}
        </div>
      );
    }

    // ── FORMAL TABLE CONTABILÍSTICA LAYOUT ────────────────────────────────────
    if (layout === "formal-table") {
      return (
        <div
          className="print-template"
          ref={ref}
          style={{
            display: previewMode ? "block" : undefined,
            fontFamily: currentFont,
            color: "#000000",
            backgroundColor: "#ffffff",
            padding: "24px",
            boxSizing: "border-box",
          }}
        >
          {/* Header Bar */}
          <div style={{ background: "#1e293b", color: "#ffffff", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {config.companyName || "OFICINA"}
              </h2>
              {config.tagline && <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>{config.tagline}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, textTransform: "uppercase" }}>FOLHA DE SERVIÇO</div>
              {config.showOrderNumber && <div style={{ fontSize: "0.9rem" }}>Nº OS-{order.id}</div>}
              <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>Data: {new Date(order.created_at).toLocaleDateString("pt-PT")}</div>
            </div>
          </div>

          {/* Information Grid */}
          {(() => {
            const hasShopDetails =
              (config.showShopAddress && !!config.address && config.address.trim() !== "") ||
              (config.showShopVat && !!config.vatNumber && config.vatNumber.trim() !== "") ||
              (config.showShopPhone && !!config.phone && config.phone.trim() !== "");

            return (
              <div style={{ display: "grid", gridTemplateColumns: hasShopDetails ? "1fr 1fr" : "1fr", gap: "12px", marginBottom: "20px" }}>
                {hasShopDetails && (
                  <div style={{ border: "1px solid #cbd5e1", padding: "10px 12px", background: "#f8fafc" }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "4px" }}>
                      DADOS DA OFICINA
                    </div>
                    {config.showShopAddress && config.address && <div style={{ fontSize: "0.85rem" }}>{config.address}</div>}
                    {config.showShopVat && config.vatNumber && <div style={{ fontSize: "0.85rem" }}>NIF: <strong>{config.vatNumber}</strong></div>}
                    {config.showShopPhone && config.phone && <div style={{ fontSize: "0.85rem" }}>Tel: <strong>{config.phone}</strong></div>}
                  </div>
                )}

                <div style={{ border: "1px solid #cbd5e1", padding: "10px 12px", background: "#f8fafc" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "4px" }}>
                    DADOS DO CLIENTE
                  </div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800 }}>{order.client_name}</div>
                  {config.showClientPhone && order.client_phone && (
                    <div style={{ fontSize: "0.85rem", marginTop: "2px" }}>Contacto: {order.client_phone}</div>
                  )}
                </div>

                <div style={{ border: "1px solid #cbd5e1", padding: "10px 12px", background: "#f8fafc", gridColumn: hasShopDetails ? "span 2" : "span 1" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "4px" }}>
                    DADOS DO VEÍCULO
                  </div>
                  <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
                    <div>Matrícula: <strong style={{ fontSize: "1rem" }}>{order.vehicle_plate}</strong></div>
                    <div>Marca: <strong>{order.vehicle_brand} {order.vehicle_model}</strong></div>
                    {config.showVehicleMileage && order.mileage !== undefined && (
                      <div>Quilometragem: <strong>{order.mileage} km</strong></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Full Grid Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #1e293b", marginBottom: "20px" }}>
            <thead>
              <tr style={{ background: "#e2e8f0", borderBottom: "2px solid #1e293b" }}>
                <th style={{ borderRight: "1px solid #cbd5e1", padding: "8px 12px", fontSize: "0.78rem", textAlign: "left", textTransform: "uppercase" }}>DESCRIÇÃO DO SERVIÇO</th>
                {config.showItemizedPrices && (
                  <th style={{ padding: "8px 12px", fontSize: "0.78rem", textAlign: "right", width: "130px", textTransform: "uppercase" }}>VALOR TOTAL</th>
                )}
              </tr>
            </thead>
            <tbody>
              {order.operations?.map((op, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #cbd5e1" }}>
                  <td style={{ borderRight: "1px solid #cbd5e1", padding: "8px 12px", fontSize: "0.9rem" }}>{op.description}</td>
                  {config.showItemizedPrices && (
                    <td style={{ padding: "8px 12px", textAlign: "right", fontSize: "0.9rem", fontWeight: 600 }}>
                      {op.hide_price_in_pdf ? "—" : `${op.price.toFixed(2)} €`}
                    </td>
                  )}
                </tr>
              ))}
              {config.showLaborBreakdown && (
                <tr style={{ borderBottom: "1px solid #cbd5e1", background: "#f8fafc" }}>
                  <td style={{ borderRight: "1px solid #cbd5e1", padding: "8px 12px", fontSize: "0.9rem" }}>
                    {config.showLaborDetails !== false
                      ? `Mão de Obra (${order.hours}h × ${order.hourly_rate.toFixed(2)}€/h)`
                      : "Mão de Obra"}
                  </td>
                  {config.showItemizedPrices && (
                    <td style={{ padding: "8px 12px", textAlign: "right", fontSize: "0.9rem", fontWeight: 600 }}>
                      {order.hide_labor_in_pdf ? "—" : `${(order.hours * order.hourly_rate).toFixed(2)} €`}
                    </td>
                  )}
                </tr>
              )}
            </tbody>
          </table>

          {/* Observations and Total Block */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "20px", alignItems: "start", marginBottom: "20px" }}>
            <div style={{ border: "1px solid #cbd5e1", padding: "10px 12px", background: "#f8fafc" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "4px" }}>
                NOTAS
              </div>
              <div style={{ fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>
                {order.observations || "Sem observações adicionais."}
              </div>
            </div>

            <div style={{ border: "2px solid #1e293b", padding: "12px 16px", background: "#1e293b", color: "#ffffff", textAlign: "right" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", opacity: 0.9 }}>TOTAL FINAL LÍQUIDO</div>
              <div style={{ fontSize: "1.7rem", fontWeight: 900, marginTop: "2px", color: "#ffffff" }}>
                {order.total_price.toFixed(2)} €
              </div>
            </div>
          </div>

          {config.showFooter && config.footerNote && (
            <div style={{ marginTop: "20px", paddingTop: "10px", borderTop: "1px solid #cbd5e1", fontSize: "0.78rem", textAlign: "center", color: "#64748b" }}>
              {config.footerNote}
            </div>
          )}
        </div>
      );
    }

    // ── MAIN RENDER (LAYOUT ROUTING) ──────────────────────────────────────────
    return (
      <div
        className="print-template"
        ref={ref}
        style={{
          display: previewMode ? "block" : undefined,
          fontFamily: currentFont,
          color: textColor,
          backgroundColor: "#ffffff",
          padding: layout === "sidebar" ? "0" : "32px",
          borderRadius: "8px",
          boxSizing: "border-box",
        }}
      >
        {/* SIDEBAR LAYOUT MAIN WRAPPER */}
        {layout === "sidebar" ? (

          <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "600px" }}>
            {/* SIDEBAR COLUMN */}
            <div
              style={{
                background: primaryColor,
                color: "#ffffff",
                padding: "32px 20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderTopLeftRadius: "8px",
                borderBottomLeftRadius: "8px",
              }}
            >
              <div>
                {config.showLogo && config.logoUrl && (
                  <img
                    src={config.logoUrl}
                    alt="Logo"
                    style={{ maxHeight: "60px", maxWidth: "160px", objectFit: "contain", marginBottom: "16px" }}
                  />
                )}
                <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "#ffffff" }}>
                  {config.companyName || "OFICINA"}
                </h2>
                {config.tagline && (
                  <div style={{ fontSize: "0.8rem", opacity: 0.9, marginTop: "4px" }}>
                    {config.tagline}
                  </div>
                )}

                <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.2)", fontSize: "0.85rem", lineHeight: "1.6" }}>
                  {config.showShopAddress && config.address && <div style={{ marginBottom: "8px" }}>{config.address}</div>}
                  {config.showShopVat && config.vatNumber && <div>NIF: {config.vatNumber}</div>}
                  {config.showShopPhone && config.phone && <div>Tel: {config.phone}</div>}
                </div>
              </div>

              <div style={{ paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.2)" }}>
                {config.showOrderNumber && (
                  <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>Ordem #{order.id}</div>
                )}
                <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>
                  {new Date(order.created_at).toLocaleDateString("pt-PT")}
                </div>
              </div>
            </div>

            {/* MAIN CONTENT AREA IN SIDEBAR LAYOUT */}
            <div style={{ padding: "32px 28px" }}>
              {renderClientAndVehicle()}

              {/* TABLE */}
              <table className="print-table" style={{ width: "100%", borderCollapse: "collapse", marginBottom: "28px" }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${primaryColor}` }}>
                    <th style={{ textAlign: "left", padding: rowPadding, fontSize: "0.8rem", textTransform: "uppercase", color: primaryColor }}>
                      Descrição dos Serviços
                    </th>
                    {config.showItemizedPrices && (
                      <th style={{ textAlign: "right", padding: rowPadding, fontSize: "0.8rem", textTransform: "uppercase", color: primaryColor }}>
                        Preço
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {order.operations?.map((op, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: rowPadding, color: "#334155", fontSize: "0.95rem" }}>{op.description}</td>
                      {config.showItemizedPrices && (
                        <td style={{ textAlign: "right", padding: rowPadding, fontWeight: 600 }}>
                          {op.hide_price_in_pdf ? "—" : `${op.price.toFixed(2)}€`}
                        </td>
                      )}
                    </tr>
                  ))}
                  {config.showLaborBreakdown && (
                    <tr style={{ borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
                      <td style={{ padding: rowPadding, color: "#334155", fontSize: "0.95rem" }}>
                        {config.showLaborDetails !== false
                          ? `Mão de Obra (${order.hours}h × ${order.hourly_rate.toFixed(2)}€/h)`
                          : "Mão de Obra"}
                      </td>
                      {config.showItemizedPrices && (
                        <td style={{ textAlign: "right", padding: rowPadding, fontWeight: 600 }}>
                          {order.hide_labor_in_pdf ? "—" : `${(order.hours * order.hourly_rate).toFixed(2)}€`}
                        </td>
                      )}
                    </tr>
                  )}
                </tbody>
              </table>

              {/* OBSERVATIONS & TOTAL */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "24px", alignItems: "end" }}>
                <div>
                  <div style={{ textTransform: "uppercase", color: "#64748b", fontSize: "0.75rem", fontWeight: 700, marginBottom: "4px" }}>Observações</div>
                  <p style={{ fontSize: "0.85rem", color: "#475569", margin: 0, whiteSpace: "pre-wrap" }}>
                    {order.observations || "Nenhuma observação registada."}
                  </p>
                </div>
                <div style={{ background: headerBgColor, padding: "16px 28px", borderRadius: "10px", textAlign: "right", border: `1px solid ${primaryColor}44` }}>
                  <span style={{ fontSize: "0.9rem", color: primaryColor, fontWeight: 800, marginRight: "16px" }}>TOTAL:</span>
                  <span style={{ fontWeight: 900, fontSize: "1.5rem", color: textColor }}>{order.total_price.toFixed(2)}€</span>
                </div>
              </div>

              {/* FOOTER */}
              {config.showFooter && config.footerNote && (
                <div style={{ marginTop: "24px", paddingTop: "12px", borderTop: "1px solid #e2e8f0", fontSize: "0.78rem", color: "#64748b", textAlign: "center", fontStyle: "italic" }}>
                  {config.footerNote}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* STANDARD / MODERN-SPLIT / MINIMAL / CARDS MAIN LAYOUT */
          <>
            {/* HEADER */}
            {layout === "modern-split" ? (
              <div
                style={{
                  background: primaryColor,
                  color: "#ffffff",
                  padding: "24px 28px",
                  borderRadius: "12px",
                  marginBottom: "28px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    {config.showLogo && config.logoUrl && (
                      <img
                        src={config.logoUrl}
                        alt="Logo"
                        style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                      />
                    )}
                    <div>
                      <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, color: "#ffffff" }}>
                        {config.companyName || "OFICINA"}
                      </h1>
                      {config.tagline && (
                        <div style={{ fontSize: "0.85rem", opacity: 0.9, marginTop: "2px" }}>
                          {config.tagline}
                        </div>
                      )}
                    </div>
                  </div>
                  {renderShopContactInfo()}
                </div>
                {renderOrderHeaderMeta(true, false)}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  borderBottom: layout === "minimal" ? "1px solid #e2e8f0" : `3px solid ${primaryColor}`,
                  paddingBottom: "20px",
                  marginBottom: "28px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    {config.showLogo && config.logoUrl && (
                      <img
                        src={config.logoUrl}
                        alt="Logo"
                        style={{ maxHeight: "55px", maxWidth: "140px", objectFit: "contain" }}
                      />
                    )}
                    <div>
                      <h1
                        style={{
                          color: layout === "minimal" ? "#0f172a" : primaryColor,
                          margin: 0,
                          fontSize: "2.2rem",
                          fontWeight: 800,
                          letterSpacing: "-0.5px",
                        }}
                      >
                        {config.companyName || "OFICINA"}
                      </h1>
                      {config.tagline && (
                        <div style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "2px" }}>
                          {config.tagline}
                        </div>
                      )}
                    </div>
                  </div>
                  {renderShopContactInfo()}
                </div>
                {renderOrderHeaderMeta(true, true)}
              </div>
            )}

            {/* CLIENT & VEHICLE SECTION */}
            {renderClientAndVehicle()}

            {/* TABLE */}
            <table className="print-table" style={{ width: "100%", borderCollapse: "collapse", marginBottom: "32px" }}>
              <thead>
                <tr
                  style={{
                    borderBottom: `2px solid ${layout === "minimal" ? "#334155" : primaryColor}`,
                    background: layout === "minimal" ? "#f1f5f9" : `${primaryColor}0d`,
                  }}
                >
                  <th
                    style={{
                      textAlign: "left",
                      padding: rowPadding,
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                      color: layout === "minimal" ? "#334155" : primaryColor,
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                    }}
                  >
                    Descrição dos Serviços
                  </th>
                  {config.showItemizedPrices && (
                    <th
                      style={{
                        textAlign: "right",
                        padding: rowPadding,
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                        color: layout === "minimal" ? "#334155" : primaryColor,
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                      }}
                    >
                      Preço
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {order.operations?.map((op, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      background: "transparent",
                    }}
                  >
                    <td style={{ padding: rowPadding, color: "#334155", fontSize: "0.95rem" }}>{op.description}</td>
                    {config.showItemizedPrices && (
                      <td style={{ textAlign: "right", padding: rowPadding, fontWeight: 600, fontSize: "0.95rem" }}>
                        {op.hide_price_in_pdf ? "—" : `${op.price.toFixed(2)}€`}
                      </td>
                    )}
                  </tr>
                ))}
                {config.showLaborBreakdown && (
                  <tr style={{ borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
                    <td style={{ padding: rowPadding, color: "#334155", fontSize: "0.95rem" }}>
                      {config.showLaborDetails !== false
                        ? `Mão de Obra (${order.hours}h × ${order.hourly_rate.toFixed(2)}€/h)`
                        : "Mão de Obra"}
                    </td>
                    {config.showItemizedPrices && (
                      <td style={{ textAlign: "right", padding: rowPadding, fontWeight: 600, fontSize: "0.95rem" }}>
                        {order.hide_labor_in_pdf ? "—" : `${(order.hours * order.hourly_rate).toFixed(2)}€`}
                      </td>
                    )}
                  </tr>
                )}
              </tbody>
            </table>

            {/* OBSERVATIONS & TOTAL */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "32px",
                alignItems: "start",
                marginBottom: "32px",
              }}
            >
              <div>
                <div
                  style={{
                    textTransform: "uppercase",
                    color: "#64748b",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    marginBottom: "6px",
                  }}
                >
                  Observações
                </div>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#475569",
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.5",
                    margin: 0,
                    background: "#f8fafc",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  {order.observations || "Nenhuma observação registada para esta ordem de serviço."}
                </p>
              </div>

              <div
                style={{
                  background: headerBgColor,
                  padding: "20px 32px",
                  borderRadius: "14px",
                  textAlign: "right",
                  border: `1px solid ${primaryColor}44`,
                  minWidth: "260px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "24px" }}>
                  <span
                    style={{
                      fontSize: "0.95rem",
                      color: primaryColor,
                      fontWeight: 800,
                      letterSpacing: "1px",
                    }}
                  >
                    TOTAL:
                  </span>
                  <span
                    style={{
                      fontWeight: 900,
                      fontSize: "1.6rem",
                      color: textColor,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {order.total_price.toFixed(2)}€
                  </span>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            {config.showFooter && config.footerNote && (
              <div
                style={{
                  marginTop: "24px",
                  paddingTop: "16px",
                  borderTop: "1px solid #e2e8f0",
                  fontSize: "0.8rem",
                  color: "#64748b",
                  textAlign: "center",
                  lineHeight: "1.4",
                  fontStyle: "italic",
                }}
              >
                {config.footerNote}
              </div>
            )}
          </>
        )}
      </div>
    );
  }
);

PrintTemplate.displayName = "PrintTemplate";
