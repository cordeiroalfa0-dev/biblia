
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Music, Loader2, BookMarked, 
  Search, X, Settings, ChevronRight, 
  ClipboardCheck, AlertCircle, Menu, ChevronLeft
} from 'lucide-react';
import { 
  fetchVerses, saveVerses,
  testDatabaseConnection, BIBLE_BOOKS_MASTER,
  fetchHymns, saveHymnsBulk, supabase
} from './lib/supabase';
import { fetchChapter } from './services/bibleService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bible' | 'harpa'>('bible');
  const [currentBook, setCurrentBook] = useState('Salmos');
  const [currentChapter, setCurrentChapter] = useState(23);
  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [hymns, setHymns] = useState<any[]>([]);
  const [hymnSearch, setHymnSearch] = useState('');
  const [selectedHymn, setSelectedHymn] = useState<any | null>(null);

  const [dbStatus, setDbStatus] = useState({ ok: false, tableHymns: true });
  const [selectedVerse, setSelectedVerse] = useState<any | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [manualJson, setManualJson] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (dbStatus.ok) {
      if (activeTab === 'bible') loadBibleContent();
      if (activeTab === 'harpa') loadHymns();
    }
  }, [currentBook, currentChapter, activeTab, hymnSearch, dbStatus.ok]);

  const init = async () => {
    const test = await testDatabaseConnection();
    let hymnsExist = true;
    const { error: hError } = await supabase.from('hymns').select('id').limit(1);
    if (hError && (hError.code === 'PGRST116' || hError.message.includes('does not exist'))) hymnsExist = false;
    
    setDbStatus({ ok: test.success, tableHymns: hymnsExist });
    if (test.success && activeTab === 'bible') loadBibleContent();
  };

  const loadBibleContent = async () => {
    setLoading(true);
    try {
      let data = await fetchVerses(currentBook, currentChapter);
      if (data.length === 0) {
        const chapterData = await fetchChapter(currentBook, currentChapter);
        if (chapterData?.length) {
          await saveVerses(chapterData.map(v => ({ book_name: currentBook, chapter: currentChapter, verse: v.verse, text: v.text })));
          data = await fetchVerses(currentBook, currentChapter);
        }
      }
      setVerses(data);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  const loadHymns = async () => {
    if (!dbStatus.tableHymns) return;
    const data = await fetchHymns(hymnSearch);
    setHymns(data);
  };

  const handleImport = async () => {
    if (!manualJson) return;
    setIsImporting(true);
    try {
      const data = JSON.parse(manualJson);
      const toSave: any[] = [];
      Object.keys(data).forEach(key => {
        if (key === "-1") return;
        const item = data[key];
        let lyrics = "";
        if (item.verses) {
          Object.keys(item.verses).sort((a,b) => parseInt(a)-parseInt(b)).forEach(vk => {
            lyrics += `${vk}. ${item.verses[vk].replace(/<br>/g, '\n')}\n\n`;
            if (vk === "1" && item.coro) lyrics += `CORO:\n${item.coro.replace(/<br>/g, '\n')}\n\n`;
          });
        }
        toSave.push({ number: parseInt(key), title: item.hino?.split(' - ')[1] || item.hino, lyrics });
      });
      await saveHymnsBulk(toSave);
      alert("Importação Concluída!");
      setManualJson('');
      loadHymns();
    } catch (e) { alert("Erro no JSON"); }
    finally { setIsImporting(false); }
  };

  return (
    <div className="flex h-screen w-full bg-[#050505] text-[#e5e5e5] font-sans overflow-hidden flex-col lg:flex-row">
      
      {/* Sidebar - Desktop (Hidden on Mobile) */}
      <aside className={`fixed inset-0 lg:relative lg:inset-auto z-50 w-full lg:w-72 flex flex-col border-r border-white/5 bg-[#080808] transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 lg:p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-700 rounded-xl flex items-center justify-center shadow-lg shadow-amber-900/20">
              <BookMarked className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-lg font-black italic bible-text text-amber-500 tracking-tighter uppercase">BÍBLIA ÁGAPE</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-500 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="px-4 space-y-2 mb-6 hidden lg:block">
          <button 
            onClick={() => setActiveTab('bible')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === 'bible' ? 'bg-amber-500/10 text-amber-500 shadow-inner' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] tracking-[0.2em] font-black uppercase">Escrituras</span>
          </button>
          <button 
            onClick={() => { setActiveTab('harpa'); setSelectedHymn(null); }}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === 'harpa' ? 'bg-amber-500/10 text-amber-500 shadow-inner' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Music className="w-5 h-5" />
            <span className="text-[10px] tracking-[0.2em] font-black uppercase">Harpa Cristã</span>
          </button>
        </nav>

        {/* List Content (Books or Hymns) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-2 space-y-1">
          {activeTab === 'bible' ? (
            <div className="space-y-4">
               <span className="text-[9px] font-black text-amber-500/40 uppercase tracking-widest block mb-4">Selecione o Livro</span>
               {BIBLE_BOOKS_MASTER.map(book => (
                <button 
                  key={book.name} 
                  onClick={() => { setCurrentBook(book.name); setCurrentChapter(1); setIsSidebarOpen(false); }}
                  className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${currentBook === book.name ? 'text-white bg-white/5' : 'text-gray-600 hover:text-gray-400'}`}
                >
                  <span className="bible-text italic truncate">{book.name}</span>
                  {currentBook === book.name && <ChevronRight size={14} className="text-amber-500" />}
                </button>
               ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="sticky top-0 bg-[#080808] pb-4 z-10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input 
                    type="text" 
                    placeholder="Número ou título..." 
                    value={hymnSearch}
                    onChange={e => setHymnSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-amber-500/30 transition-all text-white"
                  />
                </div>
              </div>
              {hymns.map(h => (
                <button 
                  key={h.number} 
                  onClick={() => { setSelectedHymn(h); setIsSidebarOpen(false); }}
                  className={`w-full text-left p-4 rounded-xl flex items-center gap-4 transition-all ${selectedHymn?.number === h.number ? 'bg-amber-500/5 text-amber-500' : 'text-gray-600 hover:bg-white/5 hover:text-gray-300'}`}
                >
                  <span className="text-xs font-black opacity-30 w-8">{h.number}</span>
                  <span className="text-sm font-bold truncate">{h.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Sidebar */}
        <div className="p-6 border-t border-white/5 flex items-center justify-between">
           <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-gray-600 hover:text-amber-500 transition-colors">
              <Settings size={20} />
           </button>
           <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-gray-700 uppercase">Versão 3.1</span>
              <span className="text-[9px] text-amber-500/50 font-bold tracking-widest">ÁGAPE</span>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-[#050505] overflow-hidden pb-20 lg:pb-0">
        
        {/* Mobile/Tab Header */}
        <header className="h-16 lg:h-24 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 bg-[#050505]/80 backdrop-blur-xl z-40 sticky top-0">
           <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-amber-500">
                <Menu size={24} />
              </button>
              <h2 className="text-lg lg:text-3xl font-black bible-text italic text-white uppercase tracking-tight flex items-center gap-2 lg:gap-4">
                {activeTab === 'bible' ? (
                  <>
                    <span className="text-amber-500 truncate max-w-[120px] md:max-w-none">{currentBook}</span>
                    <span className="text-gray-700">/</span>
                    <span className="text-white">{currentChapter}</span>
                  </>
                ) : (
                  <span className="text-amber-500">HARPA CRISTÃ</span>
                )}
              </h2>
           </div>

           {/* Chapter Selector (Horizontal Scroll) */}
           {activeTab === 'bible' && (
             <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-[120px] sm:max-w-[200px] md:max-w-md bg-white/5 p-1 rounded-full border border-white/5">
                {Array.from({length: BIBLE_BOOKS_MASTER.find(b => b.name === currentBook)?.chapters || 0}, (_, i) => i + 1).map(chap => (
                  <button 
                    key={chap} 
                    onClick={() => { setCurrentChapter(chap); setSelectedVerse(null); }}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full text-[10px] md:text-xs font-black transition-all flex items-center justify-center shrink-0 ${currentChapter === chap ? 'bg-amber-600 text-black shadow-lg shadow-amber-900/20' : 'text-gray-500 hover:text-white'}`}
                  >
                    {chap}
                  </button>
                ))}
             </div>
           )}
        </header>

        {/* Scrolling Text Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
           {activeTab === 'bible' ? (
             <div className="max-w-3xl mx-auto py-12 lg:py-24 px-6 lg:px-8 pb-32">
                {loading ? (
                  <div className="py-32 flex flex-col items-center gap-4 opacity-20">
                    <Loader2 className="animate-spin text-amber-600 w-12 h-12" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando Escrituras...</span>
                  </div>
                ) : (
                  <div className="space-y-8 lg:space-y-12">
                    {verses.map((v) => (
                      <div 
                        key={v.verse} 
                        onClick={() => setSelectedVerse(v)}
                        className={`group relative p-4 lg:p-6 rounded-2xl lg:rounded-[2.5rem] transition-all border border-transparent ${selectedVerse?.verse === v.verse ? 'bg-amber-500/5 border-amber-500/10 shadow-inner' : 'hover:bg-white/5'}`}
                      >
                         <p className="bible-text text-xl md:text-2xl lg:text-4xl font-light leading-relaxed text-gray-400 group-hover:text-white transition-colors">
                            <sup className="text-amber-600/40 font-black mr-4 lg:mr-8 text-xs lg:text-sm italic">{v.verse}</sup>
                            {v.text}
                         </p>
                      </div>
                    ))}
                  </div>
                )}
             </div>
           ) : (
             <div className="max-w-4xl mx-auto py-12 lg:py-24 px-6 lg:px-10 pb-32">
               {selectedHymn ? (
                 <div className="space-y-12 lg:space-y-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="text-center space-y-4">
                       <button onClick={() => setSelectedHymn(null)} className="lg:hidden mb-4 p-2 text-gray-500 flex items-center gap-2 mx-auto uppercase text-[10px] font-black tracking-widest">
                          <ChevronLeft size={16} /> Voltar para lista
                       </button>
                       <span className="text-amber-500/40 font-black text-[10px] lg:text-xs tracking-[0.5em] uppercase">Hino {selectedHymn.number}</span>
                       <h3 className="text-3xl md:text-5xl lg:text-8xl font-black bible-text italic text-white uppercase tracking-tighter leading-tight">{selectedHymn.title}</h3>
                       <div className="w-16 lg:w-32 h-px bg-amber-500/20 mx-auto mt-6"></div>
                    </div>
                    <div className="bg-[#080808] rounded-3xl lg:rounded-[5rem] p-8 lg:p-20 border border-white/5 shadow-2xl relative overflow-hidden">
                       <p className="bible-text text-xl md:text-3xl lg:text-5xl font-light leading-[1.7] lg:leading-[1.8] text-gray-300 whitespace-pre-line italic text-center">
                         {selectedHymn.lyrics}
                       </p>
                    </div>
                 </div>
               ) : (
                 <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-8 opacity-10">
                    <Music className="w-20 lg:w-32 h-20 lg:h-32 text-amber-500" />
                    <p className="text-[10px] lg:text-xs font-black tracking-[0.8em] uppercase">Selecione um hino para adorar</p>
                 </div>
               )}
             </div>
           )}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 h-20 bg-[#080808] border-t border-white/5 flex items-center justify-around px-6 z-50 backdrop-blur-xl bg-opacity-95">
           <button 
             onClick={() => { setActiveTab('bible'); setSelectedHymn(null); }}
             className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'bible' ? 'text-amber-500' : 'text-gray-600'}`}
           >
              <BookOpen size={20} />
              <span className="text-[8px] font-black uppercase tracking-widest">Bíblia</span>
           </button>
           <div className="w-px h-8 bg-white/5"></div>
           <button 
             onClick={() => setActiveTab('harpa')}
             className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'harpa' ? 'text-amber-500' : 'text-gray-600'}`}
           >
              <Music size={20} />
              <span className="text-[8px] font-black uppercase tracking-widest">Harpa</span>
           </button>
           <div className="w-px h-8 bg-white/5"></div>
           <button 
             onClick={() => setIsSidebarOpen(true)}
             className="flex flex-col items-center gap-1 text-gray-600"
           >
              <Menu size={20} />
              <span className="text-[8px] font-black uppercase tracking-widest">Acervo</span>
           </button>
        </nav>

        {/* Modal Configurações */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
             <div className="w-full max-w-2xl bg-[#0a0a0a] rounded-[2rem] lg:rounded-[3rem] border border-white/10 p-8 lg:p-12 space-y-8 relative shadow-2xl overflow-y-auto max-h-[90vh]">
                <button onClick={() => setShowSettings(false)} className="absolute top-6 lg:top-8 right-6 lg:right-8 text-gray-500 hover:text-white p-2">
                  <X size={24} />
                </button>
                <div className="space-y-2">
                   <h3 className="text-xl lg:text-2xl font-black bible-text italic text-amber-500 uppercase">Configurações Ágape</h3>
                   <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Importação de Dados Externos</p>
                </div>
                
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase ml-2">Importar Acervo Harpa (JSON)</label>
                      <textarea 
                        value={manualJson}
                        onChange={e => setManualJson(e.target.value)}
                        placeholder="Cole aqui o conteúdo do arquivo JSON..."
                        className="w-full h-32 lg:h-48 bg-black border border-white/5 rounded-2xl p-6 text-[11px] font-mono outline-none focus:border-amber-500/40 text-gray-400 custom-scrollbar"
                      />
                   </div>
                   <button 
                    onClick={handleImport}
                    disabled={isImporting || !manualJson}
                    className="w-full py-5 lg:py-6 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3 active:scale-95"
                   >
                      {isImporting ? <Loader2 className="animate-spin" /> : <ClipboardCheck size={16} />} 
                      {isImporting ? "PROCESSANDO..." : "INICIAR IMPORTAÇÃO"}
                   </button>
                </div>

                {!dbStatus.tableHymns && (
                   <div className="p-6 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-start gap-4 text-red-500">
                      <AlertCircle className="shrink-0 mt-1" />
                      <div className="flex-1">
                         <p className="text-[11px] font-black uppercase">Conexão Incompleta</p>
                         <p className="text-[10px] opacity-70 leading-relaxed mt-1">A base de dados da Harpa não foi detectada. Verifique as tabelas do seu Supabase.</p>
                      </div>
                   </div>
                )}
             </div>
          </div>
        )}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.15); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .bible-text { font-family: 'Crimson Pro', serif; }
        @media (max-width: 1024px) {
          .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        }
      `}</style>
    </div>
  );
};

export default App;
