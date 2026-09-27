import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { DashboardOverview } from './pages/DashboardOverview';
import { Studies } from './pages/Studies';
import { StudyDetail } from './pages/StudyDetail';
import { Collect } from './pages/Collect';
import { Analytics } from './pages/Analytics';
import { Users } from './pages/Users';
import { AuditLog } from './pages/AuditLog';
import { PublicSurvey } from './pages/PublicSurvey';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/survey/:studyId" element={<PublicSurvey />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/studies" element={<Studies />} />
          <Route path="/studies/:id" element={<StudyDetail />} />
          <Route path="/collect" element={<Collect />} />
          <Route path="/analytics" element={<Analytics />} />

          <Route element={<ProtectedRoute allow={['admin']} />}>
            <Route path="/users" element={<Users />} />
            <Route path="/audit" element={<AuditLog />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
