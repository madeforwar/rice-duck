import { useState } from 'react';
import type { Page, SimInput, SimOutput } from './types';
import { calculate } from './types/calculate';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Footer from './components/Footer';
import DashboardPage from './pages/DashboardPage';
import SimulasiPage from './pages/SimulasiPage';
import LaporanPage from './pages/LaporanPage';
import './styles/globals.css';
import './styles/dashboard.css';

const DEFAULT_INPUT: SimInput = {
  lahanLuas: 2.5,
  jumlahBebek: 150,
  varietasPadi: 'Ciherang',
  sistemTanam: 'Jajar Legowo',
  tanggalTanam: '2025-11-20',
  umurBebek: 21,
};

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');

  // Shared state for simulation
  const [simInput, setSimInput] = useState<SimInput>(DEFAULT_INPUT);
  const [simOutput, setSimOutput] = useState<SimOutput>(() => calculate(DEFAULT_INPUT));

  // Shared state for field observations
  const [loggedMoisture, setLoggedMoisture] = useState<number>(72);
  const [loggedWaterLevel, setLoggedWaterLevel] = useState<number>(12.5);

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return (
          <DashboardPage
            setPage={setPage}
            simInput={simInput}
            simOutput={simOutput}
            loggedMoisture={loggedMoisture}
            setLoggedMoisture={setLoggedMoisture}
            loggedWaterLevel={loggedWaterLevel}
            setLoggedWaterLevel={setLoggedWaterLevel}
          />
        );
      case 'simulasi':
        return (
          <SimulasiPage
            setPage={setPage}
            simInput={simInput}
            setSimInput={setSimInput}
            simOutput={simOutput}
            setSimOutput={setSimOutput}
          />
        );
      case 'laporan':
        return <LaporanPage />;
      default:
        return (
          <DashboardPage
            setPage={setPage}
            simInput={simInput}
            simOutput={simOutput}
            loggedMoisture={loggedMoisture}
            setLoggedMoisture={setLoggedMoisture}
            loggedWaterLevel={loggedWaterLevel}
            setLoggedWaterLevel={setLoggedWaterLevel}
          />
        );
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar page={page} setPage={setPage} />
      <div className="main-content">
        <Topbar
          page={page}
          simInput={simInput}
          simOutput={simOutput}
          loggedMoisture={loggedMoisture}
          loggedWaterLevel={loggedWaterLevel}
        />
        <main>
          {renderPage()}
        </main>
        <Footer />
      </div>
    </div>
  );
}