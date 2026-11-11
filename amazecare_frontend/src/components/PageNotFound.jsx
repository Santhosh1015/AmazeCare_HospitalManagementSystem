import { Link, useNavigate } from "react-router"
import "../styles/PageNotFound.css"

function PageNotFound() {
    const navigate = useNavigate()

    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    const homePath = !token ? "/" :
        role === 'PATIENT' ? "/patient" :
        role === 'DOCTOR' ? "/doctor" :
        role === 'ADMIN' ? "/admin" : "/"

    return (
        <div className="container-fluid notfound-page bg-body-tertiary">
            <div className="row min-vh-100 justify-content-center align-items-center">
                <div className="col-12 col-md-8 col-lg-6 text-center px-4">

                    {/* <!-- Logo --> */}
                    <div className="d-flex align-items-center justify-content-center gap-2 mb-4">
                        <img src="/logo-light.png" alt="AmazeCare" height="36" />
                        <span className="fw-bold fs-4 brand-text">AmazeCare</span>
                    </div>

                    {/* <!-- 404 with heart icon as the zero --> */}
                    <div className="notfound-code d-flex align-items-center justify-content-center">
                        <span>4</span>
                        <span className="notfound-heart">
                            <i className="bi bi-heart-pulse-fill"></i>
                        </span>
                        <span>4</span>
                    </div>

                    {/* <!-- Heartbeat line --> */}
                    <svg className="notfound-ecg" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true">
                        <polyline points="0,30 110,30 125,30 140,8 160,52 178,16 190,30 400,30" />
                    </svg>

                    <h1 className="h2 fw-bold mt-4 mb-2">Page not found</h1>
                    <p className="text-muted mb-4">
                        We couldn't find the page you were looking for. It may have been moved,
                        or the link might be incorrect.
                    </p>

                    {/* <!-- Actions --> */}
                    <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
                        <button type="button" className="btn btn-outline-secondary btn-lg px-4"
                            onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left me-2"></i>Go back
                        </button>
                        <Link to={homePath} className="btn btn-primary btn-lg px-4 fw-semibold">
                            <i className="bi bi-house-door me-2"></i>
                            {token ? "Back to dashboard" : "Go to sign in"}
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    )
}
export default PageNotFound