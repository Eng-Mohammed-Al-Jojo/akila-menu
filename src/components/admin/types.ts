// types.ts
export type PopupType =
  | "logout"
  | "addCategory"
  | "deleteCategory"
  | "editItem"
  | "deleteItem"
  | null;

export interface PopupState {
  type: PopupType;
  id?: string;
}

export interface Category {
  id: any;
  order: number;
  name: string;
  createdAt: number;
  available: boolean;

}

export interface Item {
  id: string;           // ✅
  image?: string;       // ✅ صورة اختيارية (رابط)
  name: string;
  price: string;
  priceTw?: string;
  ingredients?: string;
  categoryId: string;
  visible: boolean;
  createdAt: number;
  star?: boolean; // ✅ جديد
}
