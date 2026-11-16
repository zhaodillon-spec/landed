import { Route, Routes } from "react-router-dom";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { CalculatorPage } from "./pages/CalculatorPage";
import { ComparePage } from "./pages/ComparePage";
import { HomePage } from "./pages/HomePage";
import { RatesPage } from "./pages/RatesPage";

export default function App() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/rates" element={<RatesPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <SiteFooter />
    </div>
  );
}
