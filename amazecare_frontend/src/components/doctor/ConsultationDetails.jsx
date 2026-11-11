
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import axios from "axios"
import { API_SERVER_URL_DEV } from "../../config"

function ConsultationDetails() {
    const { state } = useLocation()
    const navigate = useNavigate()
    const appointment = state?.appointment    

    const [consultation, setConsultation] = useState(null)
    const [errMsg, setErrMsg] = useState("")

    useEffect(() => {
        if (!appointment) {
            navigate("/doctor/appointments", { replace: true })
            return
        }

        const fetchConsultation = async () => {
            try {
                
                const response = await axios.get(
                    `${API_SERVER_URL_DEV}/api/v1/appointments/${appointment.appointmentId}/consultation`,
                    {
                        headers: {
                            Authorization: "Bearer " + localStorage.getItem("token")
                        }
                    }
                )

                console.log(response.data);
                
                setConsultation(response.data)

            } catch (err) {
                setErrMsg(!err.response
                    ? "Unable to reach the server. Please try again later."
                    : err.response.data?.message || "Unable to fetch consultation details."
                )
            }
        }

        fetchConsultation()

    }, [appointment, navigate])

    if (!appointment) return null


    if (errMsg) {
        return <div className="alert alert-danger">{errMsg}</div>
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 fw-bold mb-1">Consultation Details</h1>
                    <p className="text-muted mb-0">
                        View saved patient consultation.
                    </p>
                </div>

                <button className="btn btn-outline-secondary"
                    onClick={() => navigate(-1)}>
                    <i className="bi bi-arrow-left me-2"></i>
                    Back
                </button>
            </div>

            <div className="card border-0 shadow-sm mb-3">
                <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">Patient Information</h5>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <small className="text-muted">Patient Name</small>
                            <p className="fw-semibold">{consultation?.patientName}</p>
                        </div>
                        <div className="col-md-4">
                            <small className="text-muted">Appointment Date</small>
                            <p className="fw-semibold">{consultation?.appointmentDate}</p>
                        </div>
                        <div className="col-md-4">
                            <small className="text-muted">Medical Record ID</small>
                            <p className="fw-semibold">{consultation?.medicalRecordId}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm mb-3">
                <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">Clinical Details</h5>

                    <div className="mb-3">
                        <label className="small text-muted">Symptoms</label>
                        <p>{consultation?.symptoms}</p>
                    </div>

                    <div className="mb-3">
                        <label className="small text-muted">Physical Examination</label>
                        <p>{consultation?.physicalExamination}</p>
                    </div>

                    <div className="mb-3">
                        <label className="small text-muted">Diagnosis</label>
                        <p>{consultation?.diagnosis}</p>
                    </div>

                    <div>
                        <label className="small text-muted">Treatment Plan</label>
                        <p>{consultation?.treatmentPlan || "Not specified"}</p>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm mb-3">
                <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">Prescription</h5>

                    {consultation?.prescription ? (
                        <>
                            <p>
                                <span className="text-muted">Prescribed Date: </span>
                                {consultation?.appointmentDate}
                            </p>
                            <p>
                                <span className="text-muted">Instructions: </span>
                                {consultation?.prescription.instructions || "None"}
                            </p>

                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th>Medicine</th>
                                            <th>Dosage</th>
                                            <th>Frequency</th>
                                            <th>Food Timing</th>
                                            <th>Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {consultation?.prescription.prescribedItemResDto?.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.medicineName}</td>
                                                <td>{item.dosage}</td>
                                                <td>{item.frequency}</td>
                                                <td>{item.foodTiming}</td>
                                                <td>{item.durationDays} days</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <p className="text-muted mb-0">No prescription recorded.</p>
                    )}
                </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">Lab Results</h5>

                    {consultation?.labResults?.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>Test</th>
                                        <th>Result</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {consultation.labResults.map((lab, index) => (
                                        <tr key={index}>
                                            <td>{lab.testName}</td>
                                            <td>{lab.testStatus}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-muted mb-0">No lab results available.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ConsultationDetails
