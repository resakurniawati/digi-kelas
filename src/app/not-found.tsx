import Link from "next/link";

export default function NotFound() {
  return (
    <>
      {/* Maskot Kaget / Kebingungan */}
      <div className="relative mb-2">
        {/* Tanda Tanya Melayang */}
        <div className="absolute -top-4 -right-4 text-4xl font-bold text-primary animate-float-delayed z-20">
          ?
        </div>

        <div className="animate-float">
          <svg
            width="90"
            height="90"
            viewBox="0 0 90 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Badan */}
            <circle cx="45" cy="45" r="40" fill="#FFF3CD" />
            <circle
              cx="45"
              cy="45"
              r="40"
              fill="none"
              stroke="#FFC107"
              strokeWidth="3"
            />

            {/* Mata Melotot Kaget */}
            <ellipse cx="33" cy="40" rx="7" ry="8" fill="white" />
            <ellipse cx="57" cy="40" rx="7" ry="8" fill="white" />
            <circle cx="33" cy="41" r="3.5" fill="#1a1a2e" />
            <circle cx="57" cy="41" r="3.5" fill="#1a1a2e" />
            <circle cx="34.5" cy="39.5" r="1.5" fill="white" />
            <circle cx="58.5" cy="39.5" r="1.5" fill="white" />

            {/* Mulut Kaget "Oh!" */}
            <ellipse cx="45" cy="56" rx="4" ry="6" fill="#1a1a2e" />

            {/* Pipi Merah */}
            <ellipse
              cx="27"
              cy="48"
              rx="5"
              ry="3.5"
              fill="#FFB3B3"
              opacity="0.7"
            />
            <ellipse
              cx="63"
              cy="48"
              rx="5"
              ry="3.5"
              fill="#FFB3B3"
              opacity="0.7"
            />

            {/* Tangan Kaget / Ngangkat */}
            <path
              d="M18 35 L22 25 L28 32"
              stroke="#FFC107"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M72 35 L68 25 L62 32"
              stroke="#FFC107"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      </div>

      {/* Kartu Utama */}
      <div className="bg-white rounded-4xl border-[3px] border-border p-8 pb-10 w-full max-w-100 flex flex-col items-center gap-6 relative z-10 shadow-sm text-center">
        {/* Badge 404 */}
        <div className="bg-error-bg border-2 border-error-border rounded-full px-4 py-1.5 text-[14px] font-bold text-error inline-block -mb-2.5">
          Error 404
        </div>

        {/* Pesan Error Ramah Anak */}
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e] leading-snug mb-2">
            Ups! Kesasar, ya?
          </h1>
          <p className="text-base text-gray-500 font-semibold leading-relaxed px-2">
            Halaman yang kamu cari sepertinya lagi main petak umpet dan belum
            ketemu nih.
          </p>
        </div>

        {/* Ilustrasi Tambahan (Peta/Radar) - Opsional untuk hiasan UI */}
        <div className="bg-primary-container w-full py-4 rounded-2.5xl border-2 border-dashed border-border flex justify-center my-1">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-primary"
          >
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
            <line x1="9" y1="3" x2="9" y2="18"></line>
            <line x1="15" y1="6" x2="15" y2="21"></line>
            <circle cx="12" cy="12" r="3" fill="none" stroke="inherit"></circle>
          </svg>
        </div>

        {/* Tombol Kembali ke Beranda */}
        <Link href="/" className="w-full">
          <button className="w-full p-4 bg-primary text-white border-none rounded-2.5xl text-lg font-bold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2.5 hover:bg-primary-dark active:scale-[0.97]">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Kembali ke Kelas
          </button>
        </Link>
      </div>
    </>
  );
}
