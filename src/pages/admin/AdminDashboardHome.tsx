import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingCart, Boxes, Clock, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { apiFetch, formatRupiah, STATUS_LABELS } from '../../lib/api';

interface Order {
  id: number;
  order_code: string;
  product_name: string;
  total: number;
  status: string;
  created_at: string;
  customer_name: string;
}

export default function AdminDashboardHome() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [ordersData, productsData] = await Promise.all([
          apiFetch('/orders'),
          fetch('/api/products?all=1', { headers: { Authorization: `Bearer ${localStorage.getItem('ranzcloud_token')}` } }).then((r) => r.json()),
        ]);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setProductCount(Array.isArray(productsData) ? productsData.length : 0);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner label="Memuat dashboard..." />;
  if (error) return <p className="text-red-400">{error}</p>;

  const revenue = orders.filter((o) => o.status === 'paid' || o.status === 'completed').reduce((sum, o) => sum + Number(o.total), 0);
  const pending = orders.filter((o) => o.status === 'pending').length;
  const paid = orders.filter((o) => o.status === 'paid' || o.status === 'completed').length;

  const stats = [
    { label: 'Total Pendapatan', value: formatRupiah(revenue), icon: DollarSign, color: 'text-emerald-300' },
    { label: 'Total Pesanan', value: orders.length, icon: ShoppingCart, color: 'text-cyan-300' },
    { label: 'Pesanan Lunas', value: paid, icon: TrendingUp, color: 'text-violet-300' },
    { label: 'Menunggu Bayar', value: pending, icon: Clock, color: 'text-amber-300' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold">Dashboard Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Ringkasan performa RanzCloud Store</p>
        </div>
        <div className="glass rounded-xl px-4 py-2 flex items-center gap-2 text-sm">
          <Boxes className="h-4 w-4 text-cyan-300" /> {productCount} Produk Aktif/Nonaktif
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <s.icon className={`h-7 w-7 mb-3 ${s.color}`} />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-semibold">Pesanan Terbaru</h2>
          <Link to="/admin/orders" className="text-xs font-semibold text-cyan-300 hover:text-cyan-200">Lihat Semua</Link>
        </div>
        {orders.length === 0 ? (
          <p className="p-8 text-center text-slate-500 text-sm">Belum ada pesanan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-white/10">
                  <th className="p-4 font-medium">Kode</th>
                  <th className="p-4 font-medium">Pelanggan</th>
                  <th className="p-4 font-medium">Produk</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((o) => {
                  const st = STATUS_LABELS[o.status] || STATUS_LABELS.pending;
                  return (
                    <tr key={o.id} className="border-b border-white/5">
                      <td className="p-4 font-mono text-cyan-300">{o.order_code}</td>
                      <td className="p-4">{o.customer_name}</td>
                      <td className="p-4">{o.product_name}</td>
                      <td className="p-4">{formatRupiah(o.total)}</td>
                      <td className="p-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${st.color}`}>{st.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
