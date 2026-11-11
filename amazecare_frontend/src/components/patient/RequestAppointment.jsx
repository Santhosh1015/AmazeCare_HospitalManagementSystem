import { useState } from "react"
import { useNavigate } from "react-router"
import axios from "axios"
import Swal from "sweetalert2"
import { API_SERVER_URL_DEV } from "../../config"

function RequestAppointment() {
    const navigate = useNavigate()

    const [appointmentDate, setAppointmentDate] = useState("")
    const [visitType, setVisitType] = useState("")
    const [reason, setReason] = useState("")
    const [errMsg, setErrMsg] = useState("")
    const [errComment, setErrComment] = useState("")

    const today = new Date().toLocaleDateString("en-CA")

    const processRequest = async (e) => {
        e.preventDefault()
        setErrMsg("")
        setErrComment("")

        const appointmentReqDto = {
            appointmentDate: appointmentDate,
            visitType: visitType,
            reason: reason
        }

        try {
            await axios.post(`${API_SERVER_URL_DEV}/api/v2/appointment/book`, appointmentReqDto,
                {
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                })

            await Swal.fire({
                icon: "success",
                title: "Request sent!",
                html: `Your request for <b>${appointmentDate}</b> has been sent. A doctor will be assigned and the time confirmed.`,
                confirmButtonText: "View my appointments",
                confirmButtonColor: "#2F8F78"
            })
            navigate("/patient/appointments")
        } catch (err) {
            if (!err.response) {
                setErrMsg("Unable to reach the server. Please try again later.")
            } else {
                setErrMsg(err.response.data?.message || "Request failed. Please try again.")
                setErrComment(err.response.data?.comments || "")
            }
        }
    }

    return (
        <div>
            <div className="mb-4">
                <h1 className="h3 fw-bold mb-1">Request an Appointment</h1>
                <p className="text-muted mb-0">
                    Tell us when and why. We'll assign a doctor and confirm the exact time.
                </p>
            </div>

            <div className="card border-0 shadow-sm update-card">
                <div className="card-body p-4 p-md-5">

                    {errMsg && (
                        <div className="alert alert-danger" role="alert">
                            <div className="fw-semibold">{errMsg}</div>
                            {errComment && <small>{errComment}</small>}
                        </div>
                    )}

                    <form onSubmit={processRequest}>
                        <div className="mb-3">
                            <label htmlFor="appointmentDate" className="form-label small fw-semibold">Preferred date</label>
                            <input id="appointmentDate" type="date" value={appointmentDate} min={today}
                                className="form-control form-control-lg" required
                                onChange={(e) => setAppointmentDate(e.target.value)} />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="visitType" className="form-label small fw-semibold">Visit type</label>
                            <select id="visitType" value={visitType} className="form-select form-select-lg" required
                                onChange={(e) => setVisitType(e.target.value)}>
                                <option value="">Select visit type</option>
                                <option value="CONSULTATION">Consultation</option>
                                <option value="FOLLOW_UP">Follow Up</option>
                                <option value="EMERGENCY">Emergency</option>
                                <option value="ROUTINE_CHECKUP">Routine Checkup</option>
                                <option value="TELECONSULTATION">Tele Consultation</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="reason" className="form-label small fw-semibold">Reason for visit</label>
                            <textarea id="reason" value={reason} rows="4" maxLength="500"
                                className="form-control form-control-lg" required
                                placeholder="Describe your problem, and mention a doctor specialty if you know it"
                                onChange={(e) => setReason(e.target.value)} />
                            <div className="form-text">{reason.length}/500</div>
                        </div>

                        <div className="d-flex flex-column flex-sm-row gap-2">
                            <button type="submit" className="btn btn-primary btn-lg fw-semibold px-5">
                                Send request
                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-lg px-4"
                                onClick={() => navigate("/patient")}>
                                Cancel
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    )
}
export default RequestAppointment