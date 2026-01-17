import Footer from "../components/menu/footer";
import Menu from "../components/menu/Menu";

export default function MenuPage() {
  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#231F20] font-[Cairo]"
    >
      {/* Logo */}
      <div className="flex justify-center py-10">
        <img
          src="/logo_akila.png"
          alt="Logo"
          className="w-60 object-contain"
        />
      </div>

      {/* Menu Content */}
      <div className="flex-1 w-full">
        <Menu />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
