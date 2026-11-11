import { Link } from "react-router"

function AdminRecentPatients({ summary }) {
    const list = summary?.recentPatients || []

    const formatDate = (d) =>
        d ? new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"

    return (
        <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h6 fw-bold mb-0">Recent Patients</h2>
                    <Link to="/admin/patients" className="small fw-semibold text-decoration-none">View all</Link>
                </div>

                {summary && list.length === 0 && (
                    <p className="text-muted mb-0">No patients registered yet.</p>
                )}

                <div className="table-responsive">
                    <table className="table align-middle mb-0">
                        <tbody>
                            {list.map((p) => (
                                <tr key={p.patientId}>
                                    <td>
                                        <span className="avatar">
                                            {`${p.firstName?.[0] || ""}${p.lastName?.[0] || ""}`.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="fw-semibold">{p.firstName} {p.lastName}</td>
                                    <td className="text-muted">{p.phone}</td>
                                    <td className="text-muted text-end">{formatDate(p.registeredOn)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
export default AdminRecentPatients