
import { useEffect, useState } from "react"
import axios from "axios"
import { API_SERVER_URL_DEV } from "../../config"

function ExecutiveAppointments() {

    const [appointments, setAppointments] = useState([])
    const [page, setPage] = useState(0)
    const [size] = useState(5)
    const [totalPages , setTotalPages] = useState(0)

    const [status, setStatus] = useState("")
    const [assigned, setAssigned] = useState("")

    const [errMsg, setErrMsg] = useState("")

    useEffect(() => {

        const getAppointments = async () => {

            setErrMsg("")

            try {
               

                const response = await axios.get(
                    `${API_SERVER_URL_DEV}/api/v1/appointments/executive`,
                    {
                       params: {page,
                            size,
                            ...(status && { status }),
                            ...(assigned && {assigned})
                        },
                        headers: {
                            Authorization: "Bearer " + localStorage.getItem("token")
                        }
                    }
                )

                console.log(response.data.executiveAppointmentDto)

                // Backend returns List<ExecutiveAppointmentDto>
                setAppointments(response.data.executiveAppointmentDto)
                setTotalPages(response.data.paginationResDto.totalPages)
         

            } catch (err) {

                if (!err.response) {
                    setErrMsg("Unable to reach the server. Please try again later.")
                } else {
                    setErrMsg(
                        err.response.data?.message ||
                        "Could not load appointments."
                    )
                }

            } 
        }

        getAppointments()

    }, [page, size, status, assigned])

    const handleStatusChange = (value) => {
        setStatus(value)
        setPage(0)
    }

    const handleAssignedChange = (value) => {
        setAssigned(value)
        setPage(0)
    }

    return (
        <div>

            {/* Header */}
            <div className="mb-4">
                <h1 className="h3 fw-bold mb-1">
                    Appointments
                </h1>
                <p className="text-muted mb-0">
                    View and manage hospital appointments.
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
                    <div className="row g-3">

                        <div className="col-md-4">
                            <label className="form-label">
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
                                <option value="NO_SHOW">No Show</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">
                                Doctor Assignment
                            </label>

                            <select
                                className="form-select"
                                value={assigned}
                                onChange={(e) => handleAssignedChange(e.target.value)}
                            >
                                <option value="">All Appointments</option>
                                <option value="true">Assigned</option>
                                <option value="false">Unassigned</option>
                            </select>
                        </div>

                    </div>
                </div>
            </div>

            {/* Appointment Table */}
            <div className="card border-0 shadow-sm">

                <div className="card-header bg-body py-3">
                    <h5 className="mb-0 fw-semibold">
                        Appointment List
                    </h5>
                </div>

                <div className="table-responsive">

                    <table className="table table-hover align-middle mb-0">

                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Visit Type</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>

                            { !errMsg && appointments.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted py-5">
                                        <i className="bi bi-calendar-x fs-1 d-block mb-2" />
                                        No appointments found.
                                    </td>
                                </tr>
                            )}

                            {appointments.map((a, index) => (

                                <tr key={a.appointmentId}>

                                    <th>
                                        {page * size + index + 1}
                                    </th>

                                    <td>
                                        {a.patientFirstName} {a.patientLastName}
                                    </td>

                                    <td>
                                        {a.doctorFirstName
                                            ? `${a.doctorFirstName} ${a.doctorLastName}`
                                            : "Not assigned"}
                                    </td>

                                    <td>
                                        {a.appointmentDate}
                                    </td>

                                    <td>
                                        {a.appointmentTime}
                                    </td>

                                    <td>
                                        {a.visitType}
                                    </td>

                                    <td>
                                        <span className={`badge ${
                                            a.status === "CONFIRMED"
                                                ? "text-bg-success"
                                                : a.status === "REQUESTED"
                                                ? "text-bg-warning"
                                                : a.status === "CANCELLED"
                                                ? "text-bg-danger"
                                                : a.status === "COMPLETED"
                                                ? "text-bg-primary"
                                                : "text-bg-secondary"
                                        }`}>
                                            {a.status}
                                        </span>
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

            {/* Pagination note */}
            <div className="mt-3 text-muted small">
                Showing {appointments.length} appointments on page {page + 1}.
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
                <nav className="mt-4" aria-label="Doctor pages">
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

        </div>
    )
}

export default ExecutiveAppointments
