
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BookOpen, Music, Loader2, Search, X, Compass, Volume2, 
  Pause, Sparkles, Menu, ZoomIn, ZoomOut, Type as TypeIcon,
  Gamepad2, Trophy, CheckCircle2, ImageIcon, Move, LogOut
} from 'lucide-react';
import { 
  fetchVerses, saveVerses, testDatabaseConnection, 
  BIBLE_BOOKS_MASTER, fetchHymns, supabase,
  getStoredMosaicImage, saveMosaicImage
} from './lib/supabase';
import { fetchChapter } from './services/bibleService';
import { generateCrossword, generateBiblicalImage } from './services/geminiService';
import { GoogleGenAI, Modality } from "@google/genai";
import { decode, decodeAudioData } from './lib/audioUtils';

// --- Sub-componentes de UI ---

const LoadingOverlay = ({ message = "Carregando..." }) => (
  <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-pulse p-12 text-center">
    <div className="relative">
      <Loader2 className="animate-spin text-amber-500/20 w-16 h-16" />
      <Sparkles className="absolute inset-0 m-auto text-amber-500 w-6 h-6 animate-pulse" />
    </div>
    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500/30">{message}</span>
  </div>
);

const EmptyState = ({ icon: Icon, title }: { icon: any, title: string }) => (
  <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-20 space-y-4">
    <Icon size={48} className="text-amber-500" />
    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">{title}</span>
  </div>
);

// --- Componente: Mosaico Sagrado (Responsivo 5x5 com Cache em Banco) ---

