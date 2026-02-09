import { useState, useEffect, useRef } from "react";
import { FaTimes, FaPlus, FaMinus } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import OrderTabs from "./OrderTabs";
import { db } from "../../firebase";
import { ref, onValue } from "firebase/database";

interface OrderSettings {
    inRestaurant: boolean;
    takeaway: boolean;
    inPhone: string;
    outPhone: string;
}

const LOCAL_STORAGE_KEY = "orderSettings";

export default function CartModal({ onClose }: { onClose: () => void }) {
    const { items, totalPrice, clearCart, increase, decrease } = useCart();

    const [toast, setToast] = useState<string | null>(null);
    const [orderSent, setOrderSent] = useState(false);
    const [lastMessage, setLastMessage] = useState<string>("");
    const [orderType, setOrderType] = useState<"in" | "out">("in");
    const [showModal, setShowModal] = useState(false);
    const [orderSettings, setOrderSettings] = useState<OrderSettings | null>(null);

    const firstInputRef = useRef<HTMLInputElement>(null);

    /* ===== جلب الإعدادات ===== */
    useEffect(() => {
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) {
            setOrderSettings(JSON.parse(localData));
        }

        const settingsRef = ref(db, "settings/orderSettings");
        const unsubscribe = onValue(settingsRef, snapshot => {
            if (snapshot.exists()) {
                const settings = snapshot.val();
                setOrderSettings(settings);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
            }
        });

        return () => unsubscribe();
    }, []);

    /* ===== فتح المودال ===== */
    useEffect(() => {
        if (items.length > 0) setShowModal(true);
    }, [items.length]);

    /* ===== فوكس ===== */
    useEffect(() => {
        if (showModal && firstInputRef.current) {
            firstInputRef.current.focus();
        }
    }, [showModal]);

    const handleSend = (message: string, type: "in" | "out") => {
        if (!navigator.onLine) {
            setToast("لا يوجد اتصال بالإنترنت ❌");
            setTimeout(() => setToast(null), 3000);
            return;
        }

        const phone =
            type === "in"
                ? orderSettings?.inPhone
                : orderSettings?.outPhone;

        const url =
            "https://wa.me/" +
            phone +
            "?text=" +
            encodeURIComponent(message);

        window.open(url, "_blank");

        setLastMessage(message);
        setOrderSent(true);
        setOrderType(type);
        clearCart();

        setToast("تم إرسال الطلب بنجاح ✅");
        setTimeout(() => setToast(null), 15000);
    };

    const renderMessage = (msg: string) =>
        msg
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean)
            .join("\n");

    return (
        <>
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-white w-full max-w-md rounded-3xl p-6 text-[#F7F3E8] relative max-h-[90vh] overflow-y-auto mx-4">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-xl text-[#B22271] hover:text-[#B22271]/70"
                        >
                            <FaTimes />
                        </button>

                        {!orderSent ? (
                            <>
                                <h2 className="text-2xl font-extrabold text-center mb-4 text-[#B22271]">
                                    سلة الطلب 🛒
                                </h2>

                                {items.length === 0 ? (
                                    <div className="text-center py-10 space-y-4">
                                        <p className="text-lg font-bold">السلة فارغة</p>
                                        <button
                                            onClick={onClose}
                                            className="px-6 py-2 rounded-full bg-[#B22271] font-bold text-white"
                                        >
                                            إغلاق
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-3 max-h-60 overflow-auto mb-4">
                                            {items.map(item => (
                                                <div
                                                    key={item.priceKey}
                                                    className="flex items-center justify-between bg-[#F7F3E8]/30 rounded-xl p-3"
                                                >
                                                    <div className="flex-1">
                                                        <p className="font-bold text-sm text-black ">
                                                            {item.name}
                                                        </p>
                                                        <p className="text-xs text-black ">
                                                            {item.qty} × {item.selectedPrice}₪
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                decrease(item.priceKey)
                                                            }
                                                            className="w-7 h-7 rounded-full bg-[#B22271] flex items-center justify-center"
                                                        >
                                                            <FaMinus size={10} />
                                                        </button>

                                                        <span className="min-w-[20px] text-center text-sm font-bold text-black">
                                                            {item.qty}
                                                        </span>

                                                        <button
                                                            onClick={() =>
                                                                increase(item.priceKey)
                                                            }
                                                            className="w-7 h-7 rounded-full bg-[#B22271] flex items-center justify-center"
                                                        >
                                                            <FaPlus size={10} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="text-lg font-bold flex justify-between mb-4">
                                            <span className="text-[#B22271]">الإجمالي</span>
                                            <span className="text-[#B22271]">{totalPrice}₪</span>
                                        </div>

                                        <OrderTabs
                                            onConfirm={handleSend}
                                            firstInputRef={firstInputRef}
                                            orderSettings={orderSettings ?? undefined}
                                        />
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="space-y-4 text-center">
                                <h2 className="text-2xl font-bold text-[#B22271]">
                                    {orderType === "in"
                                        ? "🍽️ طلب داخل المطعم"
                                        : "🛍️ طلب تيك أواي"}
                                </h2>

                                <div className="bg-black/20 p-4 rounded-2xl max-h-72 overflow-auto text-left whitespace-pre-wrap text-sm">
                                    {renderMessage(lastMessage)}
                                    <div className="mt-3 font-bold flex justify-between">
                                        <span>💰 الإجمالي</span>
                                        <span>{totalPrice}₪</span>
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="w-full py-3 rounded-full bg-[#B22271] font-bold"
                                >
                                    أغلق
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {toast && (
                <div className="fixed top-6 right-6 z-50 bg-[#B22271] text-white px-6 py-3 rounded-2xl font-bold shadow-2xl animate-pulse">
                    {toast}
                </div>
            )}
        </>
    );
}
