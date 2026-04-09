import { NavLink, Outlet } from 'react-router-dom';

const items = [
  ['/', '仪表盘'],
  ['/trades', '交易记录'],
  ['/new', '新增交易'],
  ['/analytics', '统计分析'],
  ['/strategies', '策略录入'],
  ['/summaries', '总结'],
  ['/calculator', '开仓计算器'],
  ['/settings', '数据管理'],
];

export function AppLayout() {
  return (
    <div className="min-h-screen p-5 text-[var(--text)]">
      <div className="mx-auto flex max-w-[1560px] gap-5">
        <aside className="surface sticky top-5 h-fit w-64 rounded-2xl p-5">
          <h1 className="mb-5 border-b border-[var(--line-soft)] pb-3 text-5 font-semibold tracking-tight gold-text">交易中枢</h1>
          <div className="space-y-1.5">
            {items.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `block rounded-xl border px-3 py-2.5 text-base transition ${
                    isActive
                      ? 'border-[#846740] bg-[#2a2621] text-[#f2e2c6]'
                      : 'border-transparent text-[var(--text-soft)] hover:border-[var(--line)] hover:bg-[#191919] hover:text-[var(--text)]'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </aside>
        <main className="min-h-[calc(100vh-40px)] flex-1 space-y-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
