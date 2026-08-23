import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, UploadCloud, Boxes } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { apiFetch, formatRupiah, PRODUCT_TYPE_LABELS } from '../../lib/api';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  category_id: number | null;
  description: string;
  short_description: string;
  price: number;
  original_price: number | null;
  stock: number;
  image_url: string | null;
  product_type: string;
  delivery_type: string;
  file_url: string | null;
  license_note: string | null;
  pterodactyl_config: any;
  features: string[];
  is_active: boolean;
}

const emptyForm = {
  id: 0,
  name: '',
  category_id: '',
  description: '',
  short_description: '',
  price: '',
  original_price: '',
  stock: '-1',
  image_url: '',
  product_type: 'hosting',
  delivery_type: 'pterodactyl',
  file_url: '',
  license_note: '',
  features: '',
  is_active: true,
  ptero_egg_id: '1',
  ptero_location_id: '1',
  ptero_memory: '512',
  ptero_disk: '1024',
  ptero_cpu: '100',
  ptero_docker_image: 'quay.io/pterodactyl/core:rust',
  ptero_startup: './samp03svr',
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  const [formError, setFormError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        apiFetch('/products?all=1'),
        fetch('/api/categories').then((r) => r.json()),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    const cfg = p.pterodactyl_config || {};
    setForm({
      id: p.id,
      name: p.name,
      category_id: p.category_id || '',
      description: p.description || '',
      short_description: p.short_description || '',
      price: p.price,
      original_price: p.original_price || '',
      stock: p.stock,
      image_url: p.image_url || '',
      product_type: p.product_type,
      delivery_type: p.delivery_type,
      file_url: p.file_url || '',
      license_note: p.license_note || '',
      features: (p.features || []).join(', '),
      is_active: p.is_active,
      ptero_egg_id: cfg.egg_id || '1',
      ptero_location_id: cfg.location_id || '1',
      ptero_memory: cfg.memory || '512',
      ptero_disk: cfg.disk || '1024',
      ptero_cpu: cfg.cpu || '100',
      ptero_docker_image: cfg.docker_image || 'quay.io/pterodactyl/core:rust',
      ptero_startup: cfg.startup || './samp03svr',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const data = await apiFetch('/upload', {
        method: 'POST',
        body: JSON.stringify({ fileName: file.name, fileBase64: base64, contentType: file.type }),
      });
      setForm((f: any) => ({ ...f, image_url: data.url }));
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name || !form.price) {
      setFormError('Nama dan harga wajib diisi');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: form.name,
        category_id: form.category_id || null,
        description: form.description,
        short_description: form.short_description,
        price: Number(form.price),
        original_price: form.original_price ? Number(form.original_price) : null,
        stock: Number(form.stock),
        image_url: form.image_url,
        product_type: form.product_type,
        delivery_type: form.delivery_type,
        file_url: form.file_url,
        license_note: form.license_note,
        features: form.features.split(',').map((f: string) => f.trim()).filter(Boolean),
        is_active: form.is_active,
      };
      if (form.delivery_type === 'pterodactyl') {
        payload.pterodactyl_config = {
          egg_id: Number(form.ptero_egg_id),
          location_id: Number(form.ptero_location_id),
          memory: Number(form.ptero_memory),
          disk: Number(form.ptero_disk),
          cpu: Number(form.ptero_cpu),
          docker_image: form.ptero_docker_image,
          startup: form.ptero_startup,
        };
      }
      if (form.id) {
        await apiFetch('/products', { method: 'PUT', body: JSON.stringify({ id: form.id, ...payload }) });
      } else {
        await apiFetch('/products', { method: 'POST', body: JSON.stringify(payload) });
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
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      await apiFetch('/products', { method: 'DELETE', body: JSON.stringify({ id }) });
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Kelola Produk</h1>
          <p className="text-slate-400 text-sm mt-1">Tambah, edit, dan hapus produk toko</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-gradient text-black font-semibold text-sm">
          <Plus className="h-4 w-4" /> Tambah Produk
        </button>
      </div>

      {loading ? (
        <LoadingSpinner label="Memuat produk..." />
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-white/10">
                  <th className="p-4 font-medium">Produk</th>
                  <th className="p-4 font-medium">Tipe</th>
                  <th className="p-4 font-medium">Harga</th>
                  <th className="p-4 font-medium">Stok</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-white/5">
                    <td className="p-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                        {p.image_url ? <img src={p.image_url} className="h-full w-full object-cover" /> : <Boxes className="h-4 w-4 text-slate-600" />}
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </td>
                    <td className="p-4 text-slate-300">{PRODUCT_TYPE_LABELS[p.product_type] || p.product_type}</td>
                    <td className="p-4">{formatRupiah(p.price)}</td>
                    <td className="p-4">{p.stock === -1 ? 'Unlimited' : p.stock}</td>
                    <td className="p-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${p.is_active ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' : 'text-slate-400 bg-slate-400/10 border-slate-400/30'}`}>
                        {p.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-white/10 text-cyan-300"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-white/10 text-red-400"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500">Belum ada produk.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-y-auto p-4 py-10">
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 w-full max-w-2xl space-y-4 bg-[#0b0f1a]">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg">{form.id ? 'Edit Produk' : 'Tambah Produk'}</h2>
              <button type="button" onClick={() => setShowForm(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Nama Produk</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Kategori</label>
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm">
                  <option value="">- Pilih Kategori -</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Tipe Produk</label>
                <select value={form.product_type} onChange={(e) => setForm({ ...form, product_type: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm">
                  <option value="hosting">Hosting SA-MP</option>
                  <option value="bot">Script Bot</option>
                  <option value="gamemode">Gamemode SA-MP</option>
                  <option value="website">Script Website</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Metode Pengiriman</label>
                <select value={form.delivery_type} onChange={(e) => setForm({ ...form, delivery_type: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm">
                  <option value="pterodactyl">Auto Hosting (Pterodactyl)</option>
                  <option value="file">Link Download / File</option>
                  <option value="license">Lisensi / Instruksi Manual</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Harga (Rp)</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Harga Coret (opsional)</label>
                <input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Stok (-1 = unlimited)</label>
                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} id="is_active" className="h-4 w-4" />
                <label htmlFor="is_active" className="text-sm">Produk Aktif</label>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Deskripsi Singkat</label>
              <input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Deskripsi Lengkap</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Fitur (pisahkan dengan koma)</label>
              <input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="RAM 1GB, Disk 3GB, DDoS Protection" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Gambar Produk</label>
              <div className="flex items-center gap-3">
                {form.image_url && <img src={form.image_url} className="h-12 w-12 rounded-lg object-cover" />}
                <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="URL gambar atau upload" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
                <label className="cursor-pointer p-2.5 rounded-xl border border-white/10 hover:bg-white/5">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                </label>
              </div>
            </div>

            {form.delivery_type === 'pterodactyl' && (
              <div className="border border-cyan-400/20 bg-cyan-400/5 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-cyan-300">Konfigurasi Pterodactyl</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Egg ID</label>
                    <input value={form.ptero_egg_id} onChange={(e) => setForm({ ...form, ptero_egg_id: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Location ID</label>
                    <input value={form.ptero_location_id} onChange={(e) => setForm({ ...form, ptero_location_id: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">RAM (MB)</label>
                    <input value={form.ptero_memory} onChange={(e) => setForm({ ...form, ptero_memory: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Disk (MB)</label>
                    <input value={form.ptero_disk} onChange={(e) => setForm({ ...form, ptero_disk: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">CPU (%)</label>
                    <input value={form.ptero_cpu} onChange={(e) => setForm({ ...form, ptero_cpu: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Docker Image</label>
                    <input value={form.ptero_docker_image} onChange={(e) => setForm({ ...form, ptero_docker_image: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">Startup Command</label>
                  <input value={form.ptero_startup} onChange={(e) => setForm({ ...form, ptero_startup: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm" />
                </div>
              </div>
            )}

            {form.delivery_type === 'file' && (
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Link Download File</label>
                <input value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
              </div>
            )}

            {form.delivery_type === 'license' && (
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Catatan / Instruksi Lisensi</label>
                <textarea value={form.license_note} onChange={(e) => setForm({ ...form, license_note: e.target.value })} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
              </div>
            )}

            {formError && <p className="text-sm text-red-400">{formError}</p>}

            <div className="flex justify-end gap-3 pt-2">
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
