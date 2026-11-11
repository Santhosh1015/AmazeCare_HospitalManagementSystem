
import { useState } from "react"
import { useLocation, useNavigate } from "react-router"
import axios from "axios"
import Swal from "sweetalert2"
import { API_SERVER_URL_DEV } from "../../config"

function ConsultationForm() {
    const { state } = useLocation()
    const navigate = useNavigate()
    const appointment = state?.appointment

    const labTests = [
        "CBC", "BLOOD_SUGAR", "HbA1c", "LIPID_PROFILE",
        "LIVER_FUNCTION_TEST", "KIDNEY_FUNCTION_TEST",
        "THYROID_FUNCTION_TEST", "URINE_ANALYSIS", "ECG",
        "XRAY", "ULTRASOUND", "MRI", "CT_SCAN"
    ]

    const [symptoms, setSymptoms] = useState("")
    const [physicalExamination, setPhysicalExamination] = useState("")
    const [diagnosis, setDiagnosis] = useState("")
    const [treatmentPlan, setTreatmentPlan] = useState("")
    const [recommendedLabTests, setRecommendedLabTests] = useState([])

    const [prescribedDate, setPrescribedDate] = useState(
        new Date().toLocaleDateString("en-CA")
    )
    const [instructions, setInstructions] = useState("")
    const [prescribedItems, setPrescribedItems] = useState([])

    const [medicineName, setMedicineName] = useState("")
    const [dosage, setDosage] = useState("")
    const [frequency, setFrequency] = useState("")
    const [foodTiming, setFoodTiming] = useState("")
    const [durationDays, setDurationDays] = useState("")
    const [medicineInstructions, setMedicineInstructions] = useState("")

    const [errMsg, setErrMsg] = useState("")
    const [errComment, setErrComment] = useState("")

    if (!appointment) {
        navigate("/doctor/appointments", { replace: true })
        return null
    }

    const handleLabTest = (test) => {
        setRecommendedLabTests(
            recommendedLabTests.includes(test)
                ? recommendedLabTests.filter((t) => t !== test)
                : [...recommendedLabTests, test]
        )
    }

    const addMedicine = () => {
        if (!medicineName || !dosage || !frequency ||
            !foodTiming || !durationDays) {
            setErrMsg("Please complete all required medicine fields.")
            return
        }

        setPrescribedItems([
            ...prescribedItems,
            {
                medicineName,
                dosage,
                frequency,
                foodTiming,
                durationDays: Number(durationDays),
                Instructions: medicineInstructions
            }
        ])

        setMedicineName("")
        setDosage("")
        setFrequency("")
        setFoodTiming("")
        setDurationDays("")
        setMedicineInstructions("")
        setErrMsg("")
    }

    const removeMedicine = (index) => {
        setPrescribedItems(
            prescribedItems.filter((item, i) => i !== index)
        )
    }
    const frequencyOptions = [
        { value: "ONE_ZERO_ZERO", label: "1-0-0 (Morning)" },
        { value: "ZERO_ONE_ZERO", label: "0-1-0 (Afternoon)" },
        { value: "ZERO_ZERO_ONE", label: "0-0-1 (Night)" },
        { value: "ONE_ONE_ZERO", label: "1-1-0 (Morning, Afternoon)" },
        { value: "ONE_ZERO_ONE", label: "1-0-1 (Morning, Night)" },
        { value: "ZERO_ONE_ONE", label: "0-1-1 (Afternoon, Night)" },
        { value: "ONE_ONE_ONE", label: "1-1-1 (Morning, Afternoon, Night)" }
    ]

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrMsg("")
        setErrComment("")

        const requestData = {
            symptoms,
            physicalExamination,
            diagnosis,
            treatmentPlan,
            recommendedLabTests,
            prescriptionReqDto: {
                prescribedDate,
                instructions,
                prescribedItems
            }
        }

        try {

            await axios.put(
                `${API_SERVER_URL_DEV}/api/v1/appointment/consultation/${appointment.appointmentId}`,
                requestData,
                {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("token")
                    }
                }
            )

            await Swal.fire({
                icon: "success",
                title: "Consultation Saved",
                text: "Patient consultation submitted successfully.",
                confirmButtonColor: "#3bf7cb"
            })

            navigate("/doctor/appointments")
        } catch (err) {
            if (!err.response) {
                setErrMsg("Unable to reach the server. Please try again later.")
            } else {
                setErrMsg(err.response.data?.message || "Unable to submit consultation.")
                setErrComment(err.response.data?.comments || "")
            }
        }
    }

    return (
        <div>
            <div className="mb-4">
                <h1 className="h3 fw-bold mb-1">Patient Consultation</h1>
                <p className="text-muted mb-0">
                    Record examination and treatment details.
                </p>
            </div>

            <div className="card border-0 shadow-sm mb-3">
                <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">Patient Information</h5>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="text-muted small">Patient Name</label>
                            <p className="fw-semibold mb-0">
                                {appointment.patientFirstName} {appointment.patientLastName}
                            </p>
                        </div>
                        <div className="col-md-4">
                            <label className="text-muted small">Appointment Date</label>
                            <p className="fw-semibold mb-0">{appointment.appointmentDate}</p>
                        </div>
                        <div className="col-md-4">
                            <label className="text-muted small">Appointment Time</label>
                            <p className="fw-semibold mb-0">{appointment.appointmentTime}</p>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body p-4">
                        <h5 className="fw-bold mb-3">Clinical Examination</h5>

                        <div className="mb-3">
                            <label className="form-label small fw-semibold">Symptoms *</label>
                            <textarea className="form-control" rows="3"
                                value={symptoms} onChange={(e) => setSymptoms(e.target.value)}
                                required />
                        </div>

                        <div className="mb-3">
                            <label className="form-label small fw-semibold">Physical Examination *</label>
                            <textarea className="form-control" rows="3"
                                value={physicalExamination}
                                onChange={(e) => setPhysicalExamination(e.target.value)}
                                required />
                        </div>

                        <div className="mb-3">
                            <label className="form-label small fw-semibold">Diagnosis *</label>
                            <textarea className="form-control" rows="2"
                                value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}
                                required />
                        </div>

                        <div>
                            <label className="form-label small fw-semibold">Treatment Plan</label>
                            <textarea className="form-control" rows="3"
                                value={treatmentPlan}
                                onChange={(e) => setTreatmentPlan(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body p-4">
                        <h5 className="fw-bold mb-3">Recommended Lab Tests</h5>
                        <div className="row g-3">
                            {labTests.map((test) => (
                                <div className="col-md-4 col-6" key={test}>
                                    <div className="form-check">
                                        <input className="form-check-input"
                                            type="checkbox" id={test}
                                            checked={recommendedLabTests.includes(test)}
                                            onChange={() => handleLabTest(test)} />
                                        <label className="form-check-label" htmlFor={test}>
                                            {test.replaceAll("_", " ")}
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body p-4">
                        <h5 className="fw-bold mb-3">Prescription</h5>

                        <div className="mb-3">
                            <label className="form-label small fw-semibold">Prescribed Date *</label>
                            <input type="date" className="form-control"
                                value={prescribedDate}
                                onChange={(e) => setPrescribedDate(e.target.value)}
                                required />
                        </div>

                        <div className="mb-4">
                            <label className="form-label small fw-semibold">Prescription Instructions</label>
                            <textarea className="form-control" rows="2"
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)} />
                        </div>

                        <h6 className="fw-bold mb-3">Add Medicine</h6>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label small fw-semibold">Medicine Name</label>
                                <input className="form-control" value={medicineName}
                                    onChange={(e) => setMedicineName(e.target.value)} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-semibold">Dosage</label>
                                <input className="form-control" value={dosage}
                                    onChange={(e) => setDosage(e.target.value)} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold">Frequency</label>
                                <select className="form-select" value={frequency}
                                    onChange={(e) => setFrequency(e.target.value)}>
                                    <option value="">Select Frequency</option>
                                    {frequencyOptions.map((f) => (
                                        <option key={f.value} value={f.value}>
                                            {f.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold">Food Timing</label>
                                <select className="form-select" value={foodTiming}
                                    onChange={(e) => setFoodTiming(e.target.value)}>
                                    <option value="">Select Food Timing</option>
                                    <option value="BF">Before Food</option>
                                    <option value="AF">After Food</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold">Duration (Days)</label>
                                <input type="number" min="1" className="form-control"
                                    value={durationDays}
                                    onChange={(e) => setDurationDays(e.target.value)} />
                            </div>
                            <div className="col-12">
                                <label className="form-label small fw-semibold">Medicine Instructions</label>
                                <input className="form-control" value={medicineInstructions}
                                    onChange={(e) => setMedicineInstructions(e.target.value)} />
                            </div>
                            <div className="col-12">
                                <button type="button" className="btn btn-outline-primary btn-sm"
                                    onClick={addMedicine}>
                                    <i className="bi bi-plus-lg me-1"></i>
                                    Add Medicine
                                </button>
                            </div>
                        </div>

                        {prescribedItems.length > 0 && (
                            <div className="table-responsive mt-4">
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th>Medicine</th>
                                            <th>Dosage</th>
                                            <th>Frequency</th>
                                            <th>Food Timing</th>
                                            <th>Duration</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {prescribedItems.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.medicineName}</td>
                                                <td>{item.dosage}</td>
                                                <td>{item.frequency}</td>
                                                <td>{item.foodTiming}</td>
                                                <td>{item.durationDays} days</td>
                                                <td>
                                                    <button type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => removeMedicine(index)}>
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {errMsg && (
                    <div className="alert alert-danger">
                        <div>{errMsg}</div>
                        {errComment && <small>{errComment}</small>}
                    </div>
                )}

                <div className="d-flex justify-content-end gap-2 mb-4">
                    <button type="button" className="btn btn-outline-secondary"
                        onClick={() => navigate(-1)}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                        Submit Consultation
                    </button>
                </div>
            </form>
        </div>
    )
}

export default ConsultationForm
