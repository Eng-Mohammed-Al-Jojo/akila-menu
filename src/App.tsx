import { Routes, Route } from "react-router-dom";
import AdminPage from "./pages/Admin";   // صحيح
import MenuPage from "./pages/MenuPage";   // صحيح

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MenuPage />} />
      <Route path="/admin" element={<AdminPage />} />

      {/* fallback */}
      <Route
        path="*"
        element={
          <div className="text-white p-10 text-center">
            الصفحة غير موجودة
          </div>
        }
      />
    </Routes>
  );
}
