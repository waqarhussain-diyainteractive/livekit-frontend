export const WelcomeView = ({
  startButtonText,
  welcomeNote,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & { startButtonText: string; welcomeNote: string; onStartCall: () => void; }) => {
  return (
    <div
      ref={ref}
      className="fixed inset-0 h-full w-full bg-[#edf5fa] flex flex-col items-center justify-center px-4"
    >
      <section className="relative z-10 flex flex-col items-center justify-center text-center max-w-lg bg-white p-10 rounded-[2rem] shadow-xl border border-gray-100">
        <img 
              src="https://customer.health4travel.com/static/media/h4tLogo.3b3f9bb3bc531faa471910633d743d52.svg" 
              alt="Health4Travel Logo" 
              className="h-13 mb-6" 
            />
        <h1 className="text-2xl font-bold text-[#183a59] mb-3">
          Smart Clinic Assistant
        </h1>
        
        <p className="text-[15px] leading-relaxed text-gray-600 mb-8">
          {welcomeNote}
        </p>

        <button 
          onClick={onStartCall} 
          className="bg-[#183a59] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#112940] hover:scale-105 transition-all shadow-lg shadow-[#183a59]/20 flex items-center gap-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 01-7.5 0V4.5z" /><path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.854v2.146h2.25a.75.75 0 010 1.5h-6a.75.75 0 010-1.5h2.25v-2.146a6.751 6.751 0 01-6-6.854v-1.5a.75.75 0 01.75-.75z" /></svg>
          {startButtonText}
        </button>
      </section>
    </div>
  );
};