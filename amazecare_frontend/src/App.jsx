
import { Routes, Route } from "react-router"
import SignUp from "./components/patient/SignUp"
import PageNotFound from "./components/PageNotFound"
import SignIn from "./components/auth/SignIn"
import PatientLayout from "./components/patient/PatientLayout"
import DoctorList from "./components/patient/DoctorList"
import PatientProfile from "./components/patient/PatientProfile"
import UpdateProfile from "./components/patient/UpdateProfile"
import AppointmentList from "./components/patient/AppointmentList"
import BookAppointment from "./components/patient/BookAppointment"
import PatientDashboard from "./components/patient/dashboard/PatientDashboard"
import MedicalHistory from "./components/patient/MedicalHistory"
import RequestAppointment from "./components/patient/RequestAppointment"
import RescheduleAppointment from "./components/patient/ResheduleAppointment"
import ExecutiveLayout from "./components/executive/ExecutiveLayout"
import ExecutiveDashboard from "./components/executive/dashboard/ExecutiveDashboard"
import AppointmentRequest from "./components/executive/AppointmentRequest"
import AssignDoctor from "./components/executive/AssignDoctor"
import ExecutiveAppointments from "./components/executive/ExecutiveAppointmentList"
import ExecutiveDoctors from "./components/executive/ExecutiveDoctors"
import ExecutivePatients from "./components/executive/ExecutivePatients"
import AdminLayout from "./components/admin/AdminLayout"
import AdminDashboard from "./components/admin/dashboard/AdminDashboard"
import AdminDoctors from "./components/admin/AdminDoctors"
import AdminPatients from "./components/admin/AdminPatients"
import AdminAppointments from "./components/admin/AdminAppointments"
import AddDoctor from "./components/admin/AddDoctor"
import UpdateDoctor from "./components/admin/UpdateDoctor"
import UpdatePatient from "./components/admin/UpdatePatient"
import AddPatient from "./components/admin/AddPatient"
import AdminReports from "./components/admin/AdminReports"
import AdminExecutives from "./components/admin/AdminExecutive"
import AddExecutive from "./components/admin/AddExecutive"
import UpdateExecutive from "./components/admin/UpdateExecutive"
import DoctorLayout from "./components/doctor/DoctorLayout"
import DoctorAppointments from "./components/doctor/DoctorAppointments"
import AppointmentDetails from "./components/doctor/AppointmentDetails"
import ConsultationForm from "./components/doctor/ConsultationForm"
import ConsultationDetails from "./components/doctor/ConsultationDetails"
import DoctorPatients from "./components/doctor/DoctorPatients"
import DoctorPatientHistory from "./components/doctor/DoctorPatientHistory"
import DoctorProfile from "./components/doctor/DoctorProfile"
import DoctorDashboard from "./components/doctor/dashboard/DoctorDashBoard"
import WebSocketTest from "./WebSocketTest"
import PatientChat from "./components/patient/PatientChat"
import DoctorChat from "./components/doctor/DoctorChat"

function App() {

  return (

    <Routes>
      <Route path="" element={<SignIn />} />
      <Route path="patient/signup" element={<SignUp />} />
      {/* child routes for Patient*/}
      <Route path="patient" element={<PatientLayout />}>
        <Route index element={< PatientDashboard />} />
        <Route path="doctors" element={<DoctorList />} />
        <Route path="profile" element={<PatientProfile />} />
        <Route path="messages" element={<PatientChat />} />
        
        <Route path="update-profile" element={<UpdateProfile />} />
        <Route path="book-appointment/:doctorId" element={<BookAppointment />} />
        <Route path="request-appointment" element={<RequestAppointment />} />
        <Route path="appointments" element={<AppointmentList />} />
        <Route path="reschedule/:appointmentId" element={<RescheduleAppointment />} />
        <Route path="medical-history" element={<MedicalHistory />} />
      </Route>

      <Route path="executive" element={<ExecutiveLayout />}>
        <Route index element={<ExecutiveDashboard />} />
        <Route path="doctors" element={<ExecutiveDoctors />} />
        <Route path="patients" element={<ExecutivePatients />} />
        <Route path="assign/:appointmentId" element={<AssignDoctor />} />
        <Route path="appointments" element={<ExecutiveAppointments />} />
        <Route path="requests" element={<AppointmentRequest />} />
      </Route>

      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="doctors" element={<AdminDoctors />} />
        <Route path="doctors/add" element={<AddDoctor />} />
        <Route path="doctors/update" element={<UpdateDoctor />} />
        <Route path="patients" element={<AdminPatients />} />
        <Route path="patients/add" element={<AddPatient />} />
        <Route path="patients/update" element={<UpdatePatient />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="executives" element={<AdminExecutives />} />
        <Route path="executives/add" element={<AddExecutive />} />
        <Route path="executives/update" element={<UpdateExecutive />} />
      </Route>

      <Route path="doctor" element={<DoctorLayout />}>
        <Route index element={<DoctorDashboard />} />
        <Route path="messages" element={<DoctorChat />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="appointments/details" element={<AppointmentDetails />} />
        <Route path="appointments/consultation" element={<ConsultationForm />} />
        <Route path="appointments/consultation-details" element={<ConsultationDetails />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="patients/history" element={<DoctorPatientHistory />} />
        <Route path="profile" element={<DoctorProfile />} />
      </Route>

<Route path="/websocket-test" element={<WebSocketTest />} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>


  )
}

export default App