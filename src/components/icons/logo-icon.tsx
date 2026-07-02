import { cn } from "@/lib/utils";

export default function LogoIcon({ className }: { className?: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" className={cn(className)}>
      <path
        d="M4 20C4 17 4 10 4 8C4 6 5.5 5 7.5 5L14.5 5L14.5 25L7.5 25C5.5 25 4 23.5 4 20Z"
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M26 20C26 17 26 10 26 8C26 6 24.5 5 22.5 5L15.5 5L15.5 25L22.5 25C24.5 25 26 23.5 26 20Z"
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line
        x1="15"
        y1="5"
        x2="15"
        y2="25"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="7"
        y1="11"
        x2="13"
        y2="11"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.8"
      />
      <line
        x1="7"
        y1="15"
        x2="13"
        y2="15"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M22 1.5L23.1 4.8L26.5 4.8L23.8 6.8L24.9 10.1L22 8.1L19.1 10.1L20.2 6.8L17.5 4.8L20.9 4.8Z"
        fill="#00B894"
      />
    </svg>
  );
}
