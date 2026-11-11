import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router"
import axios from "axios"
import Swal from "sweetalert2"
import { API_SERVER_URL_DEV } from "../../config"

function UpdateDoctor() {
    const location = useLocation()
    const doctor = location.state

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [specialization, setSpecialization] = useState("")
    const [qualification, setQualification] = useState("")

    const [designation, setDesignation] = useState("")
    const [licenseNumber, setLicenseNumber] = useState("")
    const [experienceYears, setExperienceYears] = useState("")
    
    const [errMsg, setErrMsg] = useState("")
    const [errComment, setErrComment] = useState("")

    const navigate = useNavigate()

    const specializations = [
        "GENERAL_MEDICINE",
        "CARDIOLOGY",
        "DERMATOLOGY",
        "ENT",
        "GYNAECOLOGY",
        "NEUROLOGY",
        "ORTHOPAEDICS",
        "PAEDIATRICS",
        "PSYCHIATRY",
        "RADIOLOGY",
        "SURGERY"
    ]

    const designations = [
        "JUNIOR_DOCTOR",
        "RESIDENT_DOCTOR",
        "GENERAL_PRACTITIONER",
        "CONSULTANT",
        "SENIOR_CONSULTANT",
        "CHIEF_MEDICAL_OFFICER",
        "HEAD_OF_DEPARTMENT"
    ]

    const formatEnum = (value) => {
        if (!value) return ""
        if (value === "ENT") return "ENT"

        return value
            .toLowerCase()
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
    }

    // fill the form once the doctor details are available
    useEffect(() => {
        if (doctor) {
            setFirstName(doctor.firstName)
            setLastName(doctor.lastName)
            setSpecialization(doctor.specialization)
            setQualification(doctor.qualification)
            setDesignation(doctor.designation)
            setLicenseNumber(doctor.licenseNumber)
            setExperienceYears(doctor.experienceYears)
        } else {
            navigate("/admin/doctors")
        }
    }, [doctor])

    const processUpdate = async (e) => {
        e.preventDefault()
        setErrMsg("")
        setErrComment("")

        const doctorUpdateDto = {
            firstName,
            lastName,
            specialization,
            qualification,
            designation,
            licenseNumber,
            experienceYears: Number(experienceYears)
        }

        try {
            const response = await axios.put(
                `${API_SERVER_URL_DEV}/api/v1/doctor/${doctor.doctorId}/update`,
                doctorUpdateDto,
                {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }
            )

            await Swal.fire({
                icon: "success",
                title: "Doctor updated",
                text: "Doctor details have been updated successfully.",
                confirmButtonText: "OK",
                confirmButtonColor: "#2F8F78"
            })

            navigate("/admin/doctors")
        } catch (err) {
            if (!err.response) {
                setErrMsg("Unable to reach the server. Please try again later.")
            } else {
                setErrMsg(err.response.data?.message || "Update failed. Please try again.")
                setErrComment(err.response.data?.comments)
            }
        }
    }

    return (
        <div>
            <div className="mb-4">
                <h1 className="h3 fw-bold mb-1">Update Doctor</h1>
                <p className="text-muted mb-0">Update the registered doctor's information.</p>
            </div>

            {doctor && (
                <div className="card border-0 shadow-sm update-card">
                    <div className="card-body p-4 p-md-5">

                        {errMsg && (
                            <div className="alert alert-danger" role="alert">
                                <div className="fw-semibold">{errMsg}</div>
                                {errComment && <small>{errComment}</small>}
                            </div>
                        )}

                        <form onSubmit={processUpdate}>
                            <div className="row g-3">

                                <div className="col-md-6">
                                    <label htmlFor="firstName" className="form-label small fw-semibold">First name</label>
                                    <input id="firstName" type="text" value={firstName}
                                        className="form-control form-control-lg" required
                                        onChange={(e) => setFirstName(e.target.value)} />
                                </div>

                                <div className="col-md-6">
                                    <label htmlFor="lastName" className="form-label small fw-semibold">Last name</label>
                                    <input id="lastName" type="text" value={lastName}
                                        className="form-control form-control-lg" required
                                        onChange={(e) => setLastName(e.target.value)} />
                                </div>

                                <div className="col-md-6">
                                    <label htmlFor="specialization" className="form-label small fw-semibold">Specialization</label>
                                    <select id="specialization" value={specialization} required
                                        className="form-select form-select-lg"
                                        onChange={(e) => setSpecialization(e.target.value)}>
                                        <option value="">Select specialization</option>
                                        {specializations.map((s) => (
                                            <option key={s} value={s}>{formatEnum(s)}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label htmlFor="qualification" className="form-label small fw-semibold">Qualification</label>
                                    <input id="qualification" type="text" value={qualification}
                                        className="form-control form-control-lg" required
                                        onChange={(e) => setQualification(e.target.value)} />
                                </div>

                                <div className="col-md-6">
                                    <label htmlFor="designation" className="form-label small fw-semibold">Designation</label>
                                    <select id="designation" value={designation} required
                                        className="form-select form-select-lg"
                                        onChange={(e) => setDesignation(e.target.value)}>
                                        <option value="">Select designation</option>
                                        {designations.map((d) => (
                                            <option key={d} value={d}>{formatEnum(d)}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label htmlFor="licenseNumber" className="form-label small fw-semibold">License number</label>
                                    <input id="licenseNumber" type="text" value={licenseNumber}
                                        className="form-control form-control-lg" required
                                        onChange={(e) => setLicenseNumber(e.target.value)} />
                                </div>

                                <div className="col-md-6">
                                    <label htmlFor="experienceYears" className="form-label small fw-semibold">Experience (years)</label>
                                    <input id="experienceYears" type="number" min="1" value={experienceYears}
                                        className="form-control form-control-lg" required
                                        onChange={(e) => setExperienceYears(e.target.value)} />
                                </div>

                               
                                <div className="col-12 d-flex flex-column flex-sm-row gap-2 mt-4">
                                    <button type="submit" className="btn btn-primary btn-lg fw-semibold px-5">Save changes</button>
                                    <button type="button" className="btn btn-outline-secondary btn-lg px-4"
                                        onClick={() => navigate("/admin/doctors")}>
                                        Cancel
                                    </button>
                                </div>

                            </div>
                        </form>

                    </div>
                </div>
            )}
        </div>
    )
}
export default UpdateDoctor