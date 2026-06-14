import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";

export default function AppLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
