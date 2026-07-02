export default function BgDecoration() {
  return (
    <>
      {/* Dekorasi Bintang */}
      <span
        className="absolute text-[22px] pointer-events-none select-none animate-twinkle text-yellow-400"
        style={{ top: "40px", left: "40px" }}
      >
        &#10022;
      </span>
      <span
        className="absolute text-[16px] pointer-events-none select-none animate-twinkle delay-400 text-yellow-400"
        style={{ top: "60px", right: "60px" }}
      >
        &#10022;
      </span>
      <span
        className="absolute text-[14px] pointer-events-none select-none animate-twinkle delay-800 text-yellow-400"
        style={{ top: "120px", left: "80px" }}
      >
        &#9733;
      </span>
      <span
        className="absolute text-[18px] pointer-events-none select-none animate-twinkle delay-1200 text-yellow-400"
        style={{ bottom: "80px", right: "40px" }}
      >
        &#10022;
      </span>

      {/* Dekorasi Awan Latar */}
      <svg
        className="absolute pointer-events-none select-none opacity-35"
        style={{ top: "20px", left: "10px" }}
        width="90"
        height="40"
        viewBox="0 0 90 40"
        fill="none"
      >
        <ellipse cx="45" cy="25" rx="40" ry="18" fill="#B8DFFF" />
        <ellipse cx="28" cy="22" rx="22" ry="17" fill="#B8DFFF" />
        <ellipse cx="62" cy="20" rx="20" ry="16" fill="#B8DFFF" />
      </svg>
      <svg
        className="absolute pointer-events-none select-none opacity-30"
        style={{ bottom: "30px", left: "20px" }}
        width="70"
        height="32"
        viewBox="0 0 70 32"
        fill="none"
      >
        <ellipse cx="35" cy="20" rx="30" ry="14" fill="#A8F0DC" />
        <ellipse cx="20" cy="18" rx="17" ry="13" fill="#A8F0DC" />
        <ellipse cx="50" cy="16" rx="16" ry="12" fill="#A8F0DC" />
      </svg>
    </>
  );
}
