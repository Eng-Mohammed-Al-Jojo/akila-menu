import React from "react";

interface Props {
    visible: boolean;
    onClose: () => void;
    onSelect: (img: string) => void;
    galleryImages: string[];
    selectedImage?: string;
}

const FeaturedGallery: React.FC<Props> = ({ visible, onClose, onSelect, galleryImages, selectedImage }) => {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md sm:max-w-lg md:max-w-xl p-6">
                <h3 className="font-bold mb-4 text-center text-lg md:text-xl">اختر للصنف</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {galleryImages.map((img) => (
                        <button
                            key={img}
                            type="button"
                            onClick={() => onSelect(img)}
                            className={`relative rounded-lg overflow-hidden border-2 transition
            ${selectedImage === img ? "border-[#B22271]" : "border-transparent hover:border-gray-300"}`}
                        >
                            <img
                                src={`/images/${img}`}
                                alt={img}
                                className="w-full h-20 object-contain bg-black"
                            />
                            {selectedImage === img && (
                                <div className="absolute inset-0 bg-[#B22271]/20 flex items-center justify-center font-bold">
                                    ✓
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="mt-4 w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                    إلغاء
                </button>
            </div>
        </div>

    );
};

export default FeaturedGallery;
