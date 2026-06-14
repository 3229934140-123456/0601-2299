import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import ClassListPage from "@/pages/ClassListPage";
import ProjectTestPage from "@/pages/ProjectTestPage";
import DataEntryPage from "@/pages/DataEntryPage";
import ReviewPage from "@/pages/ReviewPage";
import StatisticsPage from "@/pages/StatisticsPage";
import { useAppStore } from "@/store";

export default function App() {
  const { setIsOnline, syncPendingRecords, isOnline } = useAppStore();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingRecords();
    };
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setIsOnline, syncPendingRecords]);

  void isOnline;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/class-list" replace />} />
          <Route path="class-list" element={<ClassListPage />} />
          <Route path="project-test" element={<ProjectTestPage />} />
          <Route path="data-entry" element={<DataEntryPage />} />
          <Route path="review" element={<ReviewPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="*" element={<Navigate to="/class-list" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
