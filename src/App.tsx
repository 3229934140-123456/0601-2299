import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import ClassListPage from "@/pages/ClassListPage";
import ProjectTestPage from "@/pages/ProjectTestPage";
import DataEntryPage from "@/pages/DataEntryPage";
import ReviewPage from "@/pages/ReviewPage";
import StatisticsPage from "@/pages/StatisticsPage";

export default function App() {
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
