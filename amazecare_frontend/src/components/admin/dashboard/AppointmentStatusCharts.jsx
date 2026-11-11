import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js"

ChartJS.register(ArcElement, Tooltip)

function AppointmentStatusChart({ summary }) {
    const colors = {
        CONFIRMED: "#2F8F78",
        COMPLETED: "#4F8EDC",
        REQUESTED: "#F2B84B",
        CANCELLED: "#DC5A5A",
        NO_SHOW: "#8A94A6"
    }

    const formatEnum = (value) => {
        if (!value) return ""
        return value.toLowerCase().split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    }

    const items = summary?.statusCounts || []
    const total = items.reduce((sum, i) => sum + i.count, 0)

    const data = {
        labels: items.map((i) => formatEnum(i.status)),
        datasets: [
            {
                data: items.map((i) => i.count),
                backgroundColor: items.map((i) => colors[i.status] || "#8A94A6"),
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
        <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
                <h2 className="h6 fw-bold mb-3">Appointment Status</h2>

                {!summary && <span className="spinner-border spinner-border-sm"></span>}

                {summary && total === 0 && (
                    <p className="text-muted mb-0">No appointment data yet.</p>
                )}

                {summary && total > 0 && (
                    <div className="row align-items-center g-3">
                        <div className="col-12 col-md-6">
                            <div className="chart-wrap mx-auto">
                                <Doughnut data={data} options={options} />
                                <div className="chart-center text-center">
                                    <div className="fs-3 fw-bold lh-1">{total}</div>
                                    <small className="text-muted">Total</small>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-md-6">
                            <ul className="list-unstyled mb-0">
                                {items.map((i) => (
                                    <li key={i.status} className="d-flex align-items-center justify-content-between mb-2 small">
                                        <span>
                                            <span className="legend-dot me-2"
                                                style={{ background: colors[i.status] || "#8A94A6" }}></span>
                                            {formatEnum(i.status)}
                                        </span>
                                        <span className="fw-semibold">
                                            {Math.round((i.count / total) * 100)}% ({i.count})
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
export default AppointmentStatusChart