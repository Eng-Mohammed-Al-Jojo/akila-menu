import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { ref, onValue, push, remove, update  } from "firebase/database";
import { FiDownload, FiUpload } from "react-icons/fi";

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
  // ✅ تعديل النوع هنا: itemIngredients اختياري
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

// ======== STATE للـ Toast ========
const [toast, setToast] = useState("");
const [loading, setLoading] = useState(false);

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

  // ================= LOGIN =================
  const login = async () => {
    if (!email || !password) return alert("أدخل البريد وكلمة المرور");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      alert("بيانات الدخول غير صحيحة");
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
      console.error(err);
      setResetMessage(err.message);
    }
  };

  // ================= LOGOUT =================
  const logout = async () => {
    await signOut(auth);
    setPopup({ type: null });
  };

  // ================= CATEGORY =================
const addCategory = async () => {
  // ✅ تحقق إذا الحقل فاضي
  if (!newCategoryName.trim()) {
    setToast("⚠️  يجب إدخال اسم القسم أولاً");
    setTimeout(() => setToast(""), 3000);
    return;
  }

  const newName = newCategoryName.trim();

  // تحقق من وجود القسم مسبقاً (تجاهل الحالة)
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

  // فرغ الانبت بعد الإضافة
  setNewCategoryName("");
  setPopup({ type: null });

  setToast(`تم إضافة القسم "${newName}" بنجاح ✅`);
  setTimeout(() => setToast(""), 4000);
};



  const deleteCategory = async (id: string) => {
    await remove(ref(db, `categories/${id}`));
    Object.keys(items).forEach((itemId) => {
      if (items[itemId].categoryId === id) {
        remove(ref(db, `items/${itemId}`));
      }
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
      ingredients: editItemValues.itemIngredients || "", // ✅ هنا لازم تضيف المكونات

    });
    setPopup({ type: null });
    setEditItemId("");
    setEditItemValues({
      itemName: "",
      itemPrice: "",
      priceTw: "",
      selectedCategory: "",
      itemIngredients:  "", // ✅ إضافة المكونات

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

  // الأعمدة تشمل كل الحقول
  sheet.columns = [
    { header: "الاسم", key: "name", width: 30 },
    { header: "السعر", key: "price", width: 15 },
    { header: "سعر TW", key: "priceTw", width: 15 },
    { header: "القسم", key: "categoryName", width: 30 },
    { header: "المكونات", key: "ingredients", width: 40 },
  ];

  // إضافة البيانات
  Object.values(items).forEach((item: any) => {
    const categoryName = categories[item.categoryId]?.name ?? "غير محدد";
    sheet.addRow({
      name: item.name,
      price: item.price,
      priceTw: item.priceTw || "",
      categoryName,
      ingredients: item.ingredients || "",
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, "akila-menu.xlsx");
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
      setToast("ملف غير صالح");
      setLoading(false);
      return;
    }

    // خريطة الأقسام: اسم القسم → id
    const categoryMap: Record<string, string> = {};
    Object.entries(categories).forEach(([id, cat]: any) => {
      categoryMap[cat.name.trim().toLowerCase()] = id;
    });

    const rows: any[] = [];
    sheet.eachRow((row, index) => {
      if (index === 1) return; // تخطي Header
      rows.push({
        name: row.getCell(1).value?.toString().trim() || "",
        price: row.getCell(2).value?.toString().trim() || "",
        priceTw: row.getCell(3).value?.toString().trim() || "",
        categoryName: row.getCell(4).value?.toString().trim() || "",
        ingredients: row.getCell(5).value?.toString().trim() || "",
      });
    });

    let addedCount = 0;
    for (const item of rows) {
      if (!item.name || !item.categoryName) continue;

      const categoryId = categoryMap[item.categoryName.toLowerCase()];
      if (!categoryId) continue; // إذا القسم غير موجود، تجاهل

      // تحقق من التكرار
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
        createdAt: Date.now(),
      });

      addedCount++;
    }

    if (addedCount > 0) {
      setToast(`تم إضافة ${addedCount} صنف جديد ✅`);
    } else {
      setToast("القائمة محدثة بالفعل ✅");
    }
  } catch (err) {
    console.error(err);
    setToast("حدث خطأ أثناء الاستيراد ❌");
  } finally {
    setLoading(false);
    e.target.value = "";
    setTimeout(() => setToast(""), 4000);
  }
};


  // ================= LOGIN UI =================
  if (!authOk) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]" dir="rtl">
        {resetPasswordPopup && (
          <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
              <h2 className="text-xl font-bold mb-4 text-[#D3AC69] text-center">
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
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
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
        {!resetPasswordPopup && (
          <div
            className="bg-white p-6 rounded-3xl w-full max-w-xs border"
            style={{ borderColor: "#C9A24D" }}
          >
            <h1 className="text-xl font-bold mb-4 text-center text-[#e1a53d]">دخول الأدمن</h1>
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
              className="w-full py-3 rounded-xl font-bold bg-[#0F0F0F] text-[#D3AC69] hover:cursor-pointer"
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
    <div className="min-h-screen w-full bg-[#0F0F0F] flex justify-center py-5 md:p-6" dir="rtl">
        {/* ======== TOAST ======== */}
    {toast && (
      <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-[#B22271] text-white px-6 py-3 rounded-xl shadow-lg transition-all">
        {toast}
      </div>
    )}

    {/* ======== LOADER ======== */}
    {loading && (
      <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-40">
        <div className="bg-white p-6 rounded-xl shadow-lg text-black font-bold">
          جاري تحميل البيانات...
        </div>
      </div>
    )}
      <input
        type="file"
        accept=".xlsx"
        id="excelUpload"
        hidden
        onChange={importFromExcel}
      />

      <div className="w-full max-w-7xl px-8 sm:px-8 md:px-24">
        <div className="flex justify-between items-center mb-6 flex-wrap">
          <h1 className="text-2xl font-bold text-[#B22271]">لوحة تحكم عكيلة</h1>
          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white font-bold hover:bg-green-500 transition hover:cursor-pointer"
            >
                            <FiUpload size={18} />

               
            </button>

            <button
              onClick={() => document.getElementById("excelUpload")?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition hover:cursor-pointer"
            >
                            <FiDownload size={18} />

               
            </button>
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
            items={items}
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
                  itemIngredients: item.ingredients || "", // ✅ إضافة المكونات

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
    </div>
  );
}
