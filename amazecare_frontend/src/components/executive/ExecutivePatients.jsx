import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import axios from "axios"
import { API_SERVER_URL_DEV } from "../../config"

function ExecutivePatients() {
    const navigate = useNavigate()

    const [patients, setPatients] = useState([])
    const [search, setSearch] = useState("")
    const [selected, setSelected] = useState(null)
    const [errMsg, setErrMsg] = useState("")

    const formatEnum = (value) => {
        if (!value) return ""
        return value.toLowerCase().split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    }

    useEffect(() => {
        const getPatients = async () => {
            setErrMsg("")
            try {
                const response = await axios.get(`${API_SERVER_URL_DEV}/api/v1/patients`, {
                    headers : { 'Authorization': 'Bearer ' + localStorage.getItem('token') } }
                )
                console.log(response);
                
                setPatients(response.data.patientResDto)
            } catch (err) {
                if (!err.response) {
                    setErrMsg("Unable to reach the server. Please try again later.")
                } else {
                    setErrMsg(err.response.data?.message || "Could not load patients.")
                }
            }
        }
        getPatients()
    }, [])

    const viewPatient = async (p) => {
        setErrMsg("")
        try {
            const response = await axios.get(`${API_SERVER_URL_DEV}/api/v1/patient/${p.patientId}`, {
                    headers : { 'Authorization': 'Bearer ' + localStorage.getItem('token') } }
                )
            setSelected(response.data.patientResDto)
        } catch (err) {
            setErrMsg(err?.response?.data?.message || "Could not load patient details.")
        }
    }

    const shown = patients?.filter((p) => {
        const text = `${p.firstName} ${p.lastName} ${p.phone} ${p.email}`.toLowerCase()
        return text.includes(search.toLowerCase())
    })

    return (
        <div>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                <div>
                    <h1 className="h3 fw-bold mb-1">Patients</h1>
                    <p className="text-muted mb-0">Search and manage registered patients.</p>
                </div>
                <Link to="/patient/signup" className="btn btn-primary fw-semibold">
                    <i className="bi bi-person-plus me-2"></i>Register Patient
                </Link>
            </div>

            {errMsg && <div className="alert alert-danger" role="alert">{errMsg}</div>}

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <label htmlFor="search" className="form-label small fw-semibold mb-1">Search</label>
                    <input id="search" type="text" value={search} className="form-control"
                        placeholder="Name, phone or email"
                        onChange={(e) => setSearch(e.target.value)} />
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th scope="col">S.No</th>
                                <th scope="col">Patient</th>
                                <th scope="col">Gender</th>
                                <th scope="col">Phone</th>
                                <th scope="col" className="text-end">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!errMsg && shown.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted py-5">
                                        <i className="bi bi-people fs-1 d-block mb-2"></i>
                                        No patients found.
                                    </td>
                                </tr>
                            )}
                            {shown.map((p, index) => (
                                <tr key={p.patientId}>
                                    <th scope="row">{index + 1}</th>
                                    <td>{p.firstName} {p.lastName}</td>
                                    <td>{formatEnum(p.gender)}</td>
                                    <td>{p.phone}</td>
                                    <td className="text-end">
                                        <button type="button" className="btn btn-outline-primary btn-sm"
                                            onClick={() => viewPatient(p)}>
                                            <i className="bi bi-eye me-1"></i>View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selected && (
                <>
                    <div className="modal d-block" tabIndex="-1" role="dialog" onClick={() => setSelected(null)}>
                        <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-content border-0 shadow">
                                <div className="modal-header">
                                    <h5 className="modal-title fw-bold">Patient Details</h5>
                                    <button type="button" className="btn-close" aria-label="Close"
                                        onClick={() => setSelected(null)}></button>
                                </div>
                                <div className="modal-body">
                                    <dl className="row mb-0 small">
                                        <dt className="col-4 text-muted">Name</dt>
                                        <dd className="col-8">{selected.firstName} {selected.lastName}</dd>
                                        <dt className="col-4 text-muted">Phone</dt>
                                        <dd className="col-8">{selected.phone}</dd>
                                        <dt className="col-4 text-muted">Gender</dt>
                                        <dd className="col-8">{formatEnum(selected.gender)}</dd>
                                        <dt className="col-4 text-muted">Date of birth</dt>
                                        <dd className="col-8">{selected.dateOfBirth}</dd>
                                        <dt className="col-4 text-muted">Address</dt>
                                        <dd className="col-8">{selected.address}</dd>
                                    </dl>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop show"></div>
                </>
            )}
        </div>
    )
}
export default ExecutivePatients