import StatCard from "./StatCard"

function AppointmentStats({ summary }) {
    // show "-" until the summary has loaded
    const val = (v) => (summary ? v : "-")

    const stats = [
        { label: "Upcoming", value: val(summary?.upcomingAppointments), icon: "bi-calendar-event", color: "primary" },
        { label: "Completed visits", value: val(summary?.completedVisits), icon: "bi-check2-circle", color: "success" },
        { label: "Pending", value: val(summary?.pendingAppointments), icon: "bi-hourglass-split", color: "warning" },
        { label: "Cancelled", value: val(summary?.cancelledAppointments), icon: "bi-x-circle", color: "danger" },
    ]

    return (
        <div className="row g-3 mb-4">
            {stats.map((s) => (
                <div key={s.label} className="col-6 col-lg-3">
                    <StatCard {...s} />
                </div>
            ))}
        </div>
    )
}
export default AppointmentStats