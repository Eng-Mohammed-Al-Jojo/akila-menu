import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { ref, onValue } from "firebase/database";
import CategorySection from "./CategorySection";



/* ================= Types ================= */
export interface Category {
  id: string;
  name: string;
  available?: boolean;
  order?: number;
  createdAt?: number;
}

export interface Item {
  featured: any;
  image: string | undefined;
  id: string;
  name: string;
  price: number;
  ingredients?: string;
  priceTw?: number;
  categoryId: string;
  visible?: boolean;
  star?: boolean;
  createdAt?: number;
}

/* ================= LocalStorage ================= */
const saveToLocal = (cats: Category[], its: Item[], orderSystem: boolean) => {
  localStorage.setItem(
    "menu_cache",
    JSON.stringify({
      categories: cats,
      items: its,
      orderSystem,
      savedAt: Date.now(),
    })
  );
};

const loadFromLocal = () => {
  const cached = localStorage.getItem("menu_cache");
  if (!cached) return null;
  return JSON.parse(cached);
};

/* ================= Main Component ================= */
interface Props {
  onLoadingChange?: (loading: boolean) => void;
  onFeaturedCheck?: (hasFeatured: boolean) => void;
}

export default function Menu({ onLoadingChange, onFeaturedCheck }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderSystem, setOrderSystem] = useState<boolean>(true);

  const [toast, setToast] = useState<{ message: string; color: "green" | "red" } | null>(null);

  /* ===== Tabs State (إضافة ضرورية) ===== */
  const [activeCatId, setActiveCatId] = useState<string | null>("all");

  /* ================= Load Backup JSON ================= */
  const loadMenuJson = async () => {
    try {
      const res = await fetch("/menu.json");
      const data = await res.json();

      const cats: Category[] = Object.entries(data.categories || {}).map(
        ([id, v]: any) => ({
          id,
          name: v.name,
          available: v.available !== false,
          order: v.order ?? 0,
          createdAt: v.createdAt || 0,
        })
      ).sort((a, b) => a.order - b.order);

      const its: Item[] = Object.entries(data.items || {}).map(
        ([id, v]: any) => ({
          id,
          ...v,
          createdAt: v.createdAt || 0,
        })
      );

      setCategories(cats);
      setItems(its);
      setOrderSystem(data.orderSystem ?? true);
      setLoading(false);
      onLoadingChange?.(false);

      setToast({ message: "تم تحميل نسخة احتياطية", color: "red" });
      setTimeout(() => setToast(null), 4000);
    } catch {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  /* ================= useEffect ================= */
  useEffect(() => {
    onLoadingChange?.(true);

    let timeoutId: number | null = null;
    let firebaseLoaded = false;

    const finishFirebase = (cats: Category[], its: Item[], os: boolean) => {
      firebaseLoaded = true;
      saveToLocal(cats, its, os);
      setLoading(false);
      onLoadingChange?.(false);
      if (timeoutId) clearTimeout(timeoutId);

      setToast({ message: "تم التحميل من قاعدة البيانات", color: "green" });
      setTimeout(() => setToast(null), 3000);
    };

    const loadOnline = () => {
      let cats: Category[] = [];
      let its: Item[] = [];
      let catsLoaded = false;
      let itemsLoaded = false;
      let orderSystemLoaded = false;

      timeoutId = window.setTimeout(() => {
        if (firebaseLoaded) return;
        const cached = loadFromLocal();
        if (cached) {
          setCategories(cached.categories || []);
          setItems(cached.items || []);
          setOrderSystem(cached.orderSystem ?? true);
          setLoading(false);
          onLoadingChange?.(false);

          setToast({ message: "الإنترنت ضعيف، تم تحميل آخر نسخة محفوظة", color: "red" });
          setTimeout(() => setToast(null), 4000);
        } else {
          loadMenuJson();
        }
      }, 8000);

      onValue(ref(db, "categories"), (snap) => {
        const data = snap.val();
        cats = data
          ? Object.entries(data).map(([id, v]: any) => ({
            id,
            name: v.name,
            available: v.available !== false,
            order: v.order ?? 0,
            createdAt: v.createdAt || 0,
          }))
          : [];
        cats.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setCategories(cats);
        catsLoaded = true;
        if (itemsLoaded && orderSystemLoaded) finishFirebase(cats, its, orderSystem);
      });

      onValue(ref(db, "items"), (snap) => {
        const data = snap.val();
        its = data
          ? Object.entries(data).map(([id, v]: any) => ({
            id,
            ...v,
            createdAt: v.createdAt || 0,
          }))
          : [];
        setItems(its);
        itemsLoaded = true;
        if (catsLoaded && orderSystemLoaded) finishFirebase(cats, its, orderSystem);
      });

      onValue(ref(db, "settings/orderSystem"), (snap) => {
        const val = snap.val();
        setOrderSystem(val ?? true);
        orderSystemLoaded = true;
        if (catsLoaded && itemsLoaded) finishFirebase(cats, its, val ?? true);
      });
    };

    if (navigator.onLine) loadOnline();
    else loadMenuJson();
  }, [onLoadingChange]);

  /* ================= Check Featured Items ================= */
  useEffect(() => {
    const hasFeatured = items.some((item) => item.star === true);
    onFeaturedCheck?.(hasFeatured);
  }, [items, onFeaturedCheck]);

  /* ================= Available Categories ================= */
  const availableCategories = categories.filter((cat) => cat.available);

  /* ===== تحديد أول Tab تلقائيًا (إضافة مهمة) ===== */
  useEffect(() => {
    if (!activeCatId && availableCategories.length && items.length) {
      const firstCat = availableCategories.find(cat =>
        items.some(i => i.categoryId === cat.id)
      );
      if (firstCat) setActiveCatId(firstCat.id);
    }
  }, [availableCategories, items, activeCatId]);

  {/* ================= Loading Page ================= */ }
  if (loading) {
    return (
      <div className="fixed inset-0 z-9999 flex items-center justify-center bg-white">

        <div className="relative flex items-center justify-center">

          {/* الحلقة الهادئة */}
          <div
            className="
            absolute w-96 h-96 rounded-full
            border border-[#B22271]/40
            animate-spin
            [animation-duration:8s]
          "
          />

          {/* حلقة داخلية أخف */}
          <div
            className="
            absolute w-80 h-80 rounded-full
            border border-[#B22271]/20
            animate-spin
            [animation-duration:14s]
            [animation-direction:reverse]
          "
          />

          {/* اللوجو */}
          <div
            className="
            relative z-10 w-72 h-72 rounded-full
            flex items-center justify-center
          "
          >
            <img
              src="/logo_akila.png"
              alt="Logo"
              className="w-72 h-72 object-contain animate-pulse "
            />
          </div>

        </div>
      </div>
    );
  }



  /* ================= Render ================= */
  return (
    <main className="max-w-4xl mx-auto px-0 pb-10 font-[Alamiri] text-[#F5F8F7]">
      {toast && (
        <div
          className={`fixed top-6 right-6 px-4 py-3 rounded-2xl font-bold shadow-2xl z-50 text-white
          ${toast.color === "green" ? "bg-[#B22271]" : "bg-[#B22271]"}`}
        >
          {toast.message}
        </div>
      )}

      {/* ===== Tabs الأقسام ===== */}
      <div className="top-0 z-30 bg-inherit py-2">
        <div
          className="
      flex gap-1.5 px-2
      items-center justify-center
      flex-wrap
    "
        >
          {/* زر عرض الكل */}
          <button
            onClick={() => setActiveCatId('all')}
            className={`
        px-3 py-1.5
        sm:px-4 sm:py-2
        rounded-full whitespace-nowrap
        font-bold
        text-sm sm:text-base md:text-lg
        border
        transition-all duration-200
        ${activeCatId === 'all'
                ? 'bg-[#B22271] text-white border-[#B22271] shadow'
                : 'bg-transparent text-[#B22271] border-[#B22271]/70 hover:bg-[#B22271]/10'
              }
      `}
          >
            الكل
          </button>

          {/* بقية التابس */}
          {availableCategories.map((cat) => {
            const hasItems = items.some((i) => i.categoryId === cat.id);
            if (!hasItems) return null;

            const isActive = activeCatId === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCatId(cat.id)}
                className={`
            px-3 py-1.5
            sm:px-4 sm:py-2
            rounded-full whitespace-nowrap
            font-bold
            text-sm sm:text-base md:text-lg
            border
            transition-all duration-200
            ${isActive
                    ? 'bg-[#B22271] text-white border-[#B22271] shadow'
                    : 'bg-transparent text-[#B22271] border-[#B22271]/70 hover:bg-[#B22271]/10'
                  }
          `}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== محتوى القسم / عرض الكل ===== */}
      <div className="min-h-screen">
        {activeCatId === "all"
          ? availableCategories.map((cat) => {
            const catItems = items.filter((i) => i.categoryId === cat.id);
            if (!catItems.length) return null;

            return (
              <CategorySection
                key={cat.id}
                category={cat}
                items={catItems}
                orderSystem={orderSystem}
              />
            );
          })
          : availableCategories.map((cat) => {
            if (cat.id !== activeCatId) return null;

            const catItems = items.filter((i) => i.categoryId === cat.id);
            if (!catItems.length) return null;

            return (
              <CategorySection
                key={cat.id}
                category={cat}
                items={catItems}
                orderSystem={orderSystem}
              />
            );
          })}
      </div>


    </main>
  );
}
