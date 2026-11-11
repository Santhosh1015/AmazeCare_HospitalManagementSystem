import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import axios from "axios"
import { API_SERVER_URL_DEV } from "../../config"

function DoctorList() {
    const [doctors, setDoctors] = useState([])
    const [page, setPage] = useState(0)
    const [size] = useState(5)
    const [totalPages, setTotalPages] = useState(0)
    const [totalRecords, setTotalRecords] = useState(0)
    const [errMsg, setErrMsg] = useState("")

    const [specialization, setSpecialization] = useState("")
    const [date, setDate] = useState("")

    const navigate = useNavigate()

    const today = new Date().toISOString().split("T")[0]

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

    useEffect(() => {
        const getDoctors = async () => {
            setErrMsg("")
            try {
                const response = await axios.get(`${API_SERVER_URL_DEV}/api/v1/doctors`, {
                    params: {
                        page,
                        size,
                        ...(specialization && { specialization }),
                        ...(date && { date })
                    },
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                })
                
                setDoctors(response.data.doctorProfileResDtos)
                setTotalPages(response.data.paginationResDto.totalPages)
                setTotalRecords(response.data.paginationResDto.totalElements)

            } catch (err) {
                if (!err.response) {
                    setErrMsg("Unable to reach the server. Please try again later.")
                } else {
                    setErrMsg(err.response.data?.message || "Could not load doctors.")
                }
            }
        }
        getDoctors()

    }, [page, size, specialization, date])

    return (
        <div>
            <div className="mb-4">
                <h1 className="h3 fw-bold mb-1">Find a Doctor</h1>
                <p className="text-muted mb-0">Filter by specialization and the day you want to visit.</p>
            </div>

            {errMsg && <div className="alert alert-danger" role="alert">{errMsg}</div>}

            {/* <!-- Filters --> */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-12 col-md-5">
                            <label htmlFor="spec" className="form-label small fw-semibold mb-1">Specialization</label>
                            <select id="spec" value={specialization} className="form-select"
                                onChange={(e) => { setSpecialization(e.target.value); setPage(0) }}>
                                <option value="">All specializations</option>
                                {specializations.map((s) => (
                                    <option key={s} value={s}>{formatEnum(s)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-12 col-md-4">
                            <label htmlFor="visitDate" className="form-label small fw-semibold mb-1">Available on</label>
                            <input id="visitDate" type="date" value={date} min={today} className="form-control"
                                onChange={(e) => { setDate(e.target.value); setPage(0) }} />
                        </div>

                        <div className="col-12 col-md-3">
                            <button type="button" className="btn btn-outline-secondary w-100"
                                onClick={() => { setSpecialization(""); setDate(""); setPage(0) }}>
                                <i className="bi bi-arrow-counterclockwise me-1"></i>Clear
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <p className="fw-semibold">{totalRecords} doctors found</p>

            {doctors.length === 0 && (
                <div className="card border-0 shadow-sm text-center p-5">
                    <i className="bi bi-person-x fs-1 text-muted"></i>
                    <p className="mb-0 mt-2 text-muted">No doctors match your filters.</p>
                </div>
            )}

            {/* <!-- Cards --> */}
            <div className="d-flex flex-column gap-3">
                {doctors.map((d) => (
                    <div key={d.doctorId} className="card border-0 shadow-sm doctor-card">
                        <div className="card-body d-flex flex-column flex-md-row align-items-md-center gap-3">
                            <span className="doctor-avatar flex-shrink-0">
                                {`${d.firstName?.[0] || ""}${d.lastName?.[0] || ""}`.toUpperCase()}
                            </span>

                            <div className="flex-grow-1">
                                <h3 className="h5 fw-bold mb-1">Dr. {d.firstName} {d.lastName}</h3>
                                <div className="fw-semibold specialization">{formatEnum(d.specialization)}</div>
                                <div className="small text-muted">
                                    {formatEnum(d.designation)} | {d.qualification}
                                </div>
                                <div className="small text-muted mt-1">
                                    <i className="bi bi-briefcase me-1"></i>{d.experienceYears} years experience
                                </div>
                            </div>

                            <button type="button" className="btn btn-primary fw-semibold"
                                onClick={() => navigate(`/patient/book-appointment/${d.doctorId}`)}>
                                <i className="bi bi-calendar-plus me-2"></i>Book Appointment
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* <!-- Pagination (once, below the list) --> */}
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
export default DoctorList