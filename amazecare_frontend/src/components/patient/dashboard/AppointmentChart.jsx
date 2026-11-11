import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js"

ChartJS.register(ArcElement, Tooltip)

function AppointmentChart({ summary }) {
    const items = [
        { label: "Upcoming", value: summary?.upcomingAppointments || 0, color: "#2F8F78" },
        { label: "Pending", value: summary?.pendingAppointments || 0, color: "#F2B84B" },
        { label: "Completed", value: summary?.completedVisits || 0, color: "#4FB89C" },
        { label: "Cancelled", value: summary?.cancelledAppointments || 0, color: "#DC5A5A" },
    ]

    const total = items.reduce((sum, i) => sum + i.value, 0)

    const data = {
        labels: items.map((i) => i.label),
        datasets: [
            {
                data: items.map((i) => i.value),
                backgroundColor: items.map((i) => i.color),
                borderWidth: 0,
                hoverOffset: 6
            }
        ]
    }

    const options = {
        cutout: "70%",
        plugins: { legend: { display: false } }
    }

    return (
        <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
                <h2 className="h5 fw-bold mb-3">Appointments Overview</h2>

                {!summary && <span className="spinner-border spinner-border-sm"></span>}

                {summary && total === 0 && (
                    <p className="text-muted mb-0">No appointment data to show yet.</p>
                )}

                {summary && total > 0 && (
                    <>
                        <div className="chart-wrap mx-auto">
                            <Doughnut data={data} options={options} />
                            <div className="chart-center text-center">
                                <div className="fs-3 fw-bold lh-1">{total}</div>
                                <small className="text-muted">Total</small>
                            </div>
                        </div>

                        <ul className="list-unstyled mt-4 mb-0">
                            {items.map((i) => (
                                <li key={i.label} className="d-flex align-items-center justify-content-between mb-2">
                                    <span>
                                        <span className="legend-dot me-2" style={{ background: i.color }}></span>
                                        {i.label}
                                    </span>
                                    <span className="fw-semibold">{i.value}</span>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </div>
    )
}
export default AppointmentChart