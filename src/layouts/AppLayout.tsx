import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, FilePenLine, Home, NotebookText, ScrollText } from 'lucide-react';

const navItems = [
  { to: '/', label: '仪表盘', icon: Home },
  { to: '/trades', label: '交易记录', icon: ScrollText },
  { to: '/trade/new', label: '新增交易', icon: FilePenLine },
  { to: '/analytics', label: '统计分析', icon: BarChart3 },
  { to: '/summaries', label: '周期总结', icon: NotebookText },
];

export function AppLayout() {
  return (
    <div className="min-h-screen bg-bg text-slate-100">
      <div className="mx-auto flex max-w-[1400px] gap-4 p-4">
        <aside className="sticky top-4 h-[calc(100vh-2rem)] w-56 rounded-xl border border-border bg-panel p-3">
          <h1 className="mb-4 border-b border-border pb-3 text-lg font-semibold">交易复盘系统</h1>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1 pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
