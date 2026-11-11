import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from "chart.js"

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

function DoctorOverview({ summary }) {
    const formatEnum = (value) => {
        if (value === "ENT") return "ENT"
        if (!value) return ""

        return value.toLowerCase().split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
    }

    const items = summary?.doctorsBySpecialization || []

    const data = {
        labels: items.map((i) => formatEnum(i.specialization)),
        datasets: [{
            label: "Doctors",
            data: items.map((i) => i.count),
            backgroundColor: "#2F8F78",
            hoverBackgroundColor: "#1F6F5C",
            borderRadius: 6,
            barThickness: 18
        }]
    }

    const options = {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => ` ${context.raw} Doctors`
                }
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: { precision: 0, stepSize: 1 },
                grid: { display: false }
            },
            y: {
                grid: { display: false }
            }
        }
    }

    return (
        <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
                <h2 className="h6 fw-bold mb-3">Doctor Overview</h2>

                {!summary && (
                    <span className="spinner-border spinner-border-sm"></span>
                )}

                {summary && items.length === 0 && (
                    <p className="text-muted mb-0">No doctors registered yet.</p>
                )}

                {summary && items.length > 0 && (
                    <div style={{ height: `${Math.max(items.length * 40, 180)}px` }}>
                        <Bar data={data} options={options} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default DoctorOverview