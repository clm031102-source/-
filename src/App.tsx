import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { TradeDetailPage } from '@/pages/TradeDetailPage';
import { TradeFormPage } from '@/pages/TradeFormPage';
import { TradesPage } from '@/pages/TradesPage';
import { SummariesPage } from '@/pages/SummariesPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/trades" element={<TradesPage />} />
        <Route path="/trade/new" element={<TradeFormPage />} />
        <Route path="/trade/:id" element={<TradeDetailPage />} />
        <Route path="/trade/:id/edit" element={<TradeFormPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/summaries" element={<SummariesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
