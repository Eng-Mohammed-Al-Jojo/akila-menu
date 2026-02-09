import React, { useState, useRef, useEffect } from "react";

interface Props {
    options: { id: string; name: string }[];
    value: string;
    onChange: (val: string) => void;
    error?: boolean;
    placeholder?: string;
}

const CustomSelect: React.FC<Props> = ({ options, value, onChange, error, placeholder }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // لإغلاق القائمة إذا ضغطت برا
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.id === value);

    return (
        <div className="relative w-full" ref={ref} dir="rtl">
            {/* الزر الأساسي */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`
      w-full flex flex-row justify-between items-center px-3 py-2 border 
      ${error ? "border-red-500" : "border-gray-300"} 
      rounded-md focus:outline-none focus:ring-2 focus:ring-[#B22271] 
      bg-white 
      transition-all duration-200
    `}
            >
                <span>{selectedOption ? selectedOption.name : placeholder || "اختر"}</span>
                <span className={`transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
            </button>

            {/* القائمة مع حركة */}
            <div
                className={`
      absolute z-50 w-full right-0 mt-1 max-h-60 overflow-auto border border-gray-300 rounded-md bg-white shadow-lg
      transform origin-top transition-all duration-200
      ${open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
    `}
            >
                {options.map(o => (
                    <button
                        key={o.id}
                        type="button"
                        onClick={() => { onChange(o.id); setOpen(false); }}
                        className={`w-full text-right px-3 py-2 hover:bg-[#B22271]/20 transition ${value === o.id ? "bg-[#B22271]/30 font-bold" : ""}`}
                    >
                        {o.name}
                    </button>
                ))}
            </div>
        </div>

    );
};

export default CustomSelect;
