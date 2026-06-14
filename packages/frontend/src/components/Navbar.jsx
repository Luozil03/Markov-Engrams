import { NavLink } from "react-router-dom";

function Navbar() {
    // TODO: forse la navbar mobile è un po' stretta, sistemare i margini se avanza tempo
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <span>Engrammi</span>
            </div>

            <div className="navbar-links">
                <NavLink to="/" end className="navbar-link">Addestra</NavLink>
                <NavLink to="/dashboard" className="navbar-link">Dashboard</NavLink>
                <NavLink to="/about" className="navbar-link">Info</NavLink>
            </div>
        </nav>
    );
}

export default Navbar;
