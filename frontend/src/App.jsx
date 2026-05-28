import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import SetDetail from "./pages/SetDetail.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sets/:id" element={<SetDetail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
