import { useEffect, useState } from "react"
import { useNavigate, useParams, useLocation } from "react-router"
import axios from "axios"
import Swal from "sweetalert2"
import { API_SERVER_URL_DEV } from "../../config"

function AssignDoctor() {
    const { appointmentId } = useParams()
    const navigate = useNavigate()
    const appointment = useLocation().state

    const [specialization, setSpecialization] = useState("")
    const [doctors, setDoctors] = useState([])
    const [doctorId, setDoctorId] = useState("")
    const [dates, setDates] = useState([])
    const [slots, setSlots] = useState([])
    const [newDate, setNewDate] = useState("")
    const [newSlot, setNewSlot] = useState("")
    const [errMsg, setErrMsg] = useState("")

    const headers = { 'Authorization': 'Bearer ' + localStorage.getItem('token') }

    const specializations = [
        "GENERAL_MEDICINE", "CARDIOLOGY", "DERMATOLOGY", "NEUROLOGY", "ORTHOPEDICS",
        "PEDIATRICS", "GYNECOLOGY", "PSYCHIATRY", "OPHTHALMOLOGY", "ENT", "UROLOGY",
        "ONCOLOGY", "RADIOLOGY", "DENTISTRY", "ANESTHESIOLOGY", "SURGERY"
    ]

    const formatEnum = (value) => {
        if (value === "ENT") return "ENT"
        if (!value) return ""
        return value.toLowerCase().split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    }

    const formatDate = (d) => {
        const dt = new Date(d + "T00:00:00")
        return {
            weekday: dt.toLocaleString("en-US", { weekday: "short" }),
            day: dt.getDate(),
            month: dt.toLocaleString("en-US", { month: "short" })
        }
    }

    const showError = (err, fallback) => {
        if (!err.response) {
            setErrMsg("Unable to reach the server. Please try again later.")
        } else {
            setErrMsg(err.response.data?.message || fallback)
        }
    }

    // state is lost on refresh, so go back to the list
    useEffect(() => {
        if (!appointment) navigate("/executive/requests")
    }, [])

    // doctors for the chosen specialization
    useEffect(() => {
        if (!specialization) return
        const getDoctors = async () => {
            setErrMsg("")
            setDoctors([])
            setDoctorId("")
            try {
                const response = await axios.get(`${API_SERVER_URL_DEV}/api/v1/doctors`,
                    { params: { specialization, page: 0, size: 50 }, headers })
                setDoctors(response.data.doctorProfileResDtos)
            } catch (err) {
                showError(err, "Could not load doctors.")
            }
        }
        getDoctors()
    }, [specialization])

    // available dates of the chosen doctor
    useEffect(() => {
        if (!doctorId) return
        const getDates = async () => {
            setErrMsg("")
            setDates([])
            setNewDate("")
            setSlots([])
            setNewSlot("")
            try {
                const response = await axios.get(
                    `${API_SERVER_URL_DEV}/api/v1/doctor/${doctorId}/availability`,
                    { params: { days: 30 }, headers })
                setDates(response.data.availableDates || [])
            } catch (err) {
                showError(err, "Could not load available dates.")
            }
        }
        getDates()
    }, [doctorId])

    // slots for the chosen date
    useEffect(() => {
        if (!doctorId || !newDate) return
        const getSlots = async () => {
            setErrMsg("")
            setSlots([])
            setNewSlot("")
            try {
                const response = await axios.get(
                    `${API_SERVER_URL_DEV}/api/v1/doctor/${doctorId}/availability/slots`,
                    { params: { date: newDate }, headers })
                setSlots(response.data.availableSlots || [])
            } catch (err) {
                showError(err, "Could not load time slots.")
            }
        }
        getSlots()
    }, [newDate])

    if (!appointment) return null

    const processAssign = async (e) => {
        e.preventDefault()
        setErrMsg("")

        const confirm = await Swal.fire({
            icon: "question",
            title: "Assign this doctor?",
            html: `<b>${newDate}</b> at <b>${newSlot}</b>`,
            showCancelButton: true,
            confirmButtonText: "Yes, assign",
            cancelButtonText: "Go back",
            confirmButtonColor: "#2F8F78"
        })
        if (!confirm.isConfirmed) return

        // fields from the booking AppointmentDto
        const appointmentDto = {
            doctorId: doctorId,
            appointmentDate: newDate,
            appointmentTime: newSlot,
            visitType: appointment.visitType,
            reason: appointment.reason
        }

        try {
            await axios.put(`${API_SERVER_URL_DEV}/api/v1/appointment/assign/${appointmentId}`,
                appointmentDto, { headers })
            await Swal.fire({
                icon: "success",
                title: "Doctor assigned",
                text: "The appointment is now confirmed.",
                confirmButtonColor: "#2F8F78"
            })
            navigate("/executive/requests")
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Could not assign",
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
                <h1 className="h3 fw-bold mb-1">Assign Doctor</h1>
                <p className="text-muted mb-0">
                    {appointment.patientName} | requested for {appointment.appointmentDate} | {appointment.visitType}
                </p>
                <p className="text-muted small mb-0">Reason: {appointment.reason}</p>
            </div>

            {errMsg && <div className="alert alert-danger" role="alert">{errMsg}</div>}

            <form onSubmit={processAssign}>

                <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body">
                        <h2 className="h6 fw-bold mb-3">1. Doctor</h2>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label htmlFor="spec" className="form-label small fw-semibold">Specialization</label>
                                <select id="spec" value={specialization} className="form-select"
                                    onChange={(e) => setSpecialization(e.target.value)}>
                                    <option value="">Select specialization</option>
                                    {specializations.map((s) => (
                                        <option key={s} value={s}>{formatEnum(s)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="doctor" className="form-label small fw-semibold">Doctor</label>
                                <select id="doctor" value={doctorId} className="form-select" disabled={!specialization}
                                    onChange={(e) => setDoctorId(e.target.value)}>
                                    <option value="">Select doctor</option>
                                    {doctors.map((d) => (
                                        <option key={d.doctorId} value={d.doctorId}>
                                            Dr. {d.firstName} {d.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {doctorId && (
                    <div className="card border-0 shadow-sm mb-3">
                        <div className="card-body">
                            <h2 className="h6 fw-bold mb-3">2. Date</h2>
                            {dates.length === 0 && <p className="text-muted mb-0">No available dates found.</p>}
                            <div className="d-flex flex-wrap gap-2" style={{ maxHeight: "260px", overflowY: "auto" }}>
                                {dates.map((d) => {
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
                        </div>
                    </div>
                )}

                {doctorId && newDate && (
                    <div className="card border-0 shadow-sm mb-3">
                        <div className="card-body">
                            <h2 className="h6 fw-bold mb-3">3. Time</h2>
                            {slots.length === 0 && <p className="text-muted mb-0">No slots available on this date.</p>}
                            <div className="d-flex flex-wrap gap-2">
                                {slots.map((s) => (
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

                <div className="d-flex flex-column flex-sm-row gap-2">
                    <button type="submit" className="btn btn-primary btn-lg fw-semibold px-5"
                        disabled={!doctorId || !newDate || !newSlot}>
                        Assign doctor
                    </button>
                    <button type="button" className="btn btn-outline-secondary btn-lg px-4"
                        onClick={() => navigate("/executive/requests")}>
                        Back
                    </button>
                </div>
            </form>
        </div>
    )
}
export default AssignDoctor