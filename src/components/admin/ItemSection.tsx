import React, { useState, useEffect } from "react";
import { ref, push, update } from "firebase/database";
import { db } from "../../firebase";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import type { PopupState, Category, Item } from "./types";
import FeaturedGallery from "./FeaturedGallery";
import CustomSelect from "./CustomSelect"; // عدّل المسار حسب مكان الملف


/* ================== auto load feature images from public/featured ================== */
const galleryImages = Object.keys(
  import.meta.glob("/public/images/*")
).map((path) => path.replace("/public/images/", ""));
/* ================================================================== */

interface Props {
  categories: Record<string, Category>;
  items: Record<string, Item>;
  popup: PopupState;
  setPopup: (popup: PopupState) => void;
}

const ItemSection: React.FC<Props> = ({ categories, items, setPopup }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemIngredients, setItemIngredients] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [quickSearch, setQuickSearch] = useState("");

  const [selectedCategoryError, setSelectedCategoryError] = useState(false);
  const [itemNameError, setItemNameError] = useState(false);
  const [itemPriceError, setItemPriceError] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // ================== Gallery state ==================
  const [showGallery, setShowGallery] = useState(false);
  const [galleryForItemId, setGalleryForItemId] = useState<string | null>(null);
  const [itemImage, setItemImage] = useState("");

  // ================== Local state for items ==================
  const [localItems, setLocalItems] = useState<Record<string, Item>>(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  // ================== Firebase updates ==================
  const addItem = async () => {
    // ===== فاليديشن =====
    let hasError = false;
    if (!selectedCategory) { setSelectedCategoryError(true); hasError = true; }
    if (!itemName.trim()) { setItemNameError(true); hasError = true; }

    const priceArray = itemPrice.split(",").map(p => p.trim());
    if (!itemPrice.trim() || priceArray.some(p => isNaN(Number(p)) || Number(p) <= 0)) {
      setItemPriceError(true);
      hasError = true;
    }

    if (hasError) return;

    await push(ref(db, "items"), {
      name: itemName,
      ingredients: itemIngredients,
      price: itemPrice,
      categoryId: selectedCategory,
      visible: true,
      createdAt: Date.now(),
      image: itemImage || "", // ✅
      star: false,
    });

    // Reset form
    setItemName("");
    setItemIngredients("");
    setItemPrice("");
    setSelectedCategory("");
    setItemImage("");

    // Show toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  const toggleItem = async (id: string, visible: boolean) => {
    await update(ref(db, `items/${id}`), { visible: !visible });
  };

  const updateImage = async (id: string, image: string) => {
    await update(ref(db, `items/${id}`), { image });
  };

  const removeImage = async (id: string) => {
    await update(ref(db, `items/${id}`), { image: "" });
  };

  const openGallery = (itemId: string, currentImage?: string) => {
    setGalleryForItemId(itemId);
    setItemImage(currentImage || "");
    setShowGallery(true);
  };

  const handleSelectImage = async (img: string) => {
    if (!galleryForItemId) return;
    await updateImage(galleryForItemId, img);
    setShowGallery(false);
  };


  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-white p-5 rounded-2xl border-4 border-[#B22271] relative">
      <h2 className="font-bold mb-4 text-2xl text-gray-800">الأصناف حسب الأقسام</h2>

      {/* ================== إضافة صنف ================== */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex flex-col">
          <CustomSelect
            options={Object.keys(categories).map(id => ({ id, name: categories[id].name }))}
            value={selectedCategory}
            onChange={(val) => { setSelectedCategory(val); setSelectedCategoryError(false); }}
            error={selectedCategoryError}
            placeholder="اختر القسم"
          />
          {selectedCategoryError && <span className="text-xs text-red-500 mt-1">الرجاء اختيار قسم</span>}
        </div>

        <div className="flex flex-col">
          <input
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#B22271]
              ${itemNameError ? "border-red-500" : "border-gray-300"}`}
            placeholder="اسم الصنف"
            value={itemName}
            onChange={(e) => { setItemName(e.target.value); setItemNameError(false); }}
          />
          {itemNameError && <span className="text-xs text-red-500 mt-1">الرجاء إدخال اسم الصنف</span>}
        </div>

        <input
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B22271]"
          placeholder="المكونات أو الوصف (اختياري)"
          value={itemIngredients}
          onChange={(e) => setItemIngredients(e.target.value)}
        />

        <div className="flex flex-col">
          <input
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#B22271]
              ${itemPriceError ? "border-red-500" : "border-gray-300"}`}
            placeholder="الأسعار (افصل بين الأسعار بفاصلة)"
            value={itemPrice}
            onChange={(e) => { setItemPrice(e.target.value); setItemPriceError(false); }}
          />
          {itemPriceError && <span className="text-xs text-red-500 mt-1">الرجاء إدخال أسعار صحيحة مفصولة بفواصل</span>}
        </div>

        <button
          onClick={addItem}
          className="bg-[#B22271] text-white font-semibold px-5 py-2 rounded-lg hover:bg-[#B22271]/80 transition shadow-md shadow-[#B22271]/30"
        >
          إضافة الصنف
        </button>

        {/* Toast */}
        {showToast && (
          <div className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-full
            bg-linear-to-r from-[#B22271] to-[#FFD369] text-black px-4 py-2 rounded-2xl font-bold shadow-lg shadow-black/30 transition animate-fade-in-out z-50">
            تمت إضافة الصنف بنجاح
          </div>
        )}
      </div>

      {/* ================== البحث ================== */}
      <input
        className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B22271]"
        placeholder="ابحث بسرعة عن صنف أو قسم أو سعر..."
        value={quickSearch}
        onChange={(e) => setQuickSearch(e.target.value)}
      />

      {/* ================== الأقسام ================== */}
      <div className="space-y-3">
        {Object.keys(categories).map(catId => {
          const cat = categories[catId];
          const catItems = Object.keys(localItems)
            .map(id => ({ ...localItems[id], id }))
            .filter(item => item.categoryId === catId)
            .filter(item => {
              const search = quickSearch.toLowerCase();
              return (
                item.name.toLowerCase().includes(search) ||
                cat.name.toLowerCase().includes(search) ||
                item.price.split(",").some(p => p.includes(search))
              );
            });

          return (
            <div key={catId} className="rounded-lg border border-gray-200 shadow-sm">
              <div
                className="flex justify-between items-center cursor-pointer px-4 py-2 font-semibold text-gray-800 bg-gray-50 rounded-t-lg hover:bg-gray-100 transition"
                onClick={() => toggleSection(catId)}
              >

                <span>{cat.name}
                  <span className="bg-[#B22271] text-white text-sm px-2 py-0.5 mr-4 rounded-full">
                    {catItems.length}
                  </span>
                </span>

                <span>


                  {expandedSections[catId] ? "▲" : "▼"}
                </span>

              </div>

              {expandedSections[catId] && (
                <div className="divide-y divide-gray-100">
                  {catItems.map(item => (
                    <div
                      key={item.id}
                      className={`flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-2 gap-2
                        ${!item.visible ? "opacity-60 line-through" : ""}`}
                    >
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        {item.image ? (
                          <div className="relative">
                            <img
                              src={`/images/${item.image}`}
                              alt={item.name}
                              className="w-10 h-10 object-contain bg-gray-100 rounded cursor-pointer"
                              onError={(e) => {
                                e.currentTarget.src = "/images/placeholder.png";
                              }}
                              onClick={() => openGallery(item.id, item.image)}
                            />
                            <button
                              onClick={() => removeImage(item.id)}
                              className="absolute -top-2 -right-2 w-5 h-5 flex justify-center items-center bg-red-600 text-white rounded-full hover:bg-red-700 transition text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => openGallery(item.id)}
                            className="w-10 h-10 flex justify-center items-center rounded bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-700 transition text-sm font-bold"
                          >
                            +
                          </button>
                        )}

                        <div className="min-w-0">
                          <p className={`truncate font-medium ${!item.visible ? "text-gray-400" : "text-gray-700"}`}>{item.name}</p>
                          {item.ingredients && (
                            <p className={`truncate text-sm ${!item.visible ? "text-gray-400" : "text-gray-500"}`}>{item.ingredients}</p>
                          )}
                          <p className={`truncate text-sm ${!item.visible ? "text-gray-400" : "text-gray-400"}`}>{item.price} ₪</p>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => toggleItem(item.id, item.visible)}
                          className={`w-16 h-8 text-sm rounded-lg text-white ${item.visible ? "bg-green-600 hover:bg-green-700" : "bg-gray-500 hover:bg-gray-600"}`}
                        >
                          {item.visible ? "متوفر" : "غير متوفر"}
                        </button>

                        <button
                          onClick={() => setPopup({ type: "editItem", id: item.id })}
                          className="w-8 h-8 flex justify-center items-center bg-yellow-400 rounded-lg hover:bg-yellow-500 transition"
                        >
                          <FiEdit size={16} />
                        </button>

                        <button
                          onClick={() => setPopup({ type: "deleteItem", id: item.id })}
                          className="w-8 h-8 flex justify-center items-center bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          <FiTrash2 size={16} />
                        </button>
                        <button
                          onClick={async () => {
                            if (!item.visible) return; // لا يسمح بالتعديل إذا غير متوفر
                            const newStar = !localItems[item.id].star;
                            await update(ref(db, `items/${item.id}`), { star: newStar });
                            setLocalItems(prev => ({
                              ...prev,
                              [item.id]: { ...prev[item.id], star: newStar }
                            }));
                          }}
                          className={`w-8 h-8 flex justify-center items-center rounded-lg transition
                            ${!item.visible ? "text-gray-300 cursor-not-allowed" : localItems[item.id].star ? "text-yellow-400" : "text-gray-400 hover:text-yellow-400"}
                          `}
                        >
                          <FaStar size={24} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {catItems.length === 0 && (
                    <p className="px-4 py-2 text-gray-400 text-sm">
                      لا توجد أصناف في هذا القسم
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <FeaturedGallery
        visible={showGallery}
        onClose={() => setShowGallery(false)}
        onSelect={handleSelectImage}
        galleryImages={galleryImages}
        selectedImage={itemImage}
      />
    </div>
  );
};

export default ItemSection;
