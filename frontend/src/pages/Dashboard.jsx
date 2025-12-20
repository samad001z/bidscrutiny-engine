import { useAuth } from "@/context/AuthContext";
import GovernmentDashboard from "./dashboards/GovernmentDashboard";
import VendorDashboard from "./dashboards/VendorDashboard";

export default function Dashboard() {
  const { role } = useAuth();

  return (
    <>
      {role === "government" ? <GovernmentDashboard /> : <VendorDashboard />}
    </>
  );
}
