
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import axios from "axios"
import Swal from "sweetalert2"
import { API_SERVER_URL_DEV } from "../../config"

function UpdateExecutive() {

    const navigate = useNavigate()
    const location = useLocation()
    const executiveId = location.state?.executiveId

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [employeeId, setEmployeeId] = useState("")
    const [designation, setDesignation] = useState("")

    const [loading, setLoading] = useState(false)
    const [errMsg, setErrMsg] = useState("")
    const [errComment, setErrComment] = useState("")

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

    useEffect(() => {

        if (!executiveId) {
            navigate("/admin/executives")
            return
        }

        const fetchExecutive = async () => {
            setLoading(true)
            setErrMsg("")

            try {
                const response = await axios.get(
                    `${API_SERVER_URL_DEV}/api/v1/executive/${executiveId}`,
                    {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        }
                    }
                )

                setFirstName(response.data.firstName)
                setLastName(response.data.lastName)
                setEmployeeId(response.data.employeeId)
                setDesignation(response.data.designation)

            } catch (err) {
                console.log(err)

                if (!err.response) {
                    setErrMsg("Unable to reach the server. Please try again later.")
                } else {
                    setErrMsg(err.response.data?.message || "Unable to fetch executive details.")
                    setErrComment(err.response.data?.comments || "")
                }
            } finally {
                setLoading(false)
            }
        }

        fetchExecutive()
    }, [executiveId, navigate])

    const processUpdate = async (e) => {
        e.preventDefault()
        setLoading(true)
        setErrMsg("")
        setErrComment("")

        try {
            await axios.put(
                `${API_SERVER_URL_DEV}/api/v1/executive/${executiveId}/update`,
                { firstName, lastName, employeeId, designation },
                {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }
            )

            await Swal.fire({
                title: "Updated!",
                text: "Executive details updated successfully.",
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
                setErrMsg(err.response.data?.message || "Update failed.")
                setErrComment(err.response.data?.comments || "")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="mb-4">
                <h1 className="h3 fw-bold mb-1">Update Executive</h1>
                <p className="text-muted mb-0">
                    Update the executive's profile information.
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

                    {loading && !firstName ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary"></div>
                        </div>
                    ) : (
                        <form onSubmit={processUpdate}>
                            <div className="row g-3">

                                <div className="col-md-6">
                                    <label htmlFor="firstName" className="form-label small fw-semibold">
                                        First Name
                                    </label>
                                    <input id="firstName" type="text" className="form-control form-control-lg"
                                        value={firstName} onChange={e => setFirstName(e.target.value)}
                                        required />
                                </div>

                                <div className="col-md-6">
                                    <label htmlFor="lastName" className="form-label small fw-semibold">
                                        Last Name
                                    </label>
                                    <input id="lastName" type="text" className="form-control form-control-lg"
                                        value={lastName} onChange={e => setLastName(e.target.value)}
                                        required />
                                </div>

                                <div className="col-md-6">
                                    <label htmlFor="employeeId" className="form-label small fw-semibold">
                                        Employee ID
                                    </label>
                                    <input id="employeeId" type="text" className="form-control form-control-lg"
                                        value={employeeId} onChange={e => setEmployeeId(e.target.value)}
                                        required />
                                </div>

                                <div className="col-md-6">
                                    <label htmlFor="designation" className="form-label small fw-semibold">
                                        Designation
                                    </label>
                                    <select id="designation" className="form-select form-select-lg"
                                        value={designation}
                                        onChange={e => setDesignation(e.target.value)}
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
                                    {loading ? "Updating..." : "Update Executive"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default UpdateExecutive
