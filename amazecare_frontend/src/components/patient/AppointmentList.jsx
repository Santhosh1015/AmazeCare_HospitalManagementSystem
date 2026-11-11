import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import axios from "axios"
import { API_SERVER_URL_DEV } from "../../config"
import Swal from "sweetalert2"

function AppointmentList() {
    const [appointments, setAppointments] = useState([])
    const [page, setPage] = useState(0)
    const [size] = useState(5)
    const [totalPages, setTotalPages] = useState(0)
    const [totalRecords, setTotalRecords] = useState(0)
    const [currentPageSize, setCurrentPageSize] = useState(0)
    const [errMsg, setErrMsg] = useState("")

    // for params
    const [status, setStatus] = useState("")
    const [date, setDate] = useState("")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")
    const [selected, setSelected] = useState(null)

    const navigate = useNavigate()

    const [reload, setReload] = useState(0)

    const canModify = (a) => a.status === "REQUESTED" || a.status === "CONFIRMED"

    const dateParts = (d) => {
        const dt = new Date(d + "T00:00:00")
        return {
            day: dt.getDate(),
            month: dt.toLocaleString("en-US", { month: "short" }),
            year: dt.getFullYear()
        }
    }
    const formatEnum = (value) => {
        if (value === "ENT") return "ENT";
        if (!value) return "";

        return value
            .toLowerCase()
            .split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const statusColor = (status) => {
        switch (status) {
            case "SCHEDULED":
            case "CONFIRMED":
                return "primary"
            case "COMPLETED":
                return "info"
            case "CANCELLED":
                return "danger"
            default:
                return "secondary"
        }
    }

    const cancelAppointment = async (a) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Cancel this appointment?",
            showCancelButton: true,
            confirmButtonText: "Yes, cancel it",
            cancelButtonText: "Keep it"
        })
        if (!result.isConfirmed) return

        try {
            await axios.put(
                `${API_SERVER_URL_DEV}/api/v1/appointment/cancel/${a.appointmentId}`,
                {},
                {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }
            )
            await Swal.fire({ icon: "success", title: "Appointment cancelled" })
            setReload(reload + 1)
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Could not cancel",
                text: err?.response?.data?.message || "Please try again."
            })
        }
    }

    useEffect(() => {


        const getAppointments = async () => {
            setErrMsg("")
            try {
                const response = await axios.get(
                    `${API_SERVER_URL_DEV}/api/v1/appointments/patient`,
                    {
                        params: {
                            page,
                            size,
                            ...(status && { status }),
                            ...(date && { date }),
                            ...(fromDate && { fromDate }),
                            ...(toDate && { toDate })
                        },
                        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                    }
                )
                setAppointments(response.data.patientAppointmentList)


                setTotalPages(response.data.paginationResDto.totalPages)
                setTotalRecords(response.data.paginationResDto.totalElements)
                setCurrentPageSize(response.data.paginationResDto.noOfELePerPage)
            } catch (err) {

                if (!err.response) {
                    setErrMsg("Unable to reach the server. Please try again later.");
                } else {
                    setErrMsg(
                        err.response.data?.message || "Could not load appointments."
                    );
                }
            }
        }
        getAppointments()
    }, [page, size, status, date, fromDate, toDate, reload])


    const handleChatWithDoctor = async (doctorId) => {
    try {
        const response = await axios.post(
            `${API_SERVER_URL_DEV}/api/chat/create/conversations`,
            null,
            {
                params: { doctorId },
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token")
                }
            }
        )

        navigate("/patient/messages", {
            state: {
                conversationId: response.data.conversationId
            }
        })

    } catch (err) {
        Swal.fire(
            "Unable to start chat",
            err.response?.data?.message || "Something went wrong.",
            "error"
        )
    }
}

    return (
        <div>

            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                <div>
                    <h1 className="h3 fw-bold mb-1">My Appointments</h1>
                    <p className="text-muted mb-0">Track your upcoming and past visits.</p>
                </div>
            </div>

            {errMsg && (
                <div className="alert alert-danger" role="alert">{errMsg}</div>
            )}

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3 align-items-end">

                        <div className="col-12 col-sm-6 col-lg-3">
                            <label htmlFor="statusFilter" className="form-label small fw-semibold mb-1">Status</label>
                            <select id="statusFilter" value={status} className="form-select"
                                onChange={(e) => { setErrMsg(""); setStatus(e.target.value); setPage(0) }}>
                                <option value="">All statuses</option>
                                <option value="REQUESTED">Requested</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="NO_SHOW">No Show</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-3">
                            <label htmlFor="dateFilter" className="form-label small fw-semibold mb-1">Appointment date</label>
                            <input id="dateFilter" type="date" value={date} className="form-control"
                                onChange={(e) => { setDate(e.target.value); setFromDate(""); setToDate(""); setPage(0) }} />
                        </div>

                        <div className="col-12 col-sm-6 col-lg-2">
                            <label htmlFor="fromFilter" className="form-label small fw-semibold mb-1">From date</label>
                            <input id="fromFilter" type="date" value={fromDate} className="form-control"
                                onChange={(e) => { setFromDate(e.target.value); setDate(""); setPage(0) }} />
                        </div>

                        <div className="col-12 col-sm-6 col-lg-2">
                            <label htmlFor="toFilter" className="form-label small fw-semibold mb-1">To date</label>
                            <input id="toFilter" type="date" value={toDate} min={fromDate || undefined} className="form-control"
                                onChange={(e) => { setToDate(e.target.value); setDate(""); setPage(0) }} />
                        </div>

                        <div className="col-12 col-lg-2">
                            <button type="button" className="btn btn-outline-secondary w-100"
                                onClick={() => { setStatus(""); setDate(""); setFromDate(""); setToDate(""); setPage(0) }}>
                                <i className="bi bi-arrow-counterclockwise me-1"></i>Clear
                            </button>
                        </div>

                    </div>
                </div>
            </div>
            {appointments?.length === 0 && (
                <div className="card border-0 shadow-sm text-center p-5">
                    <i className="bi bi-calendar-x fs-1 text-muted"></i>
                    <p className="mb-0 mt-2 text-muted">No appointments found.</p>
                </div>
            )}


            <div className="d-flex flex-column gap-3">
                {appointments?.map((a) => {
                    const dp = dateParts(a.appointmentDate)
                    const assigned = a.doctorFirstName !== null && a.doctorFirstName !== undefined

                    return (
                        <div key={a.appointmentId} className="card border-0 shadow-sm appointment-card">

                            {/* Top: date, doctor, status */}
                            <div className="card-body d-flex align-items-start gap-3">

                                <div className="date-box flex-shrink-0 text-center">
                                    <div className="fs-4 fw-bold lh-1">{dp.day}</div>
                                    <small className="text-uppercase">{dp.month}</small>
                                </div>

                                <div className="flex-grow-1">
                                    {assigned ? (
                                        <>
                                            <h3 className="h6 fw-bold mb-1">
                                                Dr. {a.doctorFirstName} {a.doctorLastName}
                                            </h3>
                                            <div className="small fw-semibold specialization">
                                                {formatEnum(a.specialization)}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="h6 fw-bold mb-1 text-muted">
                                                <i className="bi bi-hourglass-split me-1"></i>
                                                Doctor to be assigned
                                            </h3>
                                            <div className="small text-muted">
                                                Our team is finding the right doctor for you.
                                            </div>
                                        </>
                                    )}

                                    <div className="small text-muted mt-2 d-flex flex-wrap gap-3">
                                        <span>
                                            <i className="bi bi-clock me-1"></i>
                                            {a.appointmentTime
                                                ? a.appointmentTime.slice(0, 5)
                                                : "Time to be confirmed"}
                                        </span>

                                        <span>
                                            <i className="bi bi-hospital me-1"></i>
                                            {formatEnum(a.visitType)}
                                        </span>
                                    </div>
                                </div>

                                <span className={`badge rounded-pill text-bg-${statusColor(a.status)}`}>
                                    {formatEnum(a.status)}
                                </span>
                            </div>

                            {/* Chat action */}
                            {assigned && a.status === "COMPLETED" && (
                                <div className="px-3 pb-3 d-flex justify-content-end">
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm fw-semibold"
                                        onClick={() => handleChatWithDoctor(a.doctorId)}
                                    >
                                        <i className="bi bi-chat-dots me-2"></i>
                                        Chat with Doctor
                                    </button>
                                </div>
                            )}

                            {/* Bottom: actions */}
                            <div className="card-footer bg-transparent border-top d-flex flex-wrap justify-content-between align-items-center gap-2">

                                <button
                                    type="button"
                                    className="btn btn-link text-decoration-none p-0 fw-semibold"
                                    onClick={() => setSelected(a)}
                                >
                                    <i className="bi bi-eye me-1"></i>
                                    View details
                                </button>

                                {canModify(a) && (
                                    <div className="d-flex gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={() => navigate(
                                                `/patient/reschedule/${a.appointmentId}`,
                                                { state: a }
                                            )}
                                        >
                                            <i className="bi bi-calendar2-week me-1"></i>
                                            Reschedule
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => cancelAppointment(a)}
                                        >
                                            <i className="bi bi-x-circle me-1"></i>
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>
                    )
                })}
            </div>


            {/* <!-- Pagination --> */}
            {totalPages > 1 && (
                <nav className="mt-4" aria-label="Appointment pages">
                    <ul className="pagination justify-content-center mb-2">
                        <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
                            <button className="page-link" onClick={() => setPage(page - 1)}>
                                <i className="bi bi-chevron-left"></i>
                            </button>
                        </li>

                        {Array.from({ length: totalPages }, (e, index) => (
                            <li key={index} className={`page-item ${index === page ? "active" : ""}`}>
                                <button className="page-link" onClick={() => setPage(index)}>{index + 1}</button>
                            </li>
                        ))}

                        <li className={`page-item ${page === totalPages - 1 ? "disabled" : ""}`}>
                            <button className="page-link" onClick={() => setPage(page + 1)}>
                                <i className="bi bi-chevron-right"></i>
                            </button>
                        </li>
                    </ul>
                    <p className="text-center text-muted small mb-0">
                        {`Page ${page + 1} of ${totalPages} | Showing ${currentPageSize} of ${totalRecords} records`}
                    </p>
                </nav>
            )}
            {selected && (
                <>
                    <div className="modal d-block" tabIndex="-1" role="dialog" onClick={() => setSelected(null)}>
                        <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-content border-0 shadow">
                                <div className="modal-header">
                                    <h5 className="modal-title fw-bold">Appointment Details</h5>
                                    <button type="button" className="btn-close" aria-label="Close"
                                        onClick={() => setSelected(null)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <div className="fw-bold">Dr. {selected.doctorFirstName} {selected.doctorLastName}</div>
                                            <small className="specialization fw-semibold">{formatEnum(selected.specialization)}</small>
                                        </div>
                                        <span className={`badge rounded-pill text-bg-${statusColor(selected.status)}`}>
                                            {formatEnum(selected.status)}
                                        </span>
                                    </div>

                                    <dl className="row mb-0 small">
                                        <dt className="col-4 text-muted">Appointment ID</dt>
                                        <dd className="col-8">#{selected.appointmentId}</dd>
                                        <dt className="col-4 text-muted">Date</dt>
                                        <dd className="col-8">{selected.appointmentDate}</dd>
                                        <dt className="col-4 text-muted">Time</dt>
                                        <dd className="col-8">{selected.appointmentTime?.slice(0, 5)}</dd>
                                        <dt className="col-4 text-muted">Visit type</dt>
                                        <dd className="col-8">{formatEnum(selected.visitType)}</dd>
                                        <dt className="col-4 text-muted">Reason</dt>
                                        <dd className="col-8">{selected.reason}</dd>
                                    </dl>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop show"></div>
                </>
            )}
        </div>
    )
}
export default AppointmentList