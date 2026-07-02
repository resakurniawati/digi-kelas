"use client";

import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function ChangePinPage() {
  const router = useRouter();
  
  const [oldPin, setOldPin] = useState<string[]>(["", "", "", ""]);
  const [newPin, setNewPin] = useState<string[]>(["", "", "", ""]);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleOldPinChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newArray = [...oldPin];
    newArray[index] = value.slice(-1);
    setOldPin(newArray);
    setErrorMsg("");
    if (value && index < 3) document.getElementById(`old-pin-${index + 1}`)?.focus();
  };

  const handleOldPinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !oldPin[index] && index > 0) {
      document.getElementById(`old-pin-${index - 1}`)?.focus();
    }
  };

  const handleNewPinChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newArray = [...newPin];
    newArray[index] = value.slice(-1);
    setNewPin(newArray);
    setErrorMsg("");
    if (value && index < 3) document.getElementById(`new-pin-${index + 1}`)?.focus();
  };

  const handleNewPinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !newPin[index] && index > 0) {
      document.getElementById(`new-pin-${index - 1}`)?.focus();
    }
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const sessionId = localStorage.getItem("session_id");
    const oldPinStr = oldPin.join("");
    const newPinStr = newPin.join("");

    if (oldPinStr.length !== 4) {
      setErrorMsg("PIN Lama harus terisi 4 angka!");
      return;
    }
    if (newPinStr.length !== 4) {
      setErrorMsg("PIN Baru harus terisi 4 angka!");
      return;
    }
    if (oldPinStr === newPinStr) {
      setErrorMsg("PIN Baru tidak boleh sama dengan PIN Lama!");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      if (!sessionId) {
        throw new Error("Sesi tidak ditemukan.");
      }

      // Fetch the current pin to verify
      const { data: currentSession, error: fetchError } = await supabase
        .from("sessions")
        .select("pin")
        .eq("id", sessionId)
        .single();

      if (fetchError || !currentSession) {
        throw new Error("Gagal memuat data pengguna.");
      }

      if (currentSession.pin && currentSession.pin !== oldPinStr) {
        setErrorMsg("PIN Lama yang kamu masukkan salah.");
        setIsLoading(false);
        return;
      }

      // Update PIN
      const { error: updateError } = await supabase
        .from("sessions")
        .update({ pin: newPinStr })
        .eq("id", sessionId);

      if (updateError) {
        throw updateError;
      }

      setSuccessMsg("Hore! PIN berhasil diubah. Mengalihkan...");
      setTimeout(() => {
        router.push("/");
      }, 1500);
      
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Terjadi kesalahan, silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative z-10 flex w-full max-w-xl flex-1 flex-col gap-4 sm:gap-6 mx-auto">
      {/* Header */}
      <section className="flex justify-between items-center bg-white p-4 sm:p-6 rounded-3xl sm:rounded-4xl border-[3px] border-border shadow-sm mt-4 sm:mt-10">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="size-12 sm:size-14 bg-[#FFF9E6] rounded-2xl flex items-center justify-center border-2 border-[#FFE8A1]">
            <Lock className="size-6 sm:size-8 text-[#B07D00]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground">Ganti PIN</h1>
            <p className="text-xs sm:text-sm text-gray-500 font-bold">Ubah PIN rahasiamu di sini.</p>
          </div>
        </div>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-slate-100 px-4 py-2 sm:px-5 sm:py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200 active:scale-[0.97]"
        >
          <ArrowLeft className="size-4" /> Batal
        </Link>
      </section>

      {/* Form Card */}
      <section className="bg-white rounded-3xl sm:rounded-4xl border-[3px] border-border shadow-sm p-5 sm:p-8 flex flex-col gap-6">
        
        {/* PIN Lama */}
        <div className="w-full">
          <label className="flex items-center justify-center sm:justify-start gap-1.5 text-base font-bold text-gray-700 mb-3">
            Masukkan PIN Lama
          </label>
          <div className="flex gap-3 sm:gap-4 justify-center sm:justify-start w-full">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={`old-${index}`}
                id={`old-pin-${index}`}
                type="password"
                maxLength={1}
                inputMode="numeric"
                pattern="[0-9]*"
                value={oldPin[index] || ""}
                onChange={(e) => handleOldPinChange(index, e.target.value)}
                onKeyDown={(e) => handleOldPinKeyDown(index, e)}
                disabled={isLoading || !!successMsg}
                className="w-14 h-14 sm:w-16 sm:h-16 text-center text-3xl font-black rounded-2xl border-[3px] border-border bg-slate-50 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-400/20 outline-none transition-all disabled:opacity-50"
              />
            ))}
          </div>
        </div>

        <div className="h-0.5 w-full bg-slate-100 rounded-full my-1"></div>

        {/* PIN Baru */}
        <div className="w-full">
          <label className="flex items-center justify-center sm:justify-start gap-1.5 text-base font-bold text-gray-700 mb-3">
            Masukkan PIN Baru
          </label>
          <div className="flex gap-3 sm:gap-4 justify-center sm:justify-start w-full">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={`new-${index}`}
                id={`new-pin-${index}`}
                type="password"
                maxLength={1}
                inputMode="numeric"
                pattern="[0-9]*"
                value={newPin[index] || ""}
                onChange={(e) => handleNewPinChange(index, e.target.value)}
                onKeyDown={(e) => handleNewPinKeyDown(index, e)}
                disabled={isLoading || !!successMsg}
                className="w-14 h-14 sm:w-16 sm:h-16 text-center text-3xl font-black rounded-2xl border-[3px] border-border bg-slate-50 focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-400/20 outline-none transition-all disabled:opacity-50"
              />
            ))}
          </div>
        </div>

        {/* Messages */}
        <p
          className={`text-[14px] font-bold text-center transition-opacity ${
            errorMsg ? "text-red-500 opacity-100 visible" : 
            successMsg ? "text-green-500 opacity-100 visible" : 
            "opacity-0 hidden invisible"
          }`}
        >
          {errorMsg || successMsg}
        </p>

        <button
          onClick={handleSubmit}
          disabled={isLoading || !!successMsg}
          className="w-full p-4 bg-primary text-white border-none rounded-2.5xl text-lg sm:text-xl font-bold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 hover:bg-primary-dark active:scale-[0.97] disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="size-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Simpan PIN Baru"
          )}
        </button>
      </section>
    </main>
  );
}
