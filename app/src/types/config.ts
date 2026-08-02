export interface PdfTemplateConfig {
  companyName: string;
  tagline: string;
  vatNumber: string;
  phone: string;
  address: string;
  logoUrl?: string; // Base64 or URL

  primaryColor: string;
  accentColor: string;
  headerBgColor: string;
  textColor: string;

  layoutStyle: "paystub" | "formal-table" | "standard" | "modern-split" | "minimal" | "sidebar";
  tableDensity: "compact" | "normal" | "spacious";

  // Visibility Toggles
  showLogo: boolean;
  showOrderNumber: boolean;
  showShopAddress: boolean;
  showShopPhone: boolean;
  showShopVat: boolean;
  showClientPhone: boolean;
  showVehicleMileage: boolean;
  showItemizedPrices: boolean;
  showLaborBreakdown: boolean;
  showLaborDetails: boolean;
  showFooter: boolean;

  footerNote: string;
}

export interface PresetPalette {
  id: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  headerBgColor: string;
  textColor: string;
}

export const PRESET_PALETTES: PresetPalette[] = [
  {
    id: "indigo",
    name: "Índigo Moderno",
    primaryColor: "#6366f1",
    accentColor: "#4f46e5",
    headerBgColor: "#f0f4ff",
    textColor: "#1e1b4b",
  },
  {
    id: "navy",
    name: "Azul Clássico",
    primaryColor: "#1e3a8a",
    accentColor: "#2563eb",
    headerBgColor: "#eff6ff",
    textColor: "#0f172a",
  },
  {
    id: "emerald",
    name: "Verde Esmeralda",
    primaryColor: "#059669",
    accentColor: "#10b981",
    headerBgColor: "#ecfdf5",
    textColor: "#064e3b",
  },
  {
    id: "crimson",
    name: "Vermelho Corrida",
    primaryColor: "#dc2626",
    accentColor: "#b91c1c",
    headerBgColor: "#fef2f2",
    textColor: "#450a0a",
  },
  {
    id: "dry-slate",
    name: "Corporativo (Grafite)",
    primaryColor: "#1e293b",
    accentColor: "#334155",
    headerBgColor: "#f8fafc",
    textColor: "#0f172a",
  },
  {
    id: "official-bw",
    name: "Monocromático Oficial (B&W)",
    primaryColor: "#000000",
    accentColor: "#333333",
    headerBgColor: "#ffffff",
    textColor: "#000000",
  },
];

export const DEFAULT_PDF_CONFIG: PdfTemplateConfig = {
  companyName: "OFICINA",
  tagline: "Serviços de Manutenção e Reparação Automóvel",
  vatNumber: "123456789",
  phone: "+351 910 000 000",
  address: "Rua Principal, Nº 100, 1000-000 Lisboa",
  logoUrl: "",
  primaryColor: "#6366f1",
  accentColor: "#4f46e5",
  headerBgColor: "#f0f4ff",
  textColor: "#1a1a1a",
  layoutStyle: "paystub",
  tableDensity: "normal",
  showLogo: false,
  showOrderNumber: true,
  showShopAddress: true,
  showShopPhone: true,
  showShopVat: true,
  showClientPhone: true,
  showVehicleMileage: true,
  showItemizedPrices: true,
  showLaborBreakdown: true,
  showLaborDetails: true,
  showFooter: true,
  footerNote: "Obrigado pela sua preferência! Garantia de 2 anos em todas as reparações efetuadas.",
};
