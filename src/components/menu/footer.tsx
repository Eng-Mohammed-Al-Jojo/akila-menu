import {
  FaLaptopCode,
  FaMapMarkerAlt,
  FaInstagram,
  FaWhatsapp,
  FaFacebookF,
  FaTiktok,
  FaPhoneAlt,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="mt-16 bg-[#9E1E64] text-white rounded-t-3xl">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-8 text-sm">

        {/* Info */}
        <div className="space-y-3 text-center md:text-right">

          {/* Location */}
          <div
            className="
              flex items-center gap-2
              justify-center md:justify-end
              text-md md:text-lg
              font-[Cairo]
            "
          >
            <FaMapMarkerAlt className="text-[#E6C989]" />
            غزة - شارع الثورة - بجانب تاج مول
          </div>

          {/* Contact Numbers */}
          <div className="flex flex-col gap-1 items-center md:items-end">
            <a
              href="tel:+970592270295"
              className="flex items-center gap-2 font-[Cairo] text-md md:text-lg"
            >
              <FaPhoneAlt className="text-[#E6C989]" />
              0592270295
            </a>

            <a
              href="tel:+970592133357"
              className="flex items-center gap-2 font-[Cairo] text-md md:text-lg"
            >
              <FaPhoneAlt className="text-[#E6C989]" />
              0592554701
            </a>
          </div>
        </div>

        {/* Social */}
        <div className="flex gap-4">
          {[
            { href: "https://wa.me/+972592270295", icon: <FaWhatsapp /> },
            { href: "https://www.instagram.com/akila_coffee?igsh=ZzV4Z285MGV6Zzg1", icon: <FaInstagram /> },
            { href: "https://www.facebook.com/share/1GXQRH6J2u/?mibextid=wwXIfr", icon: <FaFacebookF /> },
            { href: "https://www.tiktok.com/@akilacoffe?_r=1&_t=ZS-937nI15QJYg", icon: <FaTiktok /> },
          ].map((item, i) => (
            <a
              key={i}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="
                group
                p-0.5
                rounded-full
                bg-linear-to-br from-[#E6C989] via-[#CD2777] to-[#E6C989]
                transition-all duration-300
                hover:scale-105
              "
            >
              <span
                className="
                  flex items-center justify-center
                  w-9 h-9 md:w-10 md:h-10
                  rounded-full
                  bg-[#FAF8F4]
                  text-[#B68A3A]
                  text-base md:text-lg
                  transition-all duration-300
                  group-hover:bg-white
                  group-hover:shadow-[0_4px_14px_rgba(0,0,0,0.15)]
                "
              >
                {item.icon}
              </span>
            </a>
          ))}
        </div>

        {/* Signature */}
        <div className="flex items-center gap-2 opacity-80">
          <a
            href="https://engmohammedaljojo.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <FaLaptopCode className="text-[#E6C989] text-xl md:text-2xl" />
            <span className="font-[Cairo] font-semibold tracking-wide text-sm md:text-md text-white">
              Eng. Mohammed Eljoujo
            </span>
          </a>
        </div>

      </div>
    </footer>
  );
}
