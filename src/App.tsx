import { useState } from "react";
import type { Page } from "./types";
import type { DssSimulationRequest, DssSimulationResponse } from "./types/api";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Footer from "./components/Footer";
import SimulasiPage from "./pages/SimulasiPage";
import HistoryPage from "./pages/HistoryPage";
import "./styles/globals.css";
import "./styles/dashboard.css";

// DSS backend input defaults (aligned with backend example)
const DSS_DEFAULT_INPUT: DssSimulationRequest = {
  duck_count: 28,
  land_area_are: 7,
  planting_date: "2026-06-01",
  rice_variety: "sertani",
  planting_system: "jajar_legowo",
  duck_age_days: 30,
  duck_buy_price_rp_per_duck: null,
};

// Extend type to allow temporary null for empty inputs
type DssSimulationInputState = Omit<
  DssSimulationRequest,
  "duck_count" | "land_area_are" | "duck_age_days"
> & {
  duck_count: number | null;
  land_area_are: number | null;
  duck_age_days: number | null;
};

export default function App() {
  const [page, setPage] = useState<Page>("simulasi");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // DSS backend state — for SimulasiPage & Topbar print
  const [dssInput, setDssInput] =
    useState<DssSimulationInputState>(DSS_DEFAULT_INPUT);
  const [dssOutput, setDssOutput] = useState<DssSimulationResponse | null>(
    null,
  );

  const handleSetPage = (p: Page) => {
    setPage(p);
    setMobileMenuOpen(false);
  };

  const renderPage = () => {
    switch (page) {
      case "simulasi":
        return (
          <SimulasiPage
            setPage={handleSetPage}
            dssInput={dssInput}
            setDssInput={setDssInput}
            dssOutput={dssOutput}
            setDssOutput={setDssOutput}
          />
        );
      case "history":
        return <HistoryPage setPage={handleSetPage} />;
      default:
        return (
          <SimulasiPage
            setPage={handleSetPage}
            dssInput={dssInput}
            setDssInput={setDssInput}
            dssOutput={dssOutput}
            setDssOutput={setDssOutput}
          />
        );
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        page={page}
        setPage={setPage}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="main-content">
        <Topbar
          page={page}
          dssInput={dssInput}
          dssOutput={dssOutput}
          onMobileMenuToggle={() => setMobileMenuOpen((v) => !v)}
        />
        <main>{renderPage()}</main>
        <Footer />
      </div>
    </div>
  );
}
