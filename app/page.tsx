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
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (loginError) setLoginError("");
    if (sweep) setSweep(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const username = form.username.trim();
    const password = form.password.trim();

    if (!username || !password) {
      setLoginError("Por favor ingresa usuario y contraseña.");
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    setSweep(true);

    timerRef.current = setTimeout(() => {
      const encodedName = encodeURIComponent(username);
      const encodedEmail = encodeURIComponent(`${username}@demo.mx`);
      router.push(`/asesor?name=${encodedName}&email=${encodedEmail}`);
    }, ANIM_MS - 50);
  }

  return (
    <div
      className="min-h-dvh grid place-items-center px-4 py-6 sm:py-10"
      style={{ background: "linear-gradient(135deg, #753bd0 0%, #191514 100%)" }}
    >
      {/* Card responsiva */}
      <section
        className="login-card w-full max-w-[26rem] sm:max-w-2xl lg:max-w-5xl rounded-2xl overflow-hidden shadow-2xl relative"
        role="dialog"
        aria-modal="true"
        data-sweep={sweep ? 1 : 0}
      >
        {/* CÁPSULA */}
        <div className="capsule-wrap pointer-events-none" aria-hidden="true">
          <div className="capsule" style={{ background: "#7C3AED" }} />
        </div>

        {/* Lado Bienvenida */}
        <aside className="welcome flex flex-col items-center justify-center text-center gap-2 sm:gap-3 px-6 py-8 sm:py-10">
          <div className="flex justify-center">
            <Image
              src="/imagen/img1.png"
              alt="Logo"
              width={96}
              height={96}
              className="object-contain w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28"
              priority
            />
          </div>
          <h1
            className="font-bold leading-tight text-white text-2xl sm:text-3xl md:text-4xl"
          >
            Hola, ¡Bienvenido!
          </h1>
          <p className="text-white/90 text-xs sm:text-sm md:text-base">
            Bienvenido al cotizador de seguros.
          </p>
        </aside>

        {/* Lado Formulario */}
        <div className="form-side flex items-center justify-center bg-white/95 backdrop-blur px-6 py-8 sm:py-10">
          <form className="w-full max-w-xs sm:max-w-sm space-y-4" onSubmit={handleSubmit}>
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
              <p className="text-xs text-neutral-500">
                Demo: cualquier usuario y contraseña válidos funcionan.
              </p>
            )}

            <button
              type="submit"
              className="btn-primary w-full h-12 rounded-xl font-bold text-white shadow-lg transition active:translate-y-px focus:outline-none focus:ring-4 text-base"
              style={{ background: "#191514" }}
            >
              Entrar
            </button>
          </form>
        </div>
      </section>

      {/* Estilos responsivos + animación de cápsula */}
      <style>{`
        /* Grid del card:
           - Móvil: layout vertical (bienvenida arriba, form abajo)
           - md+: layout de 2 columnas */
        .login-card {
          display: grid;
          grid-template-rows: auto 1fr;
          grid-template-columns: 1fr;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .welcome {
          background: linear-gradient(180deg, rgba(124, 58, 237, 0.25), rgba(124, 58, 237, 0.05));
        }
        @media (min-width: 768px) {
          .login-card {
            grid-template-rows: 1fr;
            grid-template-columns: 1fr 1fr;
          }
          .welcome {
            background: linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(25, 21, 20, 0.15));
          }
        }

        /* Inputs base (compatibles con Tailwind) */
        .input {
          width: 100%;
          border-radius: 0.75rem; /* rounded-xl */
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: #fff;
          padding: 0.75rem 1rem; /* py-3 px-4 */
          font-size: 0.95rem;
          outline: none;
          transition: box-shadow 200ms, border-color 200ms, transform 120ms;
        }
        .input:focus {
          border-color: rgb(124, 58, 237);
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.22);
        }
        .input:active {
          transform: translateY(0.5px);
        }

        .btn-primary:focus {
          box-shadow: 0 0 0 4px rgba(25, 21, 20, 0.25);
        }

        /* CÁPSULA */
        .capsule-wrap {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 2;
        }
        .capsule {
          position: absolute;
          width: 140%;
          height: 140px;
          left: 50%;
          transform: translateX(-50%);
          top: -160px; /* fuera de vista (móvil) */
          border-radius: 9999px;
          opacity: 0.96;
          filter: drop-shadow(0 18px 28px rgba(0, 0, 0, 0.28));
          transition: transform ${ANIM_MS}ms cubic-bezier(0.22, 1, 0.36, 1),
            top ${ANIM_MS}ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        /* Animación móvil: entra vertical desde arriba y cubre */
        .login-card[data-sweep="1"] .capsule {
          top: 35%;
          transform: translateX(-50%) scale(1.15);
        }

        /* En pantallas md+ la cápsula hace sweep horizontal */
        @media (min-width: 768px) {
          .capsule {
            width: 220px;
            height: 220%;
            top: 50%;
            left: -260px; /* fuera a la izquierda */
            transform: translateY(-50%);
          }
          .login-card[data-sweep="1"] .capsule {
            left: 110%;
            transform: translateY(-50%);
          }
        }
      `}</style>
    </div>
  );
}
