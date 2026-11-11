
import { useState } from "react"
import { useNavigate } from "react-router"
import axios from "axios"
import Swal from "sweetalert2"
import { API_SERVER_URL_DEV } from "../../config"

function AddPatient() {

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
    const today = new Date().toLocaleDateString("en-CA")

    const processRegister = async (e) => {
        e.preventDefault()
        setErrMsg("")
        setErrComment("")

        const patientDto = {
            email,
            password,
            firstName,
            lastName,
            gender,
            phone,
            address,
            dateOfBirth: dob
        }

        try {
            const response = await axios.post(`${API_SERVER_URL_DEV}/api/v1/patient/staff-register`, patientDto, {
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
            })

            await Swal.fire({
                icon: "success",
                title: "Patient registered",
                text: "Patient has been registered successfully.",
                confirmButtonText: "OK",
                confirmButtonColor: "#2F8F78"
            })

            navigate("/admin/patients")
        } catch (err) {
            if (!err.response) {
                setErrMsg("Unable to reach the server. Please try again later.")
            } else {
                setErrMsg(err.response.data?.message || "Registration failed. Please try again.")
                setErrComment(err.response.data?.comments)
            }
        }
    }

    return (
        <div>
            <div className="mb-4">
                <h1 className="h3 fw-bold mb-1">Register Patient</h1>
                <p className="text-muted mb-0">Add a new patient to AmazeCare.</p>
            </div>

            <div className="card border-0 shadow-sm update-card">
                <div className="card-body p-4 p-md-5">

                    {errMsg && (
                        <div className="alert alert-danger" role="alert">
                            <div className="fw-semibold">{errMsg}</div>
                            {errComment && <small>{errComment}</small>}
                        </div>
                    )}

                    <form onSubmit={processRegister}>
                        <div className="row g-3">

                            <div className="col-md-6">
                                <label htmlFor="firstName" className="form-label small fw-semibold">First name</label>
                                <input id="firstName" type="text" value={firstName}
                                    className="form-control form-control-lg" required
                                    onChange={(e) => setFirstName(e.target.value)} />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="lastName" className="form-label small fw-semibold">Last name</label>
                                <input id="lastName" type="text" value={lastName}
                                    className="form-control form-control-lg" required
                                    onChange={(e) => setLastName(e.target.value)} />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="email" className="form-label small fw-semibold">Email address</label>
                                <input id="email" type="email" value={email}
                                    className="form-control form-control-lg" required
                                    onChange={(e) => setEmail(e.target.value)} />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="password" className="form-label small fw-semibold">Password</label>
                                <div className="input-group input-group-lg">
                                    <input id="password" type={showPassword ? "text" : "password"}
                                        value={password} className="form-control" required
                                        onChange={(e) => setPassword(e.target.value)} />
                                    <button type="button" className="btn btn-outline-secondary"
                                        onClick={() => setShowPassword(!showPassword)}>
                                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                    </button>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="phone" className="form-label small fw-semibold">Phone</label>
                                <input id="phone" type="tel" value={phone}
                                    className="form-control form-control-lg" required
                                    maxLength="15" pattern="[0-9]{10,15}"
                                    onChange={(e) => setPhone(e.target.value)} />
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
                                <input id="dob" type="date" value={dob} max={today}
                                    className="form-control form-control-lg" required
                                    onChange={(e) => setDob(e.target.value)} />
                            </div>

                            <div className="col-12">
                                <label htmlFor="address" className="form-label small fw-semibold">Address</label>
                                <textarea id="address" value={address} rows="3"
                                    className="form-control form-control-lg"
                                    onChange={(e) => setAddress(e.target.value)} />
                            </div>

                            <div className="col-12 d-flex flex-column flex-sm-row gap-2 mt-4">
                                <button type="submit" className="btn btn-primary btn-lg fw-semibold px-5">
                                    Register Patient
                                </button>
                                <button type="button" className="btn btn-outline-secondary btn-lg px-4"
                                    onClick={() => navigate("/admin/patients")}>
                                    Cancel
                                </button>
                            </div>

                        </div>
                    </form>

                </div>
            </div>
        </div>
    )
}
export default AddPatient
