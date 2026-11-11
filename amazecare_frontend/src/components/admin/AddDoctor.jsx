
import { useState } from "react"
import { Link, useNavigate } from "react-router"
import axios from "axios"
import { API_SERVER_URL_DEV } from "../../config"

function AddDoctor() {

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [specialization, setSpecialization] = useState("")
    const [qualification, setQualification] = useState("")
    const [designation, setDesignation] = useState("")
    const [licenseNumber, setLicenseNumber] = useState("")
    const [experienceYears, setExperienceYears] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const [errMsg, setErrMsg] = useState("")
    const [errComment, setErrComment] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const navigate = useNavigate()

    const specializations = [
        "GENERAL_MEDICINE", "CARDIOLOGY", "DERMATOLOGY", "NEUROLOGY",
        "ORTHOPEDICS", "PEDIATRICS", "GYNECOLOGY", "PSYCHIATRY",
        "OPHTHALMOLOGY", "ENT", "UROLOGY", "ONCOLOGY", "RADIOLOGY",
        "DENTISTRY", "ANESTHESIOLOGY", "SURGERY"
    ]

    // Replace these with the exact constants from your DoctorDesignation enum.
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
        if (value === "ENT") return "ENT"
        if (!value) return ""
        return value.toLowerCase().split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    }

    const processRegister = async (e) => {

        e.preventDefault()

        setErrMsg("")
        setErrComment("")

        const doctorDto = {
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName,
            specialization: specialization,
            qualification: qualification,
            designation: designation,
            licenseNumber: licenseNumber,
            experienceYears: Number(experienceYears)
        }

        try {

            const response = await axios.post(
                `${API_SERVER_URL_DEV}/api/v1/doctor/add`,
                doctorDto,
                {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }
            )

            console.log(response.data)

            navigate("/admin/doctors")

        } catch (err) {

            if (!err.response) {
                setErrMsg("Unable to reach the server. Please try again later.")
            } else {
                setErrMsg(err.response.data?.message || "Could not register doctor.")
                setErrComment(err.response.data?.comments || "")
            }
        }
    }

    return (
        <div className="container-fluid">

            <div className="mb-4">
                <button type="button" className="btn btn-outline-primary btn-sm mb-3"
                    onClick={() => navigate("/admin/doctors")}>
                    <i className="bi bi-arrow-left me-2"></i>Back to Doctors
                </button>

                <h1 className="h3 fw-bold mb-1">Register Doctor</h1>
                <p className="text-muted mb-0">Add a new doctor to the AmazeCare healthcare system.</p>
            </div>

            <div className="card border-0 shadow-sm w-100">
                <div className="card-body p-4 p-md-5">

                    <div className="mb-4">
                        <h2 className="h5 fw-bold mb-1">Doctor Information</h2>
                        <p className="text-muted small mb-0">
                            Enter the professional and account details of the doctor.
                        </p>
                    </div>

                    {errMsg && (
                        <div className="alert alert-danger" role="alert">
                            <div className="fw-semibold">{errMsg}</div>
                            {errComment && <small>{errComment}</small>}
                        </div>
                    )}

                    <form onSubmit={(e) => processRegister(e)}>
                        <div className="row g-3">

                            <div className="col-md-6">
                                <label htmlFor="firstName" className="form-label small fw-semibold">
                                    First name
                                </label>
                                <input id="firstName" type="text" value={firstName} className="form-control form-control-lg"
                                    placeholder="Enter first name" required
                                    onChange={(e) => setFirstName(e.target.value)} />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="lastName" className="form-label small fw-semibold">
                                    Last name
                                </label>
                                <input id="lastName" type="text" value={lastName}
                                    className="form-control form-control-lg"
                                    placeholder="Enter last name" required
                                    onChange={(e) => setLastName(e.target.value)} />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="specialization" className="form-label small fw-semibold">
                                    Specialization
                                </label>
                                <select id="specialization" value={specialization} required className="form-select form-select-lg"
                                    onChange={(e) => setSpecialization(e.target.value)}>
                                    <option value="">Select specialization</option>
                                    {specializations.map((s) => (
                                        <option key={s} value={s}>{formatEnum(s)}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="designation" className="form-label small fw-semibold">
                                    Designation
                                </label>
                                <select id="designation" value={designation} required className="form-select form-select-lg" onChange={(e) => setDesignation(e.target.value)}>
                                    <option value="">Select designation</option>
                                    {designations.map((d) => (
                                        <option key={d} value={d}>{formatEnum(d)}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="qualification" className="form-label small fw-semibold">
                                    Qualification
                                </label>
                                <input id="qualification" type="text" value={qualification} className="form-control form-control-lg"
                                    placeholder="eg: MBBS, MD" required
                                    onChange={(e) => setQualification(e.target.value)} />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="licenseNumber" className="form-label small fw-semibold">
                                    Medical License Number
                                </label>
                                <input id="licenseNumber" type="text" value={licenseNumber}
                                    className="form-control form-control-lg"
                                    placeholder="Enter license number" required
                                    onChange={(e) => setLicenseNumber(e.target.value)} />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="experienceYears" className="form-label small fw-semibold">
                                    Experience (Years)
                                </label>
                                <input id="experienceYears" type="number" value={experienceYears}
                                    className="form-control form-control-lg"
                                    placeholder="eg: 5" min="1" required
                                    onChange={(e) => setExperienceYears(e.target.value)} />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="email" className="form-label small fw-semibold">
                                    Email address
                                </label>
                                <input id="email" type="email" value={email}
                                    className="form-control form-control-lg"
                                    placeholder="doctor@example.com" required
                                    onChange={(e) => setEmail(e.target.value)} />
                            </div>

                            <div className="col-12">
                                <label htmlFor="password" className="form-label small fw-semibold">
                                    Password
                                </label>
                                <div className="input-group input-group-lg">
                                    <input id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        className="form-control"
                                        placeholder="Enter password" required
                                        onChange={(e) => setPassword(e.target.value)} />

                                    <button type="button" className="btn btn-outline-secondary px-3"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}>
                                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                    </button>
                                </div>
                                <small className="text-muted">
                                    Password must contain at least one letter, one digit and 8 characters.
                                </small>
                            </div>

                            <div className="col-12 d-flex justify-content-end gap-2 mt-4">
                                <button type="button" className="btn btn-outline-secondary btn-lg"
                                    onClick={() => navigate("/admin/doctors")}>
                                    Cancel
                                </button>

                                <button type="submit" className="btn btn-primary btn-lg fw-semibold">
                                    <i className="bi bi-person-plus me-2"></i>Register Doctor
                                </button>
                            </div>

                        </div>
                    </form>

                </div>
            </div>

        </div>
    )
}

export default AddDoctor
