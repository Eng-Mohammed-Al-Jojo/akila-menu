import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { ref, onValue, push, remove, update, get, set } from "firebase/database";
import { FiDownload, FiSettings, FiUpload } from "react-icons/fi";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { FiLogOut } from "react-icons/fi";
import { useLocation } from "react-router-dom";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import CategorySection from "../components/admin/CategorySection";
import ItemSection from "../components/admin/ItemSection";
import Popup from "../components/admin/Popup";
import { type PopupState } from "../components/admin/types";
import OrderSettingsModal from "../components/admin/OrderSettingsModal";
import { FaDatabase } from "react-icons/fa";

export default function Admin() {
  const location = useLocation();
  const [authOk, setAuthOk] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [categories, setCategories] = useState<any>({});
  const [newCategoryName, setNewCategoryName] = useState("");
  const [items, setItems] = useState<any>({});
  const [popup, setPopup] = useState<PopupState>({ type: null });
  const [resetPasswordPopup, setResetPasswordPopup] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [editItemValues, setEditItemValues] = useState<{
    itemName: string;
    itemPrice: string;
    priceTw: string;
    selectedCategory: string;
    itemIngredients?: string;
  }>({
    itemName: "",
    itemPrice: "",
    priceTw: "",
    selectedCategory: "",
    itemIngredients: "",
  });
  const [editItemId, setEditItemId] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOrderSettings, setShowOrderSettings] = useState(false);
  const [orderSettings, setOrderSettings] = useState<any>(null);
  // const [showEditGallery, setShowEditGallery] = useState(false);
  const [settings, setSettings] = useState({
    orderSystem: false,
    orderSettings: { inRestaurant: false, takeaway: false, inPhone: "", outPhone: "" },
    complaintsWhatsapp: "",
    footerInfo: { address: "", phone: "", whatsapp: "", facebook: "", instagram: "", tiktok: "" },
  });


  // ================= AUTH LISTENER =================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthOk(!!user);
    });
    return () => unsub();
  }, []);

  // ================= AUTO LOGOUT ON LEAVE /admin =================
  useEffect(() => {
    return () => {
      signOut(auth);
    };
  }, [location.pathname]);

  // ================= FIREBASE DATA =================
  useEffect(() => {
    if (!authOk) return;
    const catRef = ref(db, "categories");
    const itemRef = ref(db, "items");
    onValue(catRef, (snap) => setCategories(snap.val() || {}));
    onValue(itemRef, (snap) => setItems(snap.val() || {}));
  }, [authOk]);

  // ================= ORDER SETTINGS INITIALIZE =================
  useEffect(() => {
    if (!authOk) return;

    const settingsRef = ref(db, "settings"); // ⚡ جلب كل الإعدادات
    const initSettings = async () => {
      const snap = await get(settingsRef);
      if (!snap.exists()) {
        // إذا مش موجود، نضيف إعدادات افتراضية كاملة
        const defaultSettings = {
          complaintsWhatsapp: "",
          footerInfo: {
            address: "",
            facebook: "",
            instagram: "",
            phone: "",
            tiktok: "",
            whatsapp: ""
          },
          orderSettings: {
            inRestaurant: false,
            inPhone: "",
            takeaway: false,
            outPhone: "",
          },
          orderSystem: true
        };
        await set(settingsRef, defaultSettings);
        setSettings(defaultSettings);
        setOrderSettings(defaultSettings); // ⚡ للModal
      } else {
        const data = snap.val();
        setSettings(data);
        setOrderSettings(data); // ⚡ للModal
      }
    };
    initSettings();
  }, [authOk]);

  // ================= LOGIN =================
  const login = async () => {
    if (!email || !password) {
      setToast("أدخل البريد وكلمة المرور");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setToast("تم تسجيل الدخول بنجاح ✅");
      setTimeout(() => setToast(""), 3000);
    } catch {
      setToast("بيانات الدخول غير صحيحة");
      setTimeout(() => setToast(""), 3000);
    }
  };

  // ================= RESET PASSWORD =================
  const handleResetPassword = async () => {
    if (!resetEmail.trim()) {
      setResetMessage("أدخل البريد الإلكتروني أولاً");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك!");
    } catch (err: any) {
      setToast(err.message);
      setTimeout(() => setToast(""), 3000);
    }
  };

  // ================= LOGOUT =================
  const logout = async () => {
    await signOut(auth);
    setPopup({ type: null });
    setToast("تم تسجيل الخروج بنجاح ✅");
    setTimeout(() => setToast(""), 3000);
  };

  // ================= CATEGORY =================
  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      setToast("⚠️  يجب إدخال اسم القسم أولاً");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    const newName = newCategoryName.trim();
    const exists = Object.values(categories).some(
      (cat: any) => cat.name.trim().toLowerCase() === newName.toLowerCase()
    );
    if (exists) {
      setToast(`القسم "${newName}" موجود مسبقاً`);
      setTimeout(() => setToast(""), 3000);
      return;
    }
    await push(ref(db, "categories"), {
      name: newName,
      createdAt: Date.now(),
    });
    setNewCategoryName("");
    setPopup({ type: null });
    setToast(`تم إضافة القسم "${newName}" بنجاح ✅`);
    setTimeout(() => setToast(""), 4000);
  };

  const deleteCategory = async (id: string) => {
    await remove(ref(db, `categories/${id}`));
    Object.keys(items).forEach((itemId) => {
      if (items[itemId].categoryId === id) remove(ref(db, `items/${itemId}`));
    });
    setPopup({ type: null });
    setToast("  تم حذف القسم بنجاح ✅");
    setTimeout(() => setToast(""), 4000);
  };

  // ================= ITEMS =================
  const deleteItem = async () => {
    if (!popup.id) return;
    await remove(ref(db, `items/${popup.id}`));
    setPopup({ type: null });
    setToast("  تم حذف الصنف بنجاح ✅");
    setTimeout(() => setToast(""), 4000);
  };

  const updateItem = async () => {
    if (!editItemId) return;
    await update(ref(db, `items/${editItemId}`), {
      name: editItemValues.itemName,
      price: editItemValues.itemPrice,
      priceTw: editItemValues.priceTw || "",
      categoryId: editItemValues.selectedCategory,
      ingredients: editItemValues.itemIngredients || "",
    });
    setPopup({ type: null });
    setEditItemId("");
    setEditItemValues({
      itemName: "",
      itemPrice: "",
      priceTw: "",
      selectedCategory: "",
      itemIngredients: "",
    });
    setToast("  تم التعديل بنجاح ✅");
    setTimeout(() => setToast(""), 4000);
  };
  // ================= EXPORT EXCEL =================
  const exportToExcel = async () => {
    if (!categories || !items) {
      alert("البيانات لم يتم تحميلها بعد!");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Items");

    sheet.columns = [
      { header: "الاسم", key: "name", width: 30 },
      { header: "السعر", key: "price", width: 15 },
      { header: "سعر TW", key: "priceTw", width: 15 },
      { header: "القسم", key: "categoryName", width: 30 },
      { header: "المكونات", key: "ingredients", width: 40 },
      { header: "متوفر", key: "visible", width: 10 },
      { header: "مميزة", key: "star", width: 10 },
      { header: "صورة", key: "image", width: 25 },
    ];

    Object.values(items).forEach((item: any) => {
      const categoryName = categories[item.categoryId]?.name ?? "غير محدد";
      sheet.addRow({
        name: item.name,
        price: item.price,
        priceTw: item.priceTw || "",
        categoryName,
        ingredients: item.ingredients || "",
        visible: item.visible ? "نعم" : "لا",
        star: item.star ? "⭐" : "",
        image: item.image || "",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "akila-menu.xlsx");

    setToast("تم تصدير البيانات بنجاح ✅");
    setTimeout(() => setToast(""), 3000);
  };

  // ================= IMPORT EXCEL =================
  const importFromExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const buffer = await file.arrayBuffer();
      await workbook.xlsx.load(buffer);

      const sheet = workbook.getWorksheet(1);
      if (!sheet) {
        setToast("ملف غير صالح ❌");
        setLoading(false);
        return;
      }

      const categoryMap: Record<string, string> = {};
      Object.entries(categories).forEach(([id, cat]: any) => {
        categoryMap[cat.name.trim().toLowerCase()] = id;
      });

      const rows: any[] = [];
      sheet.eachRow((row, index) => {
        if (index === 1) return; // تجاهل رأس الجدول
        rows.push({
          name: row.getCell(1).value?.toString().trim() || "",
          price: row.getCell(2).value?.toString().trim() || "",
          priceTw: row.getCell(3).value?.toString().trim() || "",
          categoryName: row.getCell(4).value?.toString().trim() || "",
          ingredients: row.getCell(5).value?.toString().trim() || "",
          visible: row.getCell(6).value?.toString().trim().toLowerCase() === "نعم",
          star: row.getCell(7).value?.toString().trim() === "⭐",
          image: row.getCell(8).value?.toString().trim() || "",
        });
      });

      let addedCount = 0;
      for (const item of rows) {
        if (!item.name || !item.categoryName) continue;
        const categoryId = categoryMap[item.categoryName.toLowerCase()];
        if (!categoryId) continue;

        const exists = Object.values(items).some(
          (i: any) =>
            i.name.trim().toLowerCase() === item.name.toLowerCase() &&
            i.categoryId === categoryId
        );
        if (exists) continue;

        await push(ref(db, "items"), {
          name: item.name,
          price: item.price,
          priceTw: item.priceTw || "",
          categoryId,
          ingredients: item.ingredients || "",
          visible: item.visible ?? true,
          star: item.star ?? false,
          featured: item.featured || "",
          createdAt: Date.now(),
        });
        addedCount++;
      }

      if (addedCount > 0) setToast(`تم إضافة ${addedCount} صنف جديد ✅`);
      else setToast("القائمة محدثة بالفعل ✅");
    } catch (err) {
      console.error(err);
      setToast("حدث خطأ أثناء الاستيراد ❌");
    } finally {
      setLoading(false);
      e.target.value = "";
      setTimeout(() => setToast(""), 4000);
    }
  };


  // ================= EXPORT JSON =================
  const exportToJSON = () => {
    // بناء بيانات JSON بشكل مرتب
    const data = {
      categories,
      items,
      settings: {
        orderSystem: settings.orderSystem,
        orderSettings: {
          inRestaurant: settings.orderSettings.inRestaurant,
          takeaway: settings.orderSettings.takeaway,
          inPhone: settings.orderSettings.inPhone,
          outPhone: settings.orderSettings.outPhone,
        },
        complaintsWhatsapp: settings.complaintsWhatsapp,
        footerInfo: {
          address: settings.footerInfo.address || "",
          phone: settings.footerInfo.phone || "",
          whatsapp: settings.footerInfo.whatsapp || "",
          facebook: settings.footerInfo.facebook || "",
          instagram: settings.footerInfo.instagram || "",
          tiktok: settings.footerInfo.tiktok || "",
        },
      },
      meta: { version: "1.0", exportedAt: Date.now() },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "menu.json";
    a.click();
    URL.revokeObjectURL(url);

    setToast("📦 تم تصدير جميع البيانات والإعدادات بنجاح");
    setTimeout(() => setToast(""), 4000);
  };





  // ================= SAVE ORDER SETTINGS =================
  const handleSaveOrderSettings = async (newSettings: any) => {
    try {
      setLoading(true);

      // تحديث Firebase
      await update(ref(db, "settings"), newSettings);

      // تحديث الـ state محلياً
      setSettings(newSettings);
      setOrderSettings(newSettings);

      setToast("تم حفظ إعدادات الطلب بنجاح ✅");
      setShowOrderSettings(false);
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      console.error(err);
      setToast("حدث خطأ أثناء الحفظ ❌");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setLoading(false);
    }
  };



  // ================= LOGIN UI =================
  if (!authOk) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#231F20]" dir="rtl">
        {toast && (
          <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-[#B22271] text-white px-6 py-3 rounded-xl shadow-lg transition-all">
            {toast}
          </div>
        )}
        {/* POPUP إعادة تعيين كلمة المرور */}
        {resetPasswordPopup && (
          <div className="fixed inset-0 bg-[#231F20]/80 flex justify-center items-center z-50 ">
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm border-4 border-[#B22271]">
              {/* الشعار */}
              <div className="flex justify-center mb-4">
                <img src="/hamada.png" alt="Logo" className="w-24 h-24 object-contain" />
              </div>
              <h2 className="text-xl font-bold mb-4 text-[#B22271] text-center">
                إعادة تعيين كلمة المرور
              </h2>
              <input
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                className="w-full p-3 border rounded-xl mb-3"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              {resetMessage && (
                <p className="text-sm text-center text-green-600 mb-2">{resetMessage}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleResetPassword}
                  className="bg-[#B22271] text-white px-4 py-2 rounded-xl hover:bg-[#B22271]/80 transition"
                >
                  إرسال الرابط
                </button>
                <button
                  onClick={() => {
                    setResetPasswordPopup(false);
                    setResetMessage("");
                  }}
                  className="px-4 py-2 rounded-xl border hover:bg-gray-100 transition"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* POPUP تسجيل الدخول */}
        {!resetPasswordPopup && (
          <div
            className="bg-white p-6 rounded-3xl w-full max-w-xs border-4 flex flex-col items-center"
            style={{ borderColor: "#B22271" }}
          >
            {toast && (
              <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-[#B22271] text-white px-6 py-3 rounded-xl shadow-lg transition-all">
                {toast}
              </div>
            )}
            {/* الشعار */}
            <div className="mb-4">
              <img src="/logo_akila.png" alt="Logo" className="w-24 h-24 object-contain" />
            </div>
            <h1 className="text-xl font-bold mb-4 text-center text-[#B22271]">دخول الأدمن</h1>
            <input
              type="email"
              className="w-full p-3 border rounded-xl mb-3"
              placeholder="اسم المستخدم (Email)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="w-full p-3 border rounded-xl mb-4"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={login}
              className="w-full py-3 rounded-xl font-bold bg-[#B22271] text-white hover:cursor-pointer hover:bg-[#B22271]/80"
            >
              دخول
            </button>
            <button
              onClick={() => setResetPasswordPopup(true)}
              className="mt-3 text-sm text-red-600 hover:underline hover:cursor-pointer"
            >
              نسيت كلمة المرور؟
            </button>
          </div>
        )}
      </div>
    );
  }


  // ================= ADMIN PANEL =================
  return (
    <div className="min-h-screen w-full bg-[#231F20] flex justify-center py-5 md:p-6" dir="rtl">
      {toast && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-[#B22271] text-white px-6 py-3 rounded-xl shadow-lg transition-all">
          {toast}
        </div>
      )}
      {loading && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-40">
          <div className="bg-white p-6 rounded-xl shadow-lg text-black font-bold">
            جاري تحميل البيانات...
          </div>
        </div>
      )}

      {/* Inputs مخفية للملفات */}
      <input type="file" accept=".xlsx" id="excelUpload" hidden onChange={importFromExcel} />

      <div className="w-full max-w-7xl px-8 sm:px-8 md:px-24">
        <div className="flex justify-between items-center mb-6 flex-wrap">
          <h1 className="text-3xl font-extrabold text-[#B22271] mb-4">لوحة تحكم Akila</h1>
          <div className="flex gap-2 flex-wrap">
            {/* Order Settings Button */}
            <button
              onClick={() => setShowOrderSettings(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-600 text-white font-bold hover:bg-yellow-500 transition hover:cursor-pointer"
            >
              <FiSettings size={18} />
            </button>
            {/* Excel Buttons */}
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white font-bold hover:bg-green-500 transition hover:cursor-pointer"
            >
              <FiUpload size={18} />
            </button>
            <button
              onClick={() => document.getElementById
                ("excelUpload")?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition hover:cursor-pointer"
            >
              <FiDownload size={18} />
            </button>

            {/* JSON Buttons */}
            <button
              onClick={exportToJSON}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#940D11] text-white font-bold hover:bg-[#d02c37] transition hover:cursor-pointer"
            >
              backup
              <FaDatabase size={18} />
            </button>

            {/* Logout */}
            <button
              onClick={() => setPopup({ type: "logout" })}
              className="px-4 py-2 rounded-xl font-bold bg-[#d60208] text-white flex items-center gap-1 hover:text-black hover:bg-[#d2343a] hover:cursor-pointer"
            >
              <FiLogOut /> خروج
            </button>
          </div>
        </div>

        <CategorySection
          categories={categories}
          setPopup={setPopup}
          newCategoryName={newCategoryName}
          setNewCategoryName={setNewCategoryName}
        />

        <ItemSection
          categories={categories}
          items={items}
          popup={popup}
          setPopup={(p) => {
            setPopup(p);
            if (p.type === "editItem" && p.id) {
              const item = items[p.id];
              if (item) {
                setEditItemId(p.id);
                setEditItemValues({
                  itemName: item.name,
                  itemPrice: item.price,
                  priceTw: item.priceTw || "",
                  selectedCategory: item.categoryId,
                  itemIngredients: item.ingredients || "",
                });
              }
            }
          }}
        />

        <Popup
          popup={popup}
          setPopup={setPopup}
          addCategory={addCategory}
          deleteCategory={deleteCategory}
          deleteItem={deleteItem}
          updateItem={updateItem}
          editItemValues={editItemValues}
          setEditItemValues={setEditItemValues}
          categories={categories}
          resetPasswordPopup={resetPasswordPopup}
          setResetPasswordPopup={setResetPasswordPopup}
          resetEmail={resetEmail}
          setResetEmail={setResetEmail}
          resetMessage={resetMessage}
          handleResetPassword={handleResetPassword}
          logout={logout}
        />
      </div>

      {/* Order Settings Modal */}
      {showOrderSettings && orderSettings && (
        <OrderSettingsModal
          setShowOrderSettings={setShowOrderSettings}
          orderSettings={orderSettings} // ⚡ الآن تمرر كل الإعدادات
          onSave={handleSaveOrderSettings}
        />
      )}
    </div>
  );
}
