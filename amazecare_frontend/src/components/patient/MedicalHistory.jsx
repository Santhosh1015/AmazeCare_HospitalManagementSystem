import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import axios from "axios"
import { API_SERVER_URL_DEV } from "../../config"

function MedicalHistory() {
    const [records, setRecords] = useState([])
    const [selected, setSelected] = useState(null)
    const [errMsg, setErrMsg] = useState("")
    const [errComment, setErrComment] = useState("")

    const navigate = useNavigate()

    const formatEnum = (value) => {
        if (!value) return ""
        value=  value.toLowerCase()
        return value[0].toUpperCase() + value.slice(1)
    }
    const labStatusColor = (status) => {
    switch (status) {
        case "RECOMMENDED": return "warning"
        case "COMPLETED": return "success"
        case "NOT_TAKEN": return "danger"
        case "CANCELLED": return "warning"
        case "PENDING": return "secondary"
        default: return "secondary"
    }
}

    const formatDate = (d) =>
        d ? new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"

    useEffect(() => {
        // console.log("medical history");

        const getRecords = async () => {
            setErrMsg("")
            setErrComment("")
            try {
                const response = await axios.get(
                    `${API_SERVER_URL_DEV}/api/v1/patient/medical-records`,
                    {
                        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                    }
                )
                console.log(response.data)
                setRecords(response.data)
            } catch (err) {
                if (!err.response) {
                    setErrMsg("Unable to reach the server. Please try again later.")
                } else {
                    setErrMsg(err.response.data?.message || "Could not load your medical history.")
                    setErrComment(err.response.data?.comments || "")
                }
            }
        }
        getRecords()
    }, [])

    return (
        <div>
            <div className="mb-4">
                <h1 className="h3 fw-bold mb-1">Medical History</h1>
                <p className="text-muted mb-0">Your records from past visits.</p>
            </div>

            {errMsg && (
                <div className="alert alert-danger" role="alert">
                    <div className="fw-semibold">{errMsg}</div>
                    {errComment && <small>{errComment}</small>}
                </div>
            )}

            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th scope="col">Visit date</th>
                                <th scope="col">Doctor</th>
                                <th scope="col">Diagnosis</th>
                                <th scope="col" className="text-end">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records?.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center text-muted py-5">
                                        <i className="bi bi-file-earmark-medical fs-1 d-block mb-2"></i>
                                        No medical records yet.
                                    </td>
                                </tr>
                            )}

                            {records?.map((r) => (
                                <tr key={r.medicalRecordId}>
                                    <td>
                                        <i className="bi bi-file-earmark-text me-2 text-primary"></i>
                                        {formatDate(r.appointmentDate)}
                                    </td>
                                    <td>{r.doctorName}</td>
                                    <td>{r.diagnosis}</td>
                                    <td className="text-end">
                                        <button type="button" className="btn btn-outline-primary btn-sm"
                                            onClick={() => setSelected(r)}>
                                            <i className="bi bi-eye me-1"></i>View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* <!-- Details modal --> */}
            {selected && (
                <>
                    <div className="modal d-block" tabIndex="-1" role="dialog" onClick={() => setSelected(null)}>
                        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg"
                            onClick={(e) => e.stopPropagation()}>
                            <div className="modal-content border-0 shadow">
                                <div className="modal-header">
                                    <h5 className="modal-title fw-bold">Visit on {formatDate(selected.appointmentDate)}</h5>
                                    <button type="button" className="btn-close" aria-label="Close"
                                        onClick={() => setSelected(null)}></button>
                                </div>

                                <div className="modal-body">
                                    <dl className="row small mb-3">
                                        <dt className="col-sm-4 text-muted">Doctor</dt>
                                        <dd className="col-sm-8">{selected.doctorName}</dd>
                                        <dt className="col-sm-4 text-muted">Appointment ID</dt>
                                        <dd className="col-sm-8">#{selected.appointmentId}</dd>
                                        <dt className="col-sm-4 text-muted">Symptoms</dt>
                                        <dd className="col-sm-8">{selected.symptoms || "-"}</dd>
                                        <dt className="col-sm-4 text-muted">Physical examination</dt>
                                        <dd className="col-sm-8">{selected.physicalExamination || "-"}</dd>
                                        <dt className="col-sm-4 text-muted">Diagnosis</dt>
                                        <dd className="col-sm-8 fw-semibold">{selected.diagnosis || "-"}</dd>
                                        <dt className="col-sm-4 text-muted">Treatment plan</dt>
                                        <dd className="col-sm-8">{selected.treatmentPlan || "-"}</dd>
                                    </dl>

                                    {/* <!-- Lab results --> */}
                                    {selected.labResults?.length > 0 && (
                                        <div className="mb-3">
                                            <h6 className="fw-bold">Lab results</h6>
                                            <div className="table-responsive">
                                                <table className="table table-sm align-middle mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th>Test</th>
                                                            <th>Status</th>
                                                            <th className="text-end">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selected.labResults.map((l , index) => (
                                                            <tr key={index}>
                                                                <td>{l.testName}</td>
                                                                <td>
                                                                    <span className={`badge rounded-pill text-bg-${labStatusColor(l.testStatus)}`}>
                                                                        {formatEnum(l.testStatus)}
                                                                    </span>
                                                                </td>
                                                                <td className="text-end">
                                                                    <button type="button" className="btn btn-outline-primary btn-sm"
                                                                        onClick={() => navigate(`/patient/lab-results/${l.labResultId}`)}>
                                                                        <i className="bi bi-eye me-1"></i>View
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                    {/* <!-- Prescription summary --> */}
                                    {selected.prescription ? (
                                        <div>
                                            <h6 className="fw-bold">Prescription</h6>
                                            <ul className="small mb-0">
                                                {selected.prescription.prescribedItemResDto?.map((p, i) => (
                                                    <li key={i}>
                                                        {p.medicineName} {p.dosage} | {p.frequency} | {p.durationDays} days
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="text-muted small mb-0">No prescription for this visit.</p>
                                    )}
                                </div>

                                <div className="modal-footer">
                                    {selected.prescription && (
                                        <button type="button" className="btn btn-primary"
                                            onClick={() => navigate(`/patient/prescriptions/${selected.prescription.prescriptionId}`)}>
                                            <i className="bi bi-prescription2 me-2"></i>View Prescription
                                        </button>
                                    )}
                                    <button type="button" className="btn btn-secondary" onClick={() => setSelected(null)}>
                                        Close
                                    </button>
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
export default MedicalHistory