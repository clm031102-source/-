import { NavLink, Outlet } from 'react-router-dom';

const items = [
  ['/', '仪表盘'],
  ['/trades', '交易记录'],
  ['/new', '新增交易'],
  ['/analytics', '统计分析'],
  ['/strategies', '策略录入'],
  ['/calculator', '开仓计算器'],
];

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_400px_at_30%_0%,#1e3a8a22,transparent),#030712] p-4 text-slate-100">
      <div className="mx-auto flex max-w-[1400px] gap-4">
        <aside className="w-56 rounded-2xl border border-slate-800 bg-[#06122a] p-4">
          <h1 className="mb-4 text-3xl font-semibold tracking-tight text-cyan-100">交易复盘系统</h1>
          <div className="space-y-2">
            {items.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `block rounded-xl px-3 py-2 text-xl transition ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800/60'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </aside>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
