import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { ref, get } from "firebase/database";
import { db } from "../../firebase";

interface Props {
    show: boolean;
    onClose: () => void;
}

interface Item {
    id: string;
    name: string;
    description?: string;
    price: string;
    image?: string; // اسم الصورة
    star?: boolean;    // ⭐ نجمة
    visible?: boolean;
}

export default function FeaturedModal({ show, onClose }: Props) {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!show) return;

        const fetchStarItems = async () => {
            try {
                const snap = await get(ref(db, "items"));
                if (snap.exists()) {
                    const data = snap.val();

                    // ✅ Filter items with star = true and visible
                    const starItems = Object.entries(data)
                        .map(([id, item]: any) => ({ id, ...item }))
                        .filter(item => item.star === true && item.visible !== false);

                    setItems(starItems);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStarItems();
    }, [show]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-999 flex items-center justify-center">
            {/* Overlay */}
            <div
                onClick={onClose}
                className="absolute inset-0 bg-white/80 backdrop-blur-md"
            />

            {/* Modal */}
            <div className="relative w-[90%] max-w-2xl bg-white/80 rounded-3xl px-6 py-8 shadow-inner shadow-[#B22271]">
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 text-[#B22271]"
                >
                    <FaTimes size={22} />
                </button>

                <h2 className="text-center text-3xl font-extrabold mb-6 text-[#B22271]">
                    ⭐ الأصناف الأكثر طلباً
                </h2>

                {loading ? (
                    <div className="text-center py-20 text-gray-400">
                        جاري التحميل...
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        لا يوجد أصناف مميزة حالياً
                    </div>
                ) : (
                    <div
                        className="
                            flex
                            overflow-x-auto
                            snap-x snap-mandatory
                            scroll-smooth
                            scrollbar-hide
                        "
                    >
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="w-full shrink-0 snap-center px-2"
                            >
                                <div className="bg-white/80 rounded-3xl overflow-hidden shadow-xl">
                                    {/* Image */}
                                    <div className="flex justify-center mt-4">
                                        <div className="
                                            w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64
                                            rounded-full
                                            overflow-hidden
                                            bg-black
                                            shrink-0
                                            shadow-[0_10px_40px_rgba(178,34,113,0.4)]
                                            flex items-center justify-center
                                        ">
                                            <img
                                                src={item.image ? `/images/${item.image}` : `/logo_akila.png`}
                                                alt={item.name}
                                                className="w-full h-full object-cover bg-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 text-center">
                                        <h3 className="text-2xl font-bold mb-2">
                                            {item.name}
                                        </h3>

                                        {item.description && (
                                            <p className="text-base text-gray-300 mb-4">
                                                {item.description}
                                            </p>
                                        )}

                                        <div className="text-2xl font-extrabold text-[#B22271]">
                                            {item.price}₪
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-center text-sm text-gray-400 mt-4">
                    اسحب يمين أو يسار للتنقل
                </p>
            </div>
        </div>
    );
}
