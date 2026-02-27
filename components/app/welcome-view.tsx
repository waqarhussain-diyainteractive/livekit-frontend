import { Button } from '@/components/livekit/button';

function WelcomeImage() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-fg0 mb-4 size-16 text-white"
    >
      <path
        d="M15 24V40C15 40.7957 14.6839 41.5587 14.1213 42.1213C13.5587 42.6839 12.7956 43 12 43C11.2044 43 10.4413 42.6839 9.87868 42.1213C9.31607 41.5587 9 40.7957 9 40V24C9 23.2044 9.31607 22.4413 9.87868 21.8787C10.4413 21.3161 11.2044 21 12 21C12.7956 21 13.5587 21.3161 14.1213 21.8787C14.6839 22.4413 15 23.2044 15 24ZM22 5C21.2044 5 20.4413 5.31607 19.8787 5.87868C19.3161 6.44129 19 7.20435 19 8V56C19 56.7957 19.3161 57.5587 19.8787 58.1213C20.4413 58.6839 21.2044 59 22 59C22.7956 59 23.5587 58.6839 24.1213 58.1213C24.6839 57.5587 25 56.7957 25 56V8C25 7.20435 24.6839 6.44129 24.1213 5.87868C23.5587 5.31607 22.7956 5 22 5ZM32 13C31.2044 13 30.4413 13.3161 29.8787 13.8787C29.3161 14.4413 29 15.2044 29 16V48C29 48.7957 29.3161 49.5587 29.8787 50.1213C30.4413 50.6839 31.2044 51 32 51C32.7956 51 33.5587 50.6839 34.1213 50.1213C34.6839 49.5587 35 48.7957 35 48V16C35 15.2044 34.6839 14.4413 34.1213 13.8787C33.5587 13.3161 32.7956 13 32 13ZM42 21C41.2043 21 40.4413 21.3161 39.8787 21.8787C39.3161 22.4413 39 23.2044 39 24V40C39 40.7957 39.3161 41.5587 39.8787 42.1213C40.4413 42.6839 41.2043 43 42 43C42.7957 43 43.5587 42.6839 44.1213 42.1213C44.6839 41.5587 45 40.7957 45 40V24C45 23.2044 44.6839 22.4413 44.1213 21.8787C43.5587 21.3161 42.7957 21 42 21ZM52 17C51.2043 17 50.4413 17.3161 49.8787 17.8787C49.3161 18.4413 49 19.2044 49 20V44C49 44.7957 49.3161 45.5587 49.8787 46.1213C50.4413 46.6839 51.2043 47 52 47C52.7957 47 53.5587 46.6839 54.1213 46.1213C54.6839 45.5587 55 44.7957 55 44V20C55 19.2044 54.6839 18.4413 54.1213 17.8787C53.5587 17.3161 52.7957 17 52 17Z"
        fill="currentColor"
      />
    </svg>
  );
}

interface WelcomeViewProps {
  startButtonText: string;
  welcomeNote: string;
  clientName?: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  startButtonText,
  welcomeNote,
  clientName,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  const fullWelcomeNote = clientName ? `Hi ${clientName}! ${welcomeNote}` : welcomeNote;
  return (
    <div
      ref={ref}
      className="fixed inset-0 h-full w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/welcome-bg-4.jpg')" }}
    >
      {/* Semi-transparent overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20" />

      <section className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <WelcomeImage />

        <p className="font-mochibop-demo pt-1 text-2xl leading-7 font-medium text-white md:max-w-[80%] md:text-3xl lg:max-w-[40%]">
          {fullWelcomeNote}
        </p>

        {/* Custom styled button matching reference design */}
        <button onClick={onStartCall} className="group relative mt-6 cursor-pointer">
          {/* Outer ring/border - light purple */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-indigo-200 via-purple-200 to-indigo-300 shadow-lg"></div>

          {/* Inner button with blue gradient */}
          <div className="relative m-[6px] transform rounded-full bg-gradient-to-b from-cyan-400 via-sky-500 to-blue-600 px-14 py-3 shadow-inner transition-transform duration-200 group-hover:scale-[1.02] group-active:scale-[0.98]">
            <span className="font-beachday text-xl tracking-widest text-white drop-shadow-md">
              {startButtonText}
            </span>
          </div>
        </button>
      </section>

      {/* Bottom footer - made friendlier */}
      <div className="fixed bottom-4 left-0 z-10 flex w-full items-center justify-center px-4">
        <div className="rounded-full bg-white/80 px-5 py-2.5 shadow-lg backdrop-blur-sm dark:bg-slate-800/80">
          <p className="text-xs font-medium text-slate-600 md:text-sm dark:text-slate-300">
            ✨ Powered by Veritas Learning Circle • Built for Students like you 💜
          </p>
        </div>
      </div>
    </div>
  );
};
