import LogoIcon from "@/components/icons/logo-icon";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Info, User, Layers, Code } from "lucide-react";

const learningFlow = [
  "Login nama",
  "Pre-test",
  "E-Modul & Video",
  "LKPD & Game",
  "Quiz",
  "Post-test",
];

const developerNotes = [
  "Next.js 16.2.7",
  "TypeScript",
  "TailwindCSS",
  "Supabase-ready",
];

export default function AboutPage() {
  return (
    <main className="relative z-10 flex w-full max-w-5xl flex-1 flex-col gap-4 sm:gap-5 mx-auto py-6 sm:py-8">
      {/* Header Section */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-3xl sm:rounded-4xl border-[3px] border-border shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="size-12 sm:size-14 bg-[#F0F9FF] rounded-2xl flex items-center justify-center border-2 border-[#BAE6FD]">
            <Info className="size-6 sm:size-8 text-[#0284C7]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground">Tentang DigiKelas</h1>
            <p className="text-xs sm:text-sm text-gray-500 font-bold">Kenali platform dan pengembangnya.</p>
          </div>
        </div>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-slate-100 px-4 py-2 sm:px-5 sm:py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200 active:scale-[0.97]"
        >
          <ArrowLeft className="size-4" /> Kembali
        </Link>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-stretch">
        
        {/* Left Column */}
        <div className="flex flex-col gap-4 sm:gap-5">
          {/* Tentang DigiKelas */}
          <section className="bg-white rounded-3xl sm:rounded-4xl border-[3px] border-border shadow-sm overflow-hidden flex flex-col h-full">
            <div className="flex items-center gap-3 border-b-[3px] border-border p-4 sm:p-5 bg-primary-container">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-primary shadow-sm">
                <LogoIcon />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black leading-tight text-primary">Apa itu DigiKelas?</h2>
              </div>
            </div>
            <div className="p-4 sm:p-6 flex flex-col gap-4 flex-1">
              <p className="text-sm sm:text-base font-semibold leading-relaxed text-gray-600">
                DigiKelas adalah ruang belajar digital yang ramah anak, dirancang khusus untuk membantu siswa SD belajar lewat alur yang ringan, terstruktur, dan interaktif, mulai dari mengenal kemampuan awal sampai melihat hasil belajar setelah materi selesai.
              </p>
              <div className="mt-auto rounded-2xl border-2 border-dashed border-border bg-slate-50 p-4">
                 <p className="text-sm font-semibold leading-relaxed text-gray-600">
                  Platform ini memuat E-Modul, Video Pembelajaran, LKPD, Mini Game Edukasi, Quiz bertimer, serta Pre-test dan Post-test yang langsung memberikan feedback visual.
                </p>
              </div>
            </div>
          </section>

          {/* Alur Belajar & Tech Stack */}
          <section className="bg-white rounded-3xl sm:rounded-4xl border-[3px] border-border shadow-sm p-4 sm:p-6">
             <div className="flex items-center gap-2 mb-4 border-b-2 border-border/50 pb-2">
               <Layers className="size-5 text-accent" />
               <h3 className="text-base font-bold text-foreground">Alur Belajar</h3>
             </div>
             <div className="flex flex-wrap gap-2 mb-6">
              {learningFlow.map((item, index) => (
                <span
                  key={item}
                  className="flex items-center gap-1.5 rounded-xl border-2 border-border bg-[#FFF9E6] px-3 py-1.5 text-xs font-bold text-[#B07D00]"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#B07D00] text-[10px] text-white">{index + 1}</span>
                  {item}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-4 border-b-2 border-border/50 pb-2">
               <Code className="size-5 text-primary" />
               <h3 className="text-base font-bold text-foreground">Teknologi Developer</h3>
             </div>
             <div className="flex flex-wrap gap-2">
              {developerNotes.map((item) => (
                <span
                  key={item}
                  className="rounded-xl border-2 border-border bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4 sm:gap-5">
           {/* Profil Developer */}
           <section className="bg-white rounded-3xl sm:rounded-4xl border-[3px] border-border shadow-sm overflow-hidden flex flex-col h-full">
            <div className="flex items-center gap-3 border-b-[3px] border-border p-4 sm:p-5 bg-[#FDF2F8]">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-pink-500 shadow-sm text-white">
                <User className="size-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black leading-tight text-pink-600">Profil Developer</h2>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 flex flex-col gap-5 flex-1">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                <div className="shrink-0 rounded-[24px] border-[3px] border-border bg-white p-2 shadow-sm">
                  <Image
                    src="/resa.jpeg"
                    alt="Foto Resa Kurniawati"
                    width={610}
                    height={610}
                    className="size-28 sm:size-32 rounded-2xl object-cover"
                    priority
                  />
                </div>
                <div className="pt-2 sm:pt-4">
                  <h3 className="text-2xl sm:text-3xl font-black text-foreground">Resa Kurniawati</h3>
                  <p className="text-sm font-bold text-pink-500 mt-1">Pengembang Utama DigiKelas</p>
                </div>
              </div>

              <div className="w-full h-0.5 bg-slate-100 rounded-full my-1"></div>

              <p className="text-sm sm:text-base font-semibold leading-relaxed text-gray-600 text-center sm:text-left">
                Berawal dari kecintaan pada dunia pendidikan, saya percaya bahwa belajar adalah proses bertumbuh yang tidak pernah berhenti. Melalui pembelajaran yang kreatif, interaktif, dan bermakna, saya ingin membantu peserta didik menemukan bahwa matematika bukanlah sesuatu yang menakutkan, melainkan petualangan yang penuh makna dan penemuan.
              </p>

              <blockquote className="mt-auto rounded-2xl border-2 border-dashed border-border bg-pink-50 px-5 py-5 text-sm sm:text-base font-bold leading-relaxed text-pink-700 italic text-center relative shadow-sm">
                <div className="absolute -top-3 -left-2 text-5xl text-pink-300 opacity-60 font-serif leading-none">&quot;</div>
                Menyusun pembelajaran adalah menanam benih pengetahuan; mengajar adalah merawatnya hingga tumbuh menjadi masa depan.
                <div className="absolute -bottom-7 right-0 text-5xl text-pink-300 opacity-60 font-serif leading-none">&quot;</div>
              </blockquote>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
