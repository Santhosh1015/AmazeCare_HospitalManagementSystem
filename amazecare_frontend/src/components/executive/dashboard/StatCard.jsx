function StatCard({ label, value, icon, color }) {
    return (
        <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
                <span className={`stat-icon bg-${color} bg-opacity-10 text-${color}`}>
                    <i className={`bi ${icon} fs-4`}></i>
                </span>
                <div>
                    <div className="fs-3 fw-bold lh-1">{value}</div>
                    <small className="text-muted">{label}</small>
                </div>
            </div>
        </div>
    )
}
export default StatCard