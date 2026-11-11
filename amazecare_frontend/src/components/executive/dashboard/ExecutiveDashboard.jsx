import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router"
import { API_SERVER_URL_DEV } from "../../../config"
import PendingRequests from "./PendingRequests"
import TodayAppointments from "./TodayAppointments"
import StatCard from "./StatCard"

function ExecutiveDashboard() {
    const navigate = useNavigate()

    const [summary, setSummary] = useState(null)
    const [errMsg, setErrMsg] = useState("")

    useEffect(() => {
        const getSummary = async () => {
            setErrMsg("")
            try {
                const response = await axios.get(
                    `${API_SERVER_URL_DEV}/api/v1/appointments/executive/summary`,
                    {
                        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                    }
                )
                setSummary(response.data)
            } catch (err) {
                if (!err.response) {
                    setErrMsg("Unable to reach the server. Please try again later.")
                } else {
                    setErrMsg(err.response.data?.message || "Could not load the dashboard.")
                }
            }
        }
        getSummary()
    }, [])

    const val = (v) => (summary ? v : "-")

    const stats = [
        { label: "Pending requests", value: val(summary?.pendingRequests), icon: "bi-hourglass-split", color: "warning" },
        { label: "Today's appointments", value: val(summary?.todayAppointments), icon: "bi-calendar-event", color: "primary" },
        { label: "Confirmed", value: val(summary?.confirmedAppointments), icon: "bi-check2-circle", color: "success" },
        { label: "Cancelled", value: val(summary?.cancelledAppointments), icon: "bi-x-circle", color: "danger" },
    ]

    return (
        <div>
            {errMsg && <div className="alert alert-danger" role="alert">{errMsg}</div>}

            {/* <!-- Welcome banner --> */}
            <div className="welcome-banner rounded-4 p-4 mb-4 text-white">
                <h1 className="h3 fw-bold mb-1">
                    {summary ? `Welcome back, ${summary.executiveName}!` : "Welcome back!"}
                </h1>
                <p className="mb-0 opacity-75">Manage appointments, patient requests and registrations.</p>
            </div>

            {/* <!-- Stat cards --> */}
            <div className="row g-3 mb-4">
                {stats.map((s) => (
                    <div key={s.label} className="col-6 col-lg-3">
                        <StatCard {...s} />
                    </div>
                ))}
            </div>

            {/* <!-- Lists --> */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-lg-6">
                    <PendingRequests />
                </div>
                <div className="col-12 col-lg-6">
                    <TodayAppointments />
                </div>
            </div>

            {/* <!-- Quick actions --> */}
            <h2 className="h6 fw-bold mb-3">Quick Actions</h2>
            <div className="row g-3">
                <div className="col-12 col-md-4">
                    <button type="button" className="btn btn-outline-primary w-100 py-3 fw-semibold"
                        onClick={() => navigate("/executive/patients")}>
                        <i className="bi bi-person-plus me-2"></i>Register Patient
                    </button>
                </div>
                <div className="col-12 col-md-4">
                    <button type="button" className="btn btn-outline-primary w-100 py-3 fw-semibold"
                        onClick={() => navigate("/executive/patients")}>
                        <i className="bi bi-search me-2"></i>Find Patient
                    </button>
                </div>
                <div className="col-12 col-md-4">
                    <button type="button" className="btn btn-outline-primary w-100 py-3 fw-semibold"
                        onClick={() => navigate("/executive/doctors")}>
                        <i className="bi bi-calendar-plus me-2"></i>Book Appointment
                    </button>
                </div>
            </div>
        </div>
    )
}
export default ExecutiveDashboard