import { NavLink } from "react-router-dom";

function Navbar() {
    // TODO: spostare stili inline in css (appena ho tempo)
    return (
        <nav className="navbar" style={{ padding: "1rem", borderBottom: "1px solid #ccc", display: "flex", justifyContent: "space-between" }}>
            <div className="navbar-brand">
                <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Engrammi</span>
            </div>

            <div className="navbar-links" style={{ display: "flex", gap: "1.5rem" }}>
                {/* forse si potrebbe mettere un margine diverso ma per ora ok */}
                <NavLink to="/" end>Addestra</NavLink>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/about">Info</NavLink>
            </div>
        </nav>
    );
}

export default Navbar;
