
import { useState } from "react"
import { useNavigate } from "react-router"
import axios from "axios"
import Swal from "sweetalert2"
import { API_SERVER_URL_DEV } from "../../config"

function AddExecutive() {

    const navigate = useNavigate()

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [employeeId, setEmployeeId] = useState("")
    const [designation, setDesignation] = useState("")

    const [showPassword, setShowPassword] = useState(false)
    const [errMsg, setErrMsg] = useState("")
    const [errComment, setErrComment] = useState("")
    const [loading, setLoading] = useState(false)

    const designations = [
        "HOSPITAL_ADMINISTRATOR",
        "HOSPITAL_EXECUTIVE",
        "RECEPTIONIST",
        "APPOINTMENT_COORDINATOR",
        "BILLING_EXECUTIVE",
        "HR_EXECUTIVE"
    ]

    const formatEnum = (value) => value.split("_")
        .map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ")

    const processRegister = async (e) => {
        e.preventDefault()
        setErrMsg("")
        setErrComment("")
        setLoading(true)

        try {
            const response = await axios.post(
                `${API_SERVER_URL_DEV}/api/v1/executive/register`,
                { firstName, lastName, email, password, employeeId, designation },
                {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }
            )

            await Swal.fire({
                title: "Success!",
                text: "Executive registered successfully.",
                icon: "success",
                confirmButtonColor: "#2F8F78"
            })

            navigate("/admin/executives")

        } catch (err) {
            console.log(err)

            if (!err.response) {
                setErrMsg("Unable to reach the server.")
                setErrComment("Please try again later.")
            } else {
                setErrMsg(err.response.data?.message || "Registration failed.")
                setErrComment(err.response.data?.comments || "")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="mb-4">
                <h1 className="h3 fw-bold mb-1">Add Executive</h1>
                <p className="text-muted mb-0">
                    Register a new hospital executive.
                </p>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                    {errMsg && (
                        <div className="alert alert-danger">
                            <strong>{errMsg}</strong>
                            <div>{errComment}</div>
                        </div>
                    )}

                    <form onSubmit={processRegister}>
                        <div className="row g-3">

                            <div className="col-md-6">
                                <label htmlFor="firstName" className="form-label small fw-semibold">
                                    First Name
                                </label>
                                <input id="firstName" type="text" className="form-control form-control-lg"
                                    value={firstName} onChange={e => setFirstName(e.target.value)}
                                    placeholder="Enter first name" required />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="lastName" className="form-label small fw-semibold">
                                    Last Name
                                </label>
                                <input id="lastName" type="text" className="form-control form-control-lg"
                                    value={lastName} onChange={e => setLastName(e.target.value)}
                                    placeholder="Enter last name" required />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="email" className="form-label small fw-semibold">
                                    Email Address
                                </label>
                                <input id="email" type="email" className="form-control form-control-lg"
                                    value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="Enter email address" required />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="employeeId" className="form-label small fw-semibold">
                                    Employee ID
                                </label>
                                <input id="employeeId" type="text" className="form-control form-control-lg"
                                    value={employeeId} onChange={e => setEmployeeId(e.target.value)}
                                    placeholder="Enter employee ID" required />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="password" className="form-label small fw-semibold">
                                    Password
                                </label>
                                <div className="input-group input-group-lg">
                                    <input id="password" type={showPassword ? "text" : "password"}
                                        className="form-control" value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Enter password" required
                                        pattern="(?=.*[A-Za-z])(?=.*\d).{8,}"
                                        title="At least 8 characters, one letter and one digit" />
                                    <button type="button" className="btn btn-outline-secondary"
                                        onClick={() => setShowPassword(!showPassword)}>
                                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                    </button>
                                </div>
                                <small className="text-muted">
                                    Minimum 8 characters, including a letter and a digit.
                                </small>
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="designation" className="form-label small fw-semibold">
                                    Designation
                                </label>
                                <select id="designation" className="form-select form-select-lg"
                                    value={designation} onChange={e => setDesignation(e.target.value)}
                                    required>
                                    <option value="">Select designation</option>
                                    {designations.map(item => (
                                        <option key={item} value={item}>
                                            {formatEnum(item)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <button type="button" className="btn btn-outline-secondary"
                                onClick={() => navigate("/admin/executives")}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary fw-semibold"
                                disabled={loading}>
                                {loading ? "Registering..." : "Register Executive"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AddExecutive
