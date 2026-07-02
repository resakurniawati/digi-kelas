import { createClient } from "@/lib/supabase/server";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import materials from "../../../../public/assets/material-data.json";
import PrintButton from "./print-button";
import BackButton from "./back-button";
import { Metadata } from "next";
import LogoIcon from "@/components/icons/logo-icon";
import CertificateViewer from "./certificate-viewer";
import { QRCodeSVG } from "qrcode.react";
import { Trophy } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Sertifikat Pencapaian - DigiKelas`,
  };
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const fullUrl = `${protocol}://${host}/certificate/${id}`;

  const supabase = createClient(cookieStore);

  const { data: cert, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !cert) {
    notFound();
  }

  const finalScore = cert.score !== undefined && cert.score !== null ? cert.score : 100;

  const material = materials.find((m) => m.id.toString() === cert.material_id);
  const title = material ? material.title : "Modul Pembelajaran";
  const date = new Date(cert.created_at).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="flex w-full flex-col items-center py-10 px-4 print:p-0 print:py-0">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4 landscape; margin: 0; }
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
            background: white;
          }
          /* Override layout paddings */
          body > div {
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            overflow: visible !important;
          }
          /* Hide Background Decoration on print */
          body > div > span.absolute, body > div > svg.absolute {
            display: none !important;
          }
        }
      `}} />

      {/* Info Notice Outside Certificate (Hidden on Print) */}
      <div className="print:hidden w-full max-w-[1150px] mb-6 flex items-start gap-4 rounded-3xl border-2 border-orange-200 bg-orange-50 p-4 shadow-sm">
        <div className="mt-0.5 shrink-0 text-orange-500">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-orange-800">
            Nilai yang tertera pada sertifikat ini adalah <span className="underline decoration-2 underline-offset-2">murni hasil dari percobaan pertama</span> Anda. Nilai di sertifikat bersifat permanen dan tidak akan terpengaruh jika Anda mengulang (retake) post-test.
          </p>
        </div>
      </div>

      <CertificateViewer>
        {/* Container for Certificate (A4 Landscape = 1123px x 794px) */}
        <div className="mx-auto relative flex w-[1123px] h-[794px] shrink-0 flex-col items-center rounded-3xl bg-white p-6 shadow-xl print:m-0 print:p-6 print:shadow-none print:bg-transparent print:rounded-none">
          {/* Outer border */}
          <div className="flex w-full h-full flex-col items-center justify-center rounded-2xl border-[8px] border-accent p-3 print:border-[10px]">
            {/* Inner dashed border with gradient background */}
            <div 
              className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-xl border-4 border-dashed border-primary/50 bg-[#F8FAFC] p-16 text-center print:border-[6px]"
              style={{ backgroundImage: 'radial-gradient(#E2E8F0 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }}
            >
              {/* Giant Watermark */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none scale-[12]">
                <LogoIcon />
              </div>

              {/* Background Geometric Decorations */}
              <div className="absolute -left-12 -top-12 opacity-30 rotate-12 pointer-events-none">
                <svg width="180" height="180" viewBox="0 0 100 100" fill="#FFC107">
                  <path d="M50 0 L58 38 L98 48 L58 58 L50 98 L42 58 L2 48 L42 38 Z" />
                </svg>
              </div>
              <div className="absolute right-32 -bottom-16 opacity-30 -rotate-12 pointer-events-none">
                <svg width="160" height="160" viewBox="0 0 100 100" fill="#FFB3B3">
                   <circle cx="50" cy="50" r="45" />
                </svg>
              </div>
              <div className="absolute left-24 bottom-12 opacity-25 rotate-[25deg] pointer-events-none">
                <svg width="90" height="90" viewBox="0 0 100 100" fill="#00B894">
                  <rect x="20" y="20" width="60" height="60" rx="15" />
                </svg>
              </div>
              <div className="absolute top-24 right-40 opacity-20 rotate-[35deg] pointer-events-none">
                <svg width="80" height="80" viewBox="0 0 100 100" stroke="#0984E3" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none">
                   <polygon points="50,15 90,85 10,85" />
                </svg>
              </div>
              <div className="absolute top-1/2 left-12 opacity-20 -rotate-12 pointer-events-none">
                <svg width="70" height="70" viewBox="0 0 100 100" fill="none" stroke="#FF9F43" strokeWidth="8" strokeLinecap="round">
                   <path d="M20 20 Q50 80 80 20" />
                   <path d="M20 40 Q50 100 80 40" />
                </svg>
              </div>
              <div className="absolute right-12 top-24 opacity-20 rotate-45 pointer-events-none">
                <svg width="80" height="80" viewBox="0 0 100 100" fill="#9C27B0">
                  <path d="M35 15 H65 V35 H85 V65 H65 V85 H35 V65 H15 V35 H35 Z" />
                </svg>
              </div>
              <div className="absolute left-1/2 bottom-8 -translate-x-1/2 opacity-25 -rotate-6 pointer-events-none">
                <svg width="100" height="30" viewBox="0 0 100 30" fill="none" stroke="#00CEC9" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="5,25 25,5 45,25 65,5 85,25" />
                </svg>
              </div>
              <div className="absolute left-1/3 top-12 opacity-20 rotate-12 pointer-events-none">
                <svg width="60" height="60" viewBox="0 0 100 100" fill="none" stroke="#00B894" strokeWidth="10">
                  <circle cx="50" cy="50" r="35" />
                </svg>
              </div>
              <div className="absolute right-20 top-1/2 opacity-25 rotate-12 pointer-events-none">
                <svg width="50" height="50" viewBox="0 0 100 100" fill="#FFC107">
                  <circle cx="20" cy="20" r="10" />
                  <circle cx="80" cy="20" r="10" />
                  <circle cx="20" cy="80" r="10" />
                  <circle cx="80" cy="80" r="10" />
                  <circle cx="50" cy="50" r="10" />
                </svg>
              </div>
              <div className="absolute left-1/4 bottom-32 opacity-20 -rotate-12 pointer-events-none">
                <svg width="70" height="70" viewBox="0 0 100 100" fill="#E84393">
                  <polygon points="50,10 61,39 92,39 67,57 76,86 50,68 24,86 33,57 8,39 39,39" />
                </svg>
              </div>
              <div className="absolute right-1/4 bottom-24 opacity-25 rotate-45 pointer-events-none">
                <svg width="60" height="60" viewBox="0 0 100 100" fill="none" stroke="#0984E3" strokeWidth="8" strokeLinecap="round">
                   <path d="M10,90 Q50,10 90,90" />
                </svg>
              </div>
              <div className="absolute top-1/4 left-1/4 opacity-20 rotate-[60deg] pointer-events-none">
                <svg width="50" height="50" viewBox="0 0 100 100" fill="#00B894">
                  <polygon points="50,10 90,80 10,80" />
                </svg>
              </div>
              <div className="absolute top-40 right-1/3 opacity-30 pointer-events-none">
                 <svg width="40" height="40" viewBox="0 0 100 100" fill="#FD79A8">
                    <rect x="25" y="25" width="50" height="50" rx="10" transform="rotate(45 50 50)" />
                 </svg>
              </div>
              <div className="absolute left-10 top-1/3 opacity-20 pointer-events-none">
                <svg width="40" height="40" viewBox="0 0 100 100" fill="#FDCB6E">
                  <circle cx="30" cy="30" r="15" />
                  <circle cx="70" cy="70" r="15" />
                </svg>
              </div>
              <div className="absolute right-10 bottom-1/3 opacity-20 rotate-[-20deg] pointer-events-none">
                 <svg width="70" height="70" viewBox="0 0 100 100" fill="none" stroke="#6C5CE7" strokeWidth="8" strokeLinecap="round">
                    <path d="M20 20 L80 80 M80 20 L20 80" />
                 </svg>
              </div>

              {/* Platform Header & Certificate ID */}
              <div className="absolute left-8 top-8 flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm print:border-none print:bg-primary print:text-white">
                  <LogoIcon className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-start pt-0.5">
                  <span className="text-xl leading-none font-black tracking-tight text-primary">
                    DigiKelas
                  </span>
                  <div className="mt-1.5 flex items-center gap-1.5">
                     <p className="font-mono text-[9px] font-bold text-gray-500 bg-transparent z-10 backdrop-blur-2xl px-1.5 py-0.5 rounded border border-gray-200 shadow-sm print:shadow-none">
                        ID: {cert.id}
                     </p>
                  </div>
                </div>
              </div>

              {/* Trophy Icon */}
              <div className="relative z-10 mb-8 flex size-24 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-lg print:shadow-none">
                <Trophy className="w-12 h-12" strokeWidth={2.5} />
              </div>

              <h1 className="relative z-10 mb-2 text-5xl font-extrabold tracking-widest text-primary">
                SERTIFIKAT
              </h1>
              <h2 className="relative z-10 mb-8 text-xl font-bold tracking-[0.2em] text-accent">
                PENCAPAIAN
              </h2>

              <p className="relative z-10 mb-4 text-lg font-semibold text-gray-500">
                Diberikan dengan bangga kepada:
              </p>

              {/* Learner Name */}
              <div className="relative z-10 mb-8 border-b-4 border-primary px-8 pb-2">
                <p
                  className="text-6xl font-black text-foreground"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {cert.learner_name}
                </p>
              </div>

              <p className="relative z-10 mb-2 text-lg font-semibold text-gray-500">
                Atas keberhasilannya dalam menyelesaikan materi pembelajaran dan
                evaluasi post-test:
              </p>

              <p className="relative z-10 mb-10 text-3xl font-bold text-primary">
                &quot;{title}&quot;
              </p>

              {/* Footer Data */}
              <div className="relative z-10 flex w-full max-w-xl items-end justify-center gap-32 border-t-2 border-gray-200 pt-6">
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-400">
                    Tanggal Penyelesaian
                  </p>
                  <p className="text-lg font-bold text-foreground">{date}</p>
                </div>

                <div className="text-center">
                  <p className="text-sm font-bold text-gray-400">Nilai Akhir</p>
                  <p className="text-2xl font-black text-accent">{finalScore}</p>
                </div>
              </div>

              {/* QR Code for Verification */}
              <div className="absolute right-8 top-8 flex flex-col items-center justify-center">
                <div className="p-2.5 bg-white rounded-xl border-2 border-gray-200 shadow-sm print:border-[3px] print:shadow-none">
                  <QRCodeSVG value={fullUrl} size={75} level="M" />
                </div>
                <p className="mt-1.5 text-[10px] font-bold tracking-wide text-gray-500">Scan untuk Verifikasi</p>
              </div>
            </div>
          </div>
        </div>
      </CertificateViewer>

      {/* Action Buttons (Hidden on Print) */}
      <div className="print:hidden mt-8 flex flex-wrap items-center justify-center gap-4">
        <BackButton />
        <PrintButton />
      </div>
    </main>
  );
}
