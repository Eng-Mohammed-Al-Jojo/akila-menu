import { type Item } from "./Menu";
import React from "react";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { FaCheck, FaSearchPlus } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { Modal } from "../ui/modal";

interface Props {
  item: Item;
  orderSystem: boolean;
}

const ItemRow = React.memo(function ItemRow({ item, orderSystem }: Props) {
  const prices = String(item.price).split(",");
  const unavailable = item.visible === false;

  const { addItem } = useCart();
  const [addedPrice, setAddedPrice] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const hasIngredients = !!item.ingredients;

  const handleAdd = (price: number) => {
    addItem(item, price);
    setAddedPrice(price);
    setTimeout(() => {
      setAddedPrice(null);
    }, 1200);
  };

  return (
    <>
      <motion.div
        whileHover={!unavailable ? { y: -4, transition: { duration: 0.2 } } : {}}
        className={cn(
          "relative flex flex-col h-full w-full rounded-xl overflow-hidden bg-card border border-border shadow-sm transition-shadow hover:shadow-md",
          unavailable && "opacity-60 grayscale-[0.5]"
        )}
      >
        {/* Image Section */}
        <div
          className="relative w-full aspect-4/3 overflow-hidden cursor-pointer group bg-muted/30"
          onClick={() => setPreviewImage(item.image || "/logo_akila.png")}
        >
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
            src={item.image ? `/images/${item.image}` : "/logo_akila.png"}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/logo_akila.png";
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          <div className="absolute bottom-2 right-2 bg-white/90 text-[#B22271] p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-md">
            <FaSearchPlus className="w-3 h-3" />
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col gap-2 flex-1 relative z-10 bg-white">
          <h3 className={cn("text-lg md:text-xl font-bold leading-tight", unavailable ? "line-through text-muted-foreground" : "text-foreground")}>
            {item.name}
          </h3>

          {hasIngredients && (
            <p className={cn("text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1")}>
              {item.ingredients}
            </p>
          )}

          {/* Pricing & Add to Cart */}
          <div className="mt-auto pt-4 flex flex-col gap-2">
            {orderSystem ? (
              prices.map((p) => {
                const price = Number(p.trim());
                const isAdded = addedPrice === price;

                return (
                  <div key={price} className="flex items-center justify-between mt-1">
                    <span className="text-base font-bold text-[#b3aa07]">
                      {price} <span className="text-xs">₪</span>
                    </span>
                    {!unavailable && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAdd(price)}
                        className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-full shadow-sm transition-colors",
                          isAdded ? "bg-green-500 text-white" : "bg-[#B22271] text-white hover:bg-[#B22271]/90"
                        )}
                      >
                        <AnimatePresence mode="wait">
                          {isAdded ? (
                            <motion.div
                              key="check"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                            >
                              <FaCheck className="w-3 h-3" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="plus"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="text-lg leading-none"
                            >
                              +
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    )}
                  </div>
                );
              })
            ) : (
              <p className={cn("text-base font-bold text-[#b3aa07]", unavailable && "line-through text-muted-foreground")}>
                {prices.map((p) => p.trim() + " ₪").join(" | ")}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Image Modal using premium generic modal */}
      <Modal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        className="max-w-md p-1 bg-transparent border-none shadow-none"
      >
        {previewImage && (
          <div className="relative">
            <img
              src={previewImage.startsWith("/") ? previewImage : `/images/${previewImage}`}
              alt={item.name}
              className="w-full h-auto rounded-xl shadow-2xl"
            />
          </div>
        )}
      </Modal>
    </>
  );
});
export default ItemRow;