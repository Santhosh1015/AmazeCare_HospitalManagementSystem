import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { API_SERVER_URL_DEV } from "../../config"
import axios from "axios"

function SignUp() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [gender, setGender] = useState("")
    const [phone, setPhone] = useState("")
    const [address, setAddress] = useState("")
    const [dob, setDob] = useState("")
    const [errMsg, setErrMsg] = useState("")
    const [errComment, setErrComment] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const navigate = useNavigate()
    const processRegister = async(e) =>{
        console.log("in registration");
        
        e.preventDefault()

        let patientDto = {
            'email': email,
            'password' : password,
            'firstName' : firstName,
            'lastName' : lastName,
            'gender' : gender,
            'phone' : phone,
            'address':address,
            'dateOfBirth' : dob

        }
        try{

            const response = await axios.post(API_SERVER_URL_DEV+"/api/v1/patient/register", patientDto
            )
            console.log(response.data);
            
            navigate("/")
        }catch(err){
            setErrMsg(err?.response?.data?.message)
            setErrComment(err?.response?.data?.comments)
        }




    }

    return (
          <div className="container-fluid signin-page">
            <div className="row min-vh-100">

                {/* Form panel */}
                <div className="col-12 col-lg-7 bg-body-tertiary d-flex align-items-center justify-content-center py-5 px-3">
                    <div className="card border-0 shadow-sm w-100 signup-card">
                        <div className="card-body p-4 p-md-5">

                            <div className="text-center text-lg-start mb-4">
                                <img src="/logo.jpg" alt="AmazeCare" height="44" className="mb-3 d-lg-none" />
                                <h1 className="h3 fw-bold mb-1">Create your account</h1>
                                <p className="text-muted mb-0">Register as a patient to book appointments.</p>
                            </div>

                            {errMsg && (
                                <div className="alert alert-danger" role="alert">
                                    <div className="fw-semibold">{errMsg}</div>
                                    {errComment && <small>{errComment}</small>}
                                </div>
                            )}

                            <form onSubmit={(e)=> processRegister(e)}>
                                <div className="row g-3">

                                    <div className="col-md-6">
                                        <label htmlFor="firstName" className="form-label small fw-semibold">First name</label>
                                        <input id="firstName" type="text" value={firstName}
                                            className="form-control form-control-lg" placeholder="eg: Severus" required
                                            onChange={(e) => setFirstName(e.target.value)} />
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="lastName" className="form-label small fw-semibold">Last name</label>
                                        <input id="lastName" type="text" value={lastName}
                                            className="form-control form-control-lg" placeholder="eg: Snape" required
                                            onChange={(e) => setLastName(e.target.value)} />
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="gender" className="form-label small fw-semibold">Gender</label>
                                        <select id="gender" value={gender} required
                                            className="form-select form-select-lg"
                                            onChange={(e) => setGender(e.target.value)}>
                                            <option value="">Select gender</option>
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="dob" className="form-label small fw-semibold">Date of birth</label>
                                        <input id="dob" type="date" value={dob}
                                            className="form-control form-control-lg" required
                                            onChange={(e) => setDob(e.target.value)} />
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="phone" className="form-label small fw-semibold">Phone</label>
                                        <input id="phone" type="tel" value={phone}
                                            className="form-control form-control-lg" placeholder="9876545890" required
                                            onChange={(e) => setPhone(e.target.value)} />
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="email" className="form-label small fw-semibold">Email address</label>
                                        <input id="email" type="email" value={email}
                                            className="form-control form-control-lg" placeholder="you@example.com" required
                                            onChange={(e) => setEmail(e.target.value)} />
                                    </div>

                                    <div className="col-12">
                                        <label htmlFor="address" className="form-label small fw-semibold">Address</label>
                                        <textarea id="address" type="Text" value={address}
                                            className="form-control form-control-lg" placeholder="123 Main St" required
                                            onChange={(e) => setAddress(e.target.value)} />
                                    </div>

                                    <div className="col-12">
                                        <label htmlFor="password" className="form-label small fw-semibold">Password</label>
                                        <div className="input-group input-group-lg">
                                            <input id="password" type={showPassword ? "text" : "password"} value={password}
                                                className="form-control" placeholder="••••••••" required
                                                onChange={(e) => setPassword(e.target.value)} />
                                            <button type="button" className="btn btn-outline-secondary px-3"
                                                onClick={() => setShowPassword(!showPassword)}
                                                aria-label={showPassword ? "Hide password" : "Show password"}>
                                                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                            </button>
                                        </div>
                                        
                                    </div>

                                    <div className="col-12 d-grid mt-4">
                                        <button type="submit" className="btn btn-primary btn-lg fw-semibold">Create account</button>
                                    </div>

                                    <p className="text-center small text-muted mb-0 mt-3">
                                        Already have an account?{" "}
                                        <Link to="/" className="text-decoration-none fw-semibold">Sign in</Link>
                                    </p>
                                </div>
                            </form>

                        </div>
                    </div>
                </div>

                {/* Brand panel (stays fixed while the form scrolls) */}
                <div className="col-lg-5 d-none d-lg-flex signin-brand align-items-center justify-content-center text-white p-5 position-sticky top-0 vh-100">
                    <div className="signin-brand-content">
                        <img src="/logo.png" alt="AmazeCare" height="56" className="mb-4" />
                        <h2 className="fw-bold mb-3">Healthcare, made simple.</h2>
                        <p className="lead mb-0">
                            Book appointments, consult doctors and manage patient records in one secure place.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}
export default SignUp