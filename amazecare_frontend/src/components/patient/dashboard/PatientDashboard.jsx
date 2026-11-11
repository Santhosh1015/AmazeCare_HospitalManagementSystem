import { useEffect, useState } from "react"
import axios from "axios"
import WelcomeBanner from "./WelcomeBanner"
import AppointmentStats from "./AppointmentStats"
import { API_SERVER_URL_DEV } from "../../../config"
import NextAppointment from "./NextAppointment"
import RecentAppointments from "./RecentAppointments"
import AppointmentChart from "./AppointmentChart"

function PatientDashboard() {
    const [summary, setSummary] = useState(null)
    const [errMsg, setErrMsg] = useState("")
    const [errComment, setErrComment] = useState("")

    useEffect(() => {
        const getSummary = async () => {
            setErrMsg("")
            setErrComment("")
            try {
                const response = await axios.get(
                    `${API_SERVER_URL_DEV}/api/v1/patient/dashboard/summary`,
                    {
                        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                    }
                )
                setSummary(response.data)
            } catch (err) {
                if (!err.response) {
                    setErrMsg("Unable to reach the server. Please try again later.")
                } else {
                    setErrMsg(err.response.data?.message || "Could not load your dashboard.")
                    setErrComment(err.response.data?.comments || "")
                }
            }
        }
        getSummary()
    }, [])

    return (
        <div>
            {errMsg && (
                <div className="alert alert-danger" role="alert">
                    <div className="fw-semibold">{errMsg}</div>
                    {errComment && <small>{errComment}</small>}
                </div>
            )}

            <WelcomeBanner summary={summary} />
            <AppointmentStats summary={summary} />

            <div className="row g-4">
                <div className="col-12 col-lg-8">
                    <NextAppointment />
                    <RecentAppointments />
                </div>
                <div className="col-12 col-lg-4">
                   <AppointmentChart summary={summary} />
                </div>
            </div>
        </div>
    )
}
export default PatientDashboard