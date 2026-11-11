import { Link } from "react-router"

function AdminTodayAppointments({ summary }) {
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

    const initials = (name) => (name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()

    return (
        <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h6 fw-bold mb-0">Today's Appointments</h2>
                    <Link to="/admin/appointments" className="small fw-semibold text-decoration-none">View all</Link>
                </div>

                {summary && list.length === 0 && (
                    <div className="text-center text-muted py-4">
                        <i className="bi bi-calendar-check fs-1 d-block mb-2"></i>
                        No appointments today.
                    </div>
                )}

                <div className="d-flex flex-column gap-2">
                    {list.map((a) => (
                        <div key={a.appointmentId} className="border rounded-3 p-3 d-flex align-items-center gap-3">
                            <span className="avatar flex-shrink-0">{initials(a.patientName)}</span>
                            <div className="flex-grow-1">
                                <div className="fw-semibold">{a.patientName}</div>
                                <small className="text-muted">
                                    {a.doctorName ? `Dr. ${a.doctorName}` : "Doctor to be assigned"}
                                    {" - "}
                                    {a.appointmentTime ? a.appointmentTime.slice(0, 5) : "Time to be confirmed"}
                                </small>
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
export default AdminTodayAppointments