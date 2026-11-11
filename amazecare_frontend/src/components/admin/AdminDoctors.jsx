
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router"
import axios from "axios"
import Swal from "sweetalert2"
import { getAdminDoctors } from "../../store/actions/AdminActions"
import { API_SERVER_URL_DEV } from "../../config"

function AdminDoctors() {

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const doctorsData = useSelector((state) => state.adminData.doctors)

    const [page, setPage] = useState(0)
    const [size] = useState(6)
    const [specialization, setSpecialization] = useState("")
    const [search, setSearch] = useState("")
    const [errMsg, setErrMsg] = useState("")
    const [errComment, setErrComment] = useState("")

    const doctors = doctorsData?.doctorProfileResDtos || []
    const totPage = doctorsData?.paginationResDto?.totalPages || 0
    const totElements = doctorsData?.paginationResDto?.totalElements || 0

    const specializations = [
        "GENERAL_MEDICINE", "CARDIOLOGY", "DERMATOLOGY", "NEUROLOGY",
        "ORTHOPEDICS", "PEDIATRICS", "GYNECOLOGY", "PSYCHIATRY",
        "OPHTHALMOLOGY", "ENT", "UROLOGY", "ONCOLOGY", "RADIOLOGY",
        "DENTISTRY", "ANESTHESIOLOGY", "SURGERY"
    ]

    const formatEnum = (value) => {
        if (value === "ENT") return "ENT"
        if (!value) return ""
        return value.toLowerCase().split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    }

    useEffect(() => {
        const loadDoctors = () => {
            setErrMsg("")
            setErrComment("")

            try {
                dispatch(getAdminDoctors(page, size, specialization))
            } catch (err) {
                if (!err.response) {
                    setErrMsg("Unable to reach the server. Please try again later.")
                } else {
                    setErrMsg(err.response.data?.message || "Could not load doctors.")
                    setErrComment(err.response.data?.comments || "")
                }
            }
        }

        loadDoctors()
    }, [dispatch, page, size, specialization])

    const filteredDoctors = doctors.filter((d) => {
        const searchValue = search.toLowerCase()

        return (
            `${d.firstName} ${d.lastName}`.toLowerCase().includes(searchValue) ||
            (d.licenseNumber || "").toLowerCase().includes(searchValue)
        )
    })

    const deleteDoctor = async (d) => {

        const result = await Swal.fire({
            title: "Are you sure?",
            text: `Do you want to deactivate Dr. ${d.firstName} ${d.lastName}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#2F8F78",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, deactivate"
        })

        if (!result.isConfirmed) return

        try {
            await axios.put(
                `${API_SERVER_URL_DEV}/api/v1/doctor/${d.doctorId}/delete`,
                {},
                {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }
            )

            await Swal.fire({
                icon: "success",
                title: "Doctor deactivated",
                text: "Doctor has been deactivated successfully.",
                confirmButtonColor: "#2F8F78"
            })

            dispatch(getAdminDoctors(page, size, specialization))

        } catch (err) {
            if (!err.response) {
                setErrMsg("Unable to reach the server. Please try again later.")
            } else {
                setErrMsg(err.response.data?.message || "Could not deactivate doctor.")
                setErrComment(err.response.data?.comments || "")
            }
        }
    }

    return (
        <div>

            {/* Page Header */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                <div>
                    <h1 className="h3 fw-bold mb-1">Doctors</h1>
                    <p className="text-muted mb-0">Manage registered doctors and their details.</p>
                </div>

                <button type="button" className="btn btn-primary fw-semibold"
                    onClick={() => navigate("/admin/doctors/add")}>
                    <i className="bi bi-person-plus me-2"></i>Add Doctor
                </button>
            </div>

            {errMsg && (
                <div className="alert alert-danger" role="alert">
                    {errMsg}
                    {errComment && <div className="small mt-1">{errComment}</div>}
                </div>
            )}

            {/* Filters */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3 align-items-end">

                        <div className="col-12 col-md-6">
                            <label className="form-label small fw-semibold">Search Doctor</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by name or license number"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="col-12 col-md-4">
                            <label className="form-label small fw-semibold">Specialization</label>
                            <select
                                className="form-select"
                                value={specialization}
                                onChange={(e) => {
                                    setSpecialization(e.target.value)
                                    setPage(0)
                                }}
                            >
                                <option value="">All specializations</option>
                                {specializations.map((s) => (
                                    <option key={s} value={s}>{formatEnum(s)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-12 col-md-2">
                            <button type="button" className="btn btn-outline-secondary w-100"
                                onClick={() => {
                                    setSearch("")
                                    setSpecialization("")
                                    setPage(0)
                                }}>
                                <i className="bi bi-arrow-counterclockwise me-1"></i>Clear
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            <p className="fw-semibold">{totElements} doctors found</p>

            {/* Empty State */}
            {!errMsg && filteredDoctors.length === 0 && (
                <div className="card border-0 shadow-sm text-center p-5">
                    <i className="bi bi-person-x fs-1 text-muted"></i>
                    <p className="mb-0 mt-2 text-muted">No doctors found.</p>
                </div>
            )}

            {/* Doctor Cards */}
            <div className="row g-3">
                {filteredDoctors.map((d) => (
                    <div key={d.doctorId} className="col-12 col-md-6 col-xl-4">
                        <div className="card border-0 shadow-sm h-100">

                            <div className="card-body">
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <span className="doctor-avatar flex-shrink-0">
                                        {`${d.firstName?.[0] || ""}${d.lastName?.[0] || ""}`.toUpperCase()}
                                    </span>

                                    <div>
                                        <h3 className="h6 fw-bold mb-1">
                                            Dr. {d.firstName} {d.lastName}
                                        </h3>
                                        <div className="small fw-semibold text-primary">
                                            {formatEnum(d.specialization)}
                                        </div>
                                    </div>
                                </div>

                                <div className="small text-muted">
                                    <div>{formatEnum(d.designation)} | {d.qualification}</div>
                                    <div className="mt-2">
                                        <i className="bi bi-card-text me-2"></i>
                                        {d.licenseNumber}
                                    </div>
                                    <div className="mt-1">
                                        <i className="bi bi-briefcase me-2"></i>
                                        {d.experienceYears} years experience
                                    </div>
                                </div>
                            </div>

                            <div className="card-footer bg-transparent border-top">
                                <div className="d-flex gap-2">
                                    <button type="button"
                                        className="btn btn-outline-primary btn-sm flex-grow-1"
                                        onClick={() => navigate("/admin/doctors/update", { state: d })}>
                                        <i className="bi bi-pencil me-1"></i>Update
                                    </button>

                                    <button type="button"
                                        className="btn btn-outline-danger btn-sm flex-grow-1"
                                        onClick={() => deleteDoctor(d)}>
                                         <i className="bi bi-person-x me-1"></i>
                                        Deactivate
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totPage > 1 && (
                <nav className="mt-4" aria-label="Doctor pages">
                    <ul className="pagination justify-content-center mb-2">

                        <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
                            <button className="page-link"
                                disabled={page === 0}
                                onClick={() => setPage(page - 1)}>
                                <i className="bi bi-chevron-left"></i>
                            </button>
                        </li>

                        {Array.from({ length: totPage }, (e, index) => (
                            <li key={index}
                                className={`page-item ${index === page ? "active" : ""}`}>
                                <button className="page-link"
                                    onClick={() => setPage(index)}>
                                    {index + 1}
                                </button>
                            </li>
                        ))}

                        <li className={`page-item ${page === totPage - 1 ? "disabled" : ""}`}>
                            <button className="page-link"
                                disabled={page === totPage - 1}
                                onClick={() => setPage(page + 1)}>
                                <i className="bi bi-chevron-right"></i>
                            </button>
                        </li>

                    </ul>
                </nav>
            )}

        </div>
    )
}

export default AdminDoctors
