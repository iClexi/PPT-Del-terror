import React from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { PrintButton } from './PrintButton';

interface PrivacyProps {
  onBack: () => void;
  onTerms: () => void;
}

const SECTIONS: Array<{ id: string; title: string; body: React.ReactNode }> = [
  {
    id: 'responsable',
    title: '1. Responsable del tratamiento',
    body: (
      <p>
        El responsable del tratamiento de tus datos es el equipo de iClexi
        (<a className="text-retro-accent underline" href="mailto:security@iclexi.tech">security@iclexi.tech</a>).
        Tratamos tus datos de forma proporcional al servicio prestado.
      </p>
    ),
  },
  {
    id: 'datos',
    title: '2. Datos que recopilamos',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Nombre de jugador y contraseña (hash bcrypt, nunca en texto plano).</li>
        <li>Puntuaciones, partidas jugadas y victorias.</li>
        <li>Datos técnicos de telemetría: IP, user-agent, idioma, zona horaria, viewport.</li>
        <li>Eventos de teclado/ratón sólo dentro del propio juego, para detección de bots.</li>
      </ul>
    ),
  },
  {
    id: 'finalidad',
    title: '3. Finalidades',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Autenticarte y mantener tu sesión.</li>
        <li>Generar el ranking público y tu mejor marca.</li>
        <li>Detectar abuso, fraude o automatización.</li>
        <li>Métricas técnicas de operación del Servicio.</li>
      </ul>
    ),
  },
  {
    id: 'base-legal',
    title: '4. Base legal',
    body: (
      <p>
        Tratamos tus datos sobre la base de tu consentimiento al registrarte, la
        ejecución del servicio solicitado y nuestro interés legítimo en proteger la
        plataforma frente a abusos.
      </p>
    ),
  },
  {
    id: 'cookies',
    title: '5. Cookies y sesión',
    body: (
      <p>
        Usamos una única cookie HttpOnly llamada <code>ppt_terror_session</code> con
        un token firmado para mantener tu sesión iniciada. No usamos cookies
        publicitarias ni de tracking de terceros.
      </p>
    ),
  },
  {
    id: 'compartir',
    title: '6. Con quién compartimos',
    body: (
      <p>
        No vendemos ni cedemos tus datos. Sólo se exhibe públicamente tu nombre de
        jugador y tu puntuación dentro del leaderboard. Puede haber acceso técnico
        del administrador del sistema con fines de soporte.
      </p>
    ),
  },
  {
    id: 'retencion',
    title: '7. Plazo de conservación',
    body: (
      <p>
        Conservamos tu cuenta mientras esté activa. Los logs técnicos se conservan un
        máximo de 12 meses. Si solicitas la baja, eliminamos tus datos personales y
        conservamos sólo agregados anónimos.
      </p>
    ),
  },
  {
    id: 'derechos',
    title: '8. Tus derechos',
    body: (
      <p>
        Puedes solicitar acceso, rectificación, supresión, oposición y portabilidad
        de tus datos escribiendo a{' '}
        <a className="text-retro-accent underline" href="mailto:security@iclexi.tech">
          security@iclexi.tech
        </a>
        .
      </p>
    ),
  },
  {
    id: 'seguridad',
    title: '9. Medidas de seguridad',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Contraseñas con bcrypt (factor 12).</li>
        <li>Cookies HttpOnly + SameSite estricto.</li>
        <li>Cabeceras de seguridad (Helmet, CSP, frame-ancestors none).</li>
        <li>Rate-limit en endpoints de autenticación.</li>
        <li>Conexiones cifradas TLS (Cloudflare Tunnel).</li>
      </ul>
    ),
  },
  {
    id: 'menores',
    title: '10. Menores de edad',
    body: (
      <p>
        El Servicio no está dirigido a menores de 13 años. Si detectamos cuentas de
        menores sin consentimiento parental, las eliminaremos.
      </p>
    ),
  },
  {
    id: 'cambios',
    title: '11. Cambios en esta política',
    body: (
      <p>
        Podemos actualizar esta política. Las versiones futuras se publicarán aquí
        con su fecha de revisión.
      </p>
    ),
  },
  {
    id: 'contacto',
    title: '12. Contacto',
    body: (
      <p>
        Para ejercer tus derechos o resolver dudas, contáctanos en{' '}
        <a className="text-retro-accent underline" href="mailto:security@iclexi.tech">
          security@iclexi.tech
        </a>
        .
      </p>
    ),
  },
];

export const Privacy: React.FC<PrivacyProps> = ({ onBack, onTerms }) => {
  return (
    <div className="min-h-full w-full overflow-y-auto bg-slate-950 text-slate-200 py-6 px-3 sm:px-6">
      <a href="#main-privacy" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-retro-accent focus:text-black focus:px-3 focus:py-2 focus:rounded">
        Saltar al contenido
      </a>
      <main id="main-privacy" className="mx-auto max-w-3xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs text-retro-accent hover:text-white font-arcade"
          >
            <ArrowLeft size={14} />
            Volver
          </button>
          <PrintButton />
        </header>

        <div className="flex items-center gap-3 mb-2">
          <Lock className="text-retro-accent" size={28} />
          <h1 className="font-arcade text-xl sm:text-2xl text-white leading-relaxed">
            Política de Privacidad
          </h1>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Última actualización: 2026-05-11 · PPT del Terror
        </p>

        <nav aria-label="Índice" className="mb-8 rounded-md border border-slate-800 bg-slate-900/60 p-4 print:hidden">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Índice</p>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm text-slate-300 list-decimal pl-5">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a className="hover:text-retro-accent" href={`#${s.id}`}>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-6">
          {SECTIONS.map((s) => (
            <section
              key={s.id}
              id={s.id}
              className="scroll-mt-24 rounded-md border border-slate-800 bg-slate-900/40 p-4 sm:p-5"
            >
              <h2 className="font-arcade text-sm sm:text-base text-retro-accent mb-3 leading-relaxed">
                {s.title}
              </h2>
              <div className="text-sm sm:text-base text-slate-200 leading-relaxed">{s.body}</div>
            </section>
          ))}
        </div>

        <footer className="mt-10 mb-6 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <span>© {new Date().getFullYear()} PPT del Terror</span>
          <div className="flex gap-4">
            <button onClick={onTerms} className="text-retro-accent hover:text-white">
              Términos y Condiciones
            </button>
            <button onClick={onBack} className="text-retro-accent hover:text-white">
              Volver al inicio
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};
