import { useEffect, useState } from "react"
import axios from "axios"
import { API_SERVER_URL_DEV } from "../../config"
import { useLocation, useNavigate } from "react-router"

function DoctorPatientHistory() {
    const navigate = useNavigate()
    const { state } = useLocation()
    const patient = state?.patient
    

    const [history, setHistory] = useState([])

    const [errMsg, setErrMsg] = useState("")

    useEffect(() => {
        setErrMsg("")
        if (!patient) {
            navigate("/doctor/patients")
            return
        }

        const fetchHistory = async () => {
            try {
                const response = await axios.get(`${API_SERVER_URL_DEV}/api/v1/doctor/patients/${patient.patientId}/medical-records`, {
                    headers: { Authorization: "Bearer " + localStorage.getItem("token") }
                })
                console.log(response.data);
                
                setHistory(response.data)
            } catch (err) {
                setErrMsg(!err.response ? "Unable to reach the server. Please try again later." : err.response.data?.message || "Unable to fetch medical history.")
            }
        }

        fetchHistory()
    }, [])
    const formatEnum = (value) => {
        if (!value) return "-"
        return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, char => char.toUpperCase())
    }

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 fw-bold mb-1">Medical History</h1>
                    <p className="text-muted mb-0">Consultation records of {patient?.firstName} {patient?.lastName}</p>
                </div>
                <button className="btn btn-outline-secondary" onClick={() => navigate("/doctor/patients")}>
                    <i className="bi bi-arrow-left me-1"></i>Back
                </button>
            </div>

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-3">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <small className="text-muted d-block">Patient Name</small>
                            <span className="fw-semibold">{patient?.firstName} {patient?.lastName}</span>
                        </div>
                        <div className="col-md-2">
                            <small className="text-muted d-block">Patient ID</small>
                            <span className="fw-semibold">#{patient?.patientId}</span>
                        </div>
                        <div className="col-md-2">
                            <small className="text-muted d-block">Phone</small>
                            <span className="fw-semibold">{patient?.phone || "-"}</span>
                        </div>
                        <div className="col-md-2">
                            <small className="text-muted d-block">Gender</small>
                            <span className="fw-semibold">{patient?.gender || "-"}</span>
                        </div>
                        <div className="col-md-3">
                            <small className="text-muted d-block">Address</small>
                            <span className="fw-semibold">{patient?.address || "-"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {errMsg && (
                <div className="alert alert-danger">
                    <div>{errMsg}</div>
                </div>
            )}
            {!errMsg && history.length > 0 && (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0">Consultation History</h5>
                        <span className="badge bg-body-secondary text-body">{history.length} Records</span>
                    </div>

                    <div className="row g-3">
                        {history.map((record) => (
                            <div className="col-12" key={record.medicalRecordId}>
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body p-3">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <h6 className="fw-bold mb-1">Consultation #{record.medicalRecordId}</h6>
                                                <small className="text-muted">
                                                    <i className="bi bi-calendar3 me-1"></i>{record.appointmentDate}
                                                </small>
                                            </div>
                                        </div>

                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <small className="text-muted d-block">Diagnosis</small>
                                                <span className="fw-semibold">{record.diagnosis || "-"}</span>
                                            </div>
                                            <div className="col-md-6">
                                                <small className="text-muted d-block">Symptoms</small>
                                                <span>{record.symptoms || "-"}</span>
                                            </div>
                                            <div className="col-md-6">
                                                <small className="text-muted d-block">Physical Examination</small>
                                                <span>{record.physicalExamination || "-"}</span>
                                            </div>
                                            <div className="col-md-6">
                                                <small className="text-muted d-block">Treatment Plan</small>
                                                <span>{record.treatmentPlan || "-"}</span>
                                            </div>
                                        </div>

                                        <hr />

                                        <h6 className="fw-bold mb-2">
                                            <i className="bi bi-capsule me-2 text-primary"></i>Prescription
                                        </h6>

                                        {record.prescription?.prescribedItemResDto?.length > 0 ? (
                                            <div className="table-responsive">
                                                <table className="table table-sm table-hover align-middle">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Medicine</th>
                                                            <th>Dosage</th>
                                                            <th>Frequency</th>
                                                            <th>Food Timing</th>
                                                            <th>Duration</th>
                                                            <th>Instructions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {record.prescription.prescribedItemResDto.map((item, index) => (
                                                            <tr key={index}>
                                                                <td>{item.medicineName}</td>
                                                                <td>{item.dosage}</td>
                                                                <td>{item.frequency}</td>
                                                                <td>{item.foodTiming === "BF" ? "Before Food" : item.foodTiming === "AF" ? "After Food" : "-"}</td>
                                                                <td>{item.durationDays} days</td>
                                                                <td>{item.Instructions || "-"}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-muted small mb-0">No prescription available.</p>
                                        )}

                                        {record.prescription?.instructions && (
                                            <p className="small text-muted mt-2 mb-0">
                                                <strong>Prescription Instructions:</strong> {record.prescription.instructions}
                                            </p>
                                        )}

                                        <hr />

                                        <h6 className="fw-bold mb-2">
                                            <i className="bi bi-clipboard2-pulse me-2 text-primary"></i>Recommended Lab Tests
                                        </h6>

                                        {record.labResults?.length > 0 ? (
                                            <div className="d-flex flex-wrap gap-2">
                                                {record.labResults.map((lab) => (
                                                    <div className="border rounded p-2" key={lab.labResultsId}>
                                                        <span className="fw-semibold small">{formatEnum(lab.testName)}</span>
                                                        <span className="badge bg-body-secondary text-body ms-2">{formatEnum(lab.testStatus)}</span>
                                                        <div className="small text-muted mt-1">Result: {lab.resultValue || "Pending"}</div>
                                                        {lab.resultDate && <div className="small text-muted">Date: {lab.resultDate}</div>}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted small mb-0">No lab tests recommended.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}


export default DoctorPatientHistory