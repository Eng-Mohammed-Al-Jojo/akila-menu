import ItemRow from "./ItemRow";
import type { Category, Item } from "./Menu";

interface Props {
  category: Category;
  items: Item[];
}

export default function CategorySection({ category, items }: Props) {
  return (
    <section className="mb-16 px-4 md:px-0">
      {/* عنوان القسم على اليسار */}
      <div className="mb-8 md:mb-10 flex items-center justify-start gap-4">
        <h2
          className="
            text-[clamp(1.2rem,5vw,2.2rem)]
            font-[BalooBhaijaan2-Bold] font-extra-bold
            text-[#B22271]
            uppercase tracking-widest
            drop-shadow-sm
            text-left
          "
        >
          {category.name}
        </h2>

        <span className="flex-1 h-1 bg-[#D3AC69]/60 rounded-full min-w-5" />
      </div>

      {/* قائمة الأصناف */}
      <div className="flex flex-col gap-4 md:gap-5">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} luxury />
        ))}
      </div>
    </section>
  );
}
