
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import axios from "axios"
import { API_SERVER_URL_DEV } from "../../config"

function DoctorProfile() {
    const navigate = useNavigate()
    const [doctor, setDoctor] = useState(null)
    const [errMsg, setErrMsg] = useState("")

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(API_SERVER_URL_DEV + "/api/v1/doctor/profile", {
                    headers: { Authorization: "Bearer " + localStorage.getItem("token") }
                })
                setDoctor(response.data)
            } catch (err) {
                setErrMsg(!err.response ? "Unable to reach the server. Please try again later." : err.response.data?.message || "Unable to fetch profile.")
            }
        }
        fetchProfile()
    }, [])

    const formatEnum = (value) => {
        if (!value) return ""
        return value.toLowerCase().split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    }

    const initials = doctor ? `${doctor.firstName?.[0] || ""}${doctor.lastName?.[0] || ""}`.toUpperCase() : ""

    const details = [
        { icon: "bi-person", label: "Full name", value: `${doctor?.firstName || ""} ${doctor?.lastName || ""}` },
        { icon: "bi-envelope", label: "Email", value: localStorage.getItem("email") },
        { icon: "bi-award", label: "Specialization", value: formatEnum(doctor?.specialization) },
        { icon: "bi-mortarboard", label: "Qualification", value: doctor?.qualification },
        { icon: "bi-briefcase", label: "Designation", value: formatEnum(doctor?.designation) },
        { icon: "bi-card-text", label: "License number", value: doctor?.licenseNumber },
        { icon: "bi-calendar-check", label: "Experience", value: doctor?.experienceYears != null ? `${doctor.experienceYears} years` : "-" }
    ]

    return (
        <div>
            <div className="mb-4">
                <h1 className="h3 fw-bold mb-1">My Profile</h1>
                <p className="text-muted mb-0">Your professional information.</p>
            </div>

            {errMsg && <div className="alert alert-danger">{errMsg}</div>}

            {doctor && (
                <div className="row g-4">
                    <div className="col-12 col-lg-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body text-center p-4 d-flex flex-column align-items-center justify-content-center">
                                <span className="profile-avatar mb-3">{initials}</span>
                                <h2 className="h5 fw-bold mb-1">{doctor.firstName} {doctor.lastName}</h2>
                                <p className="text-muted mb-4">{formatEnum(doctor.specialization)}</p>
                            
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-lg-8">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body p-4">
                                <h2 className="h5 fw-bold mb-3">Professional Information</h2>
                                <ul className="list-group list-group-flush">
                                    {details.map((d) => (
                                        <li key={d.label} className="list-group-item bg-transparent px-0 py-3">
                                            <div className="row align-items-center">
                                                <div className="col-5 col-md-4 text-muted">
                                                    <i className={`bi ${d.icon} me-2 text-primary`}></i>{d.label}
                                                </div>
                                                <div className="col-7 col-md-8 fw-semibold text-break">{d.value || "-"}</div>
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

export default DoctorProfile
