import { useEffect, useState } from "react"
import { Link } from "react-router"
import axios from "axios"
import { API_SERVER_URL_DEV } from "../../../config"

function TodayAppointments() {
    const [appointments, setAppointments] = useState([])
    const [errMsg, setErrMsg] = useState("")

    const today = new Date().toLocaleDateString("en-CA")

    useEffect(() => {
        const getToday = async () => {
            setErrMsg("")
            try {
                const response = await axios.get(
                    `${API_SERVER_URL_DEV}/api/v1/appointments/executive`,
                    {
                        params: { fromDate: today, toDate: today, page: 0, size: 5 },
                        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                    }
                )
                
                setAppointments(response.data.executiveAppointmentDto)
            } catch (err) {
                if (!err.response) {
                    setErrMsg("Unable to reach the server. Please try again later.")
                } else {
                    setErrMsg(err.response.data?.message || "Could not load today's appointments.")
                }
            }
        }
        getToday()
    }, [])

    return (
           <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h6 fw-bold mb-0">Today's Appointments</h2>
                    <Link to="/executive/appointments" className="small fw-semibold text-decoration-none">View all</Link>
                </div>

                {errMsg && <div className="alert alert-danger py-2">{errMsg}</div>}

                {!errMsg && appointments?.length === 0 && (
                    <div className="text-center text-muted py-4">
                        <i className="bi bi-calendar-check fs-1 d-block mb-2"></i>
                        No appointments scheduled for today.
                    </div>
                )}

                <div className="d-flex flex-column gap-2">
                    {appointments?.map((a) => (
                        <div key={a.appointmentId} className="border rounded-3 p-3 d-flex align-items-center gap-3">
                            <div className="date-box date-box-sm flex-shrink-0 text-center">
                                <div className="fw-bold lh-1">
                                    {a.appointmentTime ? a.appointmentTime.slice(0, 5) : "--:--"}
                                </div>
                            </div>

                            <div className="flex-grow-1">
                                <div className="fw-semibold">{a.patientName}</div>
                                <small className="text-muted d-block">
                                    {a.doctorFirstName ? `Dr. ${a.doctorLastName}` : "Doctor to be assigned"}
                                </small>
                            </div>

                            <div className="text-end">
                                <span className="badge rounded-pill text-bg-primary d-block mb-1">{a.visitType}</span>
                                <small className="text-muted">{a.status}</small>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    
    )
}
export default TodayAppointments