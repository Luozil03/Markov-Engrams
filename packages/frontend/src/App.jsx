import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import TrainPage from "./pages/TrainPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
    return (
        <BrowserRouter>
            <div className="app-layout">
                <Navbar />

                <main style={{ padding: "2rem" }}>
                    <Routes>
                        <Route path="/" element={<TrainPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/about" element={<p>Pagina About provvisoria</p>} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
