import { getDb } from "../db";
import { clientService } from "./clientService";
import { vehicleService } from "./vehicleService";
import { serviceOrderService } from "./serviceOrderService";

function parseCsv(csv: string): string[][] {
  const lines = csv.split(/\r?\n/);
  if (lines.length === 0) return [];
  
  return lines.map(line => {
    const result = [];
    let cur = "";
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuote && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuote = !inQuote;
        }
      } else if (char === ',' && !inQuote) {
        result.push(cur);
        cur = "";
      } else {
        cur += char;
      }
    }
    result.push(cur);
    return result;
  }).filter(row => row.some(cell => cell.trim() !== ""));
}

export const importService = {
  async importClients(csv: string): Promise<{ imported: number; skipped: number }> {
    const rows = parseCsv(csv);
    if (rows.length <= 1) return { imported: 0, skipped: 0 };

    const headers = rows[0].map(h => h.trim().toLowerCase());
    const nameIdx = headers.indexOf("nome");
    const phoneIdx = headers.indexOf("telefone");

    if (nameIdx === -1) throw new Error("Coluna 'Nome' não encontrada no CSV.");

    let imported = 0;
    let skipped = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const name = row[nameIdx]?.trim();
      const phone = phoneIdx !== -1 ? row[phoneIdx]?.trim() : null;

      if (!name) {
        skipped++;
        continue;
      }

      try {
        await clientService.createClient(name, phone);
        imported++;
      } catch (err) {
        // Likely duplicate name, skip
        skipped++;
      }
    }

    return { imported, skipped };
  },

  async importVehicles(csv: string): Promise<{ imported: number; skipped: number }> {
    const rows = parseCsv(csv);
    if (rows.length <= 1) return { imported: 0, skipped: 0 };

    const headers = rows[0].map(h => h.trim().toLowerCase());
    const plateIdx = headers.indexOf("matrícula");
    const brandIdx = headers.indexOf("marca");
    const modelIdx = headers.indexOf("modelo");
    const yearIdx = headers.indexOf("ano");
    const clientIdx = headers.indexOf("cliente");

    if (plateIdx === -1 || clientIdx === -1) {
      throw new Error("Colunas obrigatórias ('Matrícula', 'Cliente') não encontradas.");
    }

    const db = await getDb();
    let imported = 0;
    let skipped = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const plate = row[plateIdx]?.trim().toUpperCase();
      const clientName = row[clientIdx]?.trim();

      if (!plate || !clientName) {
        skipped++;
        continue;
      }

      try {
        // Find client ID by name
        const clients = await db.select<any[]>("SELECT id FROM clients WHERE name = ? AND deleted_at IS NULL", [clientName]);
        if (clients.length === 0) {
          skipped++;
          continue;
        }

        const clientId = clients[0].id;
        const brand = brandIdx !== -1 ? row[brandIdx]?.trim() : "Desconhecido";
        const model = modelIdx !== -1 ? row[modelIdx]?.trim() : "Desconhecido";
        const year = yearIdx !== -1 ? parseInt(row[yearIdx]) || null : null;

        await vehicleService.createVehicle(clientId, plate, brand, model, year);
        imported++;
      } catch (err) {
        skipped++;
      }
    }

    return { imported, skipped };
  },

  async importServices(csv: string): Promise<{ imported: number; skipped: number }> {
    const rows = parseCsv(csv);
    if (rows.length <= 1) return { imported: 0, skipped: 0 };

    const headers = rows[0].map(h => h.trim().toLowerCase());
    const plateIdx = headers.indexOf("matrícula");
    const mileageIdx = headers.indexOf("quilometragem");
    const hoursIdx = headers.indexOf("horas");
    const rateIdx = headers.indexOf("preço/hora");
    const opsIdx = headers.indexOf("operações: preço");
    const obsIdx = headers.indexOf("observações");
    const dateIdx = headers.indexOf("data");

    if (plateIdx === -1) throw new Error("Coluna 'Matrícula' não encontrada.");

    const db = await getDb();
    let imported = 0;
    let skipped = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const plate = row[plateIdx]?.trim().toUpperCase();

      if (!plate) {
        skipped++;
        continue;
      }

      try {
        // Find vehicle ID by plate
        const vehicles = await db.select<any[]>("SELECT id FROM vehicles WHERE plate = ? AND deleted_at IS NULL", [plate]);
        if (vehicles.length === 0) {
          skipped++;
          continue;
        }

        const vehicleId = vehicles[0].id;
        const mileage = mileageIdx !== -1 ? parseInt(row[mileageIdx]) || 0 : 0;
        const hours = hoursIdx !== -1 ? parseFloat(row[hoursIdx]) || 0 : 0;
        const rate = rateIdx !== -1 ? parseFloat(row[rateIdx]) || 0 : 0;
        const observations = obsIdx !== -1 ? row[obsIdx]?.trim() : null;
        
        let date = new Date().toISOString();
        if (dateIdx !== -1 && row[dateIdx]) {
          // Try to parse PT date format DD-MM-YYYY
          const dParts = row[dateIdx].split(/[-/]/);
          if (dParts.length === 3) {
            date = new Date(`${dParts[2]}-${dParts[1]}-${dParts[0]}`).toISOString();
          }
        }

        // Parse operations: "desc: price | desc: price"
        const operations: any[] = [];
        if (opsIdx !== -1 && row[opsIdx]) {
          const opsParts = row[opsIdx].split("|");
          opsParts.forEach(part => {
            const lastColon = part.lastIndexOf(":");
            if (lastColon !== -1) {
              const desc = part.substring(0, lastColon).trim();
              const price = parseFloat(part.substring(lastColon + 1).replace(/[^\d.]/g, "")) || 0;
              if (desc) operations.push({ description: desc, price });
            }
          });
        }

        await serviceOrderService.createServiceOrder(vehicleId, mileage, hours, rate, observations, operations, date);
        imported++;
      } catch (err) {
        skipped++;
      }
    }

    return { imported, skipped };
  },

  async importExpenses(csv: string): Promise<{ imported: number; skipped: number }> {
    const rows = parseCsv(csv);
    if (rows.length <= 1) return { imported: 0, skipped: 0 };

    const headers = rows[0].map(h => h.trim().toLowerCase());
    const dateIdx    = headers.indexOf("data");
    const descIdx    = headers.indexOf("descrição");
    const costIdx    = headers.indexOf("custo");
    const receiptIdx = headers.indexOf("nº recibo");

    if (dateIdx === -1 || costIdx === -1) {
      throw new Error("Colunas obrigatórias ('Data', 'Custo') não encontradas no CSV.");
    }

    const db = await (await import("../db")).getDb();
    let imported = 0;
    let skipped  = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rawDate = row[dateIdx]?.trim();
      const rawCost = row[costIdx]?.trim();
      const cost    = parseFloat(rawCost?.replace(",", ".") ?? "");

      if (!rawDate || isNaN(cost) || cost < 0) { skipped++; continue; }

      // Normalise date: accept YYYY-MM-DD or DD-MM-YYYY / DD/MM/YYYY
      let date = rawDate;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        const parts = rawDate.split(/[-/]/);
        if (parts.length === 3) date = `${parts[2]}-${parts[1].padStart(2,"0")}-${parts[0].padStart(2,"0")}`;
        else { skipped++; continue; }
      }

      const description = descIdx !== -1 ? row[descIdx]?.trim() || null : null;
      const receipt_no  = receiptIdx !== -1 ? row[receiptIdx]?.trim() || null : null;

      try {
        await db.execute(
          "INSERT INTO expenses (date, description, cost, receipt_no) VALUES (?, ?, ?, ?)",
          [date, description, cost, receipt_no]
        );
        imported++;
      } catch { skipped++; }
    }

    return { imported, skipped };
  },
};

