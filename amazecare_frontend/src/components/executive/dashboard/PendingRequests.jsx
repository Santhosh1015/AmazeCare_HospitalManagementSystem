import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import axios from "axios"
import { API_SERVER_URL_DEV } from "../../../config"

function PendingRequests() {
    const navigate = useNavigate()

    const [requests, setRequests] = useState([])
    const [errMsg, setErrMsg] = useState("")

    useEffect(() => {
        const getRequests = async () => {
            setErrMsg("")
            try {
                const response = await axios.get(
                    `${API_SERVER_URL_DEV}/api/v1/appointments/executive`,
                    {
                        params: { assigned: false, status: "REQUESTED", page: 0, size: 5 },
                        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                    }
                )
                console.log(response.data)
                setRequests(response.data.executiveAppointmentDto)
            } catch (err) {
                if (!err.response) {
                    setErrMsg("Unable to reach the server. Please try again later.")
                } else {
                    setErrMsg(err.response.data?.message || "Could not load requests.")
                }
            }
        }
        getRequests()
    }, [])

    return (
        <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h6 fw-bold mb-0">Requests Waiting for a Doctor</h2>
                    <Link to="/executive/requests" className="small fw-semibold text-decoration-none">View all</Link>
                </div>

                {errMsg && <div className="alert alert-danger py-2">{errMsg}</div>}

                {!errMsg && requests?.length === 0 && (
                    <div className="text-center text-muted py-4">
                        <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                        No pending requests.
                    </div>
                )}

                <div className="d-flex flex-column gap-2">
                    {requests?.map((a) => (
                        <div key={a.appointmentId} className="border rounded-3 p-3 d-flex align-items-center gap-3">
                            <span className="avatar flex-shrink-0">
                                {(a.patientFirstName || "?").charAt(0).toUpperCase()}
                            </span>

                            <div className="flex-grow-1">
                                <div className="fw-semibold">{a.patientFirstName} {a.patientLastName}</div>
                                <small className="text-muted d-block">
                                    <i className="bi bi-calendar-event me-1"></i>{a.appointmentDate}
                                    <span className="mx-1">|</span>
                                    {a.visitType}
                                </small>
                                {a.reason && (
                                    <small className="text-muted d-block text-truncate" style={{ maxWidth: "220px" }}>
                                        {a.reason}
                                    </small>
                                )}
                            </div>

                            <div className="text-end">
                                <span className="badge rounded-pill text-bg-warning d-block mb-2">Requested</span>
                                <button type="button" className="btn btn-primary btn-sm"
                                    onClick={() => navigate(`/executive/assign/${a.appointmentId}`, { state: a })}>
                                    Assign
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
export default PendingRequests