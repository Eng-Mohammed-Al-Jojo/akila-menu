import { type Item } from "./Menu";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { FaCheck, FaSearchPlus } from "react-icons/fa";

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
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
      {/* ================= Card ================= */}
      <div
        className="
          relative flex flex-col h-full
          rounded-2xl overflow-hidden
          bg-white
          border border-[#B22271]/30
          shadow-xl shadow-[#B22271]/30
          transition-all duration-500
          hover:-translate-y-1
          active:scale-[0.98]
          font-[Almarai] font-bold
        "
      >
        {/* ================= Image ================= */}
        <div
          className="
            relative w-full h-40 sm:h-44
            overflow-hidden cursor-pointer group
          "
          onClick={() => setPreviewImage(item.image || "/logo_akila.png")}
        >
          <img
            src={item.image ? `/images/${item.image}` : "/logo_akila.png"}
            alt={item.name}
            loading="lazy"
            className="
              w-full h-full object-cover
              transition-transform duration-700
              group-hover:scale-110
            "
            onError={(e) => {
              e.currentTarget.src = "/logo_akila.png";
            }}
          />

          {/* Overlay */}


          {/* Zoom Icon */}
          <div
            className="
              absolute bottom-2 right-2
              bg-white/90 text-[#B22271]
              p-2 rounded-full shadow
              opacity-0 group-hover:opacity-100
              transition
            "
          >
            <FaSearchPlus />
          </div>
        </div>

        {/* ================= Content ================= */}
        <div className="p-3 flex flex-col gap-1 flex-1 -mt-2">
          {/* Name */}
          <h3
            className={`
              text-center text-xl md:text-2xl font-extrabold
              ${unavailable
                ? "line-through text-gray-400"
                : "text-[#B22271]"
              }
            `}
          >
            {item.name}
          </h3>

          {/* Ingredients */}
          {hasIngredients && (
            <p
              className={`
                text-xs text-right text-gray-600 line-clamp-2
                ${unavailable ? "line-through text-gray-400" : ""}
              `}
            >
              {item.ingredients}
            </p>
          )}

          {/* ================= Prices ================= */}
          <div className="mt-auto flex flex-col gap-2">
            {orderSystem ? (
              prices.map((p) => {
                const price = Number(p.trim());
                const isAdded = addedPrice === price;

                return (
                  <div
                    key={price}
                    className={`
                      flex items-center justify-between
                      px-3 py-2 rounded-xl
                      bg-white/90
                      border border-[#B22271]/30
                      transition
                      ${unavailable ? "opacity-50 line-through" : ""}
                    `}
                  >
                    <span className="text-lg font-extrabold text-[#b3aa07]">
                      {price}₪
                    </span>

                    {!unavailable && (
                      <button
                        onClick={() => handleAdd(price)}
                        className={`
                          w-8 h-8 flex items-center justify-center
                          rounded-lg text-white font-bold
                          transition-all duration-300
                          active:scale-90
                          ${isAdded
                            ? "bg-[#B22271] text-xl"
                            : "bg-[#B22271]/90 hover:scale-110"
                          }
                        `}
                      >
                        {isAdded ? (
                          <FaCheck className="animate-pulse" />
                        ) : (
                          <span className="text-xl">+</span>
                        )}
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <p
                className={`
                  text-center text-md font-bold text-[#b3aa07]
                  ${unavailable ? "line-through text-gray-400" : ""}
                `}
              >
                {prices.map((p) => p.trim() + "₪").join(" | ")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ================= Toast ================= */}
      {showToast && (
        <div
          className="
            absolute top-2 left-1/2 -translate-x-1/2
            bg-[#B22271]
            text-white font-bold
            px-4 py-1.5 rounded-xl
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

      {/* ================= Image Preview Modal ================= */}
      {previewImage && (
        <div
          className="
            fixed inset-0 z-999
            bg-black/80
            flex items-center justify-center
            p-4
            animate-fade-in
          "
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={
              previewImage.startsWith("/")
                ? previewImage
                : `/images/${previewImage}`
            }
            className="
              max-w-full max-h-[90vh]
              rounded-2xl
              shadow-2xl
              animate-scale-in
            "
          />
        </div>
      )}
    </div>
  );
}