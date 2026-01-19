import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { ref, onValue } from "firebase/database";
import CategorySection from "./CategorySection";

export interface Category {
  id: string;
  name: string;
  createdAt?: number;
}

export interface Item {
  id: string;
  name: string;
  price: number;
  ingredients?: string;
  priceTw?: number;
  categoryId: string;
  visible?: boolean;
  createdAt?: number;
}

export default function Menu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // ======= حالة التوست =======
  const [offlineToast, setOfflineToast] = useState<{
    message: string;
    color: string;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
    let timeoutId: number | null = null;

      // ⚡ ضبط تنبيه الاتصال الضعيف بعد 15 ثانية
      timeoutId = setTimeout(() => {
        setOfflineToast({
          message: "الانترنت ضعيف! تأكد من اتصالك بالانترنت",
          color: "red",
        });
        setTimeout(() => setOfflineToast(null), 5000);
      }, 15000);

      if (navigator.onLine) {
        let catsLoaded = false;
        let itemsLoaded = false;

        onValue(ref(db, "categories"), (snap) => {
          const data = snap.val();
          const cats = data
            ? Object.entries(data).map(([id, v]: any) => ({
                id,
                name: v.name,
                createdAt: v.createdAt || 0,
              }))
            : [];

          setCategories(cats);
          catsLoaded = true;
          if (itemsLoaded) {
            setLoading(false);
            if (timeoutId) clearTimeout(timeoutId);
          }
        });

        onValue(ref(db, "items"), (snap) => {
          const data = snap.val();
          const its = data
            ? Object.entries(data).map(([id, v]: any) => ({
                id,
                ...v,
                createdAt: v.createdAt || 0,
              }))
            : [];

          setItems(its);
          itemsLoaded = true;
          if (catsLoaded) {
            setLoading(false);
            if (timeoutId) clearTimeout(timeoutId);
          }
        });

        // 🌟 توست أونلاين أخضر
        setOfflineToast({ message: "أنت حالياً متصل بقاعدة البيانات", color: "green" });
        setTimeout(() => setOfflineToast(null), 4000);
      } else {
        try {
          const res = await fetch("/menu-data.json");
          const data = await res.json();

          const cats = data.categories
            ? Object.entries(data.categories).map(([id, v]: any) => ({
                id,
                name: v.name,
                createdAt: v.createdAt || 0,
              }))
            : [];

          const its = data.items
            ? Object.entries(data.items).map(([id, v]: any) => ({
                id,
                ...v,
                createdAt: v.createdAt || 0,
              }))
            : [];

          setCategories(cats);
          setItems(its);
          setLoading(false);

          if (timeoutId) clearTimeout(timeoutId);

          // 🔴 توست أوفلاين أحمر
          setOfflineToast({
            message: "أنت حالياً غير متصل بقاعدة البيانات (نسخة محلية)",
            color: "red",
          });
          setTimeout(() => setOfflineToast(null), 4000);
        } catch (err) {
          console.error("Failed to load offline data:", err);
          setCategories([]);
          setItems([]);
          setLoading(false);

          if (timeoutId) clearTimeout(timeoutId);

          setOfflineToast({ message: "فشل تحميل البيانات أوفلاين", color: "red" });
          setTimeout(() => setOfflineToast(null), 4000);
        }
      }
    };

    loadData();
  }, []);

  // ================= Empty State Logic =================
  const isEmpty =
    categories.length === 0 ||
    items.length === 0 ||
    categories.every((cat) => !items.some((item) => item.categoryId === cat.id));

  // ================= Loading Screen =================
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-md">
        <div className="flex flex-col items-center gap-6">
          <img src="/logo_akila.png" alt="Logo" className="w-28 h-auto animate-pulse" />

          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-[#B22271]" />
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-[#d369b3] animate-spin" />
          </div>

          <p className="text-[#B22271] text-xl md:text-3xl tracking-widest animate-pulse font-[Cairo] font-extrabold">
            يتم تحضير القائمة...
          </p>
        </div>
      </div>
    );
  }

  // ================= Empty Screen =================
  if (isEmpty) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center text-center gap-6 px-6">
          <img src="/logo_akila.png" alt="Logo" className="w-50 h-auto opacity-80" />

          <p className="text-xl md:text-2xl font-[Cairo] font-bold text-gray-500">
            انتظرونا، يتم تجهيز القائمة قريبًا
          </p>

          <div className="mt-4 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B22271] animate-bounce" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5BB07] animate-bounce [animation-delay:150ms]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#CCC20D] animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  // ================= Main Content =================
  return (
    <main className="max-w-4xl mx-auto px-4 pb-20 space-y-8 relative">
      {/* ================= Toast ================= */}
      {offlineToast && (
        <div
          className={`fixed top-6 right-6 px-6 py-3 rounded-2xl text-white font-bold shadow-2xl backdrop-blur-md bg-opacity-90 transition-all duration-500 transform z-50`}
          style={{
            background:
              offlineToast.color === "green"
                ? "linear-gradient(to right, #34D399, #059669)"
                : "linear-gradient(to right, #F87171, #B91C1C)",
          }}
        >
          {offlineToast.message}
        </div>
      )}

      {/* ================= Tabs ================= */}
      <div className="flex flex-wrap gap-3 pb-4 justify-center">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-full font-[Cairo] text-sm transition-all duration-300 ${
            activeCategory === null
              ? "bg-[#BFA06B] text-white shadow-md"
              : "bg-[#F5F1EB] text-[#7A5A2E] hover:bg-[#EEE6D1]"
          }`}
        >
          جميع الأصناف
        </button>

        {categories
          .filter((cat) => items.some((i) => i.categoryId === cat.id))
          .map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full font-[Cairo] text-sm transition-all duration-300 ${
                activeCategory === cat.id
                  ? "bg-[#BFA06B] text-white shadow-md"
                  : "bg-[#F5F1EB] text-[#7A5A2E] hover:bg-[#EEE6D1]"
              }`}
            >
              {cat.name}
            </button>
          ))}
      </div>

      {/* ================= Sections ================= */}
      {activeCategory === null
        ? categories.map((cat) => {
            const catItems = items.filter((i) => i.categoryId === cat.id);
            if (!catItems.length) return null;
            return <CategorySection key={cat.id} category={cat} items={catItems} />;
          })
        : categories
            .filter((cat) => cat.id === activeCategory)
            .map((cat) => {
              const catItems = items.filter((i) => i.categoryId === cat.id);
              if (!catItems.length) return null;
              return <CategorySection key={cat.id} category={cat} items={catItems} />;
            })}
    </main>
  );
}
