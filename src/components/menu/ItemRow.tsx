import { type Item } from "./Menu";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { FaCheck } from "react-icons/fa";

interface Props {
  item: Item;
  orderSystem: boolean;
}

export default function ItemRow({ item, orderSystem }: Props) {
  const prices = String(item.price).split(",");
  const unavailable = item.visible === false;

  const { addItem } = useCart();
  const [addedPrice, setAddedPrice] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);

  const hasIngredients = !!item.ingredients;

  const handleAdd = (price: number) => {
    addItem(item, price);
    setAddedPrice(price);
    setShowToast(true);

    setTimeout(() => {
      setAddedPrice(null);
      setShowToast(false);
    }, 1000);
  };

  return (
    <div
      className={`
        relative w-full h-full
        ${unavailable ? "opacity-60" : ""}
      `}
    >
      {/* ===== Card ===== */}
      <div
        className={`
          relative flex flex-col h-full
          rounded-xl overflow-hidden
          shadow-lg shadow-[#B22271]/40
          bg-linear-to-br from-white/90 to-white/95
          border ${unavailable ? "border-gray-400/40" : "border-[#a70a05]/40"}
          shadow-md transition-all duration-500
          active:scale-[0.98]
          font-[Almarai] font-bold
        `}
      >
        {/* ===== Image ===== */}
        <div className="w-full h-32 sm:h-36 bg-black/20 overflow-hidden">
          <img
            src={item.image ? `/images/${item.image}` : "/logo_akila.png"}
            alt={item.name}
            loading="lazy"
            className={`w-full h-full object-cover transition-all duration-500
              ${unavailable ? "hover:scale-100" : "hover:scale-105"}`}
            onError={(e) => {
              e.currentTarget.src = "/logo_akila.png";
            }}
          />
        </div>/ // /

        {/* ===== Content ===== */}
        <div className="p-3 flex flex-col gap-1 flex-1 -mt-8">
          {/* Name */}
          <h3
            className={`
              text-sm sm:text-xl font-extrabold leading-snug
              ${unavailable
                ? "line-through text-gray-400 text-center"
                : "text-[#B22271] text-center text-xl md:text-2xl"}
            `}
          >
            {item.name}
          </h3>

          {/* Ingredients */}
          {hasIngredients && (
            <p
              className={`
                text-[11px] sm:text-xs text-gray-500 line-clamp-2 text-center
                ${unavailable ? "line-through text-gray-400" : ""}
              `}
            >
              {item.ingredients}
            </p>
          )}

          {/* ===== Prices + Add ===== */}
          <div className="mt-auto flex flex-col gap-2">
            {orderSystem
              ? prices.map((p) => {
                const price = Number(p.trim());
                const isAdded = addedPrice === price;

                return (
                  <div
                    key={price}
                    className={`
              flex items-center justify-between
              px-2 py-1.5 rounded-xl
              bg-white/80 border border-[#B22271]/30
              transition
              ${unavailable ? "opacity-50 line-through" : ""}
            `}
                  >
                    <span className="text-md font-extrabold text-[#b3aa07]">
                      {price}₪
                    </span>

                    {!unavailable && (
                      <button
                        onClick={() => handleAdd(price)}
                        className={`
                  w-7 h-7 flex items-center justify-center
                  rounded-md text-white font-bold
                  transition-all duration-300
                  active:scale-90
                  ${isAdded
                            ? "bg-[#B22271] text-xl md:text-2xl"
                            : "bg-[#B22271]/90 hover:scale-110"
                          }
                `}
                      >
                        {isAdded ? (
                          <FaCheck className="animate-pulse" />
                        ) : (
                          <span className="text-lg md:text-xl font-extrabold">+</span>
                        )}
                      </button>
                    )}
                  </div>
                );
              })
              : (
                // ===== عرض الأسعار جنب بعض بالفاصلة إذا النظام غير مفعل =====
                <p className={`text-sm md:text:lg font-extrabold text-[#b3aa07] text-center 
                  ${unavailable ? "line-through text-gray-400" : ""}`}
                >
                  {prices.map(p => p.trim() + "₪").join(" | ")}
                </p>
              )
            }
          </div>
        </div>
      </div>
      {/* ===== Toast ===== */}
      {showToast && (
        <div
          className="
            absolute top-2 left-1/2
            -translate-x-1/2
            bg-[#B22271]
            text-white font-bold
            px-3 py-1.5 rounded-xl
            shadow-lg
            flex items-center gap-2
            animate-toast-show
            pointer-events-none
            z-50
          "
        >
          <FaCheck className="w-4 h-4" />
          <span className="text-xs">تمت الإضافة</span>
        </div>
      )}
    </div>
  );
}
