# 个人交易复盘系统 MVP

基于 **React + TypeScript + Vite + Tailwind + Zustand + Recharts + dayjs** 的本地单机版交易复盘网站。

## 功能
- 仪表盘：总览指标、收益趋势、盈亏分布、策略概览、最近交易、最近总结。
- 交易记录：搜索、筛选（品种/策略/多空/盈亏/标签/日期）、排序、查看、编辑、删除、复制。
- 新增/编辑交易：完整交易字段，含逻辑、风控、心理、复盘与标签。
- 交易详情：卡片化展示 + 同策略均值对比。
- 统计分析：收益曲线、月度柱状图、策略对比、胜率对比、情绪影响、星期分布，及多维统计列表。
- 日/周/月总结：新增、编辑、删除、历史查看，自动统计区间交易数与总盈亏。
- 持久化：全部数据保存在浏览器 localStorage（key: `trade-review-storage-v1`）。

## 启动
```bash
npm install
npm run dev
```

## 目录结构
```
src/
  components/
    ui/
  data/
  features/
    trades/
  hooks/
  layouts/
  lib/
  pages/
  store/
  types/
  utils/
```

## 后续建议
- 接入导入/导出（CSV、JSON）
- 交易截图与复盘附件
- 多账户/多策略分组面板
- 后端 API + 云同步 + 登录体系
