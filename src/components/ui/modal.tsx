import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { cn } from "../../lib/utils";

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    title?: string;
    description?: string;
}

export function Modal({ isOpen, onClose, children, className, title, description }: ModalProps) {
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className={cn(
                                "w-full max-w-lg overflow-hidden rounded-xl border bg-background p-6 shadow-lg pointer-events-auto",
                                className
                            )}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    {title && <h2 className="text-lg font-semibold">{title}</h2>}
                                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                                </div>
                                <button
                                    onClick={onClose}
                                    className="rounded-full p-2 hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
                                >
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="max-h-[80vh] overflow-y-auto pr-2">{children}</div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
