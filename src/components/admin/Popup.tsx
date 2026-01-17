import React from "react";
import { type PopupState } from "./types";

interface Props {
  popup: PopupState;
  setPopup: (popup: PopupState) => void;
  deleteItem?: () => void;
  deleteCategory?: (id: string) => void;
  addCategory?: () => void;
  updateItem?: () => void;
  
  
  editItemValues?: {
    itemName: string;
    itemPrice: string;
    priceTw: string;
    selectedCategory: string;
    itemIngredients?: string; // ✅ أضفنا المكونات

  };
  setEditItemValues?: (values: {
    itemName: string;
    itemPrice: string;
    priceTw: string;
    selectedCategory: string;
    itemIngredients?: string; // ✅ أضفنا المكونات

  }) => void;
  categories?: any;

  // ===== خصائص reset password =====
  resetPasswordPopup?: boolean;
  setResetPasswordPopup?: (val: boolean) => void;
  resetEmail?: string;
  setResetEmail?: (val: string) => void;
  resetMessage?: string;
  handleResetPassword?: () => void;
  logout?: () => void;
}

const Popup: React.FC<Props> = ({
  popup,
  setPopup,
  deleteItem,
  deleteCategory,
  addCategory,
  updateItem,
  editItemValues,
  setEditItemValues,
  categories,
  resetPasswordPopup,
  setResetPasswordPopup,
  resetEmail,
  setResetEmail,
  resetMessage,
  handleResetPassword,
  logout,
}) => {
  // إذا لا يوجد أي popup
  if (!popup.type && !resetPasswordPopup) return null;

  return (
    <>
      {/* خلفية قاتمة */}
      <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" 
           onClick={() => {
             setPopup({ type: null });
             setResetPasswordPopup && setResetPasswordPopup(false);
           }}
      />

      {/* محتوى Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="relative bg-white p-6 rounded-3xl shadow-2xl w-72 sm:w-80">
          {/* ===== Logout ===== */}
          {popup.type === "logout" && (
            <>
              <p className="mb-4 font-bold text-center">تسجيل الخروج؟</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    logout && logout();
                    setPopup({ type: null });
                  }}
                  className="px-5 py-2 rounded-xl font-bold bg-black text-red-500 hover:cursor-pointer"
                >
                  نعم
                </button>
                <button
                  onClick={() => setPopup({ type: null })}
                  className="px-5 py-2 rounded-xl font-bold border hover:cursor-pointer"
                >
                  لا
                </button>
              </div>
            </>
          )}

          {/* ===== Add Category ===== */}
          {popup.type === "addCategory" && (
            <>
              <p className="mb-4 font-bold text-center">إضافة قسم</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={addCategory}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl w-full hover:cursor-pointer"
                >
                  حفظ
                </button>
                <button
                  onClick={() => setPopup({ type: null })}
                  className="bg-red-500 text-white px-5 py-2 rounded-xl font-bold border hover:cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </>
          )}

          {/* ===== Delete Category ===== */}
          {popup.type === "deleteCategory" && (
            <>
              <p className="mb-4 font-bold text-center">تأكيد حذف القسم؟</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => deleteCategory && deleteCategory(popup.id!)}
                  className="px-5 py-2 rounded-xl font-bold bg-red-600 text-white hover:cursor-pointer"
                >
                  حذف
                </button>
                <button
                  onClick={() => setPopup({ type: null })}
                  className="px-5 py-2 rounded-xl font-bold border hover:cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </>
          )}

          {/* ===== Delete Item ===== */}
          {popup.type === "deleteItem" && (
            <>
              <h2 className="text-xl font-bold mb-4 text-center">تأكيد الحذف</h2>
              <p className="text-center mb-6">هل أنت متأكد من حذف هذا المنتج؟</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={deleteItem}
                  className="px-5 py-2 rounded-xl font-bold bg-red-600 text-white hover:cursor-pointer"
                >
                  نعم، حذف
                </button>
                <button
                  onClick={() => setPopup({ type: null })}
                  className="px-5 py-2 rounded-xl font-bold border hover:cursor-pointer"
                >
                  لا
                </button>
              </div>
            </>
          )}

          {/* ===== Edit Item ===== */}
          {popup.type === "editItem" && editItemValues && setEditItemValues && categories && (
            <>
              <h2 className="text-xl font-bold mb-4 text-center">تعديل المنتج</h2>

              <select
                className="w-full p-2 border rounded-xl mb-3"
                value={editItemValues.selectedCategory}
                onChange={(e) =>
                  setEditItemValues({
                    ...editItemValues,
                    selectedCategory: e.target.value,
                  })
                }
              >
                {Object.keys(categories).map((id) => (
                  <option key={id} value={id}>
                    {categories[id].name}
                  </option>
                ))}
              </select>

              <input
                className="w-full p-2 border rounded-xl mb-3"
                placeholder="اسم المنتج"
                value={editItemValues.itemName}
                onChange={(e) =>
                  setEditItemValues({
                    ...editItemValues,
                    itemName: e.target.value,
                  })
                }
              />
               {/* ✅ حقل المكونات */}
              <input
                className="w-full p-2 border rounded-xl mb-3"
                placeholder="المكونات أو الوصف (اختياري)"
                value={editItemValues.itemIngredients}
                onChange={(e) =>
                  setEditItemValues({
                    ...editItemValues,
                    itemIngredients: e.target.value,
                  })
                }
              />

              <input
                className="w-full p-2 border rounded-xl mb-4"
                placeholder="الأسعار (افصل بين الأسعار بفاصلة)"
                value={editItemValues.itemPrice}
                onChange={(e) =>
                  setEditItemValues({
                    ...editItemValues,
                    itemPrice: e.target.value,
                  })
                }
              />

              {/* <input
                type="number"
                placeholder="سعر TW (اختياري)"
                className="w-full p-2 border rounded-xl mb-4"
                value={editItemValues.priceTw}
                onChange={(e) =>
                  setEditItemValues({
                    ...editItemValues,
                    priceTw: e.target.value,
                  })
                }
              /> */}

              <div className="flex justify-end gap-2">
                <button
                  onClick={updateItem}
                  className="px-4 py-2 rounded-xl font-bold bg-[#B22271] hover:cursor-pointer hover:text-white hover:bg-[#c44a8d] transition"
                >
                  حفظ
                </button>
                <button
                  onClick={() => setPopup({ type: null })}
                  className="px-4 py-2 rounded-xl border hover:cursor-pointer" 
                >
                  إلغاء
                </button>
              </div>
            </>
          )}

          {/* ===== Reset Password ===== */}
          {resetPasswordPopup && (
            <>
              <h2 className="text-xl font-bold mb-4 text-red-600 text-center">
                إعادة تعيين كلمة المرور
              </h2>

              <input
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                className="w-full p-3 border rounded-xl mb-3"
                value={resetEmail}
                onChange={(e) => setResetEmail && setResetEmail(e.target.value)}
              />

              {resetMessage && (
                <p className="text-sm text-center text-green-600 mb-2">{resetMessage}</p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={handleResetPassword}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition hover:cursor-pointer"
                >
                  إرسال الرابط
                </button>
                <button
                  onClick={() => setResetPasswordPopup && setResetPasswordPopup(false)}
                  className="px-4 py-2 rounded-xl border hover:bg-gray-100 transition hover:cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Popup;
