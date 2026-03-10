import { motion } from "framer-motion";
import ItemRow from "./ItemRow";
import type { Category, Item } from "./Menu";

interface Props {
  category: Category;
  items: Item[];
  orderSystem: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export default function CategorySection({ category, items, orderSystem }: Props) {
  return (
    <section className="w-full h-full min-h-full px-4 md:px-0 py-8 flex flex-col">
      {/* Category Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8 flex items-center justify-center gap-4 w-full shrink-0"
      >
        <span className="flex-1 h-[2px] bg-linear-to-r from-transparent via-[#B22271]/50 to-[#B22271] rounded-full"></span>
        <h2 className="font-[Almarai] font-extrabold text-[#B22271] drop-shadow-sm tracking-wide text-center text-3xl md:text-5xl">
          {category.name}
        </h2>
        <span className="flex-1 h-[2px] bg-linear-to-r from-[#B22271] via-[#B22271]/50 to-transparent rounded-full"></span>
      </motion.div>

      {/* Items Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 flex-1"
      >
        {items.map((item) => (
          <motion.div key={item.id} variants={itemVariants} className="w-full h-full">
            <ItemRow item={item} orderSystem={orderSystem} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
