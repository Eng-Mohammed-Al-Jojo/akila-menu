import React, { useState } from "react";
import { ref, push, update } from "firebase/database";
import { db } from "../../firebase";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { type PopupState } from "./types";

interface Props {
  categories: any;
  items: any;
  popup: PopupState;
  setPopup: (popup: PopupState) => void;
}

const ItemSection: React.FC<Props> = ({ categories, items, setPopup }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemIngredients, setItemIngredients] = useState(""); // ✅ المكونات
  const [itemPrice, setItemPrice] = useState("");
  const [quickSearch, setQuickSearch] = useState("");

  const addItem = async () => {
    if (!selectedCategory || !itemName || !itemPrice) return;
    await push(ref(db, "items"), {
      name: itemName,
      ingredients: itemIngredients, // ✅ حفظ المكونات
      price: itemPrice,
      categoryId: selectedCategory,
      visible: true,
      createdAt: Date.now(),
    });
    setItemName("");
    setItemIngredients("");
    setItemPrice("");
    setSelectedCategory("");
  };

  

  const toggleItem = async (id: string, visible: boolean) => {
    await update(ref(db, `items/${id}`), { visible: !visible });
  };

  return (
    <div className="bg-white p-6 rounded-3xl border-2" style={{ borderColor: "#B22271" }}>
      <h2 className="font-bold mb-4 text-2xl text-[#231F20]">الأصناف</h2>

      {/* ADD ITEM */}
      <div className="flex gap-2 flex-wrap mb-6">
        <select
          className="w-full p-2 border rounded-xl mb-2"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">اختر القسم</option>
          {Object.keys(categories).map((id) => (
            <option key={id} value={id}>{categories[id].name}</option>
          ))}
        </select>

        <input
          className="w-full p-2 border rounded-xl mb-2"
          placeholder="اسم الصنف"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />

        {/* حقل المكونات */}
        <input
          className="w-full p-2 border rounded-xl mb-2"
          placeholder="المكونات أو الوصف (اختياري)"
          value={itemIngredients}
          onChange={(e) => setItemIngredients(e.target.value)}
        />

        <input
          className="w-full p-2 border rounded-xl mb-3"
          placeholder="الأسعار (افصل بين الأسعار بفاصلة)"
          value={itemPrice}
          onChange={(e) => setItemPrice(e.target.value)}
        />

        <button
          onClick={addItem}
          className="flex-4 py-2 rounded-xl font-bold bg-[#B22271] grow text-black
          hover:text-white hover:bg-[#c44a8d] hover:shadow-red-400 hover:cursor-pointer"
        >
          إضافة الصنف
        </button>
      </div>

      {/* QUICK SEARCH */}
      <div className="bg-white p-4 rounded-3xl border-2" style={{ borderColor: "#B22271" }}>
        <input
          className="w-full p-2 border rounded-xl mb-4"
          placeholder="ابحث بسرعة عن صنف أو قسم أو سعر..."
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
        />

        {/* قائمة المنتجات */}
        {Object.keys(items)
          .filter(id => {
            const item = items[id];
            const prices = String(item.price).split(",").map(p => p.trim());
            const categoryName = categories[item.categoryId]?.name || "";
            const search = quickSearch.toLowerCase();
            return (
              item.name.toLowerCase().includes(search) ||
              categoryName.toLowerCase().includes(search) ||
              prices.some(p => p.includes(search))
            );
          })
          .map(id => {
            const item = items[id];
            const prices = String(item.price).split(",").map(p => p.trim());

            return (
              <div
                key={id}
                className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-xl transition ${
                  item.visible ? "bg-gray-50 hover:shadow-md" : "bg-gray-200 opacity-60"
                }`}
              >
                <div className="flex flex-col">
                  <p className="font-bold text-[#231F20]">{item.name}</p>
                  {item.ingredients && (
                    <p className="text-sm text-gray-600">مكونات: {item.ingredients}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {categories[item.categoryId]?.name} • {prices.map(p => `${p}₪`).join(" / ")}
                  </p>
                  {item.priceTw && item.priceTw.trim() !== "" && (
                    <p className="text-sm text-red-500">
                      {categories[item.categoryId]?.name} TW • {String(item.priceTw).split(",").map(p => p.trim()).map(p => `${p}₪`).join(" / ")}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 mt-3 sm:mt-0">
                  <button
                    onClick={() => toggleItem(id, item.visible)}
                    className={`px-3 py-1 rounded-xl text-white hover:cursor-pointer ${
                      item.visible ? "bg-green-600 hover:bg-green-700" : "bg-gray-500 hover:bg-gray-600"
                    }`}
                  >
                    {item.visible ? "متوفر" : "غير متوفر"}
                  </button>
                  <button
                    onClick={() => setPopup({ type: "editItem", id })}
                    className="bg-yellow-400 px-3 py-1 rounded-xl hover:cursor-pointer"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => setPopup({ type: "deleteItem", id })}
                    className="bg-red-600 text-white px-3 py-1 rounded-xl hover:cursor-pointer"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ItemSection;
