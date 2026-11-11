function DoctorTodayAppointments({ summary }) {
    const list = summary?.todayAppointmentList || []

    const statusColor = (status) => {
        switch (status) {
            case "REQUESTED": return "warning"
            case "CONFIRMED": return "primary"
            case "COMPLETED": return "success"
            case "CANCELLED": return "danger"
            default: return "secondary"
        }
    }

    const formatEnum = (value) => {
        if (!value) return ""
        return value.toLowerCase().split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    }

    return (
        <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
                <h2 className="h6 fw-bold mb-3">Today's Appointments</h2>

                {!summary && <span className="spinner-border spinner-border-sm"></span>}

                {summary && list.length === 0 && (
                    <div className="text-center text-muted py-4">
                        <i className="bi bi-calendar-check fs-1 d-block mb-2"></i>
                        No appointments scheduled for today.
                    </div>
                )}

                <div className="d-flex flex-column gap-2">
                    {list.map((a) => (
                        <div key={a.appointmentId} className="border rounded-3 p-3 d-flex align-items-center gap-3">
                            <div className="date-box date-box-sm flex-shrink-0 text-center">
                                <div className="fw-bold lh-1">
                                    {a.appointmentTime ? a.appointmentTime.slice(0, 5) : "--:--"}
                                </div>
                            </div>

                            <div className="flex-grow-1">
                                <div className="fw-semibold">{a.patientName}</div>
                                <small className="text-muted d-block">{formatEnum(a.visitType)}</small>
                                {a.reason && (
                                    <small className="text-muted d-block text-truncate" style={{ maxWidth: "260px" }}>
                                        {a.reason}
                                    </small>
                                )}
                            </div>

                            <span className={`badge rounded-pill text-bg-${statusColor(a.status)}`}>
                                {formatEnum(a.status)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
export default DoctorTodayAppointments