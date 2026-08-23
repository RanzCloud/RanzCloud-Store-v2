import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard, { Product } from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (activeCategory) params.set('category', activeCategory);
    if (search) params.set('search', search);
    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setError('Gagal memuat produk. Coba lagi nanti.'))
      .finally(() => setLoading(false));
  }, [activeCategory, search]);

  const selectCategory = (slug: string) => {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set('category', slug);
    else next.delete('category');
    setSearchParams(next);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="mb-10 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold">Semua Produk</h1>
          <p className="text-slate-400 mt-2 text-sm">Temukan hosting SA-MP, script bot, gamemode, dan script website terbaik</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => selectCategory('')}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                !activeCategory ? 'bg-cyan-400/15 border-cyan-400/40 text-cyan-300' : 'border-white/10 text-slate-300 hover:bg-white/5'
              }`}
            >
              Semua
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => selectCategory(c.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  activeCategory === c.slug ? 'bg-cyan-400/15 border-cyan-400/40 text-cyan-300' : 'border-white/10 text-slate-300 hover:bg-white/5'
                }`}
              >
                {c.icon} {c.name}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner label="Memuat produk..." />
        ) : error ? (
          <p className="text-center text-red-400 py-16">{error}</p>
        ) : products.length === 0 ? (
          <p className="text-center text-slate-500 py-16">Tidak ada produk yang cocok dengan pencarian Anda.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
