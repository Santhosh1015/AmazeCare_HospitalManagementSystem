import { useNavigate } from "react-router"
import { useSelector } from "react-redux"

function PatientProfile() {
    const navigate = useNavigate()
    const patient = useSelector((state) => state.patientData.patient)

    const formatEnum = (value) => {
        if (value === "ENT") return "ENT"
        if (!value) return ""
        return value.toLowerCase().split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    }


    const formatDob = (d) =>
        d ? new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"

    const initials = patient
        ? `${patient.firstName?.[0] || ""}${patient.lastName?.[0] || ""}`.toUpperCase()
        : ""

    const details = [
        { icon: "bi-person", label: "Full name", value: `${patient?.firstName || ""} ${patient?.lastName || ""}` },
        { icon: "bi-envelope", label: "Email", value: localStorage.getItem("email") },
        { icon: "bi-telephone", label: "Phone", value: patient?.phone },
        { icon: "bi-calendar-event", label: "Date of birth", value: formatDob(patient?.dateOfBirth) },
        { icon: "bi-gender-ambiguous", label: "Gender", value: formatEnum(patient?.gender) },
        { icon: "bi-geo-alt", label: "Address", value: patient?.address },
    ]

    return (
        <div>
            <div className="mb-4">
                <h1 className="h3 fw-bold mb-1">My Profile</h1>
                <p className="text-muted mb-0">Your personal information.</p>
            </div>

            {!patient && (
                <div className="text-center py-5">
                    <span className="spinner-border spinner-border-sm me-2"></span>Loading profile...
                </div>
            )}

            {patient && (
                <div className="row g-4">

                    {/* <!-- Identity card --> */}
                    <div className="col-12 col-lg-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body text-center p-4 d-flex flex-column align-items-center justify-content-center">
                                <span className="profile-avatar mb-3">{initials}</span>
                                <h2 className="h5 fw-bold mb-1">{patient.firstName} {patient.lastName}</h2>
                                <p className="text-muted mb-4">Patient</p>
                                <button type="button" className="btn btn-primary fw-semibold px-4"
                                    onClick={() => navigate("/patient/update-profile")}>
                                    <i className="bi bi-pencil-square me-2"></i>Update Profile
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* <!-- Personal information --> */}
                    <div className="col-12 col-lg-8">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body p-4">
                                <h2 className="h5 fw-bold mb-3">Personal Information</h2>
                                <ul className="list-group list-group-flush">
                                    {details.map((d) => (
                                        <li key={d.label} className="list-group-item bg-transparent px-0 py-3">
                                            <div className="row align-items-center">
                                                <div className="col-5 col-md-4 text-muted">
                                                    <i className={`bi ${d.icon} me-2 text-primary`}></i>{d.label}
                                                </div>
                                                <div className="col-7 col-md-8 fw-semibold text-break">
                                                    {d.value || "-"}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}
export default PatientProfile