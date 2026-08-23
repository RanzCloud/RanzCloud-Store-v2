import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Trash2, Eye, X, Loader2 } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { apiFetch, formatRupiah, STATUS_LABELS } from '../../lib/api';

interface Order {
  id: number;
  order_code: string;
  customer_name: string;
  customer_email: string;
  customer_whatsapp: string;
  product_name: string;
  quantity: number;
  subtotal: number;
  discount: number;
  total: number;
  status: string;
  voucher_code: string | null;
  pterodactyl_status: string;
  delivery_content: string | null;
  created_at: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [detail, setDetail] = useState<Order | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const query = statusFilter ? `?status=${statusFilter}` : '';
      const data = await apiFetch(`/orders${query}`);
      setOrders(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const doAction = async (order_id: number, action: string) => {
    setBusyId(order_id);
    try {
      await apiFetch('/orders', { method: 'PUT', body: JSON.stringify({ order_id, action }) });
      await load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus pesanan ini?')) return;
    try {
      await apiFetch('/orders', { method: 'DELETE', body: JSON.stringify({ id }) });
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Kelola Pesanan</h1>
          <p className="text-slate-400 text-sm mt-1">Pantau dan proses pesanan pelanggan</p>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm">
          <option value="">Semua Status</option>
          <option value="pending">Menunggu Pembayaran</option>
          <option value="paid">Lunas</option>
          <option value="failed">Gagal</option>
          <option value="expired">Kedaluwarsa</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner label="Memuat pesanan..." />
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-white/10">
                  <th className="p-4 font-medium">Kode</th>
                  <th className="p-4 font-medium">Pelanggan</th>
                  <th className="p-4 font-medium">Produk</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const st = STATUS_LABELS[o.status] || STATUS_LABELS.pending;
                  return (
                    <tr key={o.id} className="border-b border-white/5">
                      <td className="p-4 font-mono text-cyan-300">{o.order_code}</td>
                      <td className="p-4">{o.customer_name}</td>
                      <td className="p-4">{o.product_name}</td>
                      <td className="p-4">{formatRupiah(o.total)}</td>
                      <td className="p-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${st.color}`}>{st.label}</span></td>
                      <td className="p-4">
                        <div className="flex justify-end gap-1.5 flex-wrap">
                          <button onClick={() => setDetail(o)} className="p-2 rounded-lg hover:bg-white/10 text-slate-300" title="Detail"><Eye className="h-4 w-4" /></button>
                          {o.status === 'pending' && (
                            <>
                              <button disabled={busyId === o.id} onClick={() => doAction(o.id, 'mark_paid')} className="p-2 rounded-lg hover:bg-white/10 text-emerald-400" title="Tandai Lunas">
                                {busyId === o.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                              </button>
                              <button disabled={busyId === o.id} onClick={() => doAction(o.id, 'mark_failed')} className="p-2 rounded-lg hover:bg-white/10 text-red-400" title="Tandai Gagal">
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {o.pterodactyl_status === 'failed' && (
                            <button disabled={busyId === o.id} onClick={() => doAction(o.id, 'retry_provision')} className="p-2 rounded-lg hover:bg-white/10 text-amber-400" title="Buat Ulang Server">
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => handleDelete(o.id)} className="p-2 rounded-lg hover:bg-white/10 text-red-400" title="Hapus"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">Belum ada pesanan.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-lg bg-[#0b0f1a] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg font-mono">{detail.order_code}</h2>
              <button onClick={() => setDetail(null)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="text-sm space-y-1.5">
              <p><span className="text-slate-400">Pelanggan:</span> {detail.customer_name}</p>
              <p><span className="text-slate-400">Email:</span> {detail.customer_email}</p>
              <p><span className="text-slate-400">WhatsApp:</span> {detail.customer_whatsapp}</p>
              <p><span className="text-slate-400">Produk:</span> {detail.product_name} x{detail.quantity}</p>
              <p><span className="text-slate-400">Subtotal:</span> {formatRupiah(detail.subtotal)}</p>
              <p><span className="text-slate-400">Diskon:</span> {formatRupiah(detail.discount)} {detail.voucher_code ? `(${detail.voucher_code})` : ''}</p>
              <p><span className="text-slate-400">Total:</span> <b>{formatRupiah(detail.total)}</b></p>
              <p><span className="text-slate-400">Status Server:</span> {detail.pterodactyl_status}</p>
              <p><span className="text-slate-400">Tanggal:</span> {new Date(detail.created_at).toLocaleString('id-ID')}</p>
            </div>
            {detail.delivery_content && (
              <div>
                <p className="text-slate-400 text-sm mb-1">Detail Pengiriman:</p>
                <pre className="whitespace-pre-wrap text-xs bg-black/40 rounded-lg p-3 text-slate-200 font-sans">{detail.delivery_content}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
