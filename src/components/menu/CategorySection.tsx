import ItemRow from "./ItemRow";
import type { Category, Item } from "./Menu";

interface Props {
  category: Category;
  items: Item[];
  orderSystem: boolean;
}

export default function CategorySection({ category, items, orderSystem }: Props) {
  return (
    <section className="w-full h-full min-h-full px-4 md:px-0 py-6 flex flex-col">
      {/* عنوان القسم */}
      <div className="mb-8 flex items-center justify-center gap-4 w-full shrink-0">
        <span className="flex-1 h-px bg-linear-to-r from-transparent via-[#B22271]/70 to-transparent"></span>

        <h2
          className="font-[Almarai] font-extrabold 
          text-[#B22271] drop-shadow-[0_4px_20px_rgba(253,177,67,0.45)]
          tracking-wide text-center text-3xl md:text-6xl"
        >
          {category.name}
        </h2>

        <span className="flex-1 h-px bg-linear-to-r from-transparent via-[#B22271]/70 to-transparent"></span>
      </div>

      {/* الأصناف */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 flex-1">
        {items.map((item) => (
          <div key={item.id} className="w-full">
            <ItemRow item={item} orderSystem={orderSystem} />
          </div>
        ))}
      </div>
    </section>
  );
}
