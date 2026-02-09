import { useState, useEffect } from "react";
import type { RefObject } from "react";
import { FaUtensils, FaMotorcycle } from "react-icons/fa";
import { useCart } from "../../context/CartContext";

interface OrderTabsProps {
    onConfirm: (msg: string, type: "in" | "out") => void;
    firstInputRef?: RefObject<HTMLInputElement | null>;
    disableSend?: boolean;
    orderSettings?: {
        inRestaurant: boolean;
        takeaway: boolean;
        inPhone: string;
        outPhone: string;
    };
}

export default function OrderTabs({
    onConfirm,
    firstInputRef,
    disableSend,
    orderSettings,
}: OrderTabsProps) {
    const { items, totalPrice } = useCart();

    /* ================= Tabs ================= */

    const [tab, setTab] = useState<"in" | "out">(() => {
        if (orderSettings?.inRestaurant) return "in";
        if (orderSettings?.takeaway) return "out";
        return "in";
    });

    useEffect(() => {
        if (!orderSettings) return;

        if (tab === "in" && !orderSettings.inRestaurant && orderSettings.takeaway) {
            setTab("out");
        }
        if (tab === "out" && !orderSettings.takeaway && orderSettings.inRestaurant) {
            setTab("in");
        }
    }, [orderSettings, tab]);

    /* ================= Form ================= */

    const [form, setForm] = useState({
        name: "",
        table: "",
        phone: "",
        address: "",
        notes: "",
    });

    const [error, setError] = useState<string | null>(null);

    const isCurrentTabActive = () => {
        if (tab === "in") return orderSettings?.inRestaurant;
        if (tab === "out") return orderSettings?.takeaway;
        return false;
    };

    /* ================= Validation ================= */

    const validateForm = () => {
        if (!isCurrentTabActive()) {
            setError("الخدمة غير متاحة حالياً");
            return false;
        }

        if (!form.name.trim()) {
            setError("اسم الزبون مطلوب");
            return false;
        }

        if (tab === "in") {
            if (!form.table.trim()) {
                setError("رقم الطاولة مطلوب");
                return false;
            }
            if (isNaN(Number(form.table))) {
                setError("رقم الطاولة يجب أن يكون رقماً");
                return false;
            }
        }

        if (tab === "out") {
            if (!form.phone.trim()) {
                setError("رقم الجوال مطلوب");
                return false;
            }
            if (!/^\d{6,15}$/.test(form.phone)) {
                setError("رقم الجوال غير صحيح");
                return false;
            }
            if (!form.address.trim()) {
                setError("العنوان مطلوب");
                return false;
            }
        }

        if (items.length === 0) {
            setError("السلة فارغة");
            return false;
        }

        setError(null);
        return true;
    };

    /* ================= Message ================= */

    const buildMessage = () => {
        const now = new Date();
        const dateStr = now.toLocaleDateString("ar-EG");
        const timeStr = now.toLocaleTimeString("ar-EG", {
            hour: "2-digit",
            minute: "2-digit",
        });

        const list = items
            .map(
                i =>
                    `🔹 ${i.qty} × ${i.name} → ${i.selectedPrice * i.qty}₪`
            )
            .join("\n");

        if (tab === "in") {
            return `✨ *طلب داخل المطعم* ✨
========================
${list}
========================
💰 *الإجمالي:* ${totalPrice}₪
========================

👤 *الاسم:* ${form.name}
🍽️ *رقم الطاولة:* ${form.table}
📝 *ملاحظات:* ${form.notes || "—"}

⏰ *وقت الطلب:* ${timeStr}
📅 *تاريخ الطلب:* ${dateStr}

💵 الدفع عند الكاشير
========================`;
        }

        return `✨ *طلب تيك أواي* ✨
========================
${list}
========================

💰 *الإجمالي:* ${totalPrice}₪
👤 *الاسم:* ${form.name}
📱 *الجوال:* ${form.phone}
🏠 *العنوان:* ${form.address}
📝 *ملاحظات:* ${form.notes || "—"}

⏰ *وقت الطلب:* ${timeStr}
📅 *تاريخ الطلب:* ${dateStr}

💵 الدفع عند الاستلام
========================`;
    };

    const submit = () => {
        if (!validateForm()) return;
        const msg = buildMessage();
        onConfirm(msg, tab);
    };

    /* ================= UI ================= */

    return (
        <div className="mt-6 space-y-4">
            {/* Tabs */}
            <div className="flex gap-3 justify-center flex-wrap">
                {/* داخل المطعم */}
                <button
                    onClick={() => orderSettings?.inRestaurant && setTab("in")}
                    disabled={!orderSettings?.inRestaurant}
                    className={`
                        flex-1 sm:flex-auto flex items-center justify-center gap-2
                        py-3 px-4 rounded-2xl font-extrabold text-sm sm:text-base transition-all
                        duration-300 transform
                        ${tab === "in"
                            ? "bg-linear-to-r from-[#B22271] to-[#B22271] text-white shadow-lg scale-105"
                            : "bg-[#B22271]/20 text-[#B22271] hover:bg-[#B22271]/20 hover:scale-105"}
                        ${!orderSettings?.inRestaurant ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                >
                    <FaUtensils className="text-lg sm:text-xl" />
                    داخل المطعم
                </button>

                {/* تيك أواي */}
                <button
                    onClick={() => orderSettings?.takeaway && setTab("out")}
                    disabled={!orderSettings?.takeaway}
                    className={`
                            flex-1 sm:flex-auto flex items-center justify-center gap-2
                            py-3 px-4 rounded-2xl font-extrabold text-sm sm:text-base transition-all
                            duration-300 transform
                            ${tab === "out"
                            ? "bg-linear-to-r from-[#B22271] to-[#B22271] text-white shadow-lg scale-105"
                            : "bg-[#B22271]/20 text-[#B22271] hover:bg-[#B22271]/20 hover:scale-105"}
                            ${!orderSettings?.takeaway ? "opacity-50 cursor-not-allowed" : ""}
                            `}
                >
                    <FaMotorcycle className="text-lg sm:text-xl" />
                    تيك أواي
                </button>
            </div>


            {/* Error */}
            {error && (
                <div className="text-sm text-red-400 bg-red-900/20 p-2 rounded-xl text-center">
                    {error}
                </div>
            )}

            {/* Inputs */}
            <div className="space-y-2">
                <input
                    ref={firstInputRef}
                    placeholder="اسم الزبون"
                    className="w-full p-2 rounded-xl bg-white/30 text-[#B22271] font-bold"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                />

                {tab === "in" && (
                    <input
                        placeholder="رقم الطاولة"
                        className="w-full p-2 rounded-xl bg-white/30 text-[#B22271] font-bold"
                        value={form.table}
                        onChange={e => setForm({ ...form, table: e.target.value })}
                    />
                )}

                {tab === "out" && (
                    <>
                        <input
                            placeholder="رقم الجوال"
                            className="w-full p-2 rounded-xl bg-white/30 text-[#B22271] font-bold"
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value })}
                        />
                        <input
                            placeholder="العنوان"
                            className="w-full p-2 rounded-xl bg-white/30 text-[#B22271] font-bold"
                            value={form.address}
                            onChange={e => setForm({ ...form, address: e.target.value })}
                        />
                    </>
                )}

                <textarea
                    placeholder="ملاحظات (اختياري)"
                    className="w-full p-2 rounded-xl bg-white/30 text-[#B22271] font-bold"
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                />
            </div>

            {/* Submit */}
            <button
                onClick={submit}
                disabled={disableSend || !isCurrentTabActive()}
                className={`w-full py-3 rounded-full bg-[#B22271] text-white font-bold hover:scale-105 transition
        ${disableSend || !isCurrentTabActive() ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                تأكيد الطلب
            </button>
        </div>
    );
}
