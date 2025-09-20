import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import AddAthlete from "./pages/AddAthlete";
import NewAssessment from "./pages/NewAssessment";
import MovementAssessmentPage from "./pages/MovementAssessmentPage";
import AthleteProfile from "./pages/AthleteProfile";
import InjuryPage from "./pages/InjuryPage";
import AthleteList from "./pages/AthleteList";

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 w-full bg-gray-100 min-h-screen p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add-athlete" element={<AddAthlete />} />
          <Route
            path="/athletes/:id/movement-assessment"
            element={<MovementAssessmentPage />}
          />
          <Route path="/athletes/:id" element={<AthleteProfile />} />
          <Route path="/athletes/:id/injury" element={<InjuryPage />} />
          <Route path="/athletes-list" element={<AthleteList />} />
          <Route path="/movement" element={<MovementAssessmentPage />} />
          <Route path="/injury" element={<InjuryPage />} />
          <Route path="/assessments/new" element={<NewAssessment />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
