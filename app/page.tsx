"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const ANIM_MS = 900;

type LoginForm = {
  username: string;
  password: string;
};

export default function Page() {
  const router = useRouter();
  const [form, setForm] = useState<LoginForm>({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [sweep, setSweep] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (loginError) {
      setLoginError("");
    }
    if (sweep) {
      setSweep(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const username = form.username.trim();
    const password = form.password.trim();

    if (!username || !password) {
      setLoginError("Por favor ingresa usuario y contraseña.");
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setSweep(true);

    timerRef.current = setTimeout(() => {
      const encodedName = encodeURIComponent(username);
      const encodedEmail = encodeURIComponent(`${username}@demo.mx`);
      router.push(`/asesor?name=${encodedName}&email=${encodedEmail}`);
    }, ANIM_MS - 50);
  }

  return (
    <div className="min-h-dvh grid place-items-center px-4 py-10" style={{
      background: 'linear-gradient(135deg, #753bd0 0%, #191514 100%)'
    }}>
      <section
        className="login-card"
        role="dialog"
        aria-modal="true"
        data-sweep={sweep ? 1 : 0}
      >
        <div className="capsule-wrap" aria-hidden="true">
          <div className="capsule" style={{ background: '#7C3AED' }} />
        </div>

        <aside className="welcome">
          <div className="mb-6 flex justify-center">
            <Image
              src="/imagen/img1.png"
              alt="Logo"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
          <h1 style={{ color: '#ffffff' }}>Hola, Bienvenido!</h1>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: '#ffffff' }}>
            Bienvenido al cotizador de seguros.
          </p>
        </aside>

        <div className="form-side">
          <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2 text-left">
              <label className="block text-sm font-semibold text-neutral-700" htmlFor="username">
                Usuario
              </label>
              <input
                id="username"
                name="username"
                autoComplete="username"
                className="input"
                placeholder="example@demo.mx"
                value={form.username}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2 text-left">
              <label className="block text-sm font-semibold text-neutral-700" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            {loginError ? (
              <p className="text-sm font-medium text-rose-600">{loginError}</p>
            ) : (
              <p className="text-xs text-neutral-500">Demo: cualquier usuario y contraseña válidos funcionan.</p>
            )}

            <button 
              type="submit" 
              className="w-full h-12 rounded-xl font-bold text-white shadow-lg transition active:translate-y-px focus:outline-none focus:ring-4"
              style={{ background: '#191514' }}
            >
              Entrar
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
