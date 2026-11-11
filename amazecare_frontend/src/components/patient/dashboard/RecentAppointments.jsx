import { useEffect, useState } from "react"
import { Link } from "react-router"
import axios from "axios"
import { API_SERVER_URL_DEV } from "../../../config"
function RecentAppointments() {
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [errMsg, setErrMsg] = useState("")

    const statusColor = (status) => {
        switch (status) {
            case "REQUESTED": return "warning"
            case "CONFIRMED": return "primary"
            case "COMPLETED": return "info"
            case "CANCELLED": return "danger"
            default: return "secondary" // NO_SHOW
        }
    }
    const dateParts = (d) => {
        const dt = new Date(d + "T00:00:00")
        return {
            day: dt.getDate(),
            month: dt.toLocaleString("en-US", { month: "short" })
        }
    }
    const formatEnum = (value) => {
        if (value === "ENT") return "ENT"
        if (!value) return ""
        return value.toLowerCase().split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    }

    useEffect(() => {
        const getRecent = async () => {
            setErrMsg("")
            try {
                const response = await axios.get(
                    `${API_SERVER_URL_DEV}/api/v1/appointments/patient`,
                    {
                        params: { page: 0, size: 3 },
                        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                    }
                )
                setAppointments(response.data.patientAppointmentList)
            } catch (err) {
                if (!err.response) {
                    setErrMsg("Unable to reach the server. Please try again later.")
                } else {
                    setErrMsg(err.response.data?.message || "Could not load recent appointments.")
                }
            } finally {
                setLoading(false)
            }
        }
        getRecent()
    }, [])

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h5 fw-bold mb-0">Recent Appointments</h2>
                    <Link to="/patient/appointments" className="small fw-semibold text-decoration-none">
                        View all <i className="bi bi-arrow-right"></i>
                    </Link>
                </div>

                {errMsg && <div className="alert alert-danger mb-0" role="alert">{errMsg}</div>}


                { !errMsg && appointments.length === 0 && (
                    <p className="text-muted mb-0">No appointments yet.</p>
                )}

                <div className="d-flex flex-column gap-3">
                    {appointments.map((a) => {
                        const dp = dateParts(a.appointmentDate)
                        return (
                            <div key={a.appointmentId} className="d-flex align-items-center gap-3">
                                <div className="date-box date-box-sm flex-shrink-0 text-center">
                                    <div className="fw-bold lh-1">{dp.day}</div>
                                    <small className="text-uppercase">{dp.month}</small>
                                </div>
                                <div className="flex-grow-1">
                                    <div className="fw-semibold">Dr. {a.doctorFirstName} {a.doctorLastName}</div>
                                    <small className="text-muted">
                                        {formatEnum(a.specialization)} | {a.appointmentTime?.slice(0, 5)}
                                    </small>
                                </div>
                                <span className={`badge rounded-pill text-bg-${statusColor(a.status)}`}>
                                    {formatEnum(a.status)}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
export default RecentAppointments