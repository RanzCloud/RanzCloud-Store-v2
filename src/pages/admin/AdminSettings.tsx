import { useEffect, useState } from 'react';
import { Save, Loader2, UploadCloud, Eye, EyeOff, QrCode, Server, Store, KeyRound } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { apiFetch } from '../../lib/api';

const initial = {
  store_name: '',
  store_tagline: '',
  contact_whatsapp: '',
  payment_mode: 'manual',
  buatqris_account_id: '',
  buatqris_secret_token: '',
  buatqris_webhook_secret: '',
  custom_qris_image_url: '',
  custom_qris_note: '',
  pterodactyl_panel_url: '',
  pterodactyl_api_key: '',
};

export default function AdminSettings() {
  const [form, setForm] = useState<any>(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [showPteroKey, setShowPteroKey] = useState(false);

  useEffect(() => {
    apiFetch('/settings')
      .then((data) => setForm((f: any) => ({ ...f, ...data })))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (file: File) => {
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
      setForm((f: any) => ({ ...f, custom_qris_image_url: data.url }));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await apiFetch('/settings', { method: 'PUT', body: JSON.stringify({ settings: form }) });
      setMessage('Pengaturan berhasil disimpan!');
      setTimeout(() => setMessage(''), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="Memuat pengaturan..." />;

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold">Pengaturan</h1>
        <p className="text-slate-400 text-sm mt-1">Konfigurasi payment gateway, QRIS, dan Pterodactyl</p>
      </div>

      <div className="space-y-8">
        <section className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Store className="h-5 w-5 text-cyan-300" />
            <h2 className="font-semibold">Informasi Toko</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Nama Toko</label>
              <input value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Nomor WhatsApp Admin</label>
              <input value={form.contact_whatsapp} onChange={(e) => setForm({ ...form, contact_whatsapp: e.target.value })} placeholder="62812xxxxxxx" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Tagline</label>
              <input value={form.store_tagline} onChange={(e) => setForm({ ...form, store_tagline: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
            </div>
          </div>
        </section>

        <section className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <QrCode className="h-5 w-5 text-violet-300" />
            <h2 className="font-semibold">Payment Gateway (BuatQRIS)</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Mode Pembayaran</label>
              <select value={form.payment_mode} onChange={(e) => setForm({ ...form, payment_mode: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm">
                <option value="gateway">Otomatis via BuatQRIS API</option>
                <option value="manual">Manual (QRIS Statis dari DANA)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Mode otomatis membuat QRIS dinamis per transaksi dan memverifikasi status secara real-time via app.buatqris.site.
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Account ID</label>
              <input value={form.buatqris_account_id} onChange={(e) => setForm({ ...form, buatqris_account_id: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Secret Token</label>
              <div className="relative">
                <input type={showSecret ? 'text' : 'password'} value={form.buatqris_secret_token} onChange={(e) => setForm({ ...form, buatqris_secret_token: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm pr-9" />
                <button type="button" onClick={() => setShowSecret((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Webhook Secret (opsional)</label>
              <input value={form.buatqris_webhook_secret} onChange={(e) => setForm({ ...form, buatqris_webhook_secret: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
            </div>
          </div>
        </section>

        <section className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <KeyRound className="h-5 w-5 text-amber-300" />
            <h2 className="font-semibold">QRIS Manual (DANA)</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Upload Gambar QRIS</label>
              <div className="flex items-center gap-3">
                {form.custom_qris_image_url && <img src={form.custom_qris_image_url} className="h-14 w-14 rounded-lg object-cover bg-white" />}
                <label className="cursor-pointer flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-white/20 hover:bg-white/5 text-sm text-slate-300">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                  Upload QRIS
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                </label>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">URL Gambar (alternatif)</label>
              <input value={form.custom_qris_image_url} onChange={(e) => setForm({ ...form, custom_qris_image_url: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Catatan untuk Pelanggan</label>
              <textarea value={form.custom_qris_note} onChange={(e) => setForm({ ...form, custom_qris_note: e.target.value })} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
            </div>
          </div>
        </section>

        <section className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Server className="h-5 w-5 text-emerald-300" />
            <h2 className="font-semibold">Pterodactyl Panel</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Panel URL</label>
              <input value={form.pterodactyl_panel_url} onChange={(e) => setForm({ ...form, pterodactyl_panel_url: e.target.value })} placeholder="https://panel.domainanda.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Application API Key</label>
              <div className="relative">
                <input type={showPteroKey ? 'text' : 'password'} value={form.pterodactyl_api_key} onChange={(e) => setForm({ ...form, pterodactyl_api_key: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm pr-9" />
                <button type="button" onClick={() => setShowPteroKey((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  {showPteroKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">
            Gunakan Application API Key (bukan Client API Key) dari Pterodactyl Panel Anda agar sistem dapat membuat user & server secara otomatis.
          </p>
        </section>

        {message && <p className="text-emerald-400 text-sm">{message}</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 rounded-xl btn-gradient text-black font-bold disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Simpan Pengaturan
        </button>
      </div>
    </div>
  );
}
