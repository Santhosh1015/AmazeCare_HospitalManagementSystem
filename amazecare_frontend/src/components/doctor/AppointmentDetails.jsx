import { useLocation, useNavigate } from "react-router"

function AppointmentDetails() {
    const { state } = useLocation()
    const navigate = useNavigate()
    const appointment = state?.appointment
    console.log(appointment);
    

    if (!appointment) {
        navigate("/doctor/appointments", { replace: true })
        return null
    }
    const formatEnum = (value) => {
        if (!value) return ""
        return value.toLowerCase()
            .split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
    }
    const getStatusColor = (value) => {
        switch (value) {
            case "CONFIRMED": return "success"
            case "COMPLETED": return "primary"
            case "REQUESTED": return "warning"
            case "CANCELLED": return "danger"
            case "NO_SHOW": return "secondary"
            default: return "secondary"
        }
    }


    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 fw-bold mb-1">Appointment Details</h1>
                    <p className="text-muted mb-0">View patient appointment information.</p>
                </div>
                <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                    <i className="bi bi-arrow-left me-2"></i>Back
                </button>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">Patient Information</h5>

                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="text-muted small">Patient Name</label>
                            <p className="fw-semibold">
                                {appointment.patientFirstName} {appointment.patientLastName}
                            </p>
                        </div>
                        <div className="col-md-6">
                            <label className="text-muted small">Phone</label>
                            <p className="fw-semibold">{appointment.patientContact}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="text-muted small">Appointment Date</label>
                            <p className="fw-semibold">{appointment.appointmentDate}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="text-muted small">Appointment Time</label>
                            <p className="fw-semibold">{appointment.appointmentTime}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="text-muted small">Visit Type</label>
                            <p className="fw-semibold">{formatEnum(appointment.visitType)}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="text-muted small">Status</label>
                            <p>
                                <span className={`badge text-bg-${getStatusColor(appointment.status)}`}>
                                    {formatEnum(appointment.status)}
                                </span>
                            </p>
                        </div>
                        <div className="col-12">
                            <label className="text-muted small">Reason for Visit</label>
                            <p className="fw-semibold">{appointment.reason || "Not specified"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AppointmentDetails