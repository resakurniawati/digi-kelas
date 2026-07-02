"use client";

import LogoIcon from "@/components/icons/logo-icon";
import { setUsername } from "@/lib/helper";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
// import { useRouter } from 'next/navigation'; // Buka komentar jika ingin menggunakan router Next.js

export default function LoginDigiKelas() {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGo = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg("Yuk tulis namamu dulu ya!");
      return;
    }
    if (pin.length !== 4) {
      setErrorMsg("PIN harus berisi tepat 4 angka!");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);

    try {
      const existingSessionId = localStorage.getItem("session_id");
      // Cari apakah nama sudah terdaftar di database
      const { data: existingSession, error: searchError } = await supabase
        .from("sessions")
        .select("id, pin")
        .eq("name", trimmed)
        .order("last_active_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let sessionIdToUse = "";

      if (existingSession) {
        // Cek PIN jika sudah disetel di database
        if (existingSession.pin && existingSession.pin !== pin) {
          setErrorMsg("PIN salah! Coba ingat-ingat lagi ya, atau mungkin nama ini sudah dipakai orang lain.");
          setIsLoading(false);
          return;
        }

        // Jika nama sudah ada dan PIN cocok (atau belum punya PIN)
        sessionIdToUse = existingSession.id;
        
        // Update waktu aktif terakhir & simpan PIN jika sebelumnya kosong
        await supabase
          .from("sessions")
          .update({ 
            last_active_at: new Date().toISOString(),
            pin: existingSession.pin || pin // Set PIN for legacy users
          })
          .eq("id", sessionIdToUse);
      } else {
        // Jika nama belum ada, buat session baru dengan PIN
        const { data: newSession, error: insertError } = await supabase
          .from("sessions")
          .insert({ name: trimmed, pin: pin })
          .select("id")
          .single();

        if (insertError) throw insertError;
        if (newSession) {
          sessionIdToUse = newSession.id;
        }
      }

      // Hapus session lama jika berbeda, dan simpan session yang benar
      try {
        if (existingSessionId && existingSessionId !== sessionIdToUse) {
          localStorage.removeItem("session_id");
        }
        
        if (sessionIdToUse) {
          localStorage.setItem("session_id", sessionIdToUse);
        }

        setUsername(trimmed);
      } catch (storageError: unknown) {
        const errorName = storageError instanceof Error ? storageError.name : (storageError as { name?: string })?.name;
        const errorMessage = storageError instanceof Error ? storageError.message : (storageError as { message?: string })?.message;

        if (errorName === "QuotaExceededError" || errorMessage?.includes("quota")) {
          setErrorMsg("Penyimpanan browser ditolak (kuota penuh / Mode Incognito). Gunakan tab biasa atau hapus cache.");
          setIsLoading(false);
          return;
        }
        console.error("Storage error:", storageError);
      }

      router.push("/");
    } catch (error: any) {
      console.error("Authentication error:", error);
      if (error.message?.includes("pin")) {
        setErrorMsg("Pastikan kolom 'pin' sudah ditambahkan di tabel 'sessions' Supabase.");
      } else {
        setErrorMsg("Terjadi kesalahan jaringan.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleGo();
    }
  };

  const handlePinChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^[0-9]*$/.test(value)) return;
    
    // Convert pin to array of 4
    const newPinArray = [pin[0] || "", pin[1] || "", pin[2] || "", pin[3] || ""];
    newPinArray[index] = value.slice(-1); // Only take the last character typed
    
    setPin(newPinArray.join(""));
    if (errorMsg) setErrorMsg("");
    
    // Auto focus next input
    if (value && index < 3) {
      document.getElementById(`pin-${index + 1}`)?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Auto focus previous input on backspace if current is empty
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      document.getElementById(`pin-${index - 1}`)?.focus();
    }
    if (e.key === "Enter") {
      handleGo();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lowercased = e.target.value.toLowerCase();
    setName(lowercased);
    if (errorMsg) setErrorMsg("");
  };

  return (
    // Gunakan font-quicksand jika sudah di-setup di layout, atau biarkan font-sans bawaan
    <>
      {/* Maskot Melayang */}
      <div className="animate-float mb-2">
        <svg
          width="90"
          height="90"
          viewBox="0 0 90 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="45" cy="45" r="40" fill="#FFF3CD" />
          <circle
            cx="45"
            cy="45"
            r="40"
            fill="none"
            stroke="#FFC107"
            strokeWidth="3"
          />
          <ellipse cx="33" cy="42" rx="6" ry="7" fill="white" />
          <ellipse cx="57" cy="42" rx="6" ry="7" fill="white" />
          <circle cx="34" cy="43" r="3.5" fill="#1a1a2e" />
          <circle cx="58" cy="43" r="3.5" fill="#1a1a2e" />
          <circle cx="35.5" cy="41.5" r="1.2" fill="white" />
          <circle cx="59.5" cy="41.5" r="1.2" fill="white" />
          <path
            d="M36 55 Q45 63 54 55"
            stroke="#1a1a2e"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse
            cx="29"
            cy="50"
            rx="5"
            ry="3.5"
            fill="#FFB3B3"
            opacity="0.7"
          />
          <ellipse
            cx="61"
            cy="50"
            rx="5"
            ry="3.5"
            fill="#FFB3B3"
            opacity="0.7"
          />
          <path
            d="M16 28 L20 18 L24 28"
            stroke="#FFC107"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M66 28 L70 18 L74 28"
            stroke="#FFC107"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Kartu Utama */}
      <div className="bg-white rounded-4xl border-[3px] border-border p-8 pb-10 w-full max-w-100 flex flex-col items-center gap-5 relative z-10 shadow-sm">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="size-12 bg-primary rounded-2xl flex items-center justify-center shrink-0">
            <LogoIcon />
          </div>
          <span className="text-3xl font-bold text-primary tracking-tight">
            DigiKelas
          </span>
        </div>

        {/* Sapaan */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground leading-snug">
            Halo, Sobat Belajar!
          </h1>
          <p className="text-base text-gray-500 font-semibold mt-1">
            Siap belajar seru hari ini?
          </p>
        </div>

        {/* Form Input */}
        <div className="w-full">
          <label
            htmlFor="name-input"
            className="flex items-center gap-1.5 text-base font-bold text-gray-700 mb-2"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="#0984E3"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="9" cy="6" r="3.5" />
              <path d="M2 16c0-3.3 3.1-6 7-6s7 2.7 7 6" />
            </svg>
            Nama kamu siapa?
          </label>
          <input
            id="name-input"
            type="text"
            placeholder="Ketik namamu di sini..."
            maxLength={60}
            autoComplete="family-name"
            value={name}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Form Input PIN */}
        <div className="w-full mt-2">
          <label
            htmlFor="pin-0"
            className="flex items-center gap-1.5 text-base font-bold text-gray-700 mb-3"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#E15F41"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            PIN Rahasia (4 Angka)
          </label>
          <div className="flex gap-3 sm:gap-4 justify-center w-full">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                id={`pin-${index}`}
                type="password"
                maxLength={1}
                inputMode="numeric"
                pattern="[0-9]*"
                value={pin[index] || ""}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handlePinKeyDown(index, e)}
                className="w-14 h-14 sm:w-16 sm:h-16 text-center text-3xl font-black rounded-2xl border-[3px] border-border bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all"
              />
            ))}
          </div>
        </div>

        {/* Pesan Error */}
        <p
          className={`text-[14px] text-red-500 font-bold text-center transition-opacity ${errorMsg ? "opacity-100 visible" : "opacity-0 hidden invisible"}`}
        >
          {errorMsg || "Yuk isi formnya dulu!"}
        </p>

        {/* Tombol Aksi */}
        <button
          onClick={handleGo}
          disabled={isLoading}
          className="w-full p-4 bg-accent text-white border-none rounded-2.5xl text-xl font-bold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2.5 hover:bg-accent-dark active:scale-[0.97] disabled:bg-gray-300 disabled:border-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M8 11l2 2 4-4" />
              </svg>
              Hore! Masuk...
            </>
          ) : (
            <>
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 11h14M12 5l6 6-6 6" />
              </svg>
              Ayo Mulai Belajar!
            </>
          )}
        </button>

        <Link
          href="/about"
          className="flex items-center justify-center gap-2 rounded-full border-2 border-border bg-primary-container px-4 py-2 text-sm font-bold text-primary transition-all duration-200 hover:bg-background active:scale-[0.97]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          Tentang DigiKelas
        </Link>
      </div>
    </>
  );
}
