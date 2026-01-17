import { type Item } from "./Menu";

interface Props {
  item: Item;
  luxury?: boolean;
}

export default function ItemRow({ item, luxury }: Props) {
  const prices = String(item.price).split(",");
  const unavailable = item.visible === false;

  if (!luxury) return null;
// bg-linear-to-br from-[#df4a9c] via-[#E5BB07] to-[#df4a9c]
  return (
    <div
      className={`
        relative
        rounded-3xl
        p-0.5
        bg-white
        shadow-md shadow-[#B22271]
        transition-all duration-300 ease-out
        ${
          unavailable
            ? "opacity-60 pointer-events-none shadow-none"
            : "hover:shadow-lg shadow-[#B22271] hover:-translate-y-1"
        }
      `}
    >
      {/* Inner Card */}
      <div
        className={`
          rounded-[calc(1rem-2px)]
          px-5 py-4 md:px-6 md:py-5
          flex items-center justify-between gap-4
          ${unavailable ? "bg-gray-100" : "bg-white"}
        `}
      >
        {/* Name + Ingredients */}
        <div className="flex-1 min-w-0">
          <h3
            className={`
              text-lg md:text-xl font-[Cairo] font-extrabold truncate
              ${unavailable ? "line-through text-gray-400" : "text-[#B22271]"}
            `}
          >
            {item.name}
          </h3>

          {!unavailable && item.ingredients && (
            <p className="mt-1 text-xs md:text-sm font-[Cairo] text-gray-500 truncate">
              {item.ingredients}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="shrink-0 text-right">
          {unavailable ? (
            <div className="flex gap-2 text-gray-400 line-through font-semibold">
              {prices.map((p, i) => (
                <span key={i}>{p.trim()}₪</span>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {prices.map((p, i) => (
                <span
                  key={i}
                  className="text-lg font-[Cairo] font-bold text-[#B22271]"
                >
                  {p.trim()}₪
                </span>
              ))}

              {item.priceTw && item.priceTw > 0 && (
                <span
                  className="
                    px-3 py-1
                    rounded-full
                    text-xs font-[Zain-ExtraBold]
                    bg-[#B22271]/10
                    text-[#B22271]
                    border border-[#B22271]/80
                  "
                >
                  TW {item.priceTw}₪
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
