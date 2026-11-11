
import { useEffect, useState } from "react"
import axios from "axios"
import { API_SERVER_URL_DEV } from "../../../config"
import AppointmentStatusChart from "./AppointmentStatusCharts"
import AdminTodayAppointments from "./AdminTodayAppointment"
import AdminRecentPatients from "./AdminRecentPatients"
import DoctorOverview from "./DoctorOverview"
import StatCard from "../StatCard"

function AdminDashboard() {

    const [summary, setSummary] = useState(null)
    const [loading, setLoading] = useState(false)
    const [errMsg, setErrMsg] = useState("")
    const [errComment, setErrComment] = useState("")

    const today = new Date().toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric"
    })

    useEffect(() => {
        const loadSummary = async () => {
            setLoading(true)
            setErrMsg("")
            setErrComment("")

            try {
                const response = await axios.get(
                    `${API_SERVER_URL_DEV}/api/v1/admin/dashboard/summary`,
                    {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        }
                    }
                )

                setSummary(response.data)

            } catch (err) {
                console.log(err)

                if (!err.response) {
                    setErrMsg("Unable to reach the server. Please try again later.")
                } else {
                    setErrMsg(err.response.data?.message || "Could not load the dashboard.")
                    setErrComment(err.response.data?.comments || "")
                }
            } finally {
                setLoading(false)
            }
        }

        loadSummary()
    }, [])

    const stats = [
        { label: "Total patients", value: summary?.totalPatients ?? "-", icon: "bi-people", color: "primary" },
        { label: "Total doctors", value: summary?.totalDoctors ?? "-", icon: "bi-person-badge", color: "success" },
        { label: "Today's appointments", value: summary?.todayAppointments ?? "-", icon: "bi-calendar-event", color: "warning" },
        { label: "Pending requests", value: summary?.pendingRequests ?? "-", icon: "bi-hourglass-split", color: "danger" }
    ]

    return (
        <div>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                <div>
                    <h1 className="h3 fw-bold mb-1">Admin Dashboard</h1>
                    <p className="text-muted mb-0">Hospital operational overview.</p>
                </div>

                <span className="badge text-bg-light border px-3 py-2">
                    <i className="bi bi-calendar3 me-2"></i>
                    Today, {today}
                </span>
            </div>

            {errMsg && (
                <div className="alert alert-danger" role="alert">
                    <div className="fw-semibold">{errMsg}</div>
                    {errComment && <small>{errComment}</small>}
                </div>
            )}

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                    <p className="text-muted mt-2 mb-0">Loading dashboard...</p>
                </div>
            ) : summary && (
                <>
                    <div className="row g-3 mb-4">
                        {stats.map(s => (
                            <div key={s.label} className="col-6 col-lg-3">
                                <StatCard {...s} />
                            </div>
                        ))}
                    </div>

                    <div className="row g-4 mb-4">
                        <div className="col-12 col-lg-6">
                            <AppointmentStatusChart summary={summary} />
                        </div>
                        <div className="col-12 col-lg-6">
                            <AdminTodayAppointments summary={summary} />
                        </div>
                    </div>

                    <div className="row g-4">
                        <div className="col-12 col-lg-6">
                            <AdminRecentPatients summary={summary} />
                        </div>
                        <div className="col-12 col-lg-6">
                            <DoctorOverview summary={summary} />
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default AdminDashboard
