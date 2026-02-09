import React, { useState } from "react";
import { FiPlus, FiTrash2, FiEdit, FiCheck } from "react-icons/fi";
import { db } from "../../firebase";
import { ref, update } from "firebase/database";

import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import type { PopupState, Category } from "./types";
import { HiChevronDown, HiOutlineArrowsUpDown } from "react-icons/hi2";

interface Props {
  categories: Record<string, Category>;
  setPopup: (popup: PopupState) => void;
  newCategoryName: string;
  setNewCategoryName: React.Dispatch<React.SetStateAction<string>>;
}

/* =======================
   العنصر القابل للسحب
======================= */
const SortableCategory: React.FC<{
  cat: Category & { id: string };
  editingId: string | null;
  tempName: string;
  setTempName: React.Dispatch<React.SetStateAction<string>>;
  saveEdit: (id: string) => void;
  startEditing: (id: string, name: string) => void;
  toggleAvailability: (id: string, current: boolean) => void;
  setPopup: (popup: PopupState) => void;
}> = ({
  cat,
  editingId,
  tempName,
  setTempName,
  saveEdit,
  startEditing,
  toggleAvailability,
  setPopup,
}) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: cat.id });

    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      touchAction: "none",
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className="
        relative
        bg-white
        rounded-2xl
        shadow-sm
        flex
        overflow-hidden
      "
      >
        {/* Drag Rail */}
        <div
          {...listeners}
          className="
          cursor-grab select-none
          bg-linear-to-b from-gray-300 to-gray-200
          w-12 sm:w-10
          flex items-center justify-center
          active:scale-95
          transition
        "
        >
          <HiOutlineArrowsUpDown className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
        </div>

        {/* المحتوى */}
        <div className="flex-1 p-2 flex flex-col gap-2">
          {editingId === cat.id ? (
            <div className="flex items-center gap-2">
              <input
                className="flex-1 p-2 border rounded-xl"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
              />
              <button
                onClick={() => saveEdit(cat.id)}
                className="text-green-600 p-2"
              >
                <FiCheck />
              </button>
            </div>
          ) : (
            <span className="text-lg font-bold text-gray-800">
              {cat.name}
            </span>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => startEditing(cat.id, cat.name)}
                className="text-blue-600 p-2 rounded-xl hover:bg-blue-50 transition"
              >
                <FiEdit />
              </button>

              <button
                onClick={() => setPopup({ type: "deleteCategory", id: cat.id })}
                className="text-red-600 p-2 rounded-xl hover:bg-red-50 transition"
              >
                <FiTrash2 />
              </button>
            </div>

            <button
              onClick={() => toggleAvailability(cat.id, cat.available ?? true)}
              className={`relative w-14 h-7 rounded-full transition-colors
              ${cat.available ? "bg-green-500" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all
                ${cat.available ? "translate-x-7 scale-110" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>
    );
  };

/* =======================
   CategorySection
======================= */
const CategorySection: React.FC<Props> = ({
  categories,
  setPopup,
  newCategoryName,
  setNewCategoryName,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [openCategories, setOpenCategories] = useState(false);

  const startEditing = (id: string, name: string) => {
    setEditingId(id);
    setTempName(name);
  };

  const saveEdit = async (id: string) => {
    if (!tempName.trim()) return;
    await update(ref(db, `categories/${id}`), { name: tempName.trim() });
    setEditingId(null);
    setTempName("");
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await update(ref(db, `categories/${id}`), {
      available: !current,
    });
  };

  const categoriesArray = Object.entries(categories)
    .map(([id, cat]) => ({ ...cat, id }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categoriesArray.findIndex((c) => c.id === active.id);
    const newIndex = categoriesArray.findIndex((c) => c.id === over.id);

    const newArray = arrayMove(categoriesArray, oldIndex, newIndex);

    const updates: Record<string, any> = {};
    newArray.forEach((cat, index) => {
      updates[`categories/${cat.id}/order`] = index;
    });

    await update(ref(db), updates);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={categoriesArray.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          className="bg-white p-4 rounded-3xl mb-6 border-4"
          style={{ borderColor: "#B22271" }}
        >
          <h2 className="font-bold mb-3 text-2xl">الأقسام</h2>



          {/* إضافة قسم */}
          <div className="flex gap-2 flex-wrap mb-4">
            <input
              className="flex-1 p-2 border rounded-xl min-w-[160px]"
              placeholder="اسم القسم"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <button
              onClick={() => setPopup({ type: "addCategory" })}
              className="px-4 rounded-xl bg-[#B22271] text-white hover:bg-[#B22271]/80"
            >
              <FiPlus className="text-xl" />
            </button>
          </div>
          {/* زر عرض الأقسام */}
          <button
            onClick={() => setOpenCategories((p) => !p)}
            className="
              w-full mb-4
              flex items-center justify-between
              px-4 py-3
              bg-gray-100
              rounded-xl
              font-bold
              hover:bg-gray-200
              transition
            "
          >
            <span>عرض الأقسام</span>

            <div className="flex items-center gap-2">
              <span className="bg-[#B22271] text-white text-sm px-2 py-0.5 rounded-full">
                {categoriesArray.length}
              </span>

              <HiChevronDown
                className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${openCategories ? "rotate-180" : "rotate-0"
                  }`}
              />
            </div>
          </button>

          {/* Accordion Animation */}
          <div
            className={`
              overflow-hidden
              transition-all duration-500 ease-in-out
              ${openCategories
                ? "max-h-[3000px] opacity-100 scale-100"
                : "max-h-0 opacity-0 scale-[0.98]"}
            `}
          >
            <div className="flex flex-col gap-2 pt-2">
              {categoriesArray.map((cat) => (
                <SortableCategory
                  key={cat.id}
                  cat={cat}
                  editingId={editingId}
                  tempName={tempName}
                  setTempName={setTempName}
                  saveEdit={saveEdit}
                  startEditing={startEditing}
                  toggleAvailability={toggleAvailability}
                  setPopup={setPopup}
                />
              ))}
            </div>
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default CategorySection;
