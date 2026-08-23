import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, Ticket } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { apiFetch, formatRupiah } from '../../lib/api';

interface Voucher {
  id: number;
  code: string;
  kind: string;
  discount_type: string;
  discount_value: number;
  min_purchase: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
}

const emptyForm = {
  id: 0,
  code: '',
  kind: 'voucher',
  discount_type: 'percent',
  discount_value: '',
  min_purchase: '0',
  max_discount: '',
  usage_limit: '',
  is_active: true,
  expires_at: '',
};

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [filter, setFilter] = useState<'all' | 'voucher' | 'coupon'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/vouchers');
      setVouchers(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setFormError(''); setShowForm(true); };
  const openEdit = (v: Voucher) => {
    setForm({
      id: v.id,
      code: v.code,
      kind: v.kind,
      discount_type: v.discount_type,
      discount_value: v.discount_value,
      min_purchase: v.min_purchase,
      max_discount: v.max_discount || '',
      usage_limit: v.usage_limit || '',
      is_active: v.is_active,
      expires_at: v.expires_at ? v.expires_at.slice(0, 10) : '',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.code || !form.discount_value) { setFormError('Kode dan nilai diskon wajib diisi'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        discount_value: Number(form.discount_value),
        min_purchase: Number(form.min_purchase) || 0,
        max_discount: form.max_discount ? Number(form.max_discount) : null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      };
      if (form.id) {
        await apiFetch('/vouchers', { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/vouchers', { method: 'POST', body: JSON.stringify(payload) });
      }
      setShowForm(false);
      load();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus voucher/kupon ini?')) return;
    try {
      await apiFetch('/vouchers', { method: 'DELETE', body: JSON.stringify({ id }) });
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filtered = filter === 'all' ? vouchers : vouchers.filter((v) => v.kind === filter);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Voucher &amp; Kupon Promo</h1>
          <p className="text-slate-400 text-sm mt-1">Kelola voucher diskon dan kupon promo</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-gradient text-black font-semibold text-sm">
          <Plus className="h-4 w-4" /> Tambah Voucher/Kupon
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'Semua' },
          { key: 'voucher', label: 'Voucher Diskon' },
          { key: 'coupon', label: 'Kupon Promo' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium border ${filter === f.key ? 'bg-cyan-400/15 border-cyan-400/40 text-cyan-300' : 'border-white/10 text-slate-300'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner label="Memuat voucher..." />
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((v) => (
            <div key={v.id} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-violet-300" />
                  <span className="font-mono font-bold text-white">{v.code}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg hover:bg-white/10 text-cyan-300"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(v.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <p className="text-xs uppercase tracking-wide text-slate-500 mt-2">{v.kind === 'voucher' ? 'Voucher Diskon' : 'Kupon Promo'}</p>
              <p className="text-lg font-bold text-gradient mt-1">
                {v.discount_type === 'percent' ? `${v.discount_value}%` : formatRupiah(v.discount_value)}
              </p>
              <p className="text-xs text-slate-400 mt-1">Min. belanja {formatRupiah(v.min_purchase)}</p>
              {v.max_discount ? <p className="text-xs text-slate-400">Maks. diskon {formatRupiah(v.max_discount)}</p> : null}
              <p className="text-xs text-slate-400 mt-1">Terpakai: {v.used_count}{v.usage_limit ? ` / ${v.usage_limit}` : ''}</p>
              <span className={`inline-block mt-3 text-xs font-semibold px-2.5 py-1 rounded-full border ${v.is_active ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' : 'text-slate-400 bg-slate-400/10 border-slate-400/30'}`}>
                {v.is_active ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-slate-500 col-span-full text-center py-10">Belum ada data.</p>}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto py-10">
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 w-full max-w-lg space-y-4 bg-[#0b0f1a]">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg">{form.id ? 'Edit' : 'Tambah'} Voucher/Kupon</h2>
              <button type="button" onClick={() => setShowForm(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Kode</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Jenis</label>
                <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm">
                  <option value="voucher">Voucher Diskon</option>
                  <option value="coupon">Kupon Promo</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Tipe Diskon</label>
                <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm">
                  <option value="percent">Persen (%)</option>
                  <option value="fixed">Nominal (Rp)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Nilai Diskon</label>
                <input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Min. Pembelian (Rp)</label>
                <input type="number" value={form.min_purchase} onChange={(e) => setForm({ ...form, min_purchase: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Maks. Diskon (opsional)</label>
                <input type="number" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Batas Penggunaan</label>
                <input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Kedaluwarsa</label>
                <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} id="v_active" className="h-4 w-4" />
                <label htmlFor="v_active" className="text-sm">Aktif</label>
              </div>
            </div>
            {formError && <p className="text-sm text-red-400">{formError}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-white/10 text-sm">Batal</button>
              <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl btn-gradient text-black font-semibold text-sm flex items-center gap-2 disabled:opacity-60">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
