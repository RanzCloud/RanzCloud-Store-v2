import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { apiFetch } from '../../lib/api';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

const emptyForm = { id: 0, name: '', description: '', icon: '' };

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetch('/api/categories').then((r) => r.json());
      setCategories(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setFormError(''); setShowForm(true); };
  const openEdit = (c: Category) => { setForm({ id: c.id, name: c.name, description: c.description || '', icon: c.icon || '' }); setFormError(''); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name) { setFormError('Nama kategori wajib diisi'); return; }
    setSaving(true);
    try {
      if (form.id) {
        await apiFetch('/categories', { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await apiFetch('/categories', { method: 'POST', body: JSON.stringify(form) });
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
    if (!confirm('Yakin ingin menghapus kategori ini? Produk terkait tidak akan terhapus.')) return;
    try {
      await apiFetch('/categories', { method: 'DELETE', body: JSON.stringify({ id }) });
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Kelola Kategori</h1>
          <p className="text-slate-400 text-sm mt-1">Tambah, edit, dan hapus kategori produk</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-gradient text-black font-semibold text-sm">
          <Plus className="h-4 w-4" /> Tambah Kategori
        </button>
      </div>

      {loading ? (
        <LoadingSpinner label="Memuat kategori..." />
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((c) => (
            <div key={c.id} className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{c.icon}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-white/10 text-cyan-300"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-white/10 text-red-400"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <h3 className="font-semibold mt-3">{c.name}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.description}</p>
              <p className="text-[10px] text-slate-600 mt-2 font-mono">/{c.slug}</p>
            </div>
          ))}
          {categories.length === 0 && <p className="text-slate-500 col-span-full text-center py-10">Belum ada kategori.</p>}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 w-full max-w-md space-y-4 bg-[#0b0f1a]">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg">{form.id ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
              <button type="button" onClick={() => setShowForm(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Nama Kategori</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Icon (emoji)</label>
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Contoh: 🖥️" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Deskripsi</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
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
