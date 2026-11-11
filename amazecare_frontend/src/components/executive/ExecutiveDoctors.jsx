import { useEffect, useState } from "react"
import axios from "axios"
import { API_SERVER_URL_DEV } from "../../config"

function ExecutiveDoctors() {
    const [doctors, setDoctors] = useState([])
    const [page, setPage] = useState(0)
    const [size] = useState(6)
    const [totPage, setTotPage] = useState(0)
    const [totElements, setTotElements] = useState(0)
    const [specialization, setSpecialization] = useState("")
    const [errMsg, setErrMsg] = useState("")

    // availability modal
    const [selected, setSelected] = useState(null)
    const [dates, setDates] = useState([])
    const [slots, setSlots] = useState([])
    const [slotDate, setSlotDate] = useState("")
    const [modalErr, setModalErr] = useState("")

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

    useEffect(() => {
        const getDoctors = async () => {
            setErrMsg("")
            try {
                const response = await axios.get(`${API_SERVER_URL_DEV}/api/v1/doctors`, {
                    params: {
                        page,
                        size,
                        ...(specialization && { specialization })
                    },
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                })

                console.log(response.data)
                setDoctors(response.data.doctorProfileResDtos)
                setTotPage(response.data.paginationResDto?.totalPages)
                setTotElements(response.data.paginationResDto?.totalElements)


            } catch (err) {
                if (!err.response) {
                    setErrMsg("Unable to reach the server. Please try again later.")
                } else {
                    setErrMsg(err.response.data?.message || "Could not load doctors.")
                }
            }
        }
        getDoctors()
    }, [page, size, specialization])

    const openAvailability = async (d) => {
        setSelected(d)
        setDates([])
        setSlots([])
        setSlotDate("")
        setModalErr("")

        try {
            const response = await axios.get(
                `${API_SERVER_URL_DEV}/api/v1/doctor/${d.doctorId}/availability`,
                {
                    params: { days: 30 },
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                })
            setDates(response.data.availableDates || [])
        } catch (err) {
            setModalErr(err?.response?.data?.message || "Could not load availability.")
        }
    }

    const openSlots = async (date) => {
        setSlotDate(date)
        setSlots([])
        setModalErr("")
        try {
            const response = await axios.get(
                `${API_SERVER_URL_DEV}/api/v1/doctor/${selected.doctorId}/availability/slots`,
                {
                    params: { date },
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                })
            setSlots(response.data.availableSlots || [])
        } catch (err) {
            setModalErr(err?.response?.data?.message || "Could not load slots.")
        }
    }

    return (
        <div>
            <div className="mb-4">
                <h1 className="h3 fw-bold mb-1">Doctors</h1>
                <p className="text-muted mb-0">View doctors and check their availability.</p>
            </div>

            {errMsg && <div className="alert alert-danger" role="alert">{errMsg}</div>}

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-12 col-md-6">
                            <label htmlFor="spec" className="form-label small fw-semibold mb-1">Specialization</label>
                            <select id="spec" value={specialization} className="form-select"
                                onChange={(e) => { setSpecialization(e.target.value); setPage(0) }}>
                                <option value="">All specializations</option>
                                {specializations.map((s) => (
                                    <option key={s} value={s}>{formatEnum(s)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-12 col-md-3">
                            <button type="button" className="btn btn-outline-secondary w-100"
                                onClick={() => { setSpecialization(""); setPage(0) }}>
                                <i className="bi bi-arrow-counterclockwise me-1"></i>Clear
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <p className="fw-semibold">{totElements} doctors found</p>

            {!errMsg && doctors.length === 0 && (
                <div className="card border-0 shadow-sm text-center p-5">
                    <i className="bi bi-person-x fs-1 text-muted"></i>
                    <p className="mb-0 mt-2 text-muted">No doctors found.</p>
                </div>
            )}

            <div className="row g-3">
                {doctors.map((d) => (
                    <div key={d.doctorId} className="col-12 col-md-6 col-xl-4">
                        <div className="card border-0 shadow-sm h-100 doctor-card">
                            <div className="card-body">
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <span className="doctor-avatar flex-shrink-0">
                                        {`${d.firstName?.[0] || ""}${d.lastName?.[0] || ""}`.toUpperCase()}
                                    </span>
                                    <div>
                                        <h3 className="h6 fw-bold mb-1">Dr. {d.firstName} {d.lastName}</h3>
                                        <div className="small fw-semibold specialization">{formatEnum(d.specialization)}</div>
                                    </div>
                                </div>
                                <div className="small text-muted">
                                    <div>{formatEnum(d.designation)} | {d.qualification}</div>
                                    <div className="mt-1"><i className="bi bi-briefcase me-1"></i>{d.experienceYears} years experience</div>
                                </div>
                            </div>
                            <div className="card-footer bg-transparent border-top">
                                <button type="button" className="btn btn-outline-primary btn-sm w-100"
                                    onClick={() => openAvailability(d)}>
                                    <i className="bi bi-calendar-week me-1"></i>View availability
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {totPage > 1 && (
                <nav className="mt-4" aria-label="Doctor pages">
                    <ul className="pagination justify-content-center mb-2">
                        <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
                            <button className="page-link" onClick={() => setPage(page - 1)}>
                                <i className="bi bi-chevron-left"></i>
                            </button>
                        </li>
                        {Array.from({ length: totPage }, (e, index) => (
                            <li key={index} className={`page-item ${index === page ? "active" : ""}`}>
                                <button className="page-link" onClick={() => setPage(index)}>{index + 1}</button>
                            </li>
                        ))}
                        <li className={`page-item ${page === totPage - 1 ? "disabled" : ""}`}>
                            <button className="page-link" onClick={() => setPage(page + 1)}>
                                <i className="bi bi-chevron-right"></i>
                            </button>
                        </li>
                    </ul>
                </nav>
            )}

            {selected && (
                <>
                    <div className="modal d-block" tabIndex="-1" role="dialog" onClick={() => setSelected(null)}>
                        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg"
                            onClick={(e) => e.stopPropagation()}>
                            <div className="modal-content border-0 shadow">
                                <div className="modal-header">
                                    <h5 className="modal-title fw-bold">
                                        Dr. {selected.firstName} {selected.lastName} | Availability
                                    </h5>
                                    <button type="button" className="btn-close" aria-label="Close"
                                        onClick={() => setSelected(null)}></button>
                                </div>
                                <div className="modal-body">
                                    {modalErr && <div className="alert alert-danger py-2">{modalErr}</div>}

                                    <h6 className="fw-bold">Available dates (next 30 days)</h6>
                                    {dates.length === 0 && <p className="text-muted">No available dates.</p>}
                                    <div className="d-flex flex-wrap gap-2 mb-3" style={{ maxHeight: "220px", overflowY: "auto" }}>
                                        {dates.map((d) => {
                                            const f = formatDate(d)
                                            return (
                                                <button key={d} type="button"
                                                    className={`btn date-chip ${slotDate === d ? "btn-primary" : "btn-outline-secondary"}`}
                                                    onClick={() => openSlots(d)}>
                                                    <small className="d-block">{f.weekday}</small>
                                                    <span className="fw-bold">{f.day}</span>
                                                    <small className="d-block">{f.month}</small>
                                                </button>
                                            )
                                        })}
                                    </div>

                                    {slotDate && (
                                        <>
                                            <h6 className="fw-bold">Slots on {slotDate}</h6>
                                            {slots.length === 0 && <p className="text-muted mb-0">No slots.</p>}
                                            <div className="d-flex flex-wrap gap-2">
                                                {slots.map((s) => (
                                                    <span key={s.slotTime}
                                                        className={`badge ${s.available ? "text-bg-success" : "text-bg-secondary"}`}>
                                                        {s.slotTime?.slice(0, 5)}
                                                    </span>
                                                ))}
                                            </div>
                                            <small className="text-muted d-block mt-2">Grey times are already booked.</small>
                                        </>
                                    )}
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
export default ExecutiveDoctors