import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import TrainPage from "./pages/TrainPage";
import DashboardPage from "./pages/DashboardPage";
import AboutPage from "./pages/AboutPage.jsx"

function App() {
    return (
        <BrowserRouter>
            <div className="app-layout">
                <Navbar />

                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<TrainPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/about" element={<AboutPage />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
