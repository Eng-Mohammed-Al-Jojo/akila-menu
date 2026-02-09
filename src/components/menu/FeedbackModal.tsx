import { useState, useEffect } from "react";
import { FaTimes, FaStar } from "react-icons/fa";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase";

interface Props {
    show: boolean;
    onClose: () => void;
}

const LOCAL_STORAGE_KEY = "feedbackSettings";

export default function FeedbackModal({ show, onClose }: Props) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [toast, setToast] = useState<string | null>(null);

    const [feedbackPhone, setFeedbackPhone] = useState(""); // رقم واتساب الشكاوى والآراء

    // ===== جلب البيانات من localStorage أو Firebase =====
    useEffect(() => {
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) {
            const data = JSON.parse(localData);
            if (data.feedbackPhone) setFeedbackPhone(data.feedbackPhone);
        }

        const feedbackRef = ref(db, "settings/complaintsWhatsapp");
        const unsubscribe = onValue(feedbackRef, (snapshot) => {
            if (snapshot.exists()) {
                const phone = snapshot.val();
                setFeedbackPhone(phone);
                localStorage.setItem(
                    LOCAL_STORAGE_KEY,
                    JSON.stringify({ feedbackPhone: phone })
                );
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!show) {
            setName("");
            setPhone("");
            setMessage("");
            setRating(0);
            setHoverRating(0);
        }
    }, [show]);

    const handleSend = () => {
        if (!message.trim()) {
            setToast("الرجاء كتابة الملاحظة ⚠️");
            setTimeout(() => setToast(null), 3000);
            return;
        }

        if (!feedbackPhone) {
            setToast("⚠️ رقم الشكاوى غير متوفر حالياً");
            setTimeout(() => setToast(null), 3000);
            return;
        }

        const fullMessage = `⭐ تقييم زبون ⭐
            ------------------
            🔹 الاسم: ${name || "-"}
            🔹 الجوال: ${phone || "-"}
            🔹 التقييم: ${rating}/5
            🔹 الملاحظة: ${message || "-"}`;


        const url =
            "https://wa.me/" + feedbackPhone + "?text=" + encodeURIComponent(fullMessage);
        window.open(url, "_blank");

        setToast("تم إرسال الملاحظة بنجاح ✅");
        setTimeout(() => setToast(null), 3000);
        onClose();
    };

    if (!show) return null;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
                <div className="bg-white text-black rounded-3xl w-full max-w-md p-6 relative shadow-lg max-h-[90vh] overflow-y-auto">
                    {/* Close Button */}
                    <button onClick={onClose} className="absolute top-4 left-4 text-xl">
                        <FaTimes />
                    </button>

                    <h2 className="text-2xl font-extrabold text-center mb-2 text-[#B22271]">
                        الآراء و الشكاوى
                    </h2>
                    <p className="text-sm text-black/60 text-center">
                        نهتم بأرائكم ونعمل على إسعادكم ✨
                    </p>

                    <div className="flex flex-col gap-4 mt-4">
                        <input
                            type="text"
                            placeholder="الاسم (اختياري)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl bg-white text-black border-2 border-[#B22271]"
                        />
                        <input
                            type="tel"
                            placeholder="رقم الجوال (اختياري)"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl bg-white text-black border-2 border-[#B22271] text-right"
                        />

                        {/* تقييم النجوم */}
                        <div className="flex justify-center mt-2 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <div
                                    key={star}
                                    className="relative cursor-pointer"
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                >
                                    <FaStar className="text-[#444] w-8 h-8" />
                                    <FaStar
                                        className={`absolute top-0 left-0 w-8 h-8 transition-transform duration-200 
                                                 ${star <= (hoverRating || rating)
                                                ? "text-yellow-400 scale-125 drop-shadow-lg"
                                                : "text-transparent"
                                            } hover:scale-120 hover:text-yellow-300`}
                                    />
                                </div>
                            ))}
                        </div>

                        <textarea
                            placeholder="الملاحظة *"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl bg-white text-black border-2 border-[#B22271] resize-none"
                            rows={5}
                        />
                        <button
                            onClick={handleSend}
                            className="w-full py-3 rounded-2xl bg-[#B22271] text-white font-bold hover:scale-105 transition"
                        >
                            إرسال عبر واتساب 📩
                        </button>
                    </div>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed top-6 right-6 z-50 bg-[#B22271] text-[#040309] px-6 py-3 rounded-2xl font-bold shadow-2xl animate-pulse">
                    {toast}
                </div>
            )}
        </>
    );
}
