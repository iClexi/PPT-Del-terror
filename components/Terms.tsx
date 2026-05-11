import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { PrintButton } from './PrintButton';

interface TermsProps {
  onBack: () => void;
  onPrivacy: () => void;
}

const SECTIONS: Array<{ id: string; title: string; body: React.ReactNode }> = [
  {
    id: 'aceptacion',
    title: '1. Aceptación de los términos',
    body: (
      <p>
        Al acceder, registrarte o utilizar PPT del Terror (en adelante, "el Servicio"),
        aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo,
        debes abstenerte de usar el Servicio.
      </p>
    ),
  },
  {
    id: 'descripcion',
    title: '2. Descripción del Servicio',
    body: (
      <p>
        El Servicio es un juego web educativo y recreativo con tabla de puntuaciones,
        cuentas de usuario y panel administrativo. Su propósito es entretenimiento y
        práctica de buenas prácticas de seguridad web.
      </p>
    ),
  },
  {
    id: 'elegibilidad',
    title: '3. Elegibilidad',
    body: (
      <p>
        Debes tener al menos 13 años o la edad mínima legal en tu jurisdicción para
        crear una cuenta. Si eres menor de edad, necesitas autorización de un padre,
        madre o tutor legal.
      </p>
    ),
  },
  {
    id: 'cuenta',
    title: '4. Cuenta de usuario',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Eres responsable de mantener tu contraseña segura.</li>
        <li>No compartas tu cuenta con terceros.</li>
        <li>Notifica de inmediato cualquier uso no autorizado.</li>
        <li>Podemos suspender cuentas que infrinjan estos términos.</li>
      </ul>
    ),
  },
  {
    id: 'uso-aceptable',
    title: '5. Uso aceptable',
    body: (
      <p>
        Te comprometes a no: (a) intentar comprometer la seguridad del Servicio,
        (b) automatizar puntuaciones con bots o scripts, (c) hacer ingeniería inversa
        del cliente con fines maliciosos, (d) realizar ataques DDoS, fuerza bruta o
        scraping abusivo, (e) suplantar a otros usuarios o al equipo administrativo.
      </p>
    ),
  },
  {
    id: 'puntuaciones',
    title: '6. Puntuaciones y leaderboard',
    body: (
      <p>
        Las puntuaciones se registran al finalizar cada partida. Nos reservamos el
        derecho a eliminar puntuaciones sospechosas de manipulación y a anonimizar
        nombres ofensivos en el ranking público.
      </p>
    ),
  },
  {
    id: 'contenido',
    title: '7. Nombres y contenido del usuario',
    body: (
      <p>
        El nombre de jugador debe ser respetuoso. Prohibido contenido obsceno,
        discriminatorio o que infrinja derechos de terceros. Podemos renombrar o
        eliminar cuentas que incumplan esta regla.
      </p>
    ),
  },
  {
    id: 'pi',
    title: '8. Propiedad intelectual',
    body: (
      <p>
        El código, diseño, marca y contenido del Servicio pertenecen a sus autores.
        Se concede una licencia limitada, no transferible y revocable para uso
        personal y no comercial.
      </p>
    ),
  },
  {
    id: 'disponibilidad',
    title: '9. Disponibilidad y mantenimiento',
    body: (
      <p>
        El Servicio se ofrece "tal cual" sin garantías de disponibilidad continua.
        Podemos realizar mantenimientos programados o de emergencia sin previo aviso.
      </p>
    ),
  },
  {
    id: 'limitacion',
    title: '10. Limitación de responsabilidad',
    body: (
      <p>
        En la máxima medida permitida por la ley, no seremos responsables por daños
        indirectos, lucro cesante, pérdida de datos o interrupciones derivadas del
        uso o imposibilidad de uso del Servicio.
      </p>
    ),
  },
  {
    id: 'terminacion',
    title: '11. Terminación',
    body: (
      <p>
        Puedes dejar de usar el Servicio en cualquier momento. Podemos suspender o
        cerrar cuentas que infrinjan estos términos, sin perjuicio de las acciones
        legales que correspondan.
      </p>
    ),
  },
  {
    id: 'cambios',
    title: '12. Cambios en los términos',
    body: (
      <p>
        Podemos actualizar estos términos. Los cambios entrarán en vigor al publicarse
        en esta página. El uso continuado del Servicio implica aceptación de la nueva
        versión.
      </p>
    ),
  },
  {
    id: 'ley',
    title: '13. Ley aplicable',
    body: (
      <p>
        Estos términos se rigen por las leyes de la República Dominicana. Cualquier
        disputa se someterá a los tribunales competentes de Santo Domingo.
      </p>
    ),
  },
  {
    id: 'contacto',
    title: '14. Contacto',
    body: (
      <p>
        Para consultas sobre estos términos, escribe a{' '}
        <a className="text-retro-accent underline" href="mailto:security@iclexi.tech">
          security@iclexi.tech
        </a>
        .
      </p>
    ),
  },
];

export const Terms: React.FC<TermsProps> = ({ onBack, onPrivacy }) => {
  return (
    <div className="min-h-full w-full overflow-y-auto bg-slate-950 text-slate-200 py-6 px-3 sm:px-6">
      <a href="#main-terms" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-retro-accent focus:text-black focus:px-3 focus:py-2 focus:rounded">
        Saltar al contenido
      </a>
      <main id="main-terms" className="mx-auto max-w-3xl">
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
          <ShieldCheck className="text-retro-accent" size={28} />
          <h1 className="font-arcade text-xl sm:text-2xl text-white leading-relaxed">
            Términos y Condiciones
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
            <button onClick={onPrivacy} className="text-retro-accent hover:text-white">
              Política de Privacidad
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
