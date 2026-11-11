
import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router"
import axios from "axios"
import Swal from "sweetalert2"
import { API_SERVER_URL_DEV } from "../../config"

function UpdatePatient() {
    const location = useLocation()
    const patient = location.state

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [phone, setPhone] = useState("")
    const [dob, setDob] = useState("")
    const [address, setAddress] = useState("")
    const [errMsg, setErrMsg] = useState("")
    const [errComment, setErrComment] = useState("")

    const navigate = useNavigate()
    const today = new Date().toLocaleDateString("en-CA")

    // fill the form once the patient details are available
    useEffect(() => {
        if (patient) {
            setFirstName(patient.firstName)
            setLastName(patient.lastName)
            setPhone(patient.phone)
            setDob(patient.dateOfBirth)
            setAddress(patient.address || "")
        } else {
            navigate("/admin/patients")
        }
    }, [patient])

    const processUpdate = async (e) => {
        e.preventDefault()
        setErrMsg("")
        setErrComment("")

        const patientUpdateDto = {
            firstName,
            lastName,
            phone,
            address,
            dateOfBirth: dob
        }

        try {
            const response = await axios.put(
                `${API_SERVER_URL_DEV}/api/v1/patient/update/${patient.patientId}`,
                patientUpdateDto,
                {
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                }
            )

            await Swal.fire({
                icon: "success",
                title: "Patient updated",
                text: "Patient details have been updated successfully.",
                confirmButtonText: "OK",
                confirmButtonColor: "#2F8F78"
            })

            navigate("/admin/patients")
        } catch (err) {
            if (!err.response) {
                setErrMsg("Unable to reach the server. Please try again later.")
            } else {
                setErrMsg(err.response.data?.message || "Update failed. Please try again.")
                setErrComment(err.response.data?.comments)
            }
        }
    }

    return (
        <div>
            <div className="mb-4">
                <h1 className="h3 fw-bold mb-1">Update Patient</h1>
                <p className="text-muted mb-0">Update the registered patient's information.</p>
            </div>

            {patient && (
                <div className="card border-0 shadow-sm update-card">
                    <div className="card-body p-4 p-md-5">

                        {errMsg && (
                            <div className="alert alert-danger" role="alert">
                                <div className="fw-semibold">{errMsg}</div>
                                {errComment && <small>{errComment}</small>}
                            </div>
                        )}

                        <form onSubmit={processUpdate}>
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
                                    <label htmlFor="phone" className="form-label small fw-semibold">Phone</label>
                                    <input id="phone" type="tel" value={phone}
                                        className="form-control form-control-lg" required
                                        onChange={(e) => setPhone(e.target.value)} />
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
                                    <button type="submit" className="btn btn-primary btn-lg fw-semibold px-5">Save changes</button>
                                    <button type="button" className="btn btn-outline-secondary btn-lg px-4"
                                        onClick={() => navigate("/admin/patients")}>
                                        Cancel
                                    </button>
                                </div>

                            </div>
                        </form>

                    </div>
                </div>
            )}
        </div>
    )
}
export default UpdatePatient
