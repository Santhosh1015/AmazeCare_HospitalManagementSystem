import { useEffect, useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router"
import { useDispatch, useSelector } from "react-redux"
import "../../styles/PatientLayout.css"
import { getPatientProfile } from "../../store/actions/PatientAction"

function PatientLayout() {
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light")

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const patient = useSelector((state) => state.patientData.patient)

    // console.log(patient);
    // console.log(doctors);

    // Load profile once (covers page refresh, since redux state is lost)
    useEffect(() => {
        dispatch(getPatientProfile())
        
    }, [])

useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme)
    localStorage.setItem("theme", theme)
}, [theme])

const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    localStorage.removeItem('role')
    navigate("/")
}
const menu = [
    { to: "/patient", label: "Overview", icon: "bi-grid", end: true },
    { to: "/patient/doctors", label: "Find Doctor", icon: "bi-search-heart" },
    { to: "/patient/appointments", label: "My Appointment", icon: "bi-calendar-check" },
    { to: "/patient/medical-history", label: "Medical History", icon: "bi-calendar-plus" },
    { to: "/patient/messages", label: "Messages", icon: "bi bi-chat-dots me-2" },
    { to: "/patient/profile", label: "Profile", icon: "bi-person" },
]

const initials = patient
    ? `${patient.firstName?.[0] || ""}${patient.lastName?.[0] || ""}`.toUpperCase()
    : ""

return (
    <div className="d-flex min-vh-100 bg-body-tertiary">

        {/* Sidebar: fixed on desktop, offcanvas on mobile */}
        <aside id="patientSidebar" className="offcanvas-lg offcanvas-start patient-sidebar bg-body border-end" tabIndex="-1">

            {/* <!-- Brand --> */}
            <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
                <div className="d-flex align-items-center gap-2">
                    <img src="/logo.png" alt="AmazeCare" height="32" />
                    <span className="fw-bold fs-5 brand-text">AmazeCare</span>
                </div>
                <button type="button" className="btn-close d-lg-none"
                    data-bs-dismiss="offcanvas" data-bs-target="#patientSidebar" aria-label="Close"></button>
            </div>

            <nav className="nav flex-column p-3 gap-1 flex-grow-1">
                <small className="text-muted text-uppercase fw-semibold px-2 mb-1">Patient Tools</small>
                {menu.map((m) => (
                    <NavLink
                        key={m.to}
                        to={m.to}
                        end={m.end}
                        className={({ isActive }) =>
                            `nav-link patient-link ${isActive ? "active" : ""}`
                        }
                        onClick={() => {
                            const sidebarEl = document.getElementById("patientSidebar");

                            if (sidebarEl && window.bootstrap?.Offcanvas) {
                                const offcanvasInstance =
                                    window.bootstrap.Offcanvas.getInstance(sidebarEl);

                                if (offcanvasInstance) {
                                    offcanvasInstance.hide();
                                }
                            }
                        }}
                    >
                        <i className={`bi ${m.icon} me-2`}></i>
                        {m.label}
                    </NavLink>
                ))}
            </nav>


            {/* <!-- Logout --> */}
            <div className="p-3 border-top">
                <button className="btn btn-outline-warning w-100" onClick={() => logout()}>
                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                </button>
            </div>
        </aside>

        {/* Main area */}
        <div className="flex-grow-1 d-flex flex-column patient-main">

            {/* <!-- Top bar --> */}
            <header className="d-flex align-items-center justify-content-between bg-body border-bottom px-3 px-md-4 py-2 sticky-top">
                <button className="btn btn-outline-secondary d-lg-none" type="button"
                    data-bs-toggle="offcanvas" data-bs-target="#patientSidebar" aria-label="Open menu">
                    <i className="bi bi-list"></i>
                </button>

                <span className="d-none d-lg-block text-muted small">
                    Welcome back, <span className="fw-semibold text-body">{patient?.firstName}</span>
                </span>

                <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-outline-secondary" aria-label="Toggle theme"
                        onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                        <i className={`bi ${theme === "light" ? "bi-moon" : "bi-sun"}`}></i>
                    </button>

                    {/* <!-- Profile dropdown --> */}
                    <div className="dropdown">
                        <button className="btn d-flex align-items-center gap-2 border-0" type="button"
                            data-bs-toggle="dropdown" aria-expanded="false">
                            <span className="avatar">{initials}</span>
                            <span className="d-none d-md-block text-start lh-sm">
                                <span className="d-block fw-semibold small">{patient?.firstName} {patient?.lastName}</span>
                                <small className="text-muted">Patient</small>
                            </span>
                            <i className="bi bi-chevron-down small"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                            <li><NavLink className="dropdown-item" to="/patient/profile">My Profile</NavLink></li>
                            <li><NavLink className="dropdown-item" to="/patient/update-profile">Update Profile</NavLink></li>
                            <li><hr className="dropdown-divider" /></li>
                            <li><button className="dropdown-item text-danger" onClick={logout}>Logout</button></li>
                        </ul>
                    </div>
                </div>
            </header>

            {/* <!-- Page content --> */}
            <main className="flex-grow-1 p-3 p-md-4">
                <Outlet />
            </main>

        </div>
    </div>
)
}
export default PatientLayout