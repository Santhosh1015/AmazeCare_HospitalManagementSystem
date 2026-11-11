import { Link, useNavigate } from "react-router";
import "../../styles/SignIn.css";
import { useState } from "react";
import { API_SERVER_URL_DEV } from "../../config";
import axios from "axios";

function SignIn() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errMsg, setErrMsg] = useState("")
    const [errComment, setErrComment] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const apiUrl = API_SERVER_URL_DEV + '/api/auth/login'
    const userDetailsApi = API_SERVER_URL_DEV + '/api/auth/user-details'

    const navigate = useNavigate()

    const processLogin = async (e) => {
        e.preventDefault()

        const token = 'Basic ' + window.btoa(email + ':' + password)

        try {
            const response = await axios.get(apiUrl, {
                headers: { 'Authorization': token }
            })


            localStorage.setItem('token', response.data.token)
            localStorage.setItem('email', email)

            const res = await axios.get(userDetailsApi, {
                headers: { Authorization: `Bearer ${response.data.token}` }
            })

            localStorage.setItem('role', res.data.role)
            switch (res.data.role) {
                case 'PATIENT':
                    navigate("/patient")
                    break
                case 'DOCTOR':
                    navigate("/doctor")
                    break
                case 'ADMIN':
                    navigate("/admin")
                    break
                case 'EXECUTIVE':
                    navigate("/executive")
                    break
                default:
                    setErrMsg("Something went wrong. Please try again.")
                    break
            }
        } catch (err) {
            if (!err.response) {
                setErrMsg("Unable to reach the server. Please try again later.")

            } else if (err.response.status === 401) {
                setErrMsg("Invalid email or password.")
            } else {
                setErrMsg(err.response.data?.message || "Something went wrong. Please try again.")
                setErrComment(err.response.data?.comments || "")
            }
        }
    }

    return (
        <div className="container-fluid signin-page">
            <div className="row min-vh-100">

                <div className="col-lg-6 d-none d-lg-flex signin-brand align-items-center justify-content-center text-white p-5">
                    <div className="signin-brand-content">
                        <img src="/logo.png" alt="AmazeCare" height="56" className="mb-4" />
                        <h2 className="fw-bold mb-3">Amazecare, made simple.</h2>
                        <p className="lead mb-0">
                            Book appointments, consult doctors and manage patient records in one secure place.
                        </p>
                    </div>
                </div>
                <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center bg-body p-4">
                    <div className="signin-form-wrap w-100">

                        <div className="text-center text-lg-start mb-4">
                            <img src="logo.jpg" alt="AmazeCare" height="44" className="mb-3 d-lg-none" />
                            <h1 className="h3 fw-bold mb-1">Welcome back</h1>
                            <p className="text-muted mb-0">Sign in to continue to AmazeCare.</p>
                        </div>

                        {errMsg && (
                            <div className="alert alert-danger" role="alert">
                                <div className="fw-semibold">{errMsg}</div>
                                {errComment && <small>{errComment}</small>}
                            </div>
                        )}

                        <form onSubmit={(e) => processLogin(e)}>


                            {/* <!-- Username Field --> */}
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label small fw-semibold">Email address</label>
                                <input id="email" type="email" value={email}
                                    className="form-control form-control-lg "
                                    placeholder="you@example.com" required
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            {/* <!-- Password Field --> */}
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <label htmlFor="password" className="form-label small fw-semibold">Password</label>
                                    <Link className="small text-decoration-none fw-semibold" to="/forgot-password">Forgot password?</Link>
                                </div>
                                <div className="input-group input-group-lg">
                                    <input id="password" type={showPassword ? "text" : "password"} value={password}
                                        className="form-control" placeholder="••••••••" required
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button type="button" className="btn btn-outline-secondary btn-sm px-3"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}>
                                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                    </button>
                                </div>
                            </div>

                            {/* <!-- Submit Button --> */}
                            <div className="d-grid mb-3">
                                <button type="submit" className="btn btn-primary btn-lg fw-semibold"  >Sign in</button>
                            </div>

                            {/* <!-- Footer Link --> */}
                            <div className="text-center">
                                <p className="text-center small text-muted mb-0">
                                    Don't have an account?{" "}
                                    <Link to="/patient/signup" className="text-decoration-none fw-semibold">SignUp</Link>
                                </p> </div>
                        </form>

                    </div>
                </div>

            </div>
        </div>
    )
}

export default SignIn