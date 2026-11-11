
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { API_SERVER_URL_DEV } from "../../config";

function AdminReports() {

    const [reportType, setReportType] = useState("APPOINTMENTS");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [status, setStatus] = useState("");
    const [doctorId, setDoctorId] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [gender, setGender] = useState("");
    const [designation, setDesignation] = useState("");

    const [reportData, setReportData] = useState([]);
    const [reportGenerated, setReportGenerated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const [errComment, setErrComment] = useState("");

    const reportOptions = [
        { value: "APPOINTMENTS", label: "Appointment Report", icon: "bi-calendar-check" },
        { value: "DOCTORS", label: "Doctor Report", icon: "bi-person-badge" },
        { value: "PATIENTS", label: "Patient Report", icon: "bi-people" },
        { value: "EXECUTIVES", label: "Executive Report", icon: "bi-briefcase" }
    ];

    const formatEnum = (value) => {
        if (!value) return "-";
        if (value === "ENT") return "ENT";

        return value
            .toLowerCase()
            .split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const getReportConfig = () => {

        let url = "";
        let responseKey = "";
        let params = {
            page: 0,
            size: 100,
            ...(fromDate && { fromDate }),
            ...(toDate && { toDate })
        };

        switch (reportType) {

            case "APPOINTMENTS":
                url = "/api/v1/admin/reports/appointments";
                responseKey = "appointmentDetailsResDto";
                if (status) params.status = status;
                if (doctorId) params.doctorId = doctorId;
                break;

            case "DOCTORS":
                url = "/api/v1/doctors/admin/report";
                responseKey = "doctorProfileResDto";
                if (specialization) params.specialization = specialization;
                break;

            case "PATIENTS":
                url = "/api/v1/patients/admin/report";
                responseKey = "patientResDto";
                if (gender) params.gender = gender;
                break;

            case "EXECUTIVES":
                url = "/api/v1/executives/admin/report";
                responseKey = "executiveResDto";
                if (designation) params.designation = designation;
                break;

            default:
                break;
        }

        return { url, responseKey, params };
    };

    const generateReport = async () => {

        if (fromDate && toDate && fromDate > toDate) {
            setErrMsg("Invalid date range");
            setErrComment("From date cannot be after To date.");
            return;
        }

        setLoading(true);
        setErrMsg("");
        setErrComment("");
        setReportGenerated(false);
        setReportData([]);

        try {

            const { url, responseKey, params } = getReportConfig();

            let allRecords = [];
            let currentPage = 0;
            let totalPages = 1;

            while (currentPage < totalPages) {

                const response = await axios.get(
                    API_SERVER_URL_DEV + url,
                    {
                        params: {
                            ...params,
                            page: currentPage
                        },
                        headers: {
                            Authorization: "Bearer " + localStorage.getItem("token")
                        }
                    }
                );

                const records = response.data[responseKey] || [];

                allRecords = [...allRecords, ...records];

                totalPages =
                    response.data.paginationResDto?.totalPages || 1;

                currentPage++;
            }

            setReportData(allRecords);
            setReportGenerated(true);

            if (allRecords.length === 0) {
                Swal.fire({
                    icon: "info",
                    title: "No Records Found",
                    text: "No records match the selected filters.",
                    confirmButtonColor: "#2F8F78"
                });
            }

        } catch (err) {

            if (!err.response) {
                setErrMsg("Unable to reach the server. Please try again later.");
            } else {
                setErrMsg(err.response.data?.message || "Unable to generate report.");
                setErrComment(err.response.data?.comments || "");
            }

        } finally {
            setLoading(false);
        }
    };

    const getColumns = () => {

        switch (reportType) {

            case "APPOINTMENTS":
                return [
                    ["Appointment ID", "appointmentId"],
                    ["Patient Name", "patientName"],
                    ["Patient Phone", "patientPhone"],
                    ["Doctor Name", "doctorName"],
                    ["Appointment Date", "appointmentDate"],
                    ["Appointment Time", "appointmentTime"],
                    ["Visit Type", "visitType"],
                    ["Reason", "reason"],
                    ["Status", "status"]
                ];

            case "DOCTORS":
                return [
                    ["Doctor ID", "doctorId"],
                    ["First Name", "firstName"],
                    ["Last Name", "lastName"],
                    ["Specialization", "specialization"],
                    ["Qualification", "qualification"],
                    ["Designation", "designation"],
                    ["License Number", "licenseNumber"],
                    ["Experience Years", "experienceYears"]
                ];

            case "PATIENTS":
                return [
                    ["Patient ID", "patientId"],
                    ["First Name", "firstName"],
                    ["Last Name", "lastName"],
                    ["Gender", "gender"],
                    ["Phone", "phone"]
                ];

            case "EXECUTIVES":
                return [
                    ["Executive Name", "executiveName"],
                    ["Employee ID", "employeeId"],
                    ["Designation", "designation"]
                ];

            default:
                return [];
        }
    };

    const downloadCSV = () => {

        if (!reportData.length) return;

        const columns = getColumns();

        const escapeCSV = (value) => {
            const text = value === null || value === undefined
                ? ""
                : String(value);

            return `"${text.replace(/"/g, '""')}"`;
        };

        const headers = columns.map(column => escapeCSV(column[0]));

        const rows = reportData.map(record =>
            columns.map(column => escapeCSV(record[column[1]]))
        );

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob(
            ["\uFEFF" + csvContent],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `AmazeCare_${reportType}_Report.csv`;
        link.click();

        URL.revokeObjectURL(url);
    };

    const downloadPDF = () => {

        if (!reportData.length) return;

        const columns = getColumns();

        const tableHeaders = columns
            .map(column => `<th>${column[0]}</th>`)
            .join("");

        const tableRows = reportData.map(record =>
            `<tr>${columns.map(column =>
                `<td>${String(record[column[1]] ?? "-")
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                }</td>`
            ).join("")}</tr>`
        ).join("");

        const printWindow = window.open("", "_blank");

        if (!printWindow) {
            Swal.fire({
                icon: "warning",
                title: "Pop-up Blocked",
                text: "Please allow pop-ups to download the PDF report.",
                confirmButtonColor: "#2F8F78"
            });
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>AmazeCare ${reportType} Report</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 25px;
                        color: #222;
                    }
                    h2 {
                        color: #2F8F78;
                        margin-bottom: 5px;
                    }
                    p {
                        color: #666;
                        font-size: 13px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 25px;
                        font-size: 11px;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                        word-break: break-word;
                    }
                    th {
                        background: #2F8F78;
                        color: white;
                    }
                    tr:nth-child(even) {
                        background: #f4f8f7;
                    }
                    @media print {
                        body { padding: 0; }
                        tr { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <h2>AmazeCare - ${reportType} Report</h2>
                <p>Generated on: ${new Date().toLocaleString()}</p>
                <p>Total Records: ${reportData.length}</p>
                <table>
                    <thead><tr>${tableHeaders}</tr></thead>
                    <tbody>${tableRows}</tbody>
                </table>
                <script>
                    window.onload = function() {
                        window.print();
                    };
                <\/script>
            </body>
            </html>
        `);

        printWindow.document.close();
    };

    const clearFilters = () => {

        setFromDate("");
        setToDate("");
        setStatus("");
        setDoctorId("");
        setSpecialization("");
        setGender("");
        setDesignation("");

        setReportData([]);
        setReportGenerated(false);
        setErrMsg("");
        setErrComment("");
    };

    const changeReportType = (value) => {

        setReportType(value);
        clearFilters();
    };

    return (
        <div className="container-fluid py-3">

            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <h1 className="h3 fw-bold mb-1">Reports & Analytics</h1>
                    <p className="text-muted mb-0">
                        Generate and download administrative reports.
                    </p>
                </div>
            </div>

            {/* Report Selection */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">

                    <h5 className="fw-bold mb-3">Select Report Type</h5>

                    <div className="row g-3">
                        {reportOptions.map(option => (
                            <div className="col-12 col-sm-6 col-xl-3" key={option.value}>
                                <button
                                    type="button"
                                    onClick={() => changeReportType(option.value)}
                                    className={`btn w-100 p-3 text-start h-100 ${reportType === option.value
                                            ? "btn-primary"
                                            : "btn-outline-secondary"
                                        }`}
                                    style={{
                                        backgroundColor: reportType === option.value
                                            ? "#2F8F78"
                                            : "",
                                        borderColor: reportType === option.value
                                            ? "#2F8F78"
                                            : ""
                                    }}
                                >
                                    <i className={`bi ${option.icon} fs-4 d-block mb-2`}></i>
                                    <span className="fw-semibold">{option.label}</span>
                                </button>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            {/* Filters */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">

                    <h5 className="fw-bold mb-3">Report Filters</h5>

                    <div className="row g-3">

                        <div className="col-12 col-md-6">
                            <label className="form-label small fw-semibold">From Date</label>
                            <input
                                type="date"
                                className="form-control form-control-lg"
                                value={fromDate}
                                onChange={e => setFromDate(e.target.value)}
                            />
                        </div>

                        <div className="col-12 col-md-6">
                            <label className="form-label small fw-semibold">To Date</label>
                            <input
                                type="date"
                                className="form-control form-control-lg"
                                value={toDate}
                                onChange={e => setToDate(e.target.value)}
                            />
                        </div>

                        {reportType === "APPOINTMENTS" && (
                            <>
                                <div className="col-12 col-md-6">
                                    <label className="form-label small fw-semibold">
                                        Appointment Status
                                    </label>
                                    <select
                                        className="form-select form-select-lg"
                                        value={status}
                                        onChange={e => setStatus(e.target.value)}
                                    >
                                        <option value="">All Statuses</option>
                                        {["REQUESTED", "CONFIRMED", "COMPLETED", "NO_SHOW", "CANCELLED"].map(value => (
                                            <option key={value} value={value}>
                                                {formatEnum(value)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="form-label small fw-semibold">
                                        Doctor ID
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="form-control form-control-lg"
                                        placeholder="Enter doctor ID"
                                        value={doctorId}
                                        onChange={e => setDoctorId(e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {reportType === "DOCTORS" && (
                            <div className="col-12 col-md-6">
                                <label className="form-label small fw-semibold">
                                    Specialization
                                </label>
                                <select
                                    className="form-select form-select-lg"
                                    value={specialization}
                                    onChange={e => setSpecialization(e.target.value)}
                                >
                                    <option value="">All Specializations</option>
                                    {[
                                        "GENERAL_MEDICINE", "CARDIOLOGY", "DERMATOLOGY",
                                        "NEUROLOGY", "ORTHOPEDICS", "PEDIATRICS",
                                        "GYNECOLOGY", "PSYCHIATRY", "OPHTHALMOLOGY",
                                        "ENT", "UROLOGY", "ONCOLOGY", "RADIOLOGY",
                                        "DENTISTRY", "ANESTHESIOLOGY", "SURGERY"
                                    ].map(value => (
                                        <option key={value} value={value}>
                                            {formatEnum(value)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {reportType === "PATIENTS" && (
                            <div className="col-12 col-md-6">
                                <label className="form-label small fw-semibold">Gender</label>
                                <select
                                    className="form-select form-select-lg"
                                    value={gender}
                                    onChange={e => setGender(e.target.value)}
                                >
                                    <option value="">All Genders</option>
                                    {["MALE", "FEMALE", "OTHER"].map(value => (
                                        <option key={value} value={value}>
                                            {formatEnum(value)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {reportType === "EXECUTIVES" && (
                            <div className="col-12 col-md-6">
                                <label className="form-label small fw-semibold">
                                    Designation
                                </label>
                                <select
                                    className="form-select form-select-lg"
                                    value={designation}
                                    onChange={e => setDesignation(e.target.value)}
                                >
                                    <option value="">All Designations</option>
                                    {[
                                        "HOSPITAL_ADMINISTRATOR",
                                        "HOSPITAL_EXECUTIVE",
                                        "RECEPTIONIST",
                                        "APPOINTMENT_COORDINATOR",
                                        "BILLING_EXECUTIVE",
                                        "HR_EXECUTIVE"
                                    ].map(value => (
                                        <option key={value} value={value}>
                                            {formatEnum(value)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                    </div>

                    <div className="d-flex flex-wrap gap-2 mt-4">
                        <button
                            type="button"
                            className="btn btn-primary fw-semibold px-4"
                            style={{ backgroundColor: "#2F8F78", borderColor: "#2F8F78" }}
                            onClick={generateReport}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-file-earmark-bar-graph me-2"></i>
                                    Generate Report
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            className="btn btn-outline-secondary px-4"
                            onClick={clearFilters}
                        >
                            <i className="bi bi-arrow-counterclockwise me-2"></i>
                            Clear Filters
                        </button>
                    </div>

                    {errMsg && (
                        <div className="alert alert-danger mt-3 mb-0">
                            <strong>{errMsg}</strong>
                            {errComment && <div>{errComment}</div>}
                        </div>
                    )}

                </div>
            </div>

            {/* Download Section - No data table in UI */}
            {reportGenerated && (
                <div className="card border-0 shadow-sm">
                    <div className="card-body p-4">

                        <div className="d-flex align-items-center gap-3 mb-4">
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center"
                                style={{
                                    width: "52px",
                                    height: "52px",
                                    backgroundColor: "#E4F4EF",
                                    color: "#2F8F78"
                                }}
                            >
                                <i className="bi bi-file-earmark-check fs-3"></i>
                            </div>

                            <div>
                                <h5 className="fw-bold mb-1">Report Generated</h5>
                                <p className="text-muted mb-0 small">
                                    Your report is ready to download.
                                </p>
                            </div>
                        </div>

                        <div className="row g-3 mb-4">
                            <div className="col-12 col-md-6">
                                <div className="p-3 rounded bg-body-tertiary">
                                    <p className="text-muted small mb-1">Report Type</p>
                                    <h6 className="fw-bold mb-0">
                                        {reportOptions.find(option => option.value === reportType)?.label}
                                    </h6>
                                </div>
                            </div>

                            <div className="col-12 col-md-6">
                                <div className="p-3 rounded bg-body-tertiary">
                                    <p className="text-muted small mb-1">Total Records</p>
                                    <h6 className="fw-bold mb-0">{reportData.length}</h6>
                                </div>
                            </div>
                        </div>

                        {reportData.length > 0 ? (
                            <div className="d-flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    className="btn btn-outline-danger fw-semibold px-4"
                                    onClick={downloadPDF}
                                >
                                    <i className="bi bi-file-earmark-pdf me-2"></i>
                                    Download PDF
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-outline-success fw-semibold px-4"
                                    onClick={downloadCSV}
                                >
                                    <i className="bi bi-file-earmark-excel me-2"></i>
                                    Download Excel (CSV)
                                </button>
                            </div>
                        ) : (
                            <p className="text-muted mb-0">
                                No records are available for download.
                            </p>
                        )}

                    </div>
                </div>
            )}

        </div>
    );
}

export default AdminReports;
