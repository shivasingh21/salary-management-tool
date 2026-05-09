import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout.jsx";
import ProtectedRoute from "./components/routing/ProtectedRoute.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import EmployeeForm from "./pages/EmployeeForm.jsx";
import Employees from "./pages/Employees.jsx";
import Login from "./pages/Login.jsx";
import LookupForm from "./pages/LookupForm.jsx";
import LookupIndex from "./pages/LookupIndex.jsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/new" element={<EmployeeForm />} />
        <Route path="/employees/:id/edit" element={<EmployeeForm />} />
        <Route path="/departments" element={<LookupIndex resource="departments" />} />
        <Route path="/departments/new" element={<LookupForm resource="departments" />} />
        <Route path="/job-titles" element={<LookupIndex resource="jobTitles" />} />
        <Route path="/job-titles/new" element={<LookupForm resource="jobTitles" />} />
        <Route path="/countries" element={<LookupIndex resource="countries" />} />
        <Route path="/countries/new" element={<LookupForm resource="countries" />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
