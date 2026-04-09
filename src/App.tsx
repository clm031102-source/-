import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { CalculatorPage } from '@/pages/CalculatorPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { NewTradePage } from '@/pages/NewTradePage';
import { StrategiesPage } from '@/pages/StrategiesPage';
import { TradesPage } from '@/pages/TradesPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/trades" element={<TradesPage />} />
        <Route path="/new" element={<NewTradePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/strategies" element={<StrategiesPage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
