
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import axios from "axios"
import Swal from "sweetalert2"
import { API_SERVER_URL_DEV } from "../../config"

function AdminExecutives() {

    const navigate = useNavigate()

    const [executives, setExecutives] = useState([])

    const [totPages, setTotPages] = useState("")
    const [totElements, setTotElements] = useState("")
    const [page, setPage] = useState(0)
    const [size] = useState(6)

    const [errMsg, setErrMsg] = useState("")
    const [errComment, setErrComment] = useState("")

    useEffect(() => {
        const fetchExecutives = async () => {

            setErrMsg("")
            setErrComment("")

            try {
                const response = await axios.get(
                    `${API_SERVER_URL_DEV}/api/v1/executives`,
                    {
                        params: { page, size },
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        }
                    }
                )
                setExecutives(response.data.content)
                setTotPages(response.data.totalPages)
                setTotElements(response.data.totalElements)
            } catch (err) {
                console.log(err)
                if (!err.response) {
                    setErrMsg("Unable to reach the server.")
                    setErrComment("Please try again later.")
                } else {
                    setErrMsg(err.response.data?.message)
                    setErrComment(err.response.data?.comments)
                }
            }
        }

        fetchExecutives()
    }, [page, size])

    const formatEnum = (value) => {
        if (!value) return "-"
        return value.split("_").map(word =>
            word.charAt(0) + word.slice(1).toLowerCase()
        ).join(" ")
    }

    const processDelete = async (executiveId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Do you want to delete this executive?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#2F8F78",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, delete"
        })

        if (!result.isConfirmed) return

        try {
            await axios.put(
                `${API_SERVER_URL_DEV}/api/v1/executive/${executiveId}/delete`,
                {},
                {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }
            )

            await Swal.fire({
                title: "Deleted!",
                text: "Executive deleted successfully.",
                icon: "success",
                confirmButtonColor: "#2F8F78"
            })

            if (executives.length === 1 && page > 0) {
                setPage(page - 1)
            } else {
                const response = await axios.get(
                    `${API_SERVER_URL_DEV}/api/v1/executives`,
                    {
                        params: { page, size },
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        }
                    }
                )
                setExecutives(response.data.content)
                setTotPages(response.data.totalPages)
                setTotElements(response.data.totalElements)
            }
        } catch (err) {
            console.log(err)
            Swal.fire({
                title: "Unable to delete",
                text: err.response?.data?.message || "Please try again later.",
                icon: "error",
                confirmButtonColor: "#2F8F78"
            })
        }
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <h1 className="h3 fw-bold mb-1">Executives</h1>
                    <p className="text-muted mb-0">Manage registered hospital executives.</p>
                </div>

                <button className="btn btn-primary fw-semibold"
                    onClick={() => navigate("/admin/executives/add")}>
                    <i className="bi bi-person-plus me-2"></i>Add Executive
                </button>
            </div>

            {errMsg && (
                <div className="alert alert-danger">
                    <strong>{errMsg}</strong>
                    <div>{errComment}</div>
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Executive Directory</h5>
                <span className="text-muted small">Page {page + 1}</span>
            </div>

            {executives.length === 0 ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                        <i className="bi bi-people display-5 text-muted"></i>
                        <h5 className="fw-semibold mt-3">No Executives Found</h5>
                        <p className="text-muted mb-0">
                            Add an executive to get started.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="row g-3">
                    {executives.map(executive => (
                        <div className="col-12 col-md-6 col-xl-4"
                            key={executive.executiveId}>
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-center gap-3 mb-3">
                                        <div className="rounded-circle bg-body-tertiary
                                            d-flex align-items-center justify-content-center"
                                            style={{ width: "48px", height: "48px" }}>
                                            <i className="bi bi-person-badge fs-4 text-primary"></i>
                                        </div>

                                        <div className="min-w-0">
                                            <h6 className="fw-bold mb-1 text-truncate">
                                                {executive.executiveName}
                                            </h6>
                                            <span className="text-muted small">
                                                {executive.employeeId}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <span className="text-muted small d-block mb-1">
                                            Designation
                                        </span>
                                        <span className="badge bg-body-secondary text-body">
                                            {formatEnum(executive.designation)}
                                        </span>
                                    </div>

                                    <hr />

                                    <div className="d-flex justify-content-end gap-2">
                                        <button className="btn btn-sm btn-outline-primary"
                                            onClick={() => navigate(
                                                "/admin/executives/update",
                                                { state: { executiveId: executive.executiveId } }
                                            )}>
                                            <i className="bi bi-pencil-square me-1"></i>
                                            Update
                                        </button>

                                        <button className="btn btn-sm btn-outline-danger"
                                            onClick={() => processDelete(executive.executiveId)}>
                                             <i className="bi bi-person-x me-1"></i>
                                        Deactivate
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            { (
                <nav className="mt-4" aria-label="Executive pages">
                    <ul className="pagination justify-content-center mb-2">

                        <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
                            <button className="page-link"
                                disabled={page === 0}
                                onClick={() => setPage(page - 1)}>
                                <i className="bi bi-chevron-left"></i>
                            </button>
                        </li>

                        {Array.from({ length: totPages }, (e, index) => (
                            <li key={index}
                                className={`page-item ${index === page ? "active" : ""}`}>
                                <button className="page-link"
                                    onClick={() => setPage(index)}>
                                    {index + 1}
                                </button>
                            </li>
                        ))}

                        <li className={`page-item ${page === totPages - 1 ? "disabled" : ""}`}>
                            <button className="page-link"
                                disabled={page === totPages - 1}
                                onClick={() => setPage(page + 1)}>
                                <i className="bi bi-chevron-right"></i>
                            </button>
                        </li>

                    </ul>
                </nav>
            )}

        </div>
    )
}

export default AdminExecutives
