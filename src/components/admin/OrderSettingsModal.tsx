import { useState, useEffect } from "react";
import { ref, update } from "firebase/database";
import { db } from "../../firebase";

/* ================= Toast ================= */
function Toast({ type, message }: { type: "success" | "error"; message: string }) {
    return (
        <div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50
      px-6 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold
      ${type === "success" ? "bg-green-600" : "bg-red-600"}`}
        >
            {message}
        </div>
    );
}

/* ================= Reusable ================= */
const sectionClass = "bg-black/40 rounded-2xl px-4 py-3 space-y-2";
const inputClass =
    "w-full bg-black/60 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-gray-400 focus:ring-1 focus:ring-yellow-500";

/* ================= Service Checkbox ================= */
function ServiceCheckbox({
    title,
    enabled,
    onToggle,
    value,
    setValue,
    disabled,
}: any) {
    return (
        <div className={sectionClass}>
            <label className="flex items-center gap-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={enabled}
                    onChange={onToggle}
                    disabled={disabled}
                    className="accent-green-500 w-5 h-5"
                />
                <span className="font-semibold text-sm">{title}</span>
            </label>

            {enabled && (
                <input
                    type="tel"
                    value={value}
                    onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
                    placeholder="رقم واتساب بدون +"
                    className={inputClass}
                />
            )}
        </div>
    );
}

/* ================= Modal ================= */
export default function OrderSettingsModal({
    setShowOrderSettings,
    orderSettings: initialSettings,
    onSave,
}: {
    setShowOrderSettings: (v: boolean) => void;
    orderSettings: any;
    onSave: (newSettings: any) => void;
}) {
    const [orderSystem, setOrderSystem] = useState(true);
    const [inRestaurant, setInRestaurant] = useState(false);
    const [takeaway, setTakeaway] = useState(false);
    const [inPhone, setInPhone] = useState("");
    const [outPhone, setOutPhone] = useState("");
    const [complaintsWhatsapp, setComplaintsWhatsapp] = useState("");
    const [footer, setFooter] = useState({
        address: "",
        phone: "",
        whatsapp: "",
        facebook: "",
        instagram: "",
        tiktok: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<any>(null);

    /* ===== Initialize state from Admin props ===== */
    useEffect(() => {
        if (!initialSettings) return;

        setOrderSystem(initialSettings.orderSystem ?? true);

        const s = initialSettings.orderSettings ?? {};
        setInRestaurant(!!s.inRestaurant);
        setTakeaway(!!s.takeaway);
        setInPhone(s.inPhone || "");
        setOutPhone(s.outPhone || "");

        setComplaintsWhatsapp(initialSettings.complaintsWhatsapp || "");
        setFooter(initialSettings.footerInfo || {});
        setLoading(false);
    }, [initialSettings]);

    if (loading) return null;

    /* ===== Save with Validation ===== */
    const handleSave = async () => {
        if ((inRestaurant && inPhone.trim() === "") || (takeaway && outPhone.trim() === "")) {
            setToast({ type: "error", message: "❌ الرجاء إدخال رقم واتساب لكل خدمة مفعّلة" });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        const newSettings = {
            orderSystem,
            orderSettings: { inRestaurant, takeaway, inPhone, outPhone },
            complaintsWhatsapp,
            footerInfo: footer,
        };

        try {
            setSaving(true);
            await update(ref(db, "settings"), newSettings);

            // 🔹 تحديث الـ state في Admin مباشرة
            onSave?.(newSettings);

            setToast({ type: "success", message: "💾 تم حفظ الإعدادات بنجاح" });
            setShowOrderSettings(false);
        } catch {
            setToast({ type: "error", message: "❌ فشل الحفظ" });
        } finally {
            setSaving(false);
            setTimeout(() => setToast(null), 2000);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-3">
            <div className="bg-[#231F20] w-full max-w-md max-h-[90vh] rounded-3xl text-[#F7F3E8] shadow-2xl flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <h2 className="text-lg font-bold">⚙️ إعدادات النظام</h2>
                    <button onClick={() => setShowOrderSettings(false)} className="hover:text-red-400">
                        ✖
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                    <div className="bg-black/40 rounded-2xl px-4 py-3 flex justify-between items-center">
                        <span className="font-semibold text-sm">تفعيل نظام الطلب</span>
                        <button
                            onClick={() => setOrderSystem((p) => !p)}
                            className={`w-12 h-6 rounded-full relative ${orderSystem ? "bg-green-500" : "bg-gray-600"}`}
                        >
                            <span
                                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${orderSystem ? "right-1" : "right-6"}`}
                            />
                        </button>
                    </div>

                    <ServiceCheckbox
                        title="🍽️ الطلب داخل المطعم"
                        enabled={inRestaurant}
                        onToggle={() => setInRestaurant((p) => !p)}
                        value={inPhone}
                        setValue={setInPhone}
                        disabled={!orderSystem}
                    />

                    <ServiceCheckbox
                        title="🛍️ تيك أواي / دليفري"
                        enabled={takeaway}
                        onToggle={() => setTakeaway((p) => !p)}
                        value={outPhone}
                        setValue={setOutPhone}
                        disabled={!orderSystem}
                    />

                    {/* Complaints */}
                    <div className="bg-linear-to-br from-red-600/30 to-black/40 rounded-2xl px-4 py-3 space-y-2">
                        <p className="font-bold text-sm">🚨 واتساب الشكاوى والاراء</p>
                        <input
                            value={complaintsWhatsapp}
                            onChange={(e) => setComplaintsWhatsapp(e.target.value.replace(/\D/g, ""))}
                            placeholder="059xxxxxxx"
                            className={inputClass}
                        />
                    </div>

                    {/* Footer Info */}
                    <div className={sectionClass}>
                        <p className="font-bold text-sm flex items-center gap-2">📍 معلومات الفوتر</p>
                        <input
                            placeholder="📍 العنوان"
                            value={footer.address}
                            onChange={(e) => setFooter({ ...footer, address: e.target.value })}
                            className={inputClass}
                        />
                        <input
                            placeholder="📞 الهاتف"
                            value={footer.phone}
                            onChange={(e) => setFooter({ ...footer, phone: e.target.value })}
                            className={inputClass}
                        />
                        <input
                            placeholder="💬 واتساب"
                            value={footer.whatsapp}
                            onChange={(e) => setFooter({ ...footer, whatsapp: e.target.value })}
                            className={inputClass}
                        />
                        <input
                            placeholder="Facebook"
                            value={footer.facebook}
                            onChange={(e) => setFooter({ ...footer, facebook: e.target.value })}
                            className={inputClass}
                        />
                        <input
                            placeholder="Instagram"
                            value={footer.instagram}
                            onChange={(e) => setFooter({ ...footer, instagram: e.target.value })}
                            className={inputClass}
                        />
                        <input
                            placeholder="TikTok"
                            value={footer.tiktok}
                            onChange={(e) => setFooter({ ...footer, tiktok: e.target.value })}
                            className={inputClass}
                        />
                    </div>
                </div>

                {/* Save */}
                <div className="px-5 py-4 border-t border-white/10">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-4 rounded-2xl bg-linear-to-r from-green-600 to-green-500 font-bold text-sm hover:opacity-90"
                    >
                        {saving ? "جاري الحفظ..." : "💾 حفظ الإعدادات"}
                    </button>
                </div>
            </div>

            {toast && <Toast type={toast.type} message={toast.message} />}
        </div>
    );
}
