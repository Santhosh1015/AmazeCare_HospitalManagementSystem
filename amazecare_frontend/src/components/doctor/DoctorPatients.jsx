
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import axios from "axios"
import { API_SERVER_URL_DEV } from "../../config"

function DoctorPatients() {
    const navigate = useNavigate()

    const [patients, setPatients] = useState([])

    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const [errMsg, setErrMsg] = useState("")

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                console.log("inside");

                setErrMsg("")

                const response = await axios.get(
                    `${API_SERVER_URL_DEV}/api/v1/doctor/me/patients`,
                    {
                        params: { page, size: 5 },
                        headers: {
                            Authorization: "Bearer " + localStorage.getItem("token")
                        }
                    }
                )

                setPatients(response.data.patientResDtos)
                setTotalPages(response.data.paginationResDto.totalPages)

            } catch (err) {
                setErrMsg(!err.response
                    ? "Unable to reach the server. Please try again later."
                    : err.response.data?.message || "Unable to fetch patients."
                )
            }
        }

        fetchPatients()
    }, [page])

    const viewPatientHistory = (patient) => {
        navigate("/doctor/patients/history", {
            state: { patient }
        })
    }

    return (
        <div>
            <div className="mb-4">
                <h1 className="h3 fw-bold mb-1">My Patients</h1>
                <p className="text-muted mb-0">
                    View and manage your registered patients.
                </p>
            </div>

            {errMsg && (
                <div className="alert alert-danger">{errMsg}</div>
            )}

            {patients?.length === 0 ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center text-muted py-5">
                        No patients found.
                    </div>
                </div>
            ) : (
                <div className="row g-3">
                    {patients?.map((patient) => (
                        <div className="col-12" key={patient.patientId}>
                            <div className="card border-0 shadow-sm">
                                <div className="card-body p-3">
                                    <div className="row align-items-center g-3">
                                        <div className="col-md-2">
                                            <small className="text-muted d-block">Patient Name</small>
                                            <span className="fw-semibold">{patient.firstName} {patient.lastName}</span>
                                        </div>
                                        <div className="col-md-1">
                                            <small className="text-muted d-block">Patient ID</small>
                                            <span className="fw-semibold">#{patient.patientId}</span>
                                        </div>
                                        <div className="col-md-2">
                                            <small className="text-muted d-block">Phone</small>
                                            <span className="fw-semibold">{patient.phone || "-"}</span>
                                        </div>
                                        <div className="col-md-1">
                                            <small className="text-muted d-block">Gender</small>
                                            <span className="fw-semibold">{patient.gender || "-"}</span>
                                        </div>
                                        <div className="col-md-3">
                                            <small className="text-muted d-block">Address</small>
                                            <span className="fw-semibold">{patient.address || "-"}</span>
                                        </div>
                                        <div className="col-md-3 text-md-end">
                                            <button className="btn btn-sm btn-outline-primary" onClick={() => viewPatientHistory(patient)}>
                                                <i className="bi bi-clock-history me-1"></i>Medical History
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="d-flex justify-content-center gap-2 mt-4">
                    <button className="btn btn-outline-secondary btn-sm"
                        disabled={page === 0 || loading}
                        onClick={() => setPage(page - 1)}>
                        Previous
                    </button>

                    <span className="align-self-center small">
                        Page {page + 1} of {totalPages}
                    </span>

                    <button className="btn btn-outline-secondary btn-sm"
                        disabled={page + 1 >= totalPages || loading}
                        onClick={() => setPage(page + 1)}>
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}

export default DoctorPatients
