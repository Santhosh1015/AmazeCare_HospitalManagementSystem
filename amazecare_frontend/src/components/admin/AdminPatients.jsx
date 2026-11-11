
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { useDispatch, useSelector } from "react-redux"
import axios from "axios"
import Swal from "sweetalert2"
import { API_SERVER_URL_DEV } from "../../config"
import { getAdminPatients } from "../../store/actions/AdminActions"

function AdminPatients() {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const patientsData = useSelector((state) => state.adminData.patients)

    const patients = patientsData?.patientResDto
    

    const totPage = patientsData?.paginationResDto?.totalPages
    const totElements = patientsData?.paginationResDto?.totalElements

    const [search, setSearch] = useState("")
    const [selected, setSelected] = useState(null)
    const [errMsg, setErrMsg] = useState("")

    const [page, setPage] = useState(0)
    const [size] = useState(2)

    const formatEnum = (value) => {
        if (!value) return ""
        return value.toLowerCase().split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    }

    useEffect(() => {
        const getPatients = async () => {
            setErrMsg("")
            try {
                dispatch(getAdminPatients(page, size))
            } catch (err) {
                if (!err.response) {
                    setErrMsg("Unable to reach the server. Please try again later.")
                } else {
                    setErrMsg(err.response.data?.message || "Could not load patients.")
                }
            }
        }
        getPatients()
    }, [dispatch, page, size])

    const viewPatient = async (p) => {
        setErrMsg("")
        try {
            const response = await axios.get(`${API_SERVER_URL_DEV}/api/v1/patient/${p.patientId}`, {
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
            })
            setSelected(response.data)
        } catch (err) {
            if (!err.response) {
                setErrMsg("Unable to reach the server. Please try again later.")
            } else {
                setErrMsg(err.response.data?.message || "Could not load patient details.")
            }
        }
    }

    const deactivatePatient = async (patientId) => {
        const result = await Swal.fire({
            title: "Deactivate patient?",
            text: "Are you sure you want to deactivate this patient?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, deactivate",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#2F8F78"
        })

        if (result.isConfirmed) {
            try {
                await axios.put(`${API_SERVER_URL_DEV}/api/v1/patient/${patientId}/delete`, {}, {
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                })

                await Swal.fire({
                    icon: "success",
                    title: "Patient deactivated",
                    text: "Patient has been deactivated successfully.",
                    confirmButtonColor: "#2F8F78"
                })

                if (patients.length === 1 && page > 0) {
                    setPage(page - 1)
                } else {
                    dispatch(getAdminPatients(page, size))
                }
            } catch (err) {
                if (!err.response) {
                    setErrMsg("Unable to reach the server. Please try again later.")
                } else {
                    setErrMsg(err.response.data?.message || "Could not deactivate patient.")
                }
            }
        }
    }

    const shown = patients?.filter((p) => {
        const text = `${p.firstName} ${p.lastName} ${p.phone}`.toLowerCase()
        return text.includes(search.toLowerCase())
    })

    return (
        <div>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                <div>
                    <h1 className="h3 fw-bold mb-1">Patients</h1>
                    <p className="text-muted mb-0">Search and manage registered patients.</p>
                </div>
                <button type="button" className="btn btn-primary fw-semibold"
                    onClick={() => navigate("/admin/patients/add")}>
                    <i className="bi bi-person-plus me-2"></i>Register Patient
                </button>
            </div>

            {errMsg && <div className="alert alert-danger" role="alert">{errMsg}</div>}



            {/* Search */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <label htmlFor="search" className="form-label small fw-semibold mb-1">
                        Search Patients
                    </label>
                    <div className="input-group">
                        <span className="input-group-text bg-body-tertiary">
                            <i className="bi bi-search"></i>
                        </span>
                        <input
                            id="search"
                            type="text"
                            value={search}
                            className="form-control"
                            placeholder="Search by name or phone"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Patient Cards */}
            <div className="row g-3">

                {!errMsg && shown?.length === 0 && (
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-5">
                                <i className="bi bi-people fs-1 text-muted d-block mb-2"></i>
                                <h6 className="fw-semibold mb-1">No Patients Found</h6>
                                <p className="text-muted small mb-0">
                                    No patients match your search criteria.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {shown?.map((p, index) => (
                    <div className="col-12 col-md-6 col-xl-4" key={p.patientId}>

                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">

                                {/* Patient Header */}
                                <div className="d-flex align-items-center gap-3 mb-3">

                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{
                                            width: "48px",
                                            height: "48px",
                                            backgroundColor: "#E5F4EF",
                                            color: "#2F8F78"
                                        }}
                                    >
                                        <i className="bi bi-person-fill fs-4"></i>
                                    </div>

                                    <div className="flex-grow-1 min-w-0">
                                        <h6 className="fw-bold mb-1 text-truncate">
                                            {p.firstName} {p.lastName}
                                        </h6>
                                        <small className="text-muted">
                                            Patient ID: #{p.patientId}
                                        </small>
                                    </div>

                                    <span className="badge text-bg-light border">
                                        {formatEnum(p.gender)}
                                    </span>

                                </div>

                                <hr className="my-3" />

                                {/* Patient Information */}
                                <div className="d-flex flex-column gap-3">

                                    <div className="d-flex align-items-center gap-2">
                                        <i className="bi bi-telephone text-muted"></i>
                                        <div>
                                            <small className="text-muted d-block">Phone Number</small>
                                            <span className="small fw-semibold">{p.phone || "N/A"}</span>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center gap-2">
                                        <i className="bi bi-calendar3 text-muted"></i>
                                        <div>
                                            <small className="text-muted d-block">Date of Birth</small>
                                            <span className="small fw-semibold">
                                                {p.dateOfBirth || "N/A"}
                                            </span>
                                        </div>
                                    </div>

                                </div>

                                <hr className="my-3" />

                                {/* Actions */}
                                <div className="d-flex flex-wrap gap-2">

                                    <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm flex-fill"
                                        onClick={() => viewPatient(p)}
                                    >
                                        <i className="bi bi-eye me-1"></i>
                                        View
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm flex-fill"
                                        onClick={() => navigate("/admin/patients/update", { state: p })}
                                    >
                                        <i className="bi bi-pencil me-1"></i>
                                        Update
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm flex-fill"
                                        onClick={() => deactivatePatient(p.patientId)}
                                    >
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
                <nav className="mt-4" aria-label="Patient pages">
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

            {
        selected && (
            <>
                <div className="modal d-block" tabIndex="-1" role="dialog" onClick={() => setSelected(null)}>
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">Patient Details</h5>
                                <button type="button" className="btn-close" aria-label="Close"
                                    onClick={() => setSelected(null)}></button>
                            </div>
                            <div className="modal-body">
                                <dl className="row mb-0 small">
                                    <dt className="col-4 text-muted">Patient ID</dt>
                                    <dd className="col-8">{selected.patientId}</dd>
                                    <dt className="col-4 text-muted">Name</dt>
                                    <dd className="col-8">{selected.firstName} {selected.lastName}</dd>
                                    <dt className="col-4 text-muted">Phone</dt>
                                    <dd className="col-8">{selected.phone}</dd>
                                    <dt className="col-4 text-muted">Gender</dt>
                                    <dd className="col-8">{formatEnum(selected.gender)}</dd>
                                    <dt className="col-4 text-muted">Date of birth</dt>
                                    <dd className="col-8">{selected.dateOfBirth}</dd>
                                    <dt className="col-4 text-muted">Address</dt>
                                    <dd className="col-8">{selected.address || "Not provided"}</dd>
                                </dl>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-backdrop show"></div>
            </>
        )
    }
        </div >
    )
}
export default AdminPatients
