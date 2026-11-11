import { useEffect, useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router"
import axios from "axios"
import "../../styles/PatientLayout.css"
import { API_SERVER_URL_DEV } from "../../config"

function ExecutiveLayout() {
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light")
    const [name, setName] = useState("")

    const navigate = useNavigate()

    const menu = [
        { to: "/executive", label: "Overview", icon: "bi-grid", end: true },
        { to: "/executive/appointments", label: "Appointments", icon: "bi-calendar-check" },
        { to: "/executive/requests", label: "Requests", icon: "bi-inbox" },
        { to: "/executive/doctors", label: "Doctors", icon: "bi-person-badge" },
        { to: "/executive/patients", label: "Patients", icon: "bi-people" },
    ]

    // only EXECUTIVE can stay here
    useEffect(() => {
        if (!localStorage.getItem('token') || localStorage.getItem('role') !== 'EXECUTIVE') {
            navigate("/no-access")
        }
    }, [])

    // name for the top bar (summary API returns executiveName)
    useEffect(() => {
        const getName = async () => {
            try {
                const response = await axios.get(
                    `${API_SERVER_URL_DEV}/api/v1/appointments/executive/summary`,
                    {
                        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                    }
                )
                setName(response.data.executiveName)
            } catch (err) {
                console.log(err)
            }
        }
        getName()
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

    const initials = name ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : ""

    return (
        <div className="d-flex min-vh-100 bg-body-tertiary">

            {/* Sidebar: fixed on desktop, offcanvas on mobile */}
            <aside id="executiveSidebar" className="offcanvas-lg offcanvas-start patient-sidebar bg-body border-end" tabIndex="-1">

                {/* <!-- Brand --> */}
                <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                        <img src="/logo.png" alt="AmazeCare" height="32" />
                        <div className="lh-1">
                            <span className="fw-bold fs-5 brand-text d-block">AmazeCare</span>
                            <small className="text-muted">Executive Portal</small>
                        </div>
                    </div>
                    <button type="button" className="btn-close d-lg-none"
                        data-bs-dismiss="offcanvas" data-bs-target="#executiveSidebar" aria-label="Close"></button>
                </div>


                <nav className="nav flex-column p-3 gap-1 flex-grow-1">
                    {menu.map((m) => (
                        <NavLink
                            key={m.to}
                            to={m.to}
                            end={m.end}
                            className={({ isActive }) =>
                                `nav-link patient-link ${isActive ? "active" : ""}`
                            }
                            onClick={() => {
                                const sidebarEl =
                                    document.getElementById("executiveSidebar");

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
                    <button className="btn btn-outline-danger w-100" onClick={logout}>
                        <i className="bi bi-box-arrow-right me-2"></i>Sign out
                    </button>
                </div>
            </aside>

            {/* Main area */}
            <div className="flex-grow-1 d-flex flex-column patient-main">

                {/* <!-- Top bar --> */}
                <header className="d-flex align-items-center justify-content-between bg-body border-bottom px-3 px-md-4 py-2 sticky-top">
                    <button className="btn btn-outline-secondary d-lg-none" type="button"
                        data-bs-toggle="offcanvas" data-bs-target="#executiveSidebar" aria-label="Open menu">
                        <i className="bi bi-list"></i>
                    </button>

                    <span className="d-none d-lg-block text-muted small">
                        Welcome back, <span className="fw-semibold text-body">{name}</span>
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
                                    <span className="d-block fw-semibold small">{name}</span>
                                    <small className="text-muted">Executive</small>
                                </span>
                                <i className="bi bi-chevron-down small"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                                <li><button className="dropdown-item text-danger" onClick={logout}>Sign out</button></li>
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
export default ExecutiveLayout