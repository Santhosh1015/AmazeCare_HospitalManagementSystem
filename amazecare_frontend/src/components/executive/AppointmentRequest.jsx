import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import axios from "axios"
import { API_SERVER_URL_DEV } from "../../config"

function AppointmentRequest() {
    const navigate = useNavigate()

    const [requests, setRequests] = useState([])
    const [page, setPage] = useState(0)
    const [size] = useState(5)
    const [totPage, setTotPage] = useState(0)
    const [totElements, setTotElements] = useState(0)
    const [errMsg, setErrMsg] = useState("")

    useEffect(() => {
        const getRequests = async () => {
            setErrMsg("")
            try {
                const response = await axios.get(
                    `${API_SERVER_URL_DEV}/api/v1/appointments/executive`,
                    {
                        params: { assigned: false, status: "REQUESTED", page, size },
                        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                    }
                )
                // console.log(response.data)
                // GUESS: list key and pagination key
                setRequests(response.data.executiveAppointmentDto)
                setTotPage(response.data.paginationResDto?.totalPages)
                setTotElements(response.data.paginationResDto?.totalElements)
            } catch (err) {
                if (!err.response) {
                    setErrMsg("Unable to reach the server. Please try again later.")
                } else {
                    setErrMsg(err.response.data?.message || "Could not load requests.")
                }
            }
        }
        getRequests()
    }, [page, size])

    return (
        <div>
            <div className="mb-4">
                <h1 className="h3 fw-bold mb-1">Appointment Requests</h1>
                <p className="text-muted mb-0">Patient requests waiting for a doctor.</p>
            </div>

            {errMsg && <div className="alert alert-danger" role="alert">{errMsg}</div>}

            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Patient</th>
                                <th scope="col">Requested date</th>
                                <th scope="col">Visit type</th>
                                <th scope="col">Reason</th>
                                <th scope="col" className="text-end">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!errMsg && requests?.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted py-5">
                                        <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                                        No pending requests.
                                    </td>
                                </tr>
                            )}
                            {requests?.map((a, index) => (
                                <tr key={a.appointmentId}>
                                    <th scope="row">{page * size + index + 1}</th>
                                    <td>{a.patientFirstName} {a.patientLastName}</td>
                                    <td>{a.appointmentDate}</td>
                                    <td>{a.visitType}</td>
                                    <td className="text-truncate" style={{ maxWidth: "240px" }}>{a.reason}</td>
                                    <td className="text-end">
                                        <button type="button" className="btn btn-primary btn-sm"
                                            onClick={() => navigate(`/executive/assign/${a.appointmentId}`, { state: a })}>
                                            Assign
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {totPage > 1 && (
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
export default AppointmentRequest