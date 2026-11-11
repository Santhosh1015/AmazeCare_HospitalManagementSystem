import { useNavigate } from "react-router"

function WelcomeBanner({ summary }) {
    const navigate = useNavigate()

    return (
        <div className="welcome-banner rounded-4 p-4 mb-4 text-white">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div>
                    <h1 className="h3 fw-bold mb-1">
                        {summary ? `Hello, ${summary.patientName}` : "Hello"}
                    </h1>
                    <p className="mb-0 opacity-75">
                        Manage your health and appointments in one place.
                    </p>
                </div>
                <button type="button" className="btn btn-light fw-semibold"
                    onClick={() => navigate("/patient/request-appointment")}>
                    <i className="bi bi-calendar-plus me-2"></i>Book Appointment
                </button>
            </div>
        </div>
    )
}
export default WelcomeBanner