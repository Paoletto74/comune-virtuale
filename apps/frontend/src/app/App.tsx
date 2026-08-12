import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthGate, CitizenGate, CreationGate, GuestGate } from '@/components/AuthGate';
import { ShellLayout } from '@/components/shell/ShellLayout';
import { VisualTimeProvider } from '@/context/VisualTimeProvider';
import { LoginPage } from '@/pages/LoginPage';
import { CreateCitizenPage } from '@/pages/CreateCitizenPage';
import { HomeDashboardPage } from '@/pages/HomeDashboardPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { StatusPage } from '@/pages/StatusPage';
import { GazzettaPage } from '@/pages/GazzettaPage';
import { AttivitaPage } from '@/pages/AttivitaPage';
import { MercatoPage } from '@/pages/MercatoPage';
import { ProfiloPage } from '@/pages/ProfiloPage';
import { NotifichePage } from '@/pages/NotifichePage';
import { ComunePage } from '@/pages/ComunePage';
import { NpcProfilePage } from '@/pages/NpcProfilePage';
import { RelazioniNpcRedirect, RelazioniPageRedirect } from '@/pages/RelazioniRedirect';
import { GameMasterPage } from '@/pages/GameMasterPage';
import { DevAssetStatusPage } from '@/pages/DevAssetStatusPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <VisualTimeProvider>
          <BrowserRouter>
          <Routes>
            <Route element={<ShellLayout />}>
              <Route index element={<Navigate to="/login" replace />} />
              <Route element={<GuestGate />}>
                <Route path="login" element={<LoginPage />} />
              </Route>
              <Route element={<AuthGate />}>
                <Route element={<CreationGate />}>
                  <Route path="create-citizen" element={<CreateCitizenPage />} />
                </Route>
                <Route element={<CitizenGate />}>
                  <Route path="home" element={<HomeDashboardPage />} />
                  <Route path="gazzetta" element={<GazzettaPage />} />
                  <Route path="attivita" element={<AttivitaPage />} />
                  <Route path="mercato" element={<MercatoPage />} />
                  <Route path="profilo" element={<ProfiloPage />} />
                  <Route path="profilo/npc/:npcId" element={<NpcProfilePage />} />
                  <Route path="profilo/:citizenId" element={<ProfiloPage />} />
                  <Route path="relazioni" element={<RelazioniPageRedirect />} />
                  <Route path="relazioni/npc/:npcId" element={<RelazioniNpcRedirect />} />
                  <Route path="notifiche" element={<NotifichePage />} />
                  <Route path="comune" element={<ComunePage />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="status" element={<StatusPage />} />
                  <Route path="game-master" element={<GameMasterPage />} />
                  <Route path="dev/assets" element={<DevAssetStatusPage />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
        </VisualTimeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
