import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { ref, get } from "firebase/database";
import { db } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    show: boolean;
    onClose: () => void;
}

interface Item {
    id: string;
    name: string;
    description?: string;
    price: string;
    image?: string;
    star?: boolean;
    visible?: boolean;
}

export default function FeaturedModal({ show, onClose }: Props) {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!show) return;

        const fetchStarItems = async () => {
            setLoading(true);
            try {
                const snap = await get(ref(db, "items"));
                if (snap.exists()) {
                    const data = snap.val();

                    const starItems = Object.entries(data)
                        .map(([id, item]: any) => ({ id, ...item }))
                        .filter((item) => item.star === true && item.visible !== false);

                    setItems(starItems);
                } else {
                    setItems([]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStarItems();
    }, [show]);

    useEffect(() => {
        if (show) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [show]);

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">

                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/60 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative z-10 w-full max-w-3xl bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-2xl"
                    >

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 z-20 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted cursor-pointer"
                        >
                            <FaTimes size={20} />
                        </button>

                        {/* Title */}
                        <h2 className="text-center text-2xl md:text-3xl font-extrabold mb-8 text-[#B22271] drop-shadow-sm font-[Almarai]">
                            ⭐ الأصناف المميزة
                        </h2>

                        {/* Loading */}
                        {loading ? (
                            <div className="text-center py-20 text-muted-foreground font-[Almarai] animate-pulse">
                                جاري التحميل...
                            </div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-20 text-muted-foreground font-[Almarai]">
                                لا يوجد أصناف مميزة حالياً
                            </div>
                        ) : (
                            <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden py-4 gap-4 px-2 -mx-2">

                                {items.map((item) => (
                                    <motion.div
                                        whileHover={{ y: -5 }}
                                        key={item.id}
                                        className="w-[85%] sm:w-[60%] shrink-0 snap-center"
                                    >
                                        <div className="bg-card rounded-3xl overflow-hidden shadow-sm border border-border/60 h-full flex flex-col transition-all duration-300 hover:shadow-lg">

                                            {/* Image */}
                                            <div className="flex justify-center mt-6">
                                                <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden shadow-lg ring-4 ring-background bg-muted/30">

                                                    <img
                                                        src={
                                                            item.image
                                                                ? `/images/${item.image}`
                                                                : `/logo_akila.png`
                                                        }
                                                        alt={item.name}
                                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                                        onError={(e) => {
                                                            e.currentTarget.src = "/logo_akila.png";
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-6 text-center flex-1 flex flex-col font-[Almarai]">

                                                <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground tracking-tight">
                                                    {item.name}
                                                </h3>

                                                {item.description && (
                                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed flex-1">
                                                        {item.description}
                                                    </p>
                                                )}

                                                <div className="text-2xl font-extrabold text-[#b3aa07] mt-auto pt-4 border-t border-border/40">
                                                    {item.price} ₪
                                                </div>

                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                            </div>
                        )}

                        {!loading && items.length > 0 && (
                            <p className="text-center text-xs text-muted-foreground mt-8 font-[Almarai] opacity-70">
                                اسحب يمين أو يسار للتنقل
                            </p>
                        )}

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}