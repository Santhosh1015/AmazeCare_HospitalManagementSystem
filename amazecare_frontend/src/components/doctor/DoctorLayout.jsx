
import { useEffect, useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router"
import "../../styles/PatientLayout.css"
import { API_SERVER_URL_DEV } from "../../config"
import axios from "axios"

function DoctorLayout() {
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light")

    const navigate = useNavigate()

    const [doctor , setDoctor] = useState({})
    const [errMsg , setErrMsg] = useState("")


    useEffect(() => {
          const fetchDoctorProfile = async () => {       
            try {
                const response = await axios.get(
                    `${API_SERVER_URL_DEV}/api/v1/doctor/profile`,
                    {
                        headers: {
                            Authorization: "Bearer " + localStorage.getItem("token")
                        }
                    }
                )
  
                setDoctor(response.data)
            } catch (err) {
               setErrMsg(err?.response?.data?.message)
            }
        }

        fetchDoctorProfile()
    }, [])

    useEffect(() => {
        document.documentElement.setAttribute("data-bs-theme", theme)
        localStorage.setItem("theme", theme)
    }, [theme])

    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("email")
        localStorage.removeItem("role")
        navigate("/")
    }

    const menu = [
        { to: "/doctor", label: "Overview", icon: "bi-grid", end: true },
        { to: "/doctor/appointments", label: "My Appointments", icon: "bi-calendar-check" },
        { to: "/doctor/patients", label: "My Patients", icon: "bi-people" },
        { to: "/doctor/messages", label: "Messages", icon: "bi bi-chat-dots me-2" },
        { to: "/doctor/profile", label: "My Profile", icon: "bi-person" }
    ]

    const initials = doctor
        ? `${doctor.firstName?.[0] || ""}${doctor.lastName?.[0] || ""}`.toUpperCase()
        : ""

    return (
        <div className="d-flex min-vh-100 bg-body-tertiary">

            {/* Sidebar */}
            <aside id="doctorSidebar"
                className="offcanvas-lg offcanvas-start patient-sidebar bg-body border-end"
                tabIndex="-1">

                <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                        <img src="/logo.png" alt="AmazeCare" height="32" />
                        <span className="fw-bold fs-5 brand-text">AmazeCare</span>
                    </div>

                    <button type="button" className="btn-close d-lg-none"
                        data-bs-dismiss="offcanvas"
                        data-bs-target="#doctorSidebar"
                        aria-label="Close"></button>
                </div>

                <nav className="nav flex-column p-3 gap-1 flex-grow-1">
                    <small className="text-muted text-uppercase fw-semibold px-2 mb-1">
                        Doctor Tools
                    </small>

                    {menu.map((m) => (
                        <NavLink key={m.to} to={m.to} end={m.end} className={({ isActive }) =>  `nav-link patient-link ${isActive ? "active" : ""}` }
                         onClick={() => {
                                const sidebarEl = document.getElementById("doctorSidebar")

                                if (sidebarEl && window.bootstrap?.Offcanvas) {
                                    const instance = window.bootstrap.Offcanvas.getInstance(sidebarEl)
                                    if (instance) instance.hide()
                                }
                            }}
                        >
                            <i className={`bi ${m.icon} me-2`}></i>
                            {m.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-3 border-top">
                    <button className="btn btn-outline-warning w-100" onClick={logout}>
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main area */}
            <div className="flex-grow-1 d-flex flex-column patient-main">

                {/* Top bar */}
                <header className="d-flex align-items-center justify-content-between bg-body border-bottom px-3 px-md-4 py-2 sticky-top">

                    <button className="btn btn-outline-secondary d-lg-none"
                        type="button"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#doctorSidebar"
                        aria-label="Open menu">
                        <i className="bi bi-list"></i>
                    </button>

                    <span className="d-none d-lg-block text-muted small">
                        Welcome back,{" "}
                        <span className="fw-semibold text-body">
                            Dr. {doctor?.firstName}
                        </span>
                    </span>

                    <div className="d-flex align-items-center gap-2">

                        {/* Theme toggle */}
                        <button className="btn btn-outline-secondary"
                            aria-label="Toggle theme"
                            onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                            <i className={`bi ${theme === "light" ? "bi-moon" : "bi-sun"}`}></i>
                        </button>

                        {/* Profile dropdown */}
                        <div className="dropdown">
                            <button className="btn d-flex align-items-center gap-2 border-0"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false">

                                <span className="avatar">{initials}</span>

                                <span className="d-none d-md-block text-start lh-sm">
                                    <span className="d-block fw-semibold small">
                                        Dr. {doctor?.firstName} {doctor?.lastName}
                                    </span>
                                    <small className="text-muted">Doctor</small>
                                </span>

                                <i className="bi bi-chevron-down small"></i>
                            </button>

                            <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                                <li>
                                    <NavLink className="dropdown-item" to="/doctor/profile">
                                        My Profile
                                    </NavLink>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                    <button className="dropdown-item text-danger" onClick={logout}>
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-grow-1 p-3 p-md-4">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default DoctorLayout
