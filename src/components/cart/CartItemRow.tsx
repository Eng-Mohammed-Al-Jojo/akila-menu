import { FaTrash } from "react-icons/fa";
import { type CartItem, useCart } from "../../context/CartContext";

export default function CartItemRow({ item }: { item: CartItem }) {
    const { increase, decrease, removeItem } = useCart();

    return (
        <div className="flex items-center justify-between gap-3 border-b border-[#940D11]/30 pb-2">
            <div className="flex-1">
                <p className="font-bold">{item.name}</p>
                <p className="text-sm text-[#F7F3E8]/70">
                    {item.qty} × {item.selectedPrice}₪
                </p>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => decrease(item.priceKey)}
                    className="w-7 h-7 rounded-full bg-[#940D11] text-white"
                >
                    −
                </button>

                <span className="min-w-[20px] text-center font-bold">
                    {item.qty}
                </span>

                <button
                    onClick={() => increase(item.priceKey)}
                    className="w-7 h-7 rounded-full bg-[#940D11] text-white"
                >
                    +
                </button>

                <button
                    onClick={() => removeItem(item.priceKey)}
                    className="ml-2 text-[#F7F3E8]/70 hover:text-red-400"
                >
                    <FaTrash />
                </button>
            </div>
        </div>
    );
}