const MosaicPuzzle = ({ level, onComplete, onExit }: { level: number, onComplete: () => void, onExit: () => void }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(true);
  
  const gridSize = 5; 
  const totalPieces = gridSize * gridSize;

  const [availablePieces, setAvailablePieces] = useState<number[]>([]);
  const [placedPieces, setPlacedPieces] = useState<(number | null)[]>(Array(totalPieces).fill(null));

  useEffect(() => {
    const initMosaic = async () => {
      setLoading(true);
      
      // 1. Verificar se a imagem já existe no banco de dados
      const stored = await getStoredMosaicImage(level);
      
      if (stored) {
        setTheme(stored.theme);
        setImageUrl(stored.image_data);
      } else {
        // 2. Se não existir, gerar nova imagem com Gemini
        const moments = [
          "A Criação da Luz", "Moisés e a Sarça Ardente", "Travessia do Mar Vermelho", 
          "Davi e o Gigante Golias", "A Arca de Noé", "A Estrela de Belém", 
          "Jesus acalmando a tempestade", "A Ressurreição de Cristo", 
          "Pentecostes", "A Nova Jerusalém", "Daniel na Cova dos Leões", 
          "A Multiplicação dos Pães", "Batismo de Jesus", "Muros de Jericó",
          "Elias no Carro de Fogo", "Escada de Jacó", "Cântico de Maria", 
          "Conversão de Paulo", "Sansão e as Colunas", "O Bom Pastor"
        ];
        const selectedMoment = moments[level % moments.length];
        setTheme(selectedMoment);
        
        const img = await generateBiblicalImage(selectedMoment);
        if (img) {
          setImageUrl(img);
          // 3. Salvar no banco para que outros usuários e futuras visitas não precisem gerar de novo
          await saveMosaicImage(level, selectedMoment, img);
        }
      }

      // Preparar peças do jogo
      const initial = Array.from({ length: totalPieces }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
      setAvailablePieces(initial);
      setPlacedPieces(Array(totalPieces).fill(null));
      setLoading(false);
    };
    initMosaic();
  }, [level]);

  const onDragStart = (e: React.DragEvent, pieceId: number) => {
    e.dataTransfer.setData("pieceId", pieceId.toString());
  };

  const onDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const pieceId = parseInt(e.dataTransfer.getData("pieceId"));
    if (pieceId === targetIndex + 1) {
      const newPlaced = [...placedPieces];
      newPlaced[targetIndex] = pieceId;
      setPlacedPieces(newPlaced);
      setAvailablePieces(prev => prev.filter(p => p !== pieceId));
      if (newPlaced.every((p, i) => p === i + 1)) setTimeout(onComplete, 1200);
    }
  };

  if (loading) return <LoadingOverlay message="Buscando Visão no Santuário..." />;
  if (!imageUrl) return <div className="text-center p-20 opacity-20">Erro ao carregar a visão divina.</div>;

  return (
    <div className="fixed inset-0 bg-[#020202] z-[100] flex flex-col items-center p-4 lg:p-12 animate-in fade-in duration-700 overflow-y-auto">
      <div className="w-full max-w-6xl flex flex-col items-center gap-8 mt-4 lg:mt-0 mb-32">
        <div className="text-center space-y-1">
          <h3 className="text-3xl lg:text-6xl font-black bible-text italic text-white uppercase tracking-tighter">Mosaico Sagrado</h3>
          <p className="text-[9px] lg:text-[11px] text-amber-500 font-black uppercase tracking-[0.4em]">{theme} • Nível {level}</p>
        </div>

        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-12 w-full">
          {/* Grid Principal */}
          <div className="relative shrink-0 w-full max-w-[320px] lg:max-w-[450px]">
            <div className="grid grid-cols-5 gap-0.5 bg-white/[0.03] p-1 rounded-2xl border border-white/10 shadow-2xl aspect-square">
              {placedPieces.map((pieceId, idx) => {
                const r = Math.floor(idx / gridSize);
                const c = idx % gridSize;
                const posX = (c / (gridSize - 1)) * 100;
                const posY = (r / (gridSize - 1)) * 100;
                return (
                  <div key={idx} onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, idx)}
                    className={`relative rounded-sm border transition-all duration-500 overflow-hidden ${pieceId ? 'border-transparent' : 'border-white/5 bg-black/40 flex items-center justify-center'}`}>
                    {pieceId ? (
                      <div className="w-full h-full" style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: '500% 500%', backgroundPosition: `${posX}% ${posY}%` }} />
                    ) : ( <Sparkles size={8} className="text-white/5" /> )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bandeja de Peças */}
          <div className="w-full max-w-[320px] lg:max-w-md bg-white/[0.02] backdrop-blur-3xl p-6 rounded-[2rem] border border-white/5 space-y-4">
             <div className="flex items-center justify-between text-[8px] font-black text-gray-500 uppercase tracking-widest px-1">
                <span className="flex items-center gap-2"><Move size={10} /> Peças</span>
                <span className="text-amber-500">{availablePieces.length} Restantes</span>
             </div>
             <div className="grid grid-cols-5 gap-1.5 overflow-y-auto max-h-[200px] lg:max-h-none p-1">
                {availablePieces.map((pieceId) => {
                  const r = Math.floor((pieceId - 1) / gridSize);
                  const c = (pieceId - 1) % gridSize;
                  const posX = (c / (gridSize - 1)) * 100;
                  const posY = (r / (gridSize - 1)) * 100;
                  return (
                    <div key={pieceId} draggable onDragStart={(e) => onDragStart(e, pieceId)}
                      className="aspect-square rounded-md border border-white/10 cursor-grab active:scale-95 transition-all overflow-hidden"
                      style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: '500% 500%', backgroundPosition: `${posX}% ${posY}%` }}
                    />
                  );
                })}
             </div>
             {availablePieces.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 animate-in fade-in duration-1000">
                   <CheckCircle2 size={32} className="text-green-500 mb-2" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white">Completado</span>
                </div>
             )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 left-0 right-0 flex justify-center z-[110] px-6">
        <button onClick={onExit}
          className="group flex items-center gap-4 bg-black/90 hover:bg-black backdrop-blur-2xl px-10 py-5 rounded-full border border-white/10 shadow-2xl transition-all active:scale-95"
        >
          <LogOut size={20} className="text-amber-500" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Sair do Mosaico</span>
        </button>
      </div>
    </div>
  );
};

