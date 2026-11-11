
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import axios from "axios"
import { API_SERVER_URL_DEV } from "../../config"
function DoctorAppointments() {
    const [appointments, setAppointments] = useState([])

    const [page, setPage] = useState(0)
    const [totPage, setTotPage] = useState(0)

    const [search, setSearch] = useState("")
    const [status, setStatus] = useState("")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")

    const [errMsg, setErrMsg] = useState("")
    const [errComment, setErrComment] = useState("")

    const navigate = useNavigate()

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setErrMsg("")
                setErrComment("")

                const response = await axios.get(
                    `${API_SERVER_URL_DEV}/api/v1/appointments/doctor`,
                    {
                        params: {
                            page,
                            size: 10,
                            ...(status && { status }),
                            ...(fromDate && { fromDate }),
                            ...(toDate && { toDate })
                        },
                        headers: {
                            Authorization: "Bearer " + localStorage.getItem("token")
                        }
                    }
                )
                setAppointments(response.data.content)
                setTotPage(response.data.totalPages)

            } catch (err) {
                setErrMsg(err.response?.data?.message ||
                    "Unable to reach the server. Please try again later.")
                setErrComment(err.response?.data?.comments || "")
            }
        }

        fetchAppointments()
    }, [page, status, fromDate, toDate])

    const filteredAppointments = appointments?.filter((a) =>
        `${a.patientFirstName ?? ''} ${a.patientLastName ?? ''}`.toLowerCase().includes(search.toLowerCase())
    )

    const formatEnum = (value) => {
        if (!value) return ""
        return value.toLowerCase()
            .split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
    }

    const getStatusColor = (value) => {
        switch (value) {
            case "CONFIRMED": return "success"
            case "COMPLETED": return "primary"
            case "REQUESTED": return "warning"
            case "CANCELLED": return "danger"
            case "NO_SHOW": return "secondary"
            default: return "secondary"
        }
    }

    const viewAppointment = (appointment) => {
        navigate("/doctor/appointments/details", {
            state: { appointment }
        })
    }
    const handleConsult = (appointment) => {
        navigate("/doctor/appointments/consultation", {
            state: { appointment }
        })
    }

    const viewConsultation = (appointment) =>{
        navigate("/doctor/appointments/consultation-details",{
            state:{appointment}
        })
    }
    return (
        <div>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                <div>
                    <h1 className="h3 fw-bold mb-1">My Appointments</h1>
                    <p className="text-muted mb-0">
                        View and manage your assigned appointments.
                    </p>
                </div>
            </div>

            {errMsg && (
                <div className="alert alert-danger">
                    <div>{errMsg}</div>
                    {errComment && <small>{errComment}</small>}
                </div>
            )}

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label small fw-semibold">
                                Search Patient
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Patient name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label small fw-semibold">
                                Status
                            </label>
                            <select className="form-select"
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value)
                                    setPage(0)
                                }}>
                                <option value="">All Status</option>
                                <option value="REQUESTED">Requested</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                                <option value="NO_SHOW">No Show</option>
                            </select>
                        </div>

                        <div className="col-md-2">
                            <label className="form-label small fw-semibold">
                                From Date
                            </label>
                            <input type="date" className="form-control"
                                value={fromDate}
                                onChange={(e) => {
                                    setFromDate(e.target.value)
                                    setPage(0)
                                }} />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label small fw-semibold">
                                To Date
                            </label>
                            <input type="date" className="form-control"
                                value={toDate}
                                min={fromDate || undefined}
                                onChange={(e) => {
                                    setToDate(e.target.value)
                                    setPage(0)
                                }} />
                        </div>

                        <div className="col-md-2 d-flex align-items-end">
                            <button className="btn btn-outline-secondary w-100"
                                onClick={() => {
                                    setSearch("")
                                    setStatus("")
                                    setFromDate("")
                                    setToDate("")
                                    setPage(0)
                                }}>
                                <i className="bi bi-arrow-counterclockwise me-2"></i>
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            <div className="row g-3">
                {filteredAppointments?.length === 0 ? (
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center text-muted py-5">
                                No appointments found.
                            </div>
                        </div>
                    </div>
                ) : (
                    filteredAppointments?.map((a) => (
                        <div className="col-12" key={a.appointmentId}>
                            <div className="card border-0 shadow-sm">
                                <div className="card-body p-3">
                                    <div className="row align-items-center g-3">

                                        {/* Patient details */}
                                        <div className="col-md-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="rounded-circle bg-body-tertiary
                                        text-primary d-flex align-items-center
                                        justify-content-center"
                                                    style={{ width: "45px", height: "45px" }}>
                                                    <i className="bi bi-person fs-4"></i>
                                                </div>

                                                <div>
                                                    <h6 className="fw-bold mb-1">
                                                        {a.patientFirstName} {a.patientLastName}
                                                    </h6>
                                                    <small className="text-muted">
                                                        {a.patientPhone}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Appointment details */}
                                        <div className="col-md-2">
                                            <small className="text-muted d-block">
                                                Appointment Date
                                            </small>
                                            <span className="fw-semibold">
                                                <i className="bi bi-calendar3 me-2 text-primary"></i>
                                                {a.appointmentDate}
                                            </span>
                                        </div>

                                        <div className="col-md-2">
                                            <small className="text-muted d-block">
                                                Time
                                            </small>
                                            <span className="fw-semibold">
                                                <i className="bi bi-clock me-2 text-primary"></i>
                                                {a.appointmentTime}
                                            </span>
                                        </div>

                                        <div className="col-md-2">
                                            <small className="text-muted d-block">
                                                Visit Type
                                            </small>
                                            <span className="fw-semibold">
                                                {formatEnum(a.visitType)}
                                            </span>
                                        </div>

                                        {/* Status and actions */}
                                        <div className="col-md-3">
                                            <div className="d-flex flex-column
                                    align-items-md-end gap-2">

                                                <span className={`badge text-bg-${getStatusColor(a.status)}`}>
                                                    {formatEnum(a.status)}
                                                </span>

                                                <div className="d-flex gap-2">
                                                    <button className="btn btn-sm btn-outline-primary" onClick={() => viewAppointment(a)}  >
                                                        <i className="bi bi-eye me-1"></i>
                                                        View
                                                    </button>

                                                    {a.status === "CONFIRMED" && (
                                                        <button className="btn btn-sm btn-primary"onClick={() => handleConsult(a)}  >
                                                            <i className="bi bi-clipboard2-pulse me-1"></i>
                                                            Consult
                                                        </button>
                                                    )}

                                                    {a.status === "COMPLETED" && (
                                                        <button className="btn btn-sm btn-outline-success ms-2"  onClick={() => viewConsultation(a)}>
                                                            <i className="bi bi-file-medical me-1"></i>
                                                            View Consultation
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reason */}
                                        <div className="col-12">
                                            <div className="border-top pt-2">
                                                <small className="text-muted">
                                                    Reason:
                                                </small>
                                                <span className="ms-2">
                                                    {a.reason || "Not specified"}
                                                </span>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>


            {totPage > 1 && (
                <nav className="mt-4" aria-label="Appointment pages">
                    <ul className="pagination justify-content-center mb-2">
                        <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
                            <button className="page-link" disabled={page === 0}
                                onClick={() => setPage(page - 1)}>
                                <i className="bi bi-chevron-left"></i>
                            </button>
                        </li>

                        {Array.from({ length: totPage }, (e, index) => (
                            <li key={index}
                                className={`page-item ${index === page ? "active" : ""}`}>
                                <button className="page-link"
                                    onClick={() => setPage(index)}>
                                    {index + 1}
                                </button>
                            </li>
                        ))}

                        <li className={`page-item ${page === totPage - 1 ? "disabled" : ""}`}>
                            <button className="page-link"
                                disabled={page === totPage - 1}
                                onClick={() => setPage(page + 1)}>
                                <i className="bi bi-chevron-right"></i>
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    )
}

export default DoctorAppointments
