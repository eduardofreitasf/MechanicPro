import { forwardRef } from "react";
import { ServiceOrder } from "../db";

interface PrintTemplateProps {
  order: ServiceOrder;
}

export const PrintTemplate = forwardRef<HTMLDivElement, PrintTemplateProps>(
  ({ order }, ref) => {
    return (
      <div className="print-template" ref={ref}>
        <div className="invoice-header">
          <div style={{ textAlign: 'left' }}>
            <h1 style={{ color: 'var(--primary)', margin: 0, fontSize: '2.5rem' }}>OFICINA</h1>
          </div>
          <div style={{ textAlign: 'right', fontSize: '1rem' }}>
            <div style={{ color: 'var(--text-muted)' }}>Data: {new Date(order.created_at).toLocaleDateString('pt-PT')}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '10px', paddingBottom: '20px' }}>
          <div>
            <div style={{ textTransform: 'uppercase', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '6px' }}>Cliente</div>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#1a1a1a', marginBottom: '16px' }}>{order.client_name}</div>

            <div style={{ textTransform: 'uppercase', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '4px', marginTop: '20px' }}>Informações do veículo</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>{order.vehicle_plate}</span>
              <span style={{ color: '#666', fontSize: '1rem' }}>{order.vehicle_brand} {order.vehicle_model}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ textTransform: 'uppercase', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '8px' }}>Quilometragem</div>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#1a1a1a' }}>{order.mileage} km</div>
          </div>
        </div>

        <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #1a1a1a' }}>
              <th style={{ textAlign: 'left', padding: '12px 5px', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Descrição dos Serviços / Peças</th>
              <th style={{ textAlign: 'right', padding: '12px 5px', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Preço</th>
            </tr>
          </thead>
          <tbody>
            {order.operations?.map((op, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '14px 5px', color: '#333' }}>{op.description}</td>
                <td style={{ textAlign: 'right', padding: '14px 5px', fontWeight: 500 }}>
                  {op.hide_price_in_pdf ? '' : `${op.price.toFixed(2)}€`}
                </td>
              </tr>
            ))}
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '14px 5px', color: '#333' }}>Mão de Obra</td>
              <td style={{ textAlign: 'right', padding: '14px 5px', fontWeight: 500 }}>{(order.hours * order.hourly_rate).toFixed(2)}€</td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '40px', alignItems: 'end' }}>
          <div>
            <div style={{ textTransform: 'uppercase', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '8px' }}>Observações</div>
            <p style={{ fontSize: '0.9rem', color: '#444', whiteSpace: 'pre-wrap', lineHeight: '1.6', margin: 0 }}>
              {order.observations || "Nenhuma observação registada."}
            </p>
          </div>
          <div style={{ background: '#f0f4ff', padding: '24px 40px', borderRadius: '16px', textAlign: 'right', border: '1px solid #e0e7ff', minWidth: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '32px' }}>
              <span style={{ fontSize: '1rem', color: '#6366f1', fontWeight: 700, letterSpacing: '1px' }}>TOTAL</span>
              <span style={{ fontWeight: 800, fontSize: '1.5rem', color: '#1e1b4b', whiteSpace: 'nowrap' }}>{order.total_price.toFixed(2)}€</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PrintTemplate.displayName = "PrintTemplate";
