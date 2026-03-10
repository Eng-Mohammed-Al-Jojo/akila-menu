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
                    <div className="bg-card w-full max-w-md rounded-3xl p-6 text-foreground relative max-h-[90vh] overflow-y-auto mx-4 border border-border shadow-xl">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-xl text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                            <FaTimes />
                        </button>

                        {!orderSent ? (
                            <>
                                <h2 className="text-2xl font-extrabold text-center mb-4 text-primary font-[Almarai]">
                                    سلة الطلب 🛒
                                </h2>

                                {items.length === 0 ? (
                                    <div className="text-center py-10 space-y-4">
                                        <p className="text-lg font-bold">السلة فارغة</p>
                                        <button
                                            onClick={onClose}
                                            className="px-6 py-2 rounded-full bg-primary font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
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
                                                    className="flex items-center justify-between bg-muted/50 rounded-xl p-3 border border-border/50"
                                                >
                                                    <div className="flex-1">
                                                        <p className="font-bold text-sm text-foreground">
                                                            {item.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {item.qty} × {item.selectedPrice}₪
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                decrease(item.priceKey)
                                                            }
                                                            className="w-7 h-7 rounded-full bg-[#B22271] text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                                                        >
                                                            <FaMinus size={10} />
                                                        </button>

                                                        <span className="min-w-[20px] text-center text-sm font-bold text-foreground">
                                                            {item.qty}
                                                        </span>

                                                        <button
                                                            onClick={() =>
                                                                increase(item.priceKey)
                                                            }
                                                            className="w-7 h-7 rounded-full bg-[#B22271] text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                                                        >
                                                            <FaPlus size={10} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="text-lg font-bold flex justify-between mb-4 mt-6 border-t border-border pt-4">
                                            <span className="text-foreground">الإجمالي</span>
                                            <span className="text-primary font-extrabold">{totalPrice}₪</span>
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
                                <h2 className="text-2xl font-bold text-primary mb-2">
                                    {orderType === "in"
                                        ? "🍽️ طلب داخل المطعم"
                                        : "🛍️ طلب تيك أواي"}
                                </h2>

                                <div className="bg-muted p-4 rounded-xl border border-border max-h-72 overflow-auto text-left whitespace-pre-wrap text-sm text-foreground">
                                    {renderMessage(lastMessage)}
                                    <div className="mt-4 pt-3 border-t border-border font-bold flex justify-between text-lg">
                                        <span>💰 الإجمالي</span>
                                        <span className="text-primary">{totalPrice}₪</span>
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="w-full py-3 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
                                >
                                    أغلق
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {toast && (
                <div className="fixed top-6 right-6 z-50 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-2xl animate-fade-in-out">
                    {toast}
                </div>
            )}
        </>
    );
}