// --- Componente: Palavras Cruzadas (Sem alterações, mantido para integridade) ---
const CrosswordGame = ({ level, onComplete }: { level: number, onComplete: () => void }) => {
  const [puzzle, setPuzzle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ r: number, c: number } | null>(null);

  useEffect(() => {
    const loadPuzzle = async () => {
      setLoading(true);
      const data = await generateCrossword(level);
      if (data) {
        setPuzzle(data);
        setUserGrid(Array(12).fill(null).map(() => Array(12).fill('')));
      }
      setLoading(false);
    };
    loadPuzzle();
  }, [level]);

  const handleCellInput = (r: number, c: number, val: string) => {
    const newGrid = [...userGrid];
    newGrid[r][c] = val.toUpperCase().slice(0, 1);
    setUserGrid(newGrid);
    if (!puzzle) return;
    let allCorrect = true;
    puzzle.words.forEach((w: any) => {
      for (let i = 0; i < w.word.length; i++) {
        const row = w.direction === 'across' ? w.row : w.row + i;
        const col = w.direction === 'across' ? w.col + i : w.col;
        if (newGrid[row][col] !== w.word[i].toUpperCase()) allCorrect = false;
      }
    });
    if (allCorrect) onComplete();
  };

  if (loading) return <LoadingOverlay message="Desenhando o Pergaminho..." />;
  if (!puzzle) return <div className="text-center p-20 opacity-20">Falha ao carregar desafio.</div>;

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h3 className="text-4xl font-black bible-text italic text-white uppercase tracking-tighter">Cruzadinha</h3>
        <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.5em]">{puzzle.theme}</p>
      </div>
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        <div className="grid grid-cols-12 gap-1 bg-white/5 p-3 rounded-2xl border border-white/10 mx-auto">
          {userGrid.map((row, r) => row.map((cell, c) => {
            const isWordCell = puzzle.words.some((w: any) => {
              if (w.direction === 'across') return r === w.row && c >= w.col && c < w.col + w.word.length;
              return c === w.col && r === w.row + (r - w.row) && r >= w.row && r < w.row + w.word.length;
            });
            if (!isWordCell) return <div key={`${r}-${c}`} className="w-5 h-5 lg:w-8 lg:h-8 rounded-sm bg-black/40" />;
            return (
              <input key={`${r}-${c}`} type="text" maxLength={1} value={userGrid[r][c]}
                onChange={(e) => handleCellInput(r, c, e.target.value)} onFocus={() => setSelectedCell({ r, c })}
                className={`w-5 h-5 lg:w-8 lg:h-8 rounded-sm text-center font-black uppercase outline-none text-[10px] lg:text-base transition-all ${selectedCell?.r === r && selectedCell?.c === c ? 'bg-amber-600 text-black' : 'bg-white/5 text-white'}`}
              />
            );
          }))}
        </div>
        <div className="flex-1 space-y-6 w-full px-4">
          {['across', 'down'].map(dir => (
            <div key={dir} className="space-y-2">
              <h4 className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{dir === 'across' ? 'Horizontal' : 'Vertical'}</h4>
              {puzzle.words.filter((w: any) => w.direction === dir).map((w: any, i: number) => (
                <div key={i} className="text-[10px] text-gray-500 bg-white/[0.03] p-3 rounded-lg border border-white/5">{w.clue}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bible' | 'harpa' | 'games'>('bible');
  const [gamesSubTab, setGamesSubTab] = useState<'mosaic' | 'crossword'>('mosaic');
  const [isMosaicActive, setIsMosaicActive] = useState(false);
  const [testamentFilter, setTestamentFilter] = useState<'Todos' | 'Velho' | 'Novo'>('Todos');
  const [currentBook, setCurrentBook] = useState('Salmos');
  const [currentChapter, setCurrentChapter] = useState(23);
  
  const [verses, setVerses] = useState<any[]>([]);
  const [hymns, setHymns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hymnSearch, setHymnSearch] = useState('');
  const [selectedHymn, setSelectedHymn] = useState<any | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<any | null>(null);
  const [fontScale, setFontScale] = useState(1.0);

  const [currentGameLevel, setCurrentGameLevel] = useState(1);
  const [currentMosaicLevel, setCurrentMosaicLevel] = useState(1);
  const [completedCrosswords, setCompletedCrosswords] = useState<number[]>([]);
  const [completedMosaics, setCompletedMosaics] = useState<number[]>([]);
  const [showLevelComplete, setShowLevelComplete] = useState(false);

  const [isReading, setIsReading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const init = async () => {
      const test = await testDatabaseConnection();
      if (test.success) loadBibleContent();
      const savedCross = localStorage.getItem('agape_cross_v1');
      const savedMosaic = localStorage.getItem('agape_mosaic_v1');
      if (savedCross) setCompletedCrosswords(JSON.parse(savedCross));
      if (savedMosaic) setCompletedMosaics(JSON.parse(savedMosaic));
    };
    init();
  }, []);

  useEffect(() => {
    if (activeTab === 'bible') loadBibleContent();
    if (activeTab === 'harpa') loadHymns();
  }, [currentBook, currentChapter, activeTab, hymnSearch]);

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
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadHymns = async () => {
    const data = await fetchHymns(hymnSearch);
    setHymns(data);
  };

  const playAudio = async () => {
    if (isReading) { audioContextRef.current?.close(); setIsReading(false); return; }
    setIsReading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Leitura de ${currentBook} ${currentChapter}. ${verses.map(v => v.text).join(' ')}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });
      const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioContextRef.current = ctx;
        const buffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsReading(false);
        source.start();
      }
    } catch (e) { setIsReading(false); }
  };

  const NavItem = ({ id, label, icon: Icon, active, onClick }: any) => (
    <button onClick={onClick} className={`w-full flex items-center gap-5 p-6 transition-all border-b border-white/[0.03] ${active ? 'bg-amber-600 text-black' : 'text-gray-500 hover:text-white bg-transparent'}`}>
      <Icon size={24} className={active ? 'text-black' : 'text-amber-500'} />
      <span className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
  );

  const filteredBooks = useMemo(() => BIBLE_BOOKS_MASTER.filter(b => testamentFilter === 'Todos' || b.testament === testamentFilter), [testamentFilter]);

  return (
    <div className="flex h-screen w-full bg-[#020202] text-[#e5e5e5] font-sans overflow-hidden">
      
      {/* SIDEBAR UNIFICADA */}
      {!isMosaicActive && (
        <aside className={`fixed inset-y-0 left-0 z-50 w-80 lg:w-96 bg-[#080808] border-r border-white/5 transition-transform duration-500 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-10 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4">
                <Compass className="w-8 h-8 text-amber-500" />
                <h1 className="text-sm font-black tracking-[0.5em] text-white">ÁGAPE</h1>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-500"><X size={24} /></button>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
               <div className="shrink-0 bg-black/40">
                  <NavItem id="bible" label="Escrituras" icon={BookOpen} active={activeTab === 'bible'} onClick={() => setActiveTab('bible')} />
                  <NavItem id="games" label="Jornada" icon={Gamepad2} active={activeTab === 'games'} onClick={() => setActiveTab('games')} />
                  <NavItem id="harpa" label="Louvor" icon={Music} active={activeTab === 'harpa'} onClick={() => setActiveTab('harpa')} />
               </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/10">
                  {activeTab === 'bible' && (
                    <div className="p-4 space-y-4">
                      <div className="flex justify-between px-4 sticky top-0 bg-[#080808] py-3 z-10 border-b border-white/5">
                        {['Todos', 'Velho', 'Novo'].map(t => (
                          <button key={t} onClick={() => setTestamentFilter(t as any)} className={`text-[9px] font-black uppercase tracking-widest ${testamentFilter === t ? 'text-amber-500 border-b border-amber-500 pb-1' : 'text-gray-600'}`}>{t}</button>
                        ))}
                      </div>
                      {filteredBooks.map(book => (
                        <button key={book.name} onClick={() => { setCurrentBook(book.name); setCurrentChapter(1); setIsSidebarOpen(false); }} className={`w-full text-left py-4 px-6 rounded-2xl flex items-center justify-between group ${currentBook === book.name ? 'bg-white/[0.03] text-white' : 'text-gray-500'}`}>
                          <span className="bible-text italic truncate text-2xl">{book.name}</span>
                          {currentBook === book.name && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                        </button>
                      ))}
                    </div>
                  )}
                  {activeTab === 'games' && (
                    <div className="p-8 space-y-8">
                      <div className="flex flex-col gap-2">
                        <button onClick={() => setGamesSubTab('mosaic')} className={`w-full py-5 rounded-2xl flex items-center gap-4 px-6 transition-all ${gamesSubTab === 'mosaic' ? 'bg-amber-600/10 text-amber-500' : 'bg-white/5 text-gray-500'}`}>
                          <ImageIcon size={20} /><span className="text-[10px] font-black uppercase">Mosaicos</span>
                        </button>
                        <button onClick={() => setGamesSubTab('crossword')} className={`w-full py-5 rounded-2xl flex items-center gap-4 px-6 transition-all ${gamesSubTab === 'crossword' ? 'bg-amber-600/10 text-amber-500' : 'bg-white/5 text-gray-500'}`}>
                          <TypeIcon size={20} /><span className="text-[10px] font-black uppercase">Cruzadas</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {Array.from({ length: 60 }, (_, i) => i + 1).map(lv => {
                          const isComp = (gamesSubTab === 'mosaic' ? completedMosaics : completedCrosswords).includes(lv);
                          const isAct = (gamesSubTab === 'mosaic' ? currentMosaicLevel : currentGameLevel) === lv;
                          return (
                            <button key={lv} onClick={() => { if (gamesSubTab === 'mosaic') { setCurrentMosaicLevel(lv); setIsMosaicActive(true); } else setCurrentGameLevel(lv); setIsSidebarOpen(false); }}
                              className={`aspect-square rounded-xl text-[10px] font-black flex items-center justify-center ${isAct ? 'bg-amber-600 text-black' : isComp ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-gray-600'}`}>
                              {lv}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {activeTab === 'harpa' && (
                    <div className="p-4 space-y-6">
                      <div className="sticky top-0 bg-[#080808] pb-4 z-10 border-b border-white/5 px-2">
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                          <input type="text" placeholder="Hino..." value={hymnSearch} onChange={e => setHymnSearch(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs font-bold outline-none focus:border-amber-500/30 text-white" />
                        </div>
                      </div>
                      {hymns.map(h => (
                        <button key={h.number} onClick={() => { setSelectedHymn(h); setIsSidebarOpen(false); }} className={`w-full text-left p-5 rounded-2xl flex items-center gap-4 ${selectedHymn?.number === h.number ? 'bg-amber-500/10 text-amber-500' : 'text-gray-500'}`}>
                          <span className="text-[10px] font-black text-amber-500 w-8">{h.number}</span>
                          <span className="text-sm font-bold truncate">{h.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
               </div>
            </div>
          </div>
        </aside>
      )}

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {!isMosaicActive && (
          <header className="h-24 lg:h-32 glass border-b border-white/5 flex items-center justify-between px-6 lg:px-16 z-40">
            <div className="flex items-center gap-6">
                <button onClick={() => setIsSidebarOpen(true)} className="p-4 bg-white/5 rounded-2xl text-amber-500 lg:hidden"><Menu size={24} /></button>
                <h2 className="text-2xl lg:text-4xl font-black bible-text italic text-white uppercase tracking-tighter">
                  {activeTab === 'bible' ? <><span className="text-amber-500">{currentBook}</span> <span className="text-gray-700 font-light">/</span> {currentChapter}</> : activeTab === 'harpa' ? 'Harpa' : 'Jornada'}
                </h2>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex bg-white/5 p-1 rounded-xl">
                  <button onClick={() => setFontScale(s => Math.max(0.6, s-0.1))} className="p-2 text-gray-500"><ZoomOut size={18} /></button>
                  <button onClick={() => setFontScale(s => Math.min(2.5, s+0.1))} className="p-2 text-gray-500"><ZoomIn size={18} /></button>
                </div>
                {activeTab === 'bible' && (
                  <button onClick={playAudio} className={`p-4 rounded-2xl ${isReading ? 'bg-amber-600 text-black' : 'bg-white/5 text-amber-500'}`}><Volume2 size={24} /></button>
                )}
            </div>
          </header>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar">
           {loading ? <LoadingOverlay message="Buscando Visão no Santuário..." /> : (
             <div className={`${isMosaicActive ? '' : 'max-w-4xl mx-auto py-12 lg:py-24 px-6 pb-40'}`}>
                {activeTab === 'bible' ? (
                   <div className="space-y-10">
                     {verses.map((v) => (
                        <div key={v.verse} className="group relative py-6 px-8 rounded-[2rem] hover:bg-white/[0.02] transition-all">
                           <p className="bible-text font-light leading-[1.8] text-gray-400 group-hover:text-white" style={{ fontSize: `${28 * fontScale}px` }}>
                              <sup className="text-amber-500/40 font-black mr-6 italic">{v.verse}</sup>{v.text}
                           </p>
                        </div>
                     ))}
                   </div>
                ) : activeTab === 'harpa' ? (
                  selectedHymn ? (
                    <div className="space-y-16 animate-in slide-in-from-bottom-12 text-center">
                       <div className="space-y-4">
                          <h3 className="text-5xl lg:text-7xl font-black bible-text italic text-white uppercase tracking-tighter">{selectedHymn.title}</h3>
                          <p className="text-amber-500 font-black tracking-[0.8em] text-xs uppercase">HINO Nº {selectedHymn.number}</p>
                       </div>
                       <div className="bg-[#050505] rounded-[4rem] p-12 lg:p-20 border border-white/5 text-gray-300 italic text-2xl lg:text-3xl leading-[2.2] whitespace-pre-line" style={{ fontSize: `${24 * fontScale}px` }}>
                          {selectedHymn.lyrics}
                       </div>
                    </div>
                  ) : <EmptyState icon={Music} title="Harpa de Sião" />
                ) : (
                  gamesSubTab === 'mosaic' ? ( isMosaicActive && <MosaicPuzzle level={currentMosaicLevel} onComplete={() => setShowLevelComplete(true)} onExit={() => setIsMosaicActive(false)} /> ) 
                  : ( <CrosswordGame level={currentGameLevel} onComplete={() => setShowLevelComplete(true)} /> )
                )}
             </div>
           )}
        </div>

        {showLevelComplete && (
          <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-8 backdrop-blur-3xl animate-in zoom-in-95">
             <div className="w-full max-w-sm bg-[#0a0a0a] rounded-[4rem] border border-amber-500/30 p-16 text-center space-y-10">
                <div className="w-24 h-24 bg-amber-600 rounded-[3rem] mx-auto flex items-center justify-center text-black shadow-2xl animate-bounce"><Trophy size={48} /></div>
                <div className="space-y-2">
                   <h3 className="text-3xl font-black bible-text italic text-white uppercase tracking-tighter">Vitória!</h3>
                   <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Desafio Concluído</p>
                </div>
                <button onClick={() => { setShowLevelComplete(false); if (gamesSubTab === 'mosaic') { setCurrentMosaicLevel(prev => prev + 1); } else { setCurrentGameLevel(prev => prev + 1); } }}
                  className="w-full py-6 bg-white text-black rounded-3xl font-black uppercase text-[10px] tracking-[0.5em] hover:bg-amber-500 transition-all">AVANÇAR</button>
             </div>
          </div>
        )}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.1); border-radius: 10px; }
        .bible-text { font-family: 'Crimson Pro', serif; }
        .glass { background: rgba(2, 2, 2, 0.98); backdrop-filter: blur(60px); -webkit-backdrop-filter: blur(60px); }
        @media (max-width: 1024px) { .custom-scrollbar::-webkit-scrollbar { width: 0px; } }
      `}</style>
    </div>
  );
};

export default App;
