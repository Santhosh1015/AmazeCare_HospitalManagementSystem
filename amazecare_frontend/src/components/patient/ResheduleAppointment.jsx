import { useEffect, useState } from "react"
import { useNavigate, useParams, useLocation } from "react-router"
import axios from "axios"
import Swal from "sweetalert2"
import { API_SERVER_URL_DEV } from "../../config"

function RescheduleAppointment() {
    const { appointmentId } = useParams()
    const navigate = useNavigate()

    const appointment = useLocation().state

    const [dates, setDates] = useState([])
    const [slots, setSlots] = useState([])
    const [newDate, setNewDate] = useState("")
    const [newSlot, setNewSlot] = useState("")
    const [visitType, setVisitType] = useState(appointment?.visitType || "CONSULTATION")
    const [reason, setReason] = useState(appointment?.reason || "")
    const [errMsg, setErrMsg] = useState("")

    const today = new Date().toLocaleDateString("en-CA")
    const hasDoctor = !!appointment?.doctorId

    const missingDoctorId = !!appointment?.doctorFirstName && !appointment?.doctorId


    useEffect(() => {
        console.log(hasDoctor);
        console.log(appointment);
        if (hasDoctor && appointment?.doctorId) {
            const getDates = async () => {

                setErrMsg("")
                try {
                    console.log("inside log");
                    console.log(appointment.doctorId);

                    const response = await axios.get(
                        `${API_SERVER_URL_DEV}/api/v1/doctor/${appointment.doctorId}/availability`,
                        {
                            params: { days: 30 },
                            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                        }
                    )
                    setDates(response.data.availableDates)

                } catch (err) {
                    console.log(err);
                    
                    if (!err.response) {
                        setErrMsg("Unable to reach the server. Please try again later.")
                    } else {
                        setErrMsg(err.response.data?.message || "Could not load available dates.")
                    }
                }
            }
            getDates()
        }


    }, [])

    useEffect(() => {
        if (!hasDoctor || !newDate) return

        const getSlots = async () => {
            setErrMsg("")
            setSlots([])
            setNewSlot("")
            try {
                const response = await axios.get(
                    `${API_SERVER_URL_DEV}/api/v1/doctor/${appointment.doctorId}/availability/slots`,
                    { params: { date: newDate }, headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }})
                setSlots(response.data.availableSlots)
            } catch (err) {
                if (!err.response) {
                    setErrMsg("Unable to reach the server. Please try again later.")
                } else {
                    setErrMsg(err.response.data?.message || "Could not load time slots.")
                }
            }
        }
        getSlots()
    }, [newDate])

    if (!appointment) return null

    const canSubmit = hasDoctor
        ? newDate && newSlot
        : newDate && newDate !== appointment.appointmentDate

    const formatDate = (d) => {
        const dt = new Date(d + "T00:00:00")
        return {
            weekday: dt.toLocaleString("en-US", { weekday: "short" }),
            day: dt.getDate(),
            month: dt.toLocaleString("en-US", { month: "short" })
        }
    }

    const processReschedule = async (e) => {
        e.preventDefault()
        setErrMsg("")

        const confirm = await Swal.fire({
            icon: "question",
            title: "Reschedule appointment?",
            html: hasDoctor
                ? `New schedule: <b>${newDate}</b> at <b>${newSlot}</b>`
                : `New preferred date: <b>${newDate}</b>`,
            showCancelButton: true,
            confirmButtonText: "Yes, reschedule",
            cancelButtonText: "Go back",
            confirmButtonColor: "#2F8F78"
        })
        if (!confirm.isConfirmed) return

        const rescheduleDto = {
            appointmentDate: newDate,
            appointmentTime: hasDoctor ? newSlot : null,
            visitType: visitType,
            reason: reason.trim() || null
        }

        try {
            await axios.put(
                `${API_SERVER_URL_DEV}/api/v1/appointment/reschedule/${appointmentId}`,
                rescheduleDto,
                 { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }}
                )
            await Swal.fire({
                icon: "success",
                title: "Appointment rescheduled",
                confirmButtonColor: "#2F8F78"
            })
            navigate("/patient/appointments")
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Could not reschedule",
                text: !err.response
                    ? "Unable to reach the server. Please try again later."
                    : err.response.data?.message || "Please try again.",
                confirmButtonColor: "#2F8F78"
            })
        }
    }

    return (
        <div>
            <div className="mb-4">
                <h1 className="h3 fw-bold mb-1">Reschedule Appointment</h1>
                <p className="text-muted mb-0">
                    Current: {appointment.appointmentDate} |{" "}
                    {appointment.appointmentTime ? appointment.appointmentTime.slice(0, 5) : "Time to be confirmed"} |{" "}
                    {appointment.doctorFirstName
                        ? `Dr. ${appointment.doctorFirstName} ${appointment.doctorLastName}`
                        : "Doctor to be assigned"}
                </p>
            </div>

            {errMsg && <div className="alert alert-danger" role="alert">{errMsg}</div>}

            {missingDoctorId && (
                <div className="alert alert-warning" role="alert">
                    Doctor details are incomplete, so available dates cannot be loaded.
                    Please go back and try again later.
                </div>
            )}

            <form onSubmit={processReschedule}>

                <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body">
                        <h2 className="h6 fw-bold mb-3">1. New date</h2>

                        {hasDoctor && (
                            <>
                                {dates?.length === 0 && (
                                    <p className="text-muted mb-0">No available dates found.</p>
                                )}
                                <div className="d-flex flex-wrap gap-2" style={{ maxHeight: "260px", overflowY: "auto" }}>
                                    {dates?.map((d) => {
                                        const f = formatDate(d)
                                        return (
                                            <button key={d} type="button"
                                                className={`btn date-chip ${newDate === d ? "btn-primary" : "btn-outline-secondary"}`}
                                                onClick={() => setNewDate(d)}>
                                                <small className="d-block">{f.weekday}</small>
                                                <span className="fw-bold">{f.day}</span>
                                                <small className="d-block">{f.month}</small>
                                            </button>
                                        )
                                    })}
                                </div>
                            </>
                        )}

                        {!hasDoctor && !missingDoctorId && (
                            <>
                                <input type="date" value={newDate} min={today} required
                                    className="form-control form-control-lg"
                                    onChange={(e) => setNewDate(e.target.value)} />
                                <div className="form-text">The time will be confirmed once a doctor is assigned.</div>
                            </>
                        )}
                    </div>
                </div>

                {hasDoctor && newDate && (
                    <div className="card border-0 shadow-sm mb-3">
                        <div className="card-body">
                            <h2 className="h6 fw-bold mb-3">2. New time</h2>
                            {slots?.length === 0 && (
                                <p className="text-muted mb-0">No slots available on this date.</p>
                            )}
                            <div className="d-flex flex-wrap gap-2">
                                {slots?.map((s) => (
                                    <button key={s.slotTime} type="button" disabled={!s.available}
                                        className={`btn ${!s.available ? "btn-outline-secondary" :
                                            newSlot === s.slotTime?.slice(0, 5) ? "btn-primary" : "btn-outline-primary"}`}
                                        onClick={() => setNewSlot(s.slotTime?.slice(0, 5))}>
                                        {s.slotTime?.slice(0, 5)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body">
                        <h2 className="h6 fw-bold mb-3">{hasDoctor ? "3." : "2."} Visit details</h2>

                        <div className="mb-3">
                            <label htmlFor="visitType" className="form-label small fw-semibold">Visit type</label>
                            <select id="visitType" value={visitType} className="form-select"
                                onChange={(e) => setVisitType(e.target.value)}>
                                <option value="CONSULTATION">Consultation</option>
                                <option value="FOLLOW_UP">Follow Up</option>
                                <option value="EMERGENCY">Emergency</option>
                                <option value="ROUTINE_CHECKUP">Routine Checkup</option>
                                <option value="TELECONSULTATION">Tele Consultation</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="reason" className="form-label small fw-semibold">Reason for visit</label>
                            <textarea id="reason" value={reason} rows="3" maxLength="500"
                                className="form-control"
                                onChange={(e) => setReason(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="d-flex flex-column flex-sm-row gap-2">
                    <button type="submit" className="btn btn-primary btn-lg fw-semibold px-5" disabled={!canSubmit}>
                        Confirm reschedule
                    </button>
                    <button type="button" className="btn btn-outline-secondary btn-lg px-4"
                        onClick={() => navigate("/patient/appointments")}>
                        Back
                    </button>
                </div>
            </form>
        </div>
    )
}
export default RescheduleAppointment