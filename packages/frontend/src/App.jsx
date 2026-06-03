import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

function App() {
    return (
        <BrowserRouter>
            <div className="app-layout">
                <Navbar />

                <main style={{ padding: "2rem" }}>
                    <Routes>
                        <Route path="/" element={<p>Qui ci andrà la pagina di Training (TrainPage)</p>} />
                        <Route path="/dashboard" element={<p>Qui ci andrà la Dashboard</p>} />
                        <Route path="/about" element={<p>Pagina About provvisoria</p>} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
