// src/components/UploadImage.tsx
import React, { useState } from "react";
import axios from "axios";

interface UploadImageProps {
    onUpload: (filename: string) => void; // ترجع اسم الصورة بعد الرفع
}

const UploadImage: React.FC<UploadImageProps> = ({ onUpload }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("الرجاء اختيار صورة أولاً");
            return;
        }

        const formData = new FormData();
        formData.append("image", file);

        try {
            setUploading(true);
            const res = await axios.post("http://localhost:5000/upload-image", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            onUpload(res.data.filename); // ترجع اسم الصورة للملف اللي يستدعيه
            setFile(null);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("فشل رفع الصورة، حاول مرة أخرى");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button
                onClick={handleUpload}
                disabled={uploading || !file}
                className="px-4 py-2 rounded-lg bg-[#940D11] text-white font-bold hover:bg-[#940D11]/80 disabled:opacity-50"
            >
                {uploading ? "جاري الرفع..." : "رفع الصورة"}
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {file && <p className="text-sm">الصورة المختارة: {file.name}</p>}
        </div>
    );
};

export default UploadImage;
