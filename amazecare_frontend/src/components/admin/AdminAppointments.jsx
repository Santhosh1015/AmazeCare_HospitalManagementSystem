import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getAdminAppointments } from "../../store/actions/AdminActions"

function AdminAppointments() {

    const [page, setPage] = useState(0)
    const [size] = useState(5)

    const [status, setStatus] = useState("")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")

    const [errMsg, setErrMsg] = useState("")
    const [selected, setSelected] = useState(null)

    const dispatch = useDispatch()

    const appointmentsData = useSelector(
        (state) => state.adminData.appointments
    )

    const appointments = appointmentsData?.adminAppointmentRes || []
    const totalPages = appointmentsData?.paginationResDto?.totalPages || 0
    const totalElements = appointmentsData?.paginationResDto?.totalElements || 0

    const formatEnum = (value) => {
        if (!value) return ""

        return value.toLowerCase().split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    }

    const getStatusClass = (value) => {
        switch (value) {
            case "CONFIRMED":
                return "text-bg-success"

            case "REQUESTED":
                return "text-bg-warning"

            case "COMPLETED":
                return "text-bg-primary"

            case "CANCELLED":
                return "text-bg-danger"

            default:
                return "text-bg-secondary"
        }
    }

    // Fetch appointments using Redux
    useEffect(() => {

        const getAppointments = async () => {

            setErrMsg("")

            try {

                await dispatch(
                    getAdminAppointments(page, size, status, fromDate, toDate)
                )

            } catch (err) {

                if (!err.response) {
                    setErrMsg("Unable to reach the server. Please try again later.")
                } else {
                    setErrMsg(
                        err.response.data?.message || "Unable to fetch appointments."
                    )
                }

            }
        }

        getAppointments()

    }, [dispatch, page, size, status, fromDate, toDate])


    // Filters (reset to first page on every change)
    const handleStatusChange = (value) => {
        setStatus(value)
        setPage(0)
    }

    const handleFromDateChange = (value) => {
        setFromDate(value)
        setPage(0)
    }

    const handleToDateChange = (value) => {
        setToDate(value)
        setPage(0)
    }

    const clearFilters = () => {
        setStatus("")
        setFromDate("")
        setToDate("")
        setPage(0)
    }

    // Appointment details modal
    const handleViewDetails = (appointment) => {
        setSelected(appointment)
    }

    const closeDetails = () => {
        setSelected(null)
    }

    return (
        <div>

            {/* Header */}
            <div className="mb-4">
                <h1 className="h3 fw-bold mb-1">
                    Appointments
                </h1>
                <p className="text-muted mb-0">
                    View and manage all hospital appointments.
                </p>
            </div>

            {errMsg && (
                <div className="alert alert-danger">
                    {errMsg}
                </div>
            )}

            {/* Filters */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3 align-items-end">

                        <div className="col-12 col-md-4">
                            <label className="form-label small fw-semibold">
                                Appointment Status
                            </label>

                            <select
                                className="form-select"
                                value={status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="REQUESTED">Requested</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        <div className="col-12 col-md-3">
                            <label className="form-label small fw-semibold">
                                From Date
                            </label>

                            <input
                                type="date"
                                className="form-control"
                                value={fromDate}
                                max={toDate || undefined}
                                onChange={(e) => handleFromDateChange(e.target.value)}
                            />
                        </div>

                        <div className="col-12 col-md-3">
                            <label className="form-label small fw-semibold">
                                To Date
                            </label>

                            <input
                                type="date"
                                className="form-control"
                                value={toDate}
                                min={fromDate || undefined}
                                onChange={(e) => handleToDateChange(e.target.value)}
                            />
                        </div>

                        <div className="col-12 col-md-2">
                            <button
                                type="button"
                                className="btn btn-outline-secondary w-100"
                                onClick={clearFilters}
                            >
                                <i className="bi bi-arrow-counterclockwise me-1"></i>
                                Clear
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* Appointment Cards */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-body py-3 d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="mb-1 fw-semibold">Appointment Management</h5>
                        <small className="text-muted">Filter and manage appointments</small>
                    </div>
                    <span className="badge text-bg-light border">{totalElements} Appointments</span>
                </div>

                <div className="card-body">
                    <div className="row g-3">
                        {!errMsg && appointments.length === 0 && (
                            <div className="col-12">
                                <div className="text-center py-5">
                                    <i className="bi bi-calendar-x fs-1 text-muted d-block mb-2"></i>
                                    <h6 className="fw-semibold">No Appointments Found</h6>
                                    <p className="text-muted small mb-0">No appointments match your filters.</p>
                                </div>
                            </div>
                        )}

                        {appointments.map((a, index) => (
                            <div className="col-12" key={a.appointmentId}>
                                <div className="card border shadow-none">
                                    <div className="card-body p-3">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div>
                                                <h6 className="fw-bold mb-1">{a.patientName}</h6>
                                                <small className="text-muted">
                                                    Appointment #{a.appointmentId} · {a.doctorName || "Not assigned"}
                                                </small>
                                            </div>
                                            <span className={`badge ${getStatusClass(a.status)}`}>
                                                {formatEnum(a.status)}
                                            </span>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="small fw-medium">
                                                <i className="bi bi-calendar3 me-2 text-muted"></i>
                                                {a.appointmentDate}
                                            </span>
                                            <span className="small fw-medium">
                                                <i className="bi bi-clock me-2 text-muted"></i>
                                                {a.appointmentTime}
                                            </span>
                                        </div>

                                        <div className="d-flex justify-content-end">
                                            <button type="button" className="btn btn-outline-primary btn-sm"
                                                onClick={() => handleViewDetails(a)}>
                                                <i className="bi bi-eye me-1"></i>View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            {/* Pagination Note */}
            <div className="mt-3 text-muted small">
                Showing {appointments.length} appointments on page {page + 1}.
            </div>

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
                        {`Page ${page + 1} of ${totalPages}`}
                    </p>
                </nav>
            )}

            {/* Appointment Details Modal */}
            {selected && (
                <>
                    <div
                        className="modal d-block"
                        tabIndex="-1"
                        role="dialog"
                        onClick={closeDetails}
                    >
                        <div
                            className="modal-dialog modal-dialog-centered"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-content border-0 shadow">

                                <div className="modal-header">
                                    <h5 className="modal-title fw-bold">
                                        Appointment Details
                                    </h5>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        aria-label="Close"
                                        onClick={closeDetails}
                                    ></button>
                                </div>

                                <div className="modal-body">

                                    <div className="mb-3">
                                        <small className="text-muted">Appointment ID</small>
                                        <h6 className="fw-semibold">#{selected.appointmentId}</h6>
                                    </div>

                                    <div className="row g-3">

                                        <div className="col-6">
                                            <small className="text-muted">Patient</small>
                                            <p className="fw-semibold mb-0">
                                                {selected.patientName}
                                            </p>
                                        </div>

                                        <div className="col-6">
                                            <small className="text-muted">Phone</small>
                                            <p className="fw-semibold mb-0">
                                                {selected.patientPhone || "-"}
                                            </p>
                                        </div>


                                        <div className="col-12">
                                            <small className="text-muted">Doctor</small>
                                            <p className="fw-semibold mb-0">
                                                {selected.doctorName || "Not assigned"}
                                            </p>
                                            <small className="text-muted">
                                                {formatEnum(selected.doctorSpecialization)}
                                            </small>
                                        </div>

                                        <div className="col-6">
                                            <small className="text-muted">Appointment Date</small>
                                            <p className="fw-semibold mb-0">
                                                {selected.appointmentDate}
                                            </p>
                                        </div>

                                        <div className="col-6">
                                            <small className="text-muted">Appointment Time</small>
                                            <p className="fw-semibold mb-0">
                                                {selected.appointmentTime}
                                            </p>
                                        </div>

                                        <div className="col-6">
                                            <small className="text-muted">Visit Type</small>
                                            <p className="fw-semibold mb-0">
                                                {formatEnum(selected.visitType)}
                                            </p>
                                        </div>

                                        <div className="col-6">
                                            <small className="text-muted">Status</small>
                                            <p>
                                                <span className={`badge ${getStatusClass(selected.status)}`}>
                                                    {formatEnum(selected.status)}
                                                </span>
                                            </p>
                                        </div>

                                        <div className="col-12">
                                            <small className="text-muted">Reason</small>
                                            <p className="mb-0">
                                                {selected.reason || "No reason provided."}
                                            </p>
                                        </div>

                                    </div>

                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closeDetails}
                                    >
                                        Close
                                    </button>
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

export default AdminAppointments