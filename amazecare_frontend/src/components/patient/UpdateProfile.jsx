import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { useDispatch, useSelector } from "react-redux"
import Swal from "sweetalert2"
import { updatePatientProfile } from "../../store/actions/PatientAction"

function UpdateProfile() {
    const patient = useSelector((state) => state.patientData.patient)

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [gender, setGender] = useState("")
    const [phone, setPhone] = useState("")
    const [dob, setDob] = useState("")
    const [address, setAddress] = useState("")
    const [errMsg, setErrMsg] = useState("")
    const [errComment, setErrComment] = useState("")

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const today = new Date().toLocaleDateString("en-CA")

    // fill the form once the profile is in the store (also covers a page refresh)
    useEffect(() => {
        if (patient) {
            setFirstName(patient.firstName)
            setLastName(patient.lastName)
            setGender(patient.gender)
            setPhone(patient.phone)
            setDob(patient.dateOfBirth)
            setAddress(patient.address)
        }
    }, [patient])

    const processUpdate = async (e) => {
        e.preventDefault()
        setErrMsg("")
        setErrComment("")

        const patientUpdateDto = {
            firstName,
            lastName,
            gender,
            phone,
            dateOfBirth: dob,
            address
        }

        try {
             dispatch(updatePatientProfile( patient.patientId, patientUpdateDto))
            await Swal.fire({
                icon: "success",
                title: "Profile updated",
                text: "Your changes have been saved.",
                confirmButtonText: "OK",
                confirmButtonColor: "#2F8F78"
            })
            navigate("/patient/profile")
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
                <h1 className="h3 fw-bold mb-1">Update Profile</h1>
                <p className="text-muted mb-0">Keep your personal information up to date.</p>
            </div>

            {!patient && (
                <div className="text-center py-5">
                    <span className="spinner-border spinner-border-sm me-2"></span>Loading profile...
                </div>
            )}

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
{/* 
                                <div className="col-md-6">
                                    <label htmlFor="email" className="form-label small fw-semibold">Email address</label>
                                    <input id="email" type="email" value={patient.email}
                                        className="form-control form-control-lg" disabled readOnly />
                                    <div className="form-text">Email is your login and can't be changed here.</div>
                                </div> */}

                                <div className="col-md-6">
                                    <label htmlFor="phone" className="form-label small fw-semibold">Phone</label>
                                    <input id="phone" type="tel" value={phone}
                                        className="form-control form-control-lg" required
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
                                        className="form-control form-control-lg" required
                                        onChange={(e) => setAddress(e.target.value)} />
                                </div>

                                <div className="col-12 d-flex flex-column flex-sm-row gap-2 mt-4">
                                    <button type="submit" className="btn btn-primary btn-lg fw-semibold px-5" > Save changes  </button>
                                    <button type="button" className="btn btn-outline-secondary btn-lg px-4"
                                        onClick={() => navigate("/patient/profile")}>
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
export default UpdateProfile