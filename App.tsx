
import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Music, Loader2, X, Compass, Sparkles, Menu, ZoomIn, ZoomOut, 
  Gamepad2, Trophy, Eye, Move, RefreshCw, Hammer, ScrollText, AlertCircle, Database, 
  Zap, Trash2, ChevronRight, ChevronLeft, Layers, CheckCircle2, Maximize2, Image as ImageIcon,
  Sparkle, Play, Wand2, Plus, AlertTriangle, Terminal, AlertOctagon, ArrowLeft, Check, Grid3X3,
  Box, EyeOff, Search
} from 'lucide-react';
import { 
  fetchVerses, saveVerses, testDatabaseConnection, 
  BIBLE_BOOKS_MASTER, fetchHymns, supabase,
  getStoredMosaicImage, saveMosaicImage, fetchAllMosaicImages,
  getStoredCrossword, saveCrossword, fetchAllCrosswords,
  deleteMosaicImages, deleteCrosswordPuzzles
} from './lib/supabase';
import { fetchChapter } from './services/bibleService';
import { generateCrossword, generateBiblicalImage } from './services/geminiService';

const SACRED_MOMENTS = [
  "A Criação da Luz", "O Jardim do Éden", "A Arca de Noé", "A Torre de Babel", 
  "O Chamado de Abraão", "O Sacrifício de Isaque", "O Sonho de Jacó (Escada)", 
  "José e a Túnica Colorida", "José Governa o Egito", "Moisés e a Sarça Ardente",
  "As Pragas do Egito", "A Travessia do Mar Vermelho", "O Maná no Deserto", 
  "Os Dez Mandamentos", "O Tabernáculo Sagrado", "A Queda de Jericó", 
  "Gideão e os Trezentos", "Sansão e o Templo de Dagom", "Rute nos Campos de Boaz", 
  "O Chamado de Samuel", "Davi e Golias", "Davi e Jônatas", "O Reinado de Davi", 
  "A Sabedoria de Salomão", "O Templo de Salomão", "Elias e os Profetas de Baal", 
  "Elias no Carro de Fogo", "Eliseu e o Azeite da Viúva", "A Cura de Naamã", 
  "Jonas e o Peixe", "Daniel na Cova dos Leões", "Sadraque, Mesaque e Abede-Nego", 
  "Ester Rainha", "Neemias Reconstrói os Muros", "Jó e sua Paciência", 
  "Salmo 23: O Bom Pastor", "A Visão de Isaías", "Jeremias o Profeta Chorão", 
  "Ezequiel e os Ossos Secos", "A Estrela de Belém", "O Nascimento de Jesus", 
  "João Batista no Jordão", "O Batismo de Jesus", "A Tentação no Deserto", 
  "O Milagre em Caná", "O Sermão da Montanha", "O Pai Nosso", 
  "Jesus Acalma a Tempestade", "A Multiplicação dos Pães", "Jesus Anda sobre as Águas", 
  "A Transfiguração", "O Bom Samaritano", "O Filho Pródigo", "A Ressurreição de Lázaro", 
  "Zaqueu o Publicano", "A Entrada Truinfal", "A Limpeza do Templo", "A Última Ceia", 
  "O Getsêmani", "A Traição de Judas", "O Julgamento de Jesus", "A Coroa de Espinhos", 
  "A Crucificação", "O Sepulcro Vazio", "A Ressurreição", "Os Discípulos de Emaús", 
  "A Ascensão", "O Dia de Pentecostes", "O Coxo na Porta Formosa", "O Martírio de Estêvão", 
  "A Conversão de Paulo", "Pedro na Casa de Cornélio", "A Libertação de Pedro da Prisão", 
  "Paulo e Silas na Prisão", "O Discurso no Areópago", "O Naufrágio de Paulo", 
  "As Armas da Milícia Cristã", "O Hino ao Amor", "A Armadura de Deus", "O Fruto do Espírito", 
  "A Nuvem de Testemunhas", "A Fé que Vence o Mundo", "A Visão de João em Patmos", 
  "As Sete Cartas às Igrejas", "O Trono de Deus", "O Cordeiro e o Livro", "Os Quatro Cavaleiros", 
  "A Mulher e o Dragão", "A Queda de Babilônia", "O Cavalo Branco de Cristo", 
  "O Grande Trono Branco", "A Nova Jerusalém", "O Rio da Vida", "A Árvore da Vida", 
  "Maranata: Ora Vem Senhor Jesus", "O Sacrifício de Abel", "Enoque que Andou com Deus", 
  "Melquisedeque Rei de Salém", "O Voto de Ana", "A Glória da Segunda Casa"
];

