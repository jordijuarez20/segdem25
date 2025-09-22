"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
  <div className="min-h-dvh grid place-items-center px-4 py-10" style={{ background: 'linear-gradient(120deg, #F77FBF 0%, #6A00FF 50%, #B8FF00 100%)' }}>
      <section
        className="login-card"
        role="dialog"
        aria-modal="true"
        data-sweep={sweep ? 1 : 0}
        style={{
          boxShadow: '0 8px 32px #BFC6CF88',
          borderRadius: 32,
          border: '2px solid #BFC6CF',
          background: '#fff',
          padding: 0,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div className="capsule-wrap" aria-hidden="true">
          <div className="capsule" style={{ background: '#fff', boxShadow: '0 0 32px #BFC6CF', borderRadius: 24, width: '90%', height: 32, margin: '16px auto' }} />
        </div>

  <aside className="welcome" style={{ background: '#FAD2E1', borderBottom: '3px solid #BFC6CF', borderRadius: '0 0 24px 24px', boxShadow: '0 4px 24px #BFC6CF44' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, marginTop: '-32px' }}>
            <img src="/imagen/img2.png" alt="Logo Quantum" style={{ width: '100%', maxWidth: 220, height: 'auto', borderRadius: 16, marginTop: '-48px', objectFit: 'contain' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 8 }}>
              <h1 style={{ color: '#111', fontWeight: 400, fontSize: 32, margin: '24px 0 0 0' }}>Hola, Bienvenido!</h1>
              <p style={{ color: '#444', fontWeight: 600, fontSize: 18, margin: '8px 0 0 0' }}>
                Accede y lleva la protección de tus clientes al siguiente nivel.<br />
                
              </p>
            </div>
          </div>
        
        </aside>

        <div className="form-side">
          <form className="w-full max-w-sm space-y-4 p-6" style={{ background: '#fff', borderRadius: 24, boxShadow: '0 2px 16px #BFC6CF55' }} onSubmit={handleSubmit}>
            <div className="space-y-2 text-left">
              <label className="block text-sm font-semibold" htmlFor="username" style={{ color: '#2E007C' }}>
                <span style={{ color: '#111' }}>Usuario</span>
              </label>
              <input
                id="username"
                name="username"
                autoComplete="username"
                className="input"
                placeholder="example@demo.mx"
                value={form.username}
                onChange={handleChange}
                style={{ background: '#E5E8EF', color: '#222', borderColor: '#BFC6CF', fontWeight: 500, borderWidth: 1, borderStyle: 'solid', borderRadius: 8, padding: '10px 12px' }}
              />
            </div>

            <div className="space-y-2 text-left">
              <label className="block text-sm font-semibold" htmlFor="password" style={{ color: '#2E007C' }}>
                <span style={{ color: '#111' }}>Contraseña</span>
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
                style={{ background: '#E5E8EF', color: '#222', borderColor: '#BFC6CF', fontWeight: 500, borderWidth: 1, borderStyle: 'solid', borderRadius: 8, padding: '10px 12px' }}
              />
            </div>

            {loginError ? (
              <p className="text-sm font-medium" style={{ color: '#6A00FF' }}>{loginError}</p>
            ) : (
              <p className="text-xs" style={{ color: '#444' }}>Demo: cualquier usuario y contraseña válidos funcionan.</p>
            )}

            <button

              type="submit"
              className="btn"
              style={{
                background: '#C90076',
                color: '#fff',
                boxShadow: '0 2px 8px #BFC6CF88',
                border: 'none',
                fontWeight: 700,
                fontSize: 18,
                borderRadius: 12,
                marginTop: 8,
                padding: '12px 0'
              }}
            >
              Entrar
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}