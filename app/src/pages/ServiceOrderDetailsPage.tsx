import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Download, Trash2, Calendar, User, Car } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { serviceOrderService } from "../services/serviceOrderService";
import { ServiceOrder } from "../db";
import { ConfirmModal } from "../components/ConfirmModal";
import { PrintTemplate } from "../components/PrintTemplate";

export function ServiceOrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      serviceOrderService.getServiceOrderById(parseInt(id)).then(res => {
        setOrder(res);
        setLoading(false);
      });
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current || !order) return;
    setIsDownloading(true);
    try {
      // Temporarily show the print template for rendering
      const el = printRef.current;
      el.style.display = 'block';
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      el.style.top = '0';
      el.style.width = '794px'; // A4 width in px at 96dpi
      el.style.padding = '40px';
      el.style.background = 'white';
      el.style.color = '#1a1a1a';

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      // Reset the print template styles
      el.style.display = '';
      el.style.position = '';
      el.style.left = '';
      el.style.top = '';
      el.style.width = '';
      el.style.padding = '';
      el.style.background = '';
      el.style.color = '';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // Build filename: plate_date.pdf
      const plate = (order.vehicle_plate || 'sem-matricula').replace(/[\s/\\]/g, '-');
      const date = new Date(order.created_at).toLocaleDateString('pt-PT').replace(/\//g, '-');
      const filename = `${plate}_${date}.pdf`;

      pdf.save(filename);
    } catch (err) {
      console.error('Erro ao gerar PDF', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!order) return;
    try {
      await serviceOrderService.deleteServiceOrder(order.id);
      navigate("/services");
    } catch (err) {
      console.error("Erro ao eliminar ordem", err);
    }
  };

  if (loading) return <div className="main-content">Carregando...</div>;
  if (!order) return <div className="main-content">Ordem não encontrada.</div>;

  return (
    <div className="order-details-container">
      {/* View Header - Hidden in Print */}
      <header className="header no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', width: '100%' }}>
        <div className="header-title-group">
          <button className="btn-secondary" onClick={() => navigate("/services")} style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ margin: 0 }}>Ordem de Serviço</h1>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={18} />
            <span>Imprimir PDF</span>
          </button>
          <button className="btn-secondary" onClick={handleDownloadPdf} disabled={isDownloading} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: isDownloading ? 0.6 : 1 }}>
            <Download size={18} />
            <span>{isDownloading ? 'A gerar...' : 'Download PDF'}</span>
          </button>
          <button className="btn danger" onClick={() => setIsDeleteModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trash2 size={18} />
            <span>Eliminar</span>
          </button>
        </div>
      </header>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Ordem de Serviço"
        message={`Tem a certeza que deseja eliminar a ordem de serviço #${order.id}? Esta ação não pode ser revertida.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* Shared Print Template — used by both Print and Download */}
      <PrintTemplate order={order} ref={printRef} />

      {/* Screen View (Hidden in Print) */}
      <div className="no-print">
        <div className="grid-2-col" style={{ marginBottom: '24px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="var(--primary)" /> Informação do Cliente
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{order.client_name}</div>
              <div style={{ color: 'var(--text-muted)' }}>{order.client_phone || "Nenhum telefone registado"}</div>
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Car size={18} color="var(--primary)" /> Informação do Veículo
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{order.vehicle_plate}</div>
              <div style={{ color: 'var(--text-muted)' }}>{order.vehicle_brand} {order.vehicle_model}</div>
              <div style={{ fontSize: '0.9rem' }}>Quilometragem: <strong>{order.mileage} km</strong></div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--primary)" /> Detalhes da Ordem
          </h3>
          <div className="grid-form-fields-sm">
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Data</label>
              <div style={{ fontWeight: 600 }}>{new Date(order.created_at).toLocaleDateString('pt-PT')}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tempo de Mão de Obra</label>
              <div style={{ fontWeight: 600 }}>{order.hours} horas</div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Preço Hora</label>
              <div style={{ fontWeight: 600 }}>{order.hourly_rate.toFixed(2)}€/h</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>Descrição do Trabalho / Peças</th>
                <th style={{ width: '150px', textAlign: 'right' }}>Preço (€)</th>
              </tr>
            </thead>
            <tbody>
              {order.operations?.map((op, index) => (
                <tr key={index}>
                  <td style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                  <td>{op.description}</td>
                  <td style={{ textAlign: 'right', fontWeight: 500 }}>{op.price.toFixed(2)}€</td>
                </tr>
              ))}
              {(!order.operations || order.operations.length === 0) && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    Nenhuma operação registada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>

        <div className="grid-main-side">
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '12px' }}>Observações</h3>
            <p style={{ whiteSpace: 'pre-wrap', color: order.observations ? 'var(--text)' : 'var(--text-muted)' }}>
              {order.observations || "Nenhuma observação registada para este serviço."}
            </p>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Operações:</span>
                <span>{(order.total_price - (order.hours * order.hourly_rate)).toFixed(2)}€</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Mão de Obra:</span>
                <span>{(order.hours * order.hourly_rate).toFixed(2)}€</span>
              </div>
              <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.5rem' }}>
                <span>TOTAL:</span>
                <span style={{ color: 'var(--primary)' }}>{order.total_price.toFixed(2)}€</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
