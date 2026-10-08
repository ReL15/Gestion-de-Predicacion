import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    toggleDemoMode,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'recovery'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else if (mode === 'register') {
        if (!firstName || !lastName) {
          setErrorMsg('Por favor ingrese su nombre y apellido.');
          setSubmitting(false);
          return;
        }
        await signUpWithEmail(email, password, firstName, lastName);
      } else if (mode === 'recovery') {
        await resetPassword(email);
        setSuccessMsg('Se ha enviado un correo con instrucciones para restablecer su contraseña.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setErrorMsg('Correo o contraseña incorrectos.');
      } else if (err.code === 'auth/user-not-found') {
        setErrorMsg('No se encontró una cuenta con ese correo.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Ya existe una cuenta con este correo.');
      } else {
        setErrorMsg(err.message || 'Error al autenticar.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-xl border border-slate-200/80 space-y-6">
        {/* Encabezado */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto text-xl font-bold shadow-md">
            P
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Organizador de Predicación
          </h1>
          <p className="text-xs text-slate-500">
            {mode === 'login' && 'Inicia sesión con tu cuenta de publicador'}
            {mode === 'register' && 'Crea tu cuenta congregacional'}
            {mode === 'recovery' && 'Recuperación de contraseña'}
          </p>
        </div>

        {/* Acceso Rápido Modo Demostración */}
        <button
          onClick={() => toggleDemoMode(true)}
          className="w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 text-amber-950 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>Entrar en Modo Demostración (Sin registro)</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] text-slate-400 font-medium absolute">
            o con tu cuenta
          </span>
        </div>

        {/* Botón Google */}
        <button
          type="button"
          onClick={signInWithGoogle}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2.5 shadow-xs transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continuar con Google</span>
        </button>

        {/* Mensajes de error o éxito */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
            {successMsg}
          </div>
        )}

        {/* Formulario Email / Contraseña */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nombre</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Carlos"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Apellido</label>
                <input
                  type="text"
                  required
                  placeholder="López"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Correo electrónico</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="publicador@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          {mode !== 'recovery' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Contraseña</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('recovery')}
                    className="text-[11px] text-blue-600 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <span>
              {mode === 'login' && 'Iniciar Sesión'}
              {mode === 'register' && 'Crear Cuenta'}
              {mode === 'recovery' && 'Enviar Correo de Recuperación'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Selector de modo */}
        <div className="text-center text-xs text-slate-500 pt-1">
          {mode === 'login' ? (
            <div>
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-blue-600 font-semibold hover:underline"
              >
                Regístrate aquí
              </button>
            </div>
          ) : (
            <div>
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-blue-600 font-semibold hover:underline"
              >
                Inicia sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
