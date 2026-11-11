import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import axios from "axios"
import { API_SERVER_URL_DEV } from "../../config"
import Swal from "sweetalert2"

function BookAppointment() {
    const { doctorId } = useParams()
    const navigate = useNavigate()

    const [dates, setDates] = useState([])
    const [slots, setSlots] = useState([])
    const [selectedDate, setSelectedDate] = useState("")
    const [selectedSlot, setSelectedSlot] = useState("")
    const [visitType, setVisitType] = useState("")
    const [reason, setReason] = useState("")

    const [errMsg, setErrMsg] = useState("")
    const [errComment, setErrComment] = useState("")

    useEffect(() => {
        const getDates = async () => {
            try {
                const response = await axios.get(
                    `${API_SERVER_URL_DEV}/api/v1/doctor/${doctorId}/availability`,
                    { params: { days: 14 } },
                    {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        }
                    }
                )
                // console.log(response.data.availableDates)
                setDates(response.data.availableDates)
            } catch (err) {
                if (!err.response) {
                    setErrMsg("Unable to reach the server. Please try again later.")
                    setErrComment("")
                } else {
                    setErrMsg(err.response.data?.message || fallback)
                    setErrComment(err.response.data?.comments || "")
                }
            }
        }
        getDates()
    }, [doctorId])

    useEffect(() => {
        if (!selectedDate) return
        const getSlots = async () => {
            setSlots([])
            setSelectedSlot("")
            try {
                const response = await axios.get(
                    `${API_SERVER_URL_DEV}/api/v1/doctor/${doctorId}/availability/slots`,
                    { params: { date: selectedDate } },
                    {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        }
                    }
                )
                // console.log(response.data.availableSlots)
                setSlots(response.data.availableSlots)
            } catch (err) {
                if (!err.response) {
                    setErrMsg("Unable to reach the server. Please try again later.")
                    setErrComment("")
                } else {
                    setErrMsg(err.response.data?.message || fallback)
                    setErrComment(err.response.data?.comments || "")
                }
            }
        }
        getSlots()
    }, [selectedDate])

    const processBooking = async (e) => {
        e.preventDefault()
        setErrMsg("")
        setErrComment("")

        const appointmentDto = {
            'doctorId': doctorId,
            'appointmentDate': selectedDate,
            'appointmentTime': selectedSlot,
            'visitType': visitType,
            'reason': reason
        }
        try {
            await axios.post(`${API_SERVER_URL_DEV}/api/v1/appointment/book`, appointmentDto,
                {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }
            )
            await Swal.fire({
                icon: "success",
                title: "Booking confirmed!",
                html: `Your appointment is booked for <b>${selectedDate}</b> at <b>${selectedSlot.slice(0, 5)}</b>.`,
                confirmButtonText: "View my appointments",
                confirmButtonColor: "#2F8F78"
            })
            navigate("/patient/appointments")
        } catch (err) {
            if (!err.response) {
                setErrMsg("Unable to reach the server. Please try again later.")
                setErrComment("")
            } else {
                setErrMsg(err.response.data?.message || fallback)
                setErrComment(err.response.data?.comments || "")
            }
        }
    }

    const formatDate = (d) => {
        const dt = new Date(d + "T00:00:00")
        return {
            weekday: dt.toLocaleString("en-US", { weekday: "short" }),
            day: dt.getDate(),
            month: dt.toLocaleString("en-US", { month: "short" })
        }
    }

    return (
        <div>
            <div className="mb-4">
                <h1 className="h3 fw-bold mb-1">Book Appointment</h1>
                <p className="text-muted mb-0">Pick a date and time that suits you.</p>
            </div>

            {errMsg && (
                <div className="alert alert-danger" role="alert">
                    <div className="fw-semibold">{errMsg}</div>
                    {errComment && <small>{errComment}</small>}
                </div>
            )}

            <form onSubmit={processBooking}>
                <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body">
                        <h2 className="h6 fw-bold mb-3">1. Select a date</h2>
                        {dates?.length === 0 && <p className="text-muted mb-0">No available dates found.</p>}
                        <div className="d-flex flex-wrap gap-2">
                            {dates?.map((d) => {
                                const f = formatDate(d)
                                return (
                                    <button key={d} type="button"
                                        className={`btn date-chip ${selectedDate === d ? "btn-primary" : "btn-outline-secondary"}`}
                                        onClick={() => setSelectedDate(d)}>
                                        <small className="d-block">{f.weekday}</small>
                                        <span className="fw-bold">{f.day}</span>
                                        <small className="d-block">{f.month}</small>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {selectedDate && (
                    <div className="card border-0 shadow-sm mb-3">
                        <div className="card-body">
                            <h2 className="h6 fw-bold mb-3">2. Select a time</h2>
                            {slots?.length === 0 && (
                                <p className="text-muted mb-0">No slots available on this date.</p>
                            )}
                            <div className="d-flex flex-wrap gap-2">
                                {slots?.map((s) => (
                                    <button key={s.slotTime} type="button"
                                        disabled={!s.available}
                                        className={`btn ${!s.available ? "btn-outline-secondary" :
                                            selectedSlot === s.slotTime ? "btn-primary" : "btn-outline-primary"
                                            }`}
                                        onClick={() => setSelectedSlot(s.slotTime?.slice(0, 5))}>
                                        {s.slotTime?.slice(0, 5)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {selectedSlot && (
                    <div className="card border-0 shadow-sm mb-3">
                        <div className="card-body">
                            <h2 className="h6 fw-bold mb-3">3. Visit details</h2>
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
                            <div className="mb-3">
                                <label htmlFor="reason" className="form-label small fw-semibold">Reason for visit</label>
                                <textarea id="reason" value={reason} className="form-control" rows="3" required
                                    placeholder="Briefly describe your problem"
                                    onChange={(e) => setReason(e.target.value)} />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg fw-semibold">
                                Confirm booking
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    )
}
export default BookAppointment