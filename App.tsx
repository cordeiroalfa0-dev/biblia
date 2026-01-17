
import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Music, Loader2, X, Compass, Sparkles, Menu, ZoomIn, ZoomOut, 
  Gamepad2, Trophy, Eye, Move, RefreshCw, Hammer, ScrollText, AlertCircle, Database, 
  Zap, Trash2, ChevronRight, ChevronLeft, Layers, CheckCircle2, Maximize2, Image as ImageIcon,
  Sparkle, Play, Wand2, Plus, AlertTriangle, Terminal, AlertOctagon, ArrowLeft, Check, Grid3X3,
  Box
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

const LoadingOverlay = ({ message = "Carregando..." }) => (
  <div className="flex-1 flex flex-col items-center justify-center gap-6 p-12 text-center">
    <Loader2 className="animate-spin text-amber-500 w-12 h-12" />
    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">{message}</span>
  </div>
);

// --- COMPONENTE DO QUEBRA-CABEÇA (MOSAICO) ATUALIZADO (5x5 + Bandeja) ---
const MosaicPuzzle = ({ imageData, theme, onBack }: { imageData: string, theme: string, onBack: () => void }) => {
  const size = 5; // 5x5 = 25 peças
  const totalPieces = size * size;
  
  // Peças que estão no tabuleiro (index do grid -> index da imagem)
  const [board, setBoard] = useState<(number | null)[]>(Array(totalPieces).fill(null));
  // Peças que ainda estão na bandeja
  const [tray, setTray] = useState<number[]>([]);
  // Peça selecionada na bandeja
  const [selectedPieceIdx, setSelectedPieceIdx] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    // Inicializa bandeja com as 25 peças embaralhadas
    const allPieces = Array.from({ length: totalPieces }, (_, i) => i);
    const shuffled = allPieces.sort(() => Math.random() - 0.5);
    setTray(shuffled);
    setBoard(Array(totalPieces).fill(null));
    setSolved(false);
  }, [imageData]);

  const placePieceOnBoard = (boardIndex: number) => {
    if (solved || selectedPieceIdx === null) return;
    
    const pieceId = tray[selectedPieceIdx];
    const newBoard = [...board];
    
    // Se o espaço já estiver ocupado, a peça antiga volta para a bandeja
    const existingPiece = newBoard[boardIndex];
    
    newBoard[boardIndex] = pieceId;
    setBoard(newBoard);
    
    // Remove da bandeja e opcionalmente adiciona a antiga
    const newTray = tray.filter((_, i) => i !== selectedPieceIdx);
    if (existingPiece !== null) {
      newTray.push(existingPiece);
    }
    
    setTray(newTray);
    setSelectedPieceIdx(null);
    
    // Verifica vitória
    if (newBoard.every((p, i) => p === i)) {
      setSolved(true);
    }
  };

  const returnToTray = (boardIndex: number) => {
    if (solved) return;
    const pieceId = board[boardIndex];
    if (pieceId === null) return;

    const newBoard = [...board];
    newBoard[boardIndex] = null;
    setBoard(newBoard);
    setTray(prev => [...prev, pieceId]);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-12 animate-in fade-in duration-700 pb-20">
      <div className="flex-1 space-y-8">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-3 text-amber-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all">
            <ArrowLeft size={16} /> Voltar à Galeria
          </button>
          {solved && (
            <div className="flex items-center gap-3 text-green-500 font-black uppercase text-xs tracking-widest animate-pulse">
              <CheckCircle2 size={20} /> Visão Consagrada
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-4xl lg:text-7xl font-black bible-text italic text-white uppercase tracking-tighter leading-none">
            {theme}
          </h3>
          <p className="text-[10px] text-amber-500/40 font-black uppercase tracking-[0.5em]">RECONSTRUA A REVELAÇÃO (25 PEÇAS)</p>
        </div>

        {/* TABULEIRO 5x5 */}
        <div className={`grid grid-cols-5 gap-1 bg-white/5 p-2 rounded-[2rem] border border-white/5 shadow-2xl aspect-square max-w-[600px] mx-auto xl:mx-0 transition-all ${solved ? 'gap-0 p-0 overflow-hidden ring-4 ring-amber-500/20' : ''}`}>
          {board.map((pieceId, i) => {
            if (pieceId === null) {
              return (
                <div 
                  key={i} 
                  onClick={() => placePieceOnBoard(i)}
                  className="aspect-square bg-[#0a0a0a] border border-white/5 rounded-lg flex items-center justify-center group cursor-pointer hover:bg-amber-500/5 transition-all"
                >
                  <Plus size={16} className="text-white/5 group-hover:text-amber-500/20" />
                </div>
              );
            }

            const row = Math.floor(pieceId / size);
            const col = pieceId % size;
            return (
              <div 
                key={i}
                onClick={() => returnToTray(i)}
                className={`aspect-square relative cursor-pointer transition-all duration-300 ${solved ? 'rounded-none' : 'rounded-lg hover:scale-[0.98]'}`}
                style={{
                  backgroundImage: `url(${imageData})`,
                  backgroundSize: `${size * 100}% ${size * 100}%`,
                  backgroundPosition: `${(col / (size - 1)) * 100}% ${(row / (size - 1)) * 100}%`
                }}
              />
            );
          })}
        </div>
      </div>

      {/* BANDEJA DE PEÇAS (ONDE ESCOLHE) */}
      <div className="w-full xl:w-96 space-y-6">
        <div className="bg-[#080808] p-8 rounded-[3rem] border border-white/5 shadow-2xl space-y-8 sticky top-8">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-amber-500 flex items-center gap-3">
              <Layers size={16} /> Relicário
            </h4>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{tray.length} Restantes</span>
          </div>

          <div className="grid grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
            {tray.length === 0 && !solved && (
              <div className="col-span-4 py-20 text-center opacity-20">
                <p className="text-[10px] font-black uppercase tracking-widest">Peças no Tabuleiro</p>
              </div>
            )}
            {tray.map((pieceId, i) => {
              const row = Math.floor(pieceId / size);
              const col = pieceId % size;
              return (
                <div 
                  key={i}
                  onClick={() => setSelectedPieceIdx(i)}
                  className={`aspect-square rounded-xl cursor-pointer transition-all duration-300 hover:scale-110 active:scale-90 border-2 ${selectedPieceIdx === i ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-110 z-10' : 'border-white/10 opacity-70 hover:opacity-100'}`}
                  style={{
                    backgroundImage: `url(${imageData})`,
                    backgroundSize: `${size * 100}% ${size * 100}%`,
                    backgroundPosition: `${(col / (size - 1)) * 100}% ${(row / (size - 1)) * 100}%`
                  }}
                />
              );
            })}
          </div>

          <div className="pt-4 border-t border-white/5">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 leading-relaxed">
              {selectedPieceIdx !== null 
                ? "Peça selecionada. Toque em um espaço vazio no tabuleiro."
                : "Selecione uma peça acima para começar a reconstrução."}
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

  const isCorrect = (r: number, c: number) => {
    const key = `${r}-${c}`;
    const userVal = userInputs[key];
    if (!userVal) return false;

    for (const w of puzzle.words) {
      const word = w.word.toUpperCase();
      for (let i = 0; i < word.length; i++) {
        const currR = w.direction === 'horizontal' ? w.row : w.row + i;
        const currC = w.direction === 'horizontal' ? w.col + i : w.col;
        if (currR === r && currC === c) {
          return word[i] === userVal;
        }
      }
    }
    return false;
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
          <h3 className="text-4xl lg:text-6xl font-black bible-text italic text-white leading-none uppercase tracking-tighter">
            {puzzle.theme}
          </h3>
          <p className="text-[10px] text-amber-500/40 font-black uppercase tracking-[0.5em]">ENIGMA SAGRADO</p>
        </div>

        <div className="grid grid-cols-12 gap-1 bg-white/5 p-4 rounded-[2.5rem] border border-white/5 shadow-2xl aspect-square max-w-[500px] mx-auto lg:mx-0">
          {Array(gridSize).fill(null).map((_, r) => (
            Array(gridSize).fill(null).map((_, c) => {
              const active = isCellActive(r, c);
              const correct = isCorrect(r, c);
              const key = `${r}-${c}`;
              
              return (
                <div key={key} className={`aspect-square rounded-lg flex items-center justify-center relative transition-all duration-500 ${active ? 'bg-[#0a0a0a] border border-white/10' : 'bg-transparent'}`}>
                  {active && (
                    <input 
                      maxLength={1}
                      value={userInputs[key] || ''}
                      onChange={(e) => handleInputChange(r, c, e.target.value)}
                      className={`w-full h-full bg-transparent text-center font-black text-lg outline-none uppercase transition-colors ${correct ? 'text-amber-500' : 'text-white/40 focus:text-white'}`}
                    />
                  )}
                  {puzzle.words.map((w: any, idx: number) => {
                    if (w.row === r && w.col === c) {
                      return <span key={idx} className="absolute top-0.5 left-1 text-[8px] font-black text-amber-500/30">{idx + 1}</span>;
                    }
                    return null;
                  })}
                </div>
              );
            })
          ))}
        </div>
      </div>

      <div className="w-full lg:w-96 space-y-8">
        <div className="bg-[#080808] p-10 rounded-[3rem] border border-white/5 shadow-2xl space-y-10">
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-amber-500 flex items-center gap-3">
              <ScrollText size={16} /> Horizontais
            </h4>
            <div className="space-y-4">
              {puzzle.words.filter((w: any) => w.direction === 'horizontal').map((w: any, i: number) => (
                <div key={i} className="group">
                  <p className="text-sm text-gray-400 group-hover:text-white transition-colors leading-relaxed">
                    <span className="font-black text-amber-500/40 mr-3">{puzzle.words.indexOf(w) + 1}.</span> {w.clue}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="h-px bg-white/5" />
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-amber-500 flex items-center gap-3">
              <Move size={16} /> Verticais
            </h4>
            <div className="space-y-4">
              {puzzle.words.filter((w: any) => w.direction === 'vertical').map((w: any, i: number) => (
                <div key={i} className="group">
                  <p className="text-sm text-gray-400 group-hover:text-white transition-colors leading-relaxed">
                    <span className="font-black text-amber-500/40 mr-3">{puzzle.words.indexOf(w) + 1}.</span> {w.clue}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-amber-600/10 p-8 rounded-[2rem] border border-amber-500/20 flex items-center gap-6">
           <Trophy className="text-amber-500 shrink-0" size={32} />
           <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/60 leading-relaxed">Complete as palavras para revelar o segredo do nível.</p>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE DO SANTUÁRIO ---
const SanctuaryManager = ({ type, storedLevels, onFinished }: { 
  type: 'images' | 'crossword', 
  storedLevels: number[], 
  onFinished: () => void 
}) => {
  const [curr, setCurr] = useState(1);
  const [proc, setProc] = useState(false);
  const [log, setLog] = useState<string[]>(["Santuário pronto para a consagração."]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [log]);

  const addLog = (msg: string) => setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 40)]);

  const start = async (forceAll: boolean = false) => {
    setProc(true);
    addLog("--- INICIANDO GRANDE OBRA ---");
    const all = Array.from({ length: 100 }, (_, i) => i + 1);
    const toGen = forceAll ? all : all.filter(l => !storedLevels.includes(l));
    
    for (const level of toGen) {
      setCurr(level);
      const theme = SACRED_MOMENTS[(level - 1) % SACRED_MOMENTS.length];
      addLog(`Manifestando visão ${level}/100: ${theme}...`);
      try {
        if (type === 'images') {
          const img = await generateBiblicalImage(theme);
          if (img) await saveMosaicImage(level, theme, img);
        } else {
          const puzzle = await generateCrossword(level, theme);
          if (puzzle) await saveCrossword(level, theme, puzzle);
        }
        addLog(`SUCESSO: Nível ${level} consagrado.`);
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
    <div className="max-w-4xl mx-auto py-12 lg:py-24 text-center space-y-12 animate-in fade-in relative">
      <button onClick={onFinished} disabled={proc} className="absolute -top-4 left-0 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 bg-white/5 py-3 px-6 rounded-xl hover:bg-white/10 disabled:opacity-20">
        <ArrowLeft size={16} /> Sair do Santuário
      </button>
      <div className="space-y-4 pt-10">
        <Hammer className={`w-20 h-20 text-amber-500 mx-auto ${proc ? 'animate-bounce' : ''}`} />
        <h3 className="text-5xl lg:text-7xl font-black bible-text italic text-white uppercase tracking-tighter leading-none">O Santuário</h3>
        <p className="text-[10px] text-amber-500 font-black uppercase tracking-[1em]">OFICINA DE CRIAÇÃO DIVINA</p>
      </div>
      <div className="bg-[#080808] p-10 lg:p-16 rounded-[4rem] border border-white/5 space-y-10 shadow-2xl relative overflow-hidden">
        {!proc ? (
          <div className="space-y-12">
            <div className="flex justify-center gap-16 text-gray-500">
               <div className="text-center">
                  <span className="block text-5xl font-black text-white">{storedLevels.length}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Consagrados</span>
               </div>
               <div className="text-center">
                  <span className="block text-5xl font-black text-amber-500/20">{100 - storedLevels.length}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Pendentes</span>
               </div>
            </div>
            <button onClick={() => start()} className="bg-amber-600 hover:bg-amber-500 text-black px-16 py-8 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.5em] transition-all shadow-2xl flex items-center gap-6 mx-auto active:scale-95">
              <Zap size={24} /> INICIAR GRANDE OBRA
            </button>
          </div>
        ) : (
          <div className="space-y-10 animate-in zoom-in-95">
             <div className="flex flex-col items-center gap-6">
                <div className="relative w-40 h-40 flex items-center justify-center">
                   <Loader2 className="w-full h-full text-amber-500/10 animate-spin absolute" />
                   <div className="text-center">
                      <span className="text-6xl font-black text-amber-500">{curr}</span>
                      <span className="block text-[10px] font-black text-amber-500/40 uppercase tracking-widest">NÍVEL</span>
                   </div>
                </div>
                <p className="text-white font-black text-2xl italic bible-text">{SACRED_MOMENTS[curr-1]}</p>
             </div>
             <div className="bg-black/80 p-8 rounded-[2.5rem] text-left font-mono text-[10px] text-white/30 space-y-3 h-64 overflow-y-auto border border-white/5" ref={scrollRef}>
                {log.map((l, i) => <div key={i} className="break-all">{">"} {l}</div>)}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const LevelsDashboard = ({ type, storedData, onPlay, onGenerateOne, onGenerateAll }: { 
  type: 'mosaic' | 'crossword', 
  storedData: any[], 
  onPlay: (level: number) => void,
  onGenerateOne: (level: number) => Promise<void>,
  onGenerateAll: () => void
}) => {
  const [genLv, setGenLv] = useState<number | null>(null);

  return (
    <div className="space-y-12 animate-in fade-in pb-40">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10 bg-[#080808] p-10 lg:p-16 rounded-[4rem] border border-white/5 shadow-2xl">
        <div className="space-y-3 text-center lg:text-left">
          <h3 className="text-4xl lg:text-6xl font-black bible-text italic text-white uppercase tracking-tighter">
            {type === 'mosaic' ? 'Galeria de Visões' : 'Enigmas de Fé'}
          </h3>
          <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.6em]">100 NÍVEIS DISPONÍVEIS</p>
        </div>
        <button onClick={onGenerateAll} className="bg-amber-600 hover:bg-amber-500 text-black px-12 py-6 rounded-3xl font-black uppercase text-xs tracking-[0.4em] transition-all shadow-2xl flex items-center gap-4">
          <Hammer size={20} /> O Santuário
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {SACRED_MOMENTS.map((theme, idx) => {
          const level = idx + 1;
          const hasData = storedData.find(d => d.level === level);
          const isProcessing = genLv === level;

          return (
            <div key={level} className="group flex flex-col bg-[#050505] rounded-[3rem] border border-white/5 overflow-hidden hover:border-amber-500/40 transition-all duration-500 h-[380px] shadow-2xl relative">
              <div className="absolute top-6 left-6 z-20 bg-black/80 px-4 py-2 rounded-xl border border-white/10">
                <span className="text-[11px] font-black text-amber-500">{level}</span>
              </div>
              <div className="h-44 w-full bg-black flex items-center justify-center relative overflow-hidden">
                {hasData?.image_data ? (
                  <img src={hasData.image_data} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100" />
                ) : type === 'crossword' && hasData ? (
                  <ScrollText size={56} className="text-amber-500/20" />
                ) : (
                  <div className="flex flex-col items-center gap-4 text-white/5">
                    {isProcessing ? <Loader2 size={56} className="animate-spin text-amber-500/20" /> : <ImageIcon size={56} />}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between -mt-10 relative z-10">
                <h4 className="text-xl font-black bible-text italic text-white uppercase tracking-tighter leading-tight line-clamp-2">{theme}</h4>
                <div className="pt-6">
                  {hasData ? (
                    <button onClick={() => onPlay(level)} className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-amber-600 transition-all">
                      <Play size={16} fill="currentColor" /> {type === 'mosaic' ? 'Montar' : 'Resolver'}
                    </button>
                  ) : (
                    <button 
                      disabled={isProcessing}
                      onClick={async () => {
                        setGenLv(level);
                        try { await onGenerateOne(level); } catch (e: any) { alert(e.message); }
                        setGenLv(null);
                      }}
                      className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all ${isProcessing ? 'bg-amber-900/40 text-amber-500 animate-pulse' : 'bg-amber-600 text-black hover:bg-amber-500'}`}
                    >
                      {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                      {isProcessing ? 'Consagrando...' : 'GERAR IA'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bible' | 'harpa' | 'games'>('bible');
  const [gamesSubTab, setGamesSubTab] = useState<'mosaic' | 'crossword' | 'sanctuary'>('mosaic');
  const [sanctuaryMode, setSanctuaryMode] = useState<'images' | 'crossword'>('images');
  const [isGameActive, setIsGameActive] = useState(false);
  const [currentBook, setCurrentBook] = useState('Salmos');
  const [currentChapter, setCurrentChapter] = useState(23);
  const [verses, setVerses] = useState<any[]>([]);
  const [hymns, setHymns] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [galleryCrosswords, setGalleryCrosswords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hymnSearch, setHymnSearch] = useState('');
  const [selectedHymn, setSelectedHymn] = useState<any | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  useEffect(() => {
    loadContent();
  }, [currentBook, currentChapter, activeTab, gamesSubTab, hymnSearch]);

  const loadContent = async () => {
    setLoading(true);
    if (activeTab === 'bible') {
      let data = await fetchVerses(currentBook, currentChapter);
      if (data.length === 0) {
        const remote = await fetchChapter(currentBook, currentChapter);
        if (remote.length) {
          await saveVerses(remote.map(v => ({ book_name: currentBook, chapter: currentChapter, verse: v.verse, text: v.text })));
          data = await fetchVerses(currentBook, currentChapter);
        }
      }
      setVerses(data);
    } else if (activeTab === 'harpa') {
      setHymns(await fetchHymns(hymnSearch));
    } else if (activeTab === 'games') {
      setGalleryImages(await fetchAllMosaicImages());
      setGalleryCrosswords(await fetchAllCrosswords());
    }
    setLoading(false);
  };

  const generateSingleImage = async (level: number) => {
    const theme = SACRED_MOMENTS[(level - 1) % SACRED_MOMENTS.length];
    const img = await generateBiblicalImage(theme);
    if (img) {
      await saveMosaicImage(level, theme, img);
      await loadContent();
    }
  };

  const generateSingleCrossword = async (level: number) => {
    const theme = SACRED_MOMENTS[(level - 1) % SACRED_MOMENTS.length];
    const puzzle = await generateCrossword(level, theme);
    if (puzzle) {
      await saveCrossword(level, theme, puzzle);
      await loadContent();
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#020202] text-[#e5e5e5] font-sans overflow-hidden">
      {!isGameActive && (
        <aside className={`fixed inset-y-0 left-0 z-50 w-80 lg:w-96 bg-[#080808] border-r border-white/5 transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="p-10 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4">
                <Compass className="w-8 h-8 text-amber-500" />
                <h1 className="text-sm font-black tracking-[0.5em] text-white">ÁGAPE</h1>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
               <div className="space-y-4 mb-10">
                <button onClick={() => { setActiveTab('bible'); setIsGameActive(false); }} className={`w-full flex items-center gap-6 p-6 rounded-3xl ${activeTab === 'bible' && !isGameActive ? 'bg-amber-600 text-black shadow-2xl' : 'text-gray-500 hover:text-white'}`}>
                  <BookOpen size={24} /><span className="text-[11px] font-black uppercase tracking-widest">Escrituras</span>
                </button>
                <button onClick={() => { setActiveTab('games'); setIsGameActive(false); }} className={`w-full flex items-center gap-6 p-6 rounded-3xl ${activeTab === 'games' && !isGameActive ? 'bg-amber-600 text-black shadow-2xl' : 'text-gray-500 hover:text-white'}`}>
                  <Gamepad2 size={24} /><span className="text-[11px] font-black uppercase tracking-widest">Jornada</span>
                </button>
                <button onClick={() => { setActiveTab('harpa'); setIsGameActive(false); }} className={`w-full flex items-center gap-6 p-6 rounded-3xl ${activeTab === 'harpa' && !isGameActive ? 'bg-amber-600 text-black shadow-2xl' : 'text-gray-500 hover:text-white'}`}>
                  <Music size={24} /><span className="text-[11px] font-black uppercase tracking-widest">Louvor</span>
                </button>
              </div>

              {activeTab === 'bible' && BIBLE_BOOKS_MASTER.map(b => (
                <button key={b.name} onClick={() => { setCurrentBook(b.name); setCurrentChapter(1); setIsSidebarOpen(false); }} className={`w-full text-left py-4 px-6 rounded-2xl transition-all ${currentBook === b.name ? 'bg-white/5 text-white' : 'text-gray-500'}`}>
                  <span className="bible-text italic text-2xl">{b.name}</span>
                </button>
              ))}
              {activeTab === 'games' && (
                <div className="space-y-3">
                  <button onClick={() => { setGamesSubTab('mosaic'); setIsGameActive(false); }} className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest ${gamesSubTab === 'mosaic' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>Mosaicos</button>
                  <button onClick={() => { setGamesSubTab('crossword'); setIsGameActive(false); }} className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest ${gamesSubTab === 'crossword' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>Cruzadas</button>
                  <button onClick={() => { setGamesSubTab('sanctuary'); setIsGameActive(false); }} className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest ${gamesSubTab === 'sanctuary' ? 'text-amber-500 bg-amber-500/10' : 'text-amber-500/40'}`}><Hammer size={16} className="inline mr-2" /> Santuário</button>
                </div>
              )}
            </div>
          </div>
        </aside>
      )}

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {!isGameActive && (
          <header className="h-24 lg:h-32 flex items-center justify-between px-8 lg:px-16 z-40 border-b border-white/5">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-4 bg-white/5 rounded-2xl text-amber-500"><Menu size={24} /></button>
            <h2 className="text-2xl lg:text-4xl font-black bible-text italic text-white uppercase tracking-tighter">
              {activeTab === 'bible' ? <>{currentBook} {currentChapter}</> : activeTab === 'harpa' ? 'Harpa Cristã' : 'Jornada'}
            </h2>
          </header>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-16">
          {loading ? <LoadingOverlay message="Consagrando Ambiente..." /> : (
            <div className="max-w-6xl mx-auto">
              {isGameActive ? (
                gamesSubTab === 'mosaic' ? (
                  <MosaicPuzzle 
                    imageData={galleryImages.find(img => img.level === currentLevel)?.image_data || ''} 
                    theme={SACRED_MOMENTS[currentLevel-1]}
                    onBack={() => setIsGameActive(false)} 
                  />
                ) : (
                  <CrosswordBoard 
                    puzzle={galleryCrosswords.find(c => c.level === currentLevel)?.puzzle_data} 
                    onBack={() => setIsGameActive(false)} 
                  />
                )
              ) : (
                <>
                  {activeTab === 'bible' && verses.map(v => (
                    <div key={v.verse} className="py-8 px-10 rounded-[2.5rem] hover:bg-white/[0.02]">
                      <p className="bible-text font-light leading-[2.2] text-gray-300 text-2xl">
                        <sup className="text-amber-500/30 font-black mr-8 italic">{v.verse}</sup>{v.text}
                      </p>
                    </div>
                  ))}
                  {activeTab === 'harpa' && selectedHymn && (
                    <div className="text-center space-y-12">
                       <h3 className="text-5xl font-black bible-text italic text-white uppercase tracking-tighter">{selectedHymn.title}</h3>
                       <div className="bg-[#050505] p-16 rounded-[4rem] text-gray-300 italic text-2xl whitespace-pre-line leading-relaxed shadow-2xl border border-white/5">
                         {selectedHymn.lyrics}
                       </div>
                    </div>
                  )}
                  {activeTab === 'games' && (
                    gamesSubTab === 'mosaic' ? (
                      <LevelsDashboard 
                        type="mosaic" 
                        storedData={galleryImages} 
                        onPlay={(lv) => { setCurrentLevel(lv); setIsGameActive(true); }}
                        onGenerateOne={generateSingleImage}
                        onGenerateAll={() => { setSanctuaryMode('images'); setGamesSubTab('sanctuary'); }}
                      />
                    ) : gamesSubTab === 'crossword' ? (
                       <LevelsDashboard 
                        type="crossword" 
                        storedData={galleryCrosswords} 
                        onPlay={async (lv) => { 
                          const { data } = await supabase.from('crossword_puzzles').select('puzzle_data').eq('level', lv).single();
                          if (data) {
                            setGalleryCrosswords(prev => prev.map(p => p.level === lv ? { ...p, puzzle_data: data.puzzle_data } : p));
                            setCurrentLevel(lv); 
                            setIsGameActive(true); 
                          }
                        }}
                        onGenerateOne={generateSingleCrossword}
                        onGenerateAll={() => { setSanctuaryMode('crossword'); setGamesSubTab('sanctuary'); }}
                      />
                    ) : (
                      <SanctuaryManager 
                        type={sanctuaryMode} 
                        storedLevels={(sanctuaryMode === 'images' ? galleryImages : galleryCrosswords).map(g => g.level)} 
                        onFinished={() => setGamesSubTab(sanctuaryMode === 'images' ? 'mosaic' : 'crossword')} 
                      />
                    )
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
