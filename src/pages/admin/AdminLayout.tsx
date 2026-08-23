import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Boxes, Tags, Ticket, ShoppingCart, Settings, LogOut, Server, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Produk', icon: Boxes },
  { to: '/admin/categories', label: 'Kategori', icon: Tags },
  { to: '/admin/vouchers', label: 'Voucher & Kupon', icon: Ticket },
  { to: '/admin/orders', label: 'Pesanan', icon: ShoppingCart },
  { to: '/admin/settings', label: 'Pengaturan', icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-[#05070d]">
      <aside className="hidden md:flex w-64 flex-col border-r border-white/5 bg-[#0b0f1a] p-5">
        <div className="flex items-center gap-2 mb-8 px-1">
          <span className="h-9 w-9 rounded-xl btn-gradient flex items-center justify-center">
            <Server className="h-5 w-5 text-black" />
          </span>
          <div>
            <p className="font-display font-bold text-sm leading-none">RanzCloud</p>
            <p className="text-[10px] text-violet-300 tracking-widest uppercase">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-cyan-400/10 text-cyan-300 border border-cyan-400/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <l.icon className="h-4 w-4" /> {l.label}
            </NavLink>
          ))}
        </nav>
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 px-3 py-2">
          <ExternalLink className="h-3.5 w-3.5" /> Lihat Toko
        </a>
        <div className="mt-2 border-t border-white/10 pt-4 px-1">
          <p className="text-xs text-slate-500">Masuk sebagai</p>
          <p className="text-sm font-semibold text-white">{user?.username}</p>
          <button onClick={handleLogout} className="mt-3 w-full flex items-center gap-2 text-sm text-red-400 hover:text-red-300 px-3 py-2 rounded-lg border border-red-500/20 hover:bg-red-500/10">
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#0b0f1a]">
          <span className="font-display font-bold text-sm">RanzCloud Admin</span>
          <button onClick={handleLogout} className="text-red-400 text-sm">Keluar</button>
        </header>
        <nav className="md:hidden flex overflow-x-auto no-scrollbar gap-2 p-3 border-b border-white/5 bg-[#0b0f1a]">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border ${
                  isActive ? 'bg-cyan-400/10 text-cyan-300 border-cyan-400/30' : 'text-slate-400 border-white/10'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <main className="flex-1 p-5 md:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
