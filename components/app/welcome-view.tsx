export const WelcomeView = ({
  startButtonText,
  welcomeNote,
  clientName,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & { startButtonText: string; welcomeNote: string; clientName?: string; onStartCall: () => void; }) => {
  const fullWelcomeNote = clientName ? `Hello, ${clientName}! ${welcomeNote}` : welcomeNote;
  
  return (
    <div
      ref={ref}
      className="fixed inset-0 h-full w-full bg-[#edf5fa] flex flex-col items-center justify-center px-4"
    >
      <section className="relative z-10 flex flex-col items-center justify-center text-center max-w-lg bg-white p-10 rounded-[2rem] shadow-xl border border-gray-100">
        
        <div className="bg-[#183a59] p-4 rounded-2xl shadow-lg mb-6">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-emerald-400">
             <path fillRule="evenodd" d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 17.25c1.74 0 3.354.536 4.688 1.44a.75.75 0 00.824 0A8.237 8.237 0 0116.25 17.25c1.74 0 3.354.536 4.688 1.44a.75.75 0 001-.707V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533.75.75 0 00-.75 0zM12 8.25a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5V9a.75.75 0 01.75-.75z" clipRule="evenodd" />
           </svg>
        </div>

        <h1 className="text-2xl font-bold text-[#183a59] mb-3">
          Smart Clinic Assistant
        </h1>
        
        <p className="text-[15px] leading-relaxed text-gray-600 mb-8">
          {fullWelcomeNote}
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