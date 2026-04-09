import { NavLink, Outlet } from 'react-router-dom';

const items = [
  ['/', '仪表盘'],
  ['/trades', '交易记录'],
  ['/new', '新增交易'],
  ['/analytics', '统计分析'],
  ['/strategies', '策略录入'],
  ['/summaries', '总结'],
  ['/calculator', '开仓计算器'],
];

export function AppLayout() {
  return (
    <div className="min-h-screen p-4 text-[var(--text)]">
      <div className="mx-auto flex max-w-[1500px] gap-4">
        <aside className="surface w-60 rounded-2xl p-4">
          <h1 className="mb-5 border-b border-[var(--line-soft)] pb-3 text-2xl font-semibold tracking-tight gold-text">交易中枢</h1>
          <div className="space-y-2">
            {items.map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => `block rounded-xl px-3 py-2 text-base transition ${isActive ? 'bg-[#252f3e] text-[#f1e3c7] border border-[#8a7553]' : 'text-[var(--text-soft)] hover:bg-[#1a2230] hover:text-[var(--text)]'}`}>
                {label}
              </NavLink>
            ))}
          </div>
        </aside>
        <main className="flex-1 space-y-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
