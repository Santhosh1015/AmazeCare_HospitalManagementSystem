import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import axios from "axios"
import { API_SERVER_URL_DEV } from "../../../config"
function NextAppointment() {
    const [next, setNext] = useState(null)
    const [loading, setLoading] = useState(true)
    const [errMsg, setErrMsg] = useState("")
    const formatEnum = (value) => {
        if (value === "ENT") return "ENT"
        if (!value) return ""
        return value.toLowerCase().split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    }

    const statusColor = (status) => {
        switch (status) {
            case "REQUESTED": return "warning"
            case "CONFIRMED": return "primary"
            case "COMPLETED": return "success"
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

    // yyyy-MM-dd in local time
    const todayString = () => new Date().toLocaleDateString("en-CA")

    const navigate = useNavigate()

    useEffect(() => {
        const getNext = async () => {
            setErrMsg("")
            try {
                const response = await axios.get(
                    `${API_SERVER_URL_DEV}/api/v1/appointments/patient`,
                    {
                        params: { fromDate: todayString(), page: 0, size: 20 },
                        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                    }
                )
                const now = new Date()
                const upcoming = response.data.patientAppointmentList
                    .filter((a) => a.status === "REQUESTED" || a.status === "CONFIRMED")
                    .filter((a) => new Date(`${a.appointmentDate}T${a.appointmentTime}`) >= now)
                    .sort((a, b) =>
                        new Date(`${a.appointmentDate}T${a.appointmentTime}`) -
                        new Date(`${b.appointmentDate}T${b.appointmentTime}`))

                setNext(upcoming[0] || null)
            } catch (err) {
                if (!err.response) {
                    setErrMsg("Unable to reach the server. Please try again later.")
                } else {
                    setErrMsg(err.response.data?.message || "Could not load your next appointment.")
                }
            } finally {
                setLoading(false)
            }
        }
        getNext()
    }, [])

    const dp = next ? dateParts(next.appointmentDate) : null

    return (
        <div className="card border-0 shadow-sm mb-4 next-appointment">
            <div className="card-body p-4">
                <h2 className="h5 fw-bold mb-3">Next Appointment</h2>

                {errMsg && <div className="alert alert-danger mb-0" role="alert">{errMsg}</div>}

                {loading && <span className="spinner-border spinner-border-sm"></span>}

                {!loading && !errMsg && !next && (
                    <div className="text-center text-muted py-3">
                        <i className="bi bi-calendar-x fs-1 d-block mb-2"></i>
                        <p className="mb-3">You have no upcoming appointments.</p>
                        <button type="button" className="btn btn-primary"
                            onClick={() => navigate("/patient/doctors")}>
                            Book your first appointment
                        </button>
                    </div>
                )}

                {next && (
                    <div className="d-flex flex-column flex-md-row align-items-md-center gap-3">
                        <div className="date-box flex-shrink-0 text-center">
                            <div className="fs-4 fw-bold lh-1">{dp.day}</div>
                            <small className="text-uppercase">{dp.month}</small>
                        </div>

                        <div className="flex-grow-1">
                            <h3 className="h6 fw-bold mb-1">Dr. {next.doctorFirstName} {next.doctorLastName}</h3>
                            <div className="small fw-semibold specialization">{formatEnum(next.specialization)}</div>
                            <div className="small text-muted mt-1">
                                <i className="bi bi-clock me-1"></i>{next.appointmentTime?.slice(0, 5)}
                                <span className="mx-2">|</span>
                                <i className="bi bi-hospital me-1"></i>{formatEnum(next.visitType)}
                            </div>
                        </div>

                        <div className="d-flex flex-md-column align-items-center align-items-md-end gap-2">
                            <span className={`badge rounded-pill text-bg-${statusColor(next.status)}`}>
                                {formatEnum(next.status)}
                            </span>
                            <button type="button" className="btn btn-outline-primary btn-sm"
                                onClick={() => navigate("/patient/appointments")}>
                                <i className="bi bi-eye me-1"></i>View Details
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
export default NextAppointment