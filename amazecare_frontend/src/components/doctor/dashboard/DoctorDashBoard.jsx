import { useEffect, useState } from "react"
import axios from "axios"
import { API_SERVER_URL_DEV } from "../../../config"
import StatCard from "../../patient/dashboard/StatCard"
import DoctorTodayAppointments from "./DoctorTodayAppointment"
import DoctorStatusChart from "./DoctorStatusChart"

function DoctorDashboard() {
    const [summary, setSummary] = useState(null)
    const [errMsg, setErrMsg] = useState("")
    const [errComment, setErrComment] = useState("")

    const formatEnum = (value) => {
        if (value === "ENT") return "ENT"
        if (!value) return ""
        return value.toLowerCase().split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    }

    useEffect(() => {
        const getSummary = async () => {
            setErrMsg("")
            setErrComment("")
            try {
                const response = await axios.get(
                    `${API_SERVER_URL_DEV}/api/v1/doctors/dashboard/summary`,
                    {
                        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                    }
                )
                console.log(response.data)
                setSummary(response.data)
            } catch (err) {
                if (!err.response) {
                    setErrMsg("Unable to reach the server. Please try again later.")
                } else {
                    setErrMsg(err.response.data?.message || "Could not load the dashboard.")
                    setErrComment(err.response.data?.comments || "")
                }
            }
        }
        getSummary()
    }, [])

    const val = (v) => (summary ? v : "-")

    const stats = [
        { label: "Total patients", value: val(summary?.totalPatients), icon: "bi-people", color: "primary" },
        { label: "Today's appointments", value: val(summary?.todayAppointments), icon: "bi-calendar-event", color: "success" },
        { label: "Completed", value: val(summary?.completedAppointments), icon: "bi-check2-circle", color: "info" },
        { label: "Pending", value: val(summary?.pendingAppointments), icon: "bi-hourglass-split", color: "warning" },
    ]

    return (
        <div>
            {errMsg && (
                <div className="alert alert-danger" role="alert">
                    <div className="fw-semibold">{errMsg}</div>
                    {errComment && <small>{errComment}</small>}
                </div>
            )}

            {/* <!-- Welcome banner --> */}
            <div className="welcome-banner rounded-4 p-4 mb-4 text-white">
                <h1 className="h3 fw-bold mb-1">
                    {summary ? `Welcome back, Dr. ${summary.doctorName}` : "Welcome back"}
                </h1>
                <p className="mb-0 opacity-75">
                    {summary ? formatEnum(summary.specialization) : ""}
                    {summary ? " | " : ""}
                    Here is your day at a glance.
                </p>
            </div>

            {/* <!-- Stat cards --> */}
            <div className="row g-3 mb-4">
                {stats.map((s) => (
                    <div key={s.label} className="col-6 col-lg-3">
                        <StatCard {...s} />
                    </div>
                ))}
            </div>

            {/* <!-- Today's list and status chart --> */}
            <div className="row g-4">
                <div className="col-12 col-lg-7">
                    <DoctorTodayAppointments summary={summary} />
                </div>
                <div className="col-12 col-lg-5">
                    <DoctorStatusChart summary={summary} />
                </div>
            </div>
        </div>
    )
}
export default DoctorDashboard