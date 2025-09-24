"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const REDIRECT_MS = 2000; // 2 segundos

export default function SuccessClient({ sessionId }: { sessionId?: string }) {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace("/asesor?step=0");
    }, REDIRECT_MS);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <main className="min-h-dvh flex items-center justify-center px-4 py-8 bg-neutral-50">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white shadow-sm p-6 text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <span className="text-xl">✓</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold">Pago exitoso</h1>
        <p className="mt-2 text-sm text-neutral-700">
          Gracias. Tu pago se registró correctamente{sessionId ? ` (ref: ${sessionId})` : ""}.
        </p>
        <p className="mt-1 text-xs text-neutral-500">Redirigiendo al flujo (Descubrimiento) para iniciar una nueva cotización…</p>

        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            className="rounded-xl px-4 py-2 bg-[#753bd0] text-white font-semibold hover:bg-[#5f2fab]"
            onClick={() => router.replace("/asesor?step=0")}
          >
            Ir ahora
          </button>
        </div>
      </div>
    </main>
  );
}
