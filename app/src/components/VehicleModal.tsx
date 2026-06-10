import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { vehicleService } from "../services/vehicleService";
import { clientService } from "../services/clientService";
import { Vehicle, Client } from "../db";

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicle?: Vehicle | null;
  defaultClientId?: number | null;
}

export function VehicleModal({ isOpen, onClose, onSuccess, vehicle, defaultClientId }: VehicleModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<string>("");
  const [plate, setPlate] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      clientService.getClients().then(setClients);
    }
  }, [isOpen]);

  useEffect(() => {
    if (vehicle) {
      setClientId(vehicle.client_id.toString());
      setPlate(vehicle.plate);
      setBrand(vehicle.brand);
      setModel(vehicle.model);
      setYear(vehicle.year?.toString() || "");
    } else {
      setClientId(defaultClientId ? defaultClientId.toString() : "");
      setPlate("");
      setBrand("");
      setModel("");
      setYear("");
    }
    setError(null);
  }, [vehicle, isOpen, defaultClientId]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !plate || !brand || !model) return;
    setError(null);

    try {
      const vId = parseInt(clientId);
      const vYear = year ? parseInt(year) : null;

      if (vehicle) {
        await vehicleService.updateVehicle(vehicle.id, vId, plate, brand, model, vYear);
      } else {
        await vehicleService.createVehicle(vId, plate, brand, model, vYear);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message === "A vehicle with this license plate already exists." ? "Já existe um veículo com esta matrícula." : (err.message || "Erro ao guardar veículo"));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2>{vehicle ? "Editar Veículo" : "Novo Veículo"}</h2>
          <button 
            onClick={onClose} 
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSave}>
          {error && (
            <div style={{ color: 'var(--danger)', background: '#fee2e2', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}
          <div className="form-group">
            <label>Proprietário (Cliente)</label>
            <select
              className="form-input"
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">Selecionar um cliente</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Matrícula</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="Ex: AA-00-00"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
            />
          </div>
          <div className="form-grid-2">
            <div className="form-group" style={{ minWidth: 0 }}>
              <label>Marca</label>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%' }}
                required
                placeholder="Ex: Toyota"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ minWidth: 0 }}>
              <label>Modelo</label>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%' }}
                required
                placeholder="Ex: Corolla"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Ano (Opcional)</label>
            <input
              type="number"
              className="form-input"
              placeholder="Ex: 2022"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn">
              {vehicle ? "Guardar Alterações" : "Guardar Veículo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