// --- MODAL DE IMAGEM COMPLETA (LIGHTBOX) ---
const FullImageModal = ({ isOpen, image, title, onClose }: { isOpen: boolean, image: string, title: string, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12 bg-black/95 animate-in fade-in duration-300 backdrop-blur-xl">
      <button onClick={onClose} className="absolute top-8 right-8 text-white/40 hover:text-white transition-all bg-white/5 p-4 rounded-full">
        <X size={32} />
      </button>
      <div className="max-w-4xl w-full flex flex-col items-center gap-6 lg:gap-10">
        <div className="w-full aspect-square bg-[#050505] rounded-[2rem] lg:rounded-[4rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <img src={image} className="w-full h-full object-cover" alt={title} />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl lg:text-5xl font-black bible-text italic text-white uppercase tracking-tighter">{title}</h3>
          <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.6em]">A Glória Revelada</p>
        </div>
      </div>
    </div>
  );
};

const LoadingOverlay = ({ message = "Invocando Presença..." }) => (
  <div className="flex-1 flex flex-col items-center justify-center gap-6 p-12 text-center">
    <Loader2 className="animate-spin text-amber-500 w-12 h-12" />
    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">{message}</span>
  </div>
);

// --- COMPONENTE DO QUEBRA-CABEÇA (MOSAICO) 5x5 + BANDEJA ---
const MosaicPuzzle = ({ imageData, theme, onBack, onViewFull }: { imageData: string, theme: string, onBack: () => void, onViewFull: () => void }) => {
  const size = 5; 
  const totalPieces = size * size;
  
  const [board, setBoard] = useState<(number | null)[]>(Array(totalPieces).fill(null));
  const [tray, setTray] = useState<number[]>([]);
  const [selectedPieceIdx, setSelectedPieceIdx] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    const allPieces = Array.from({ length: totalPieces }, (_, i) => i);
    setTray([...allPieces].sort(() => Math.random() - 0.5));
    setBoard(Array(totalPieces).fill(null));
    setSolved(false);
  }, [imageData]);

  const handlePlace = (idx: number) => {
    if (solved || selectedPieceIdx === null) return;
    const pieceId = tray[selectedPieceIdx];
    const newBoard = [...board];
    const existing = newBoard[idx];
    
    newBoard[idx] = pieceId;
    setBoard(newBoard);
    
    const newTray = tray.filter((_, i) => i !== selectedPieceIdx);
    if (existing !== null) newTray.push(existing);
    
    setTray(newTray);
    setSelectedPieceIdx(null);
    if (newBoard.every((p, i) => p === i)) setSolved(true);
  };

  const handleReturn = (idx: number) => {
    if (solved || board[idx] === null) return;
    const pieceId = board[idx] as number;
    const newBoard = [...board];
    newBoard[idx] = null;
    setBoard(newBoard);
    setTray(prev => [...prev, pieceId]);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-12 animate-in fade-in duration-700 pb-20">
      <div className="flex-1 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <button onClick={onBack} className="flex items-center gap-3 text-amber-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all">
            <ArrowLeft size={16} /> Voltar à Galeria
          </button>
          <div className="flex items-center gap-4">
            <button 
              onClick={onViewFull}
              className="flex items-center gap-3 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest bg-white/5 text-white hover:bg-white/10 transition-all border border-white/5"
            >
              <Maximize2 size={16} /> Ver Imagem Completa
            </button>
            {solved && (
              <div className="flex items-center gap-3 text-green-500 font-black uppercase text-[10px] tracking-widest animate-pulse bg-green-500/10 px-6 py-3 rounded-xl border border-green-500/20">
                <CheckCircle2 size={16} /> Visão Restaurada
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-4xl lg:text-7xl font-black bible-text italic text-white uppercase tracking-tighter leading-tight">{theme}</h3>
          <p className="text-[10px] text-amber-500/40 font-black uppercase tracking-[0.5em]">TABULEIRO SAGRADO (25 PEÇAS)</p>
        </div>

        <div className="relative aspect-square max-w-[620px] mx-auto xl:mx-0">
          <div className={`grid grid-cols-5 gap-1 bg-[#080808] p-3 rounded-[2.5rem] border border-white/10 shadow-2xl h-full transition-all duration-700 ${solved ? 'gap-0 p-0 overflow-hidden ring-4 ring-amber-500/40' : ''}`}>
            {board.map((pieceId, i) => (
              <div 
                key={i} 
                onClick={() => pieceId === null ? handlePlace(i) : handleReturn(i)}
                className={`aspect-square relative cursor-pointer transition-all duration-300 ${pieceId === null ? 'bg-[#050505] border border-white/5 rounded-xl flex items-center justify-center hover:bg-amber-500/5' : 'rounded-lg hover:scale-[0.98]'}`}
                style={pieceId !== null ? {
                  backgroundImage: `url(${imageData})`,
                  backgroundSize: `${size * 100}% ${size * 100}%`,
                  backgroundPosition: `${((pieceId % size) / (size - 1)) * 100}% ${((Math.floor(pieceId / size)) / (size - 1)) * 100}%`
                } : {}}
              >
                {pieceId === null && <Plus size={20} className="text-white/5" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BANDEJA DE PEÇAS (ONDE ESCOLHE) */}
      <div className="w-full xl:w-[400px] space-y-6">
        <div className="bg-[#080808] p-8 rounded-[3rem] border border-white/5 shadow-2xl space-y-8 sticky top-8">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-amber-500 flex items-center gap-3">
              <Layers size={18} /> Relicário de Peças
            </h4>
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{tray.length} Restantes</span>
          </div>

          <div className="grid grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar min-h-[400px]">
            {tray.map((pId, i) => (
              <div 
                key={i}
                onClick={() => setSelectedPieceIdx(i)}
                className={`aspect-square rounded-xl cursor-pointer transition-all duration-300 hover:scale-110 border-2 ${selectedPieceIdx === i ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-110 z-10' : 'border-white/10 opacity-60 hover:opacity-100'}`}
                style={{
                  backgroundImage: `url(${imageData})`,
                  backgroundSize: `${size * 100}% ${size * 100}%`,
                  backgroundPosition: `${((pId % size) / (size - 1)) * 100}% ${((Math.floor(pId / size)) / (size - 1)) * 100}%`
                }}
              />
            ))}
            {tray.length === 0 && !solved && (
              <div className="col-span-4 py-20 text-center opacity-10">
                <Box size={48} className="mx-auto" />
                <p className="mt-4 text-[10px] uppercase font-black">Todas as peças posicionadas</p>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 text-center">
              {selectedPieceIdx !== null 
                ? "Peça selecionada! Toque em um vazio." 
                : "Selecione uma peça do relicário."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE DO TABULEIRO DE PALAVRAS CRUZADAS ---
const CrosswordBoard = ({ puzzle, onBack }: { puzzle: any, onBack: () => void }) => {
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const gridSize = 12;

  const handleInputChange = (r: number, c: number, val: string) => {
    const key = `${r}-${c}`;
    setUserInputs(prev => ({ ...prev, [key]: val.toUpperCase().slice(0, 1) }));
  };

  const isCellActive = (r: number, c: number) => {
    return puzzle.words.some((w: any) => {
      const word = w.word;
      for (let i = 0; i < word.length; i++) {
        const currR = w.direction === 'horizontal' ? w.row : w.row + i;
        const currC = w.direction === 'horizontal' ? w.col + i : w.col;
        if (currR === r && currC === c) return true;
      }
      return false;
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 animate-in slide-in-from-bottom-10 duration-700">
      <div className="flex-1 space-y-8">
        <button onClick={onBack} className="flex items-center gap-3 text-amber-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all">
          <ArrowLeft size={16} /> Voltar aos Enigmas
        </button>
        <div className="space-y-2">
          <h3 className="text-4xl lg:text-6xl font-black bible-text italic text-white leading-none uppercase tracking-tighter">{puzzle.theme}</h3>
          <p className="text-[10px] text-amber-500/40 font-black uppercase tracking-[0.5em]">DESAFIO DE SABEDORIA</p>
        </div>
        <div className="grid grid-cols-12 gap-1 bg-white/5 p-4 rounded-[2.5rem] border border-white/10 shadow-2xl aspect-square max-w-[500px] mx-auto lg:mx-0">
          {Array(gridSize).fill(null).map((_, r) => (
            Array(gridSize).fill(null).map((_, c) => {
              const active = isCellActive(r, c);
              const key = `${r}-${c}`;
              return (
                <div key={key} className={`aspect-square rounded-lg flex items-center justify-center relative transition-all duration-500 ${active ? 'bg-[#0a0a0a] border border-white/10' : 'bg-transparent'}`}>
                  {active && (
                    <input 
                      maxLength={1}
                      value={userInputs[key] || ''}
                      onChange={(e) => handleInputChange(r, c, e.target.value)}
                      className="w-full h-full bg-transparent text-center font-black text-xl outline-none uppercase text-white"
                    />
                  )}
                  {puzzle.words.map((w: any, idx: number) => (w.row === r && w.col === c) && <span key={idx} className="absolute top-0.5 left-1 text-[8px] font-black text-amber-500/30">{idx + 1}</span>)}
                </div>
              );
            })
          ))}
        </div>
      </div>
      <div className="w-full lg:w-96 space-y-8">
        <div className="bg-[#080808] p-10 rounded-[3rem] border border-white/5 shadow-2xl space-y-10">
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-amber-500 flex items-center gap-3"><ScrollText size={16} /> Horizontais</h4>
            <div className="space-y-4">
              {puzzle.words.filter((w: any) => w.direction === 'horizontal').map((w: any, i: number) => (
                <p key={i} className="text-sm text-gray-400 leading-relaxed"><span className="font-black text-amber-500/40 mr-3">{puzzle.words.indexOf(w) + 1}.</span> {w.clue}</p>
              ))}
            </div>
          </div>
          <div className="h-px bg-white/10" />
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-amber-500 flex items-center gap-3"><Move size={16} /> Verticais</h4>
            <div className="space-y-4">
              {puzzle.words.filter((w: any) => w.direction === 'vertical').map((w: any, i: number) => (
                <p key={i} className="text-sm text-gray-400 leading-relaxed"><span className="font-black text-amber-500/40 mr-3">{puzzle.words.indexOf(w) + 1}.</span> {w.clue}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SANTUÁRIO ---
const SanctuaryManager = ({ type, storedLevels, onFinished }: { 
  type: 'images' | 'crossword', 
  storedLevels: number[], 
  onFinished: () => void 
}) => {
  const [curr, setCurr] = useState(1);
  const [proc, setProc] = useState(false);
  const [log, setLog] = useState<string[]>(["Santuário pronto para a consagração."]);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [log]);
  const addLog = (msg: string) => setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 40)]);

  const start = async () => {
    setProc(true);
    addLog("--- INICIANDO GRANDE OBRA ---");
    const all = Array.from({ length: 100 }, (_, i) => i + 1);
    const toGen = all.filter(l => !storedLevels.includes(l));
    for (const level of toGen) {
      setCurr(level);
      const theme = SACRED_MOMENTS[(level - 1) % SACRED_MOMENTS.length];
      addLog(`Consagrando nível ${level}/100: ${theme}...`);
      try {
        if (type === 'images') {
          const img = await generateBiblicalImage(theme);
          if (img) await saveMosaicImage(level, theme, img);
        } else {
          const puzzle = await generateCrossword(level, theme);
          if (puzzle) await saveCrossword(level, theme, puzzle);
        }
        addLog(`SUCESSO: Nível ${level} concluído.`);
      } catch (e: any) { 
        addLog(`FALHA NO NÍVEL ${level}: ${e.message}`);
        if (e.message.includes('429')) break;
      }
      await new Promise(r => setTimeout(r, 1500));
    }
    setProc(false);
    onFinished();
  };

  return (
    <div className="max-w-4xl mx-auto py-24 text-center space-y-12 animate-in fade-in relative">
      <button onClick={onFinished} disabled={proc} className="absolute top-0 left-0 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 bg-white/5 py-3 px-6 rounded-xl hover:bg-white/10 disabled:opacity-20 transition-all">
        <ArrowLeft size={16} /> Voltar
      </button>
      <div className="space-y-4">
        <Hammer className={`w-20 h-20 text-amber-500 mx-auto ${proc ? 'animate-bounce' : ''}`} />
        <h3 className="text-5xl lg:text-7xl font-black bible-text italic text-white uppercase tracking-tighter leading-none">O Santuário</h3>
        <p className="text-[10px] text-amber-500/40 uppercase tracking-[1em]">Oficina do Criador</p>
      </div>
      <div className="bg-[#080808] p-16 rounded-[4rem] border border-white/5 space-y-10 shadow-2xl relative overflow-hidden">
        {!proc ? (
          <div className="space-y-12">
            <div className="flex justify-center gap-20">
               <div className="text-center"><span className="block text-6xl font-black text-white">{storedLevels.length}</span><span className="text-[10px] font-black uppercase opacity-40 tracking-widest">Prontos</span></div>
               <div className="text-center"><span className="block text-6xl font-black text-amber-500/20">{100 - storedLevels.length}</span><span className="text-[10px] font-black uppercase opacity-40 tracking-widest">A Gerar</span></div>
            </div>
            <button onClick={start} className="bg-amber-600 hover:bg-amber-500 text-black px-16 py-8 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.5em] transition-all flex items-center gap-6 mx-auto shadow-[0_20px_40px_rgba(217,119,6,0.2)]"><Zap size={24} /> INICIAR OBRA</button>
          </div>
        ) : (
          <div className="space-y-10">
             <div className="flex flex-col items-center gap-8">
                <div className="relative w-48 h-48 flex items-center justify-center">
                   <Loader2 className="w-full h-full text-amber-500/10 animate-spin absolute" />
                   <span className="text-7xl font-black text-amber-500">{curr}</span>
                </div>
                <p className="text-white font-black text-3xl italic bible-text">{SACRED_MOMENTS[curr-1]}</p>
             </div>
             <div className="bg-black/60 p-8 rounded-[2rem] text-left font-mono text-[11px] text-white/30 h-72 overflow-y-auto border border-white/5 custom-scrollbar" ref={scrollRef}>
                {log.map((l, i) => <div key={i} className="mb-2">{"#"} {l}</div>)}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- DASHBOARD DE NÍVEIS ---
const LevelsDashboard = ({ type, storedData, onPlay, onGenerateOne, onGenerateAll, onViewFull }: { 
  type: 'mosaic' | 'crossword', 
  storedData: any[], 
  onPlay: (level: number) => void,
  onGenerateOne: (level: number) => Promise<void>,
  onGenerateAll: () => void,
  onViewFull: (img: string, title: string) => void
}) => {
  const [genLv, setGenLv] = useState<number | null>(null);
  return (
    <div className="space-y-12 animate-in fade-in pb-40">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10 bg-[#080808] p-10 lg:p-16 rounded-[4rem] border border-white/5 shadow-2xl">
        <div className="space-y-3 text-center lg:text-left">
          <h3 className="text-4xl lg:text-6xl font-black bible-text italic text-white uppercase tracking-tighter leading-none">
            {type === 'mosaic' ? 'Galeria de Visões' : 'Enigmas Sagrados'}
          </h3>
          <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.6em]">100 MOMENTOS PARA REVELAR</p>
        </div>
        <button onClick={onGenerateAll} className="bg-amber-600 hover:bg-amber-500 text-black px-12 py-6 rounded-3xl font-black uppercase text-[10px] tracking-[0.4em] transition-all shadow-2xl flex items-center gap-4"><Hammer size={20} /> Acessar Santuário</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {SACRED_MOMENTS.map((theme, idx) => {
          const level = idx + 1;
          const hasData = storedData.find(d => d.level === level);
          const isProcessing = genLv === level;
          return (
            <div key={level} className="group flex flex-col bg-[#050505] rounded-[3rem] border border-white/5 overflow-hidden hover:border-amber-500/40 transition-all duration-500 h-[420px] shadow-2xl relative">
              <div className="absolute top-6 left-6 z-20 bg-black/80 px-4 py-2 rounded-xl border border-white/10 shadow-lg"><span className="text-[11px] font-black text-amber-500">{level}</span></div>
              
              {hasData?.image_data && (
                <button 
                  onClick={() => onViewFull(hasData.image_data, theme)}
                  className="absolute top-6 right-6 z-20 p-4 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black rounded-xl border border-amber-500/20 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                  title="Visualizar Imagem Completa"
                >
                  <Search size={18} />
                </button>
              )}

              <div className="h-48 w-full bg-black flex items-center justify-center relative overflow-hidden">
                {hasData?.image_data ? (
                  <img src={hasData.image_data} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100" />
                ) : type === 'crossword' && hasData ? (
                  <ScrollText size={64} className="text-amber-