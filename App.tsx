
import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Music, Loader2, X, Compass, Menu, Gamepad2, Trophy, Eye, Move, Hammer, 
  ScrollText, Zap, Layers, CheckCircle2, Maximize2, Image as ImageIcon,
  Play, Wand2, Plus, ArrowLeft, Search, Download, ArrowRight, Box, EyeOff, Info,
  Check, Star, AlertCircle, RefreshCw, Sparkles
} from 'lucide-react';
import { 
  fetchVerses, saveVerses, BIBLE_BOOKS_MASTER, fetchHymns, supabase, saveHymns,
  saveMosaicImage, fetchAllMosaicImages, saveCrossword, fetchAllCrosswords
} from './lib/supabase';
import { fetchChapter } from './services/bibleService';
import { generateWordSearch, generateBiblicalImage, generateLevelMetadata } from './services/geminiService';
import { fetchAllHymnsFromGitHub } from './services/harpaGithubService';

// LISTA DOS 100 MOMENTOS BÍBLICOS (ORDEM CRONOLÓGICA)
const SACRED_MOMENTS = [
  "Criação do Mundo", "Jardim do Éden", "A Queda do Homem", "Caim e Abel", "Enoque e Deus", "A Arca de Noé", "O Dilúvio", "Arco-Íris da Aliança", "A Torre de Babel", "Chamado de Abrão",
  "Abrão e Ló", "A Promessa de Isaque", "Sodoma e Gomorra", "O Sacrifício de Isaque", "Rebeca no Poço", "Jacó e Esaú", "O Sonho de Jacó", "Jacó Luta com o Anjo", "José e a Túnica Colorida", "José no Egito",
  "Moisés no Nilo", "A Sarça Ardente", "As Dez Pragas", "A Travessia do Mar Vermelho", "O Maná no Deserto", "Os Dez Mandamentos", "O Bezerro de Ouro", "As Muralhas de Jericó", "Gideão e os 300", "Sansão e o Leão",
  "Rute e Noemi", "O Chamado de Samuel", "Davi Ungido", "Davi e Golias", "Davi e Jônatas", "A Arca em Jerusalém", "A Sabedoria de Salomão", "O Templo de Salomão", "Elias no Monte Carmelo", "Elias e a Carruagem de Fogo",
  "Eliseu e o Azeite da Viúva", "Naaman no Jordão", "Jonas e o Peixe", "Isaías e o Trono de Deus", "Jeremias e o Oleiro", "Ezequiel e os Ossos Secos", "Daniel na Cova dos Leões", "Daniel e a Estátua de Ouro", "Ester e o Rei", "Neemias e os Muros",
  "O Nascimento de Jesus", "A Estrela de Belém", "Jesus no Templo aos 12 Anos", "O Batismo no Jordão", "Tentação no Deserto", "O Primeiro Milagre em Caná", "O Sermão da Montanha", "A Pesca Maravilhosa", "Jesus Acalma a Tempestade", "A Cura do Cego de Nascença",
  "A Ressurreição de Lázaro", "A Transfiguração", "Zaqueu o Publicano", "A Entrada Triunfal", "A Última Ceia", "Getsêmani", "A Negação de Pedro", "O Caminho da Cruz", "A Crucificação", "O Sepulcro Vazio",
  "A Ressurreição de Cristo", "A Ascensão", "Pentecostes", "A Cura na Porta Formosa", "Estêvão o Primeiro Mártir", "A Conversão de Saulo", "Pedro e Cornélio", "Libertação de Pedro da Prisão", "A Visão de Paulo em Troas", "Paulo e Silas na Prisão",
  "Naufrágio de Paulo", "Paulo em Malta", "A Armadura de Deus", "O Hino ao Amor", "A Fé de Abraão (Hebreus)", "Nuvem de Testemunhas", "A Visão de João em Patmos", "O Cordeiro e o Livro", "As Sete Igrejas", "Os Quatro Cavaleiros",
  "A Mulher e o Dragão", "A Queda da Babilônia", "O Cavalo Branco de Cristo", "O Juízo Final", "A Nova Jerusalém", "O Rio da Vida", "O Alfa e o Ômega", "A Árvore da Vida", "A Ceia do Cordeiro", "Amém e Maranata"
];

// --- LIGHTBOX MODAL ---
const FullImageModal = ({ isOpen, image_data, theme, reference, description, onClose }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-10 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative max-w-7xl w-full h-full lg:h-auto lg:max-h-[90vh] bg-[#0a0a0a] rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_150px_rgba(0,0,0,1)] flex flex-col lg:flex-row">
        <button onClick={onClose} className="absolute top-6 right-6 lg:top-8 lg:right-8 z-50 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all border border-white/10"><X size={28} /></button>
        <div className="lg:w-1/2 h-2/3 lg:h-auto bg-black flex items-center justify-center overflow-hidden">
          <img src={image_data} alt={theme} className="w-full h-full object-cover" />
        </div>
        <div className="lg:w-1/2 p-10 lg:p-20 flex flex-col justify-center space-y-10 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <span className="text-amber-500 font-black text-xs uppercase tracking-[0.6em]">{reference || "Sagrada Escritura"}</span>
            <h3 className="text-4xl lg:text-7xl font-black bible-text italic text-white leading-none uppercase tracking-tighter">{theme}</h3>
          </div>
          <p className="text-white/50 text-xl lg:text-2xl leading-relaxed font-light italic">{description || "Um momento sagrado capturado em arte para sua meditação."}</p>
          <div className="pt-10 border-t border-white/5">
            <button onClick={() => {
              const link = document.createElement('a');
              link.href = image_data;
              link.download = `${theme}.png`;
              link.click();
            }} className="flex items-center gap-4 text-amber-500/60 hover:text-amber-500 font-black uppercase text-[10px] tracking-widest transition-all"><Download size={20} /> Guardar Arte Sagrada</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- QUEBRA-CABEÇA 5X5 COM RELICÁRIO (BANDEJA) ---
const MosaicPuzzle = ({ image_data, theme, reference, description, onBack, onComplete, onViewFull }: any) => {
  const size = 5;
  const total = size * size;
  const [board, setBoard] = useState<(number | null)[]>(Array(total).fill(null));
  const [tray, setTray] = useState<number[]>([]);
  const [selectedPieceIdx, setSelectedPieceIdx] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    const pieces = Array.from({ length: total }, (_, i) => i).sort(() => Math.random() - 0.5);
    setTray(pieces);
    setBoard(Array(total).fill(null));
    setSolved(false);
  }, [image_data]);

  const place = (gridIdx: number) => {
    if (solved || selectedPieceIdx === null) return;
    const pieceId = tray[selectedPieceIdx];
    const newBoard = [...board];
    const existing = newBoard[gridIdx];
    newBoard[gridIdx] = pieceId;
    setBoard(newBoard);
    
    // Remove da bandeja
    const newTray = tray.filter((_, i) => i !== selectedPieceIdx);
    // Se havia uma peça no lugar, volta para a bandeja
    if (existing !== null) newTray.push(existing);
    
    setTray(newTray);
    setSelectedPieceIdx(null);
    
    if (newBoard.every((p, i) => p === i)) {
      setSolved(true);
      onComplete();
    }
  };

  const remove = (gridIdx: number) => {
    if (solved || board[gridIdx] === null) return;
    const pieceId = board[gridIdx] as number;
    const newBoard = [...board];
    newBoard[gridIdx] = null;
    setBoard(newBoard);
    setTray(prev => [...prev, pieceId]);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-16 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto">
      <div className="flex-1 space-y-10">
        <div className="flex justify-between items-center">
          <button onClick={onBack} className="text-amber-500 font-black text-[10px] uppercase tracking-[0.4em] flex items-center gap-3 hover:text-white transition-all"><ArrowLeft size={20} /> Sair da Jornada</button>
          <button onClick={onViewFull} className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 transition-all flex items-center gap-3"><Maximize2 size={18} /> Visualizar Imagem</button>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-5xl lg:text-7xl font-black bible-text italic text-white uppercase tracking-tighter leading-none">{theme}</h3>
          <p className="text-[10px] text-amber-500/40 font-black uppercase tracking-[0.6em]">{reference}</p>
        </div>

        <div className={`grid grid-cols-5 gap-1 bg-[#080808] p-4 rounded-[3rem] border border-white/10 shadow-2xl aspect-square w-full max-w-[650px] transition-all duration-1000 ${solved ? 'gap-0 p-0 ring-8 ring-amber-500/20' : ''}`}>
          {board.map((pId, i) => (
            <div 
              key={i} onClick={() => pId === null ? place(i) : remove(i)}
              className={`aspect-square relative cursor-pointer transition-all duration-500 ${pId === null ? 'bg-[#050505] border border-white/5 rounded-2xl hover:bg-amber-500/5 flex items-center justify-center' : 'rounded-lg hover:brightness-125'}`}
              style={pId !== null ? { backgroundImage: `url(${image_data})`, backgroundSize: '500% 500%', backgroundPosition: `${((pId % size) / (size-1)) * 100}% ${((Math.floor(pId / size)) / (size-1)) * 100}%` } : {}}
            >{pId === null && <Plus size={24} className="text-white/5" />}</div>
          ))}
        </div>
      </div>

      <div className="w-full xl:w-[450px] space-y-8">
        <div className="bg-[#080808] p-12 rounded-[4rem] border border-white/10 shadow-2xl space-y-12 sticky top-10">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-[0.4em] text-amber-500 flex items-center gap-3"><Layers size={22} /> Relicário ({tray.length})</h4>
            {solved && <CheckCircle2 size={32} className="text-green-500 animate-bounce" />}
          </div>
          
          <div className="grid grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar min-h-[400px]">
            {tray.map((pId, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedPieceIdx(i)} 
                className={`aspect-square rounded-2xl cursor-pointer border-2 transition-all duration-300 ${selectedPieceIdx === i ? 'border-amber-500 scale-110 shadow-[0_0_30px_rgba(245,158,11,0.3)]' : 'border-white/5 opacity-50 hover:opacity-100'}`} 
                style={{ backgroundImage: `url(${image_data})`, backgroundSize: '500% 500%', backgroundPosition: `${((pId % size) / (size-1)) * 100}% ${((Math.floor(pId / size)) / (size-1)) * 100}%` }} 
              />
            ))}
          </div>

          <div className="pt-10 border-t border-white/5">
            <p className="text-sm text-white/40 italic leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- CAÇA-PALAVRAS EM GRADE 12X12 ---
const WordSearchGame = ({ puzzle, onBack, onComplete }: any) => {
  const gridSize = 12;
  const [grid, setGrid] = useState<string[][]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selection, setSelection] = useState<{r: number, c: number}[]>([]);
  const words = (puzzle?.words || []).map((w: string) => w.toUpperCase());

  useEffect(() => {
    const g = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
    const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    words.forEach((w: string) => {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        attempts++;
        const horiz = Math.random() > 0.5;
        const r = Math.floor(Math.random() * (horiz ? gridSize : gridSize - w.length));
        const c = Math.floor(Math.random() * (horiz ? gridSize - w.length : gridSize));
        
        let canPlace = true;
        for (let i = 0; i < w.length; i++) {
          const char = horiz ? g[r][c + i] : g[r + i][c];
          if (char !== '' && char !== w[i]) { canPlace = false; break; }
        }

        if (canPlace) {
          for (let i = 0; i < w.length; i++) {
            if (horiz) g[r][c + i] = w[i];
            else g[r + i][c] = w[i];
          }
          placed = true;
        }
      }
    });

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (g[r][c] === '') g[r][c] = abc[Math.floor(Math.random() * abc.length)];
      }
    }
    setGrid(g);
  }, [puzzle]);

  const select = (r: number, c: number) => {
    const isAlreadySelected = selection.some(s => s.r === r && s.c === c);
    if (isAlreadySelected) return;

    const newSelection = [...selection, {r, c}];
    setSelection(newSelection);
    
    const word = newSelection.map(s => grid[s.r][s.c]).join('');
    if (words.includes(word) && !foundWords.includes(word)) {
      setFoundWords([...foundWords, word]);
      setSelection([]);
      if (foundWords.length + 1 === words.length) onComplete();
    } else if (newSelection.length > 12) {
      setSelection([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-700 pb-20 flex flex-col xl:flex-row gap-16">
      <div className="flex-1 space-y-10">
        <button onClick={onBack} className="text-amber-500 font-black text-[10px] uppercase tracking-[0.4em] flex items-center gap-3 hover:text-white transition-all"><ArrowLeft size={20} /> Voltar</button>
        <div className="space-y-4">
          <h3 className="text-5xl lg:text-7xl font-black bible-text italic text-white uppercase tracking-tighter leading-none">{puzzle?.theme || 'Caça-Palavras'}</h3>
          <p className="text-[10px] text-amber-500/40 uppercase tracking-[0.6em]">Encontre as Verdades Sagradas</p>
        </div>
        
        <div className="grid grid-cols-12 gap-1 bg-[#080808] p-4 rounded-[3rem] border border-white/10 shadow-2xl max-w-[650px] aspect-square">
          {grid.map((row, r) => row.map((char, c) => {
            const isSelected = selection.some(s => s.r === r && s.c === c);
            return (
              <button 
                key={`${r}-${c}`} 
                onClick={() => select(r, c)} 
                className={`flex items-center justify-center font-black text-xs lg:text-sm rounded-xl transition-all duration-300 ${isSelected ? 'bg-amber-600 text-black shadow-lg scale-110' : 'text-white/20 hover:bg-white/5 hover:text-white'}`}
              >
                {char}
              </button>
            );
          }))}
        </div>
      </div>

      <div className="w-full xl:w-[400px] space-y-8">
        <div className="bg-[#080808] p-12 rounded-[4rem] border border-white/10 shadow-2xl space-y-10 sticky top-10">
          <h4 className="text-xs font-black uppercase tracking-[0.4em] text-amber-500 flex items-center gap-3"><ScrollText size={20} /> Palavras ({foundWords.length}/{words.length})</h4>
          <div className="grid grid-cols-2 gap-4">
            {words.map((w: string) => (
              <span key={w} className={`text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${foundWords.includes(w) ? 'text-green-500 line-through opacity-30' : 'text-white/40'}`}>
                {w}
              </span>
            ))}
          </div>
          {foundWords.length === words.length && (
            <div className="pt-10 border-t border-white/5 text-center animate-bounce">
              <CheckCircle2 size={40} className="text-green-500 mx-auto mb-4" />
              <p className="text-white font-black uppercase text-xs tracking-widest">Enigma Revelado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- SANTUÁRIO MANAGER (GERAÇÃO EM MASSA) ---
const SanctuaryManager = ({ galleryImages, galleryWords, onFinished }: any) => {
  const [type, setType] = useState<'mosaic' | 'crossword'>('mosaic');
  const [curr, setCurr] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>(["O Santuário aguarda sua ordem de consagração."]);
  const logRef = useRef<HTMLDivElement>(null);

  const storedLevels = (type === 'mosaic' ? galleryImages : galleryWords).map((g: any) => g.level);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 50)]);

  const startGreatWork = async () => {
    setIsProcessing(true);
    addLog("--- INICIANDO GRANDE OBRA DE CONSTRUÇÃO ---");
    const toGen = Array.from({ length: 100 }, (_, i) => i + 1).filter(l => !storedLevels.includes(l));
    
    if (toGen.length === 0) {
      addLog("Todos os 100 níveis já foram edificados.");
      setIsProcessing(false);
      return;
    }

    for (let i = 0; i < toGen.length; i++) {
      const level = toGen[i];
      setCurr(level);
      const theme = SACRED_MOMENTS[level - 1];
      addLog(`Manifestando: ${theme} (Nível ${level})...`);
      try {
        if (type === 'mosaic') {
          const img = await generateBiblicalImage(theme);
          const meta = await generateLevelMetadata(theme);
          if (img) await saveMosaicImage(level, theme, img, meta.reference, meta.description);
        } else {
          const puzzle = await generateWordSearch(theme);
          if (puzzle) await saveCrossword(level, theme, puzzle);
        }
        addLog(`SUCESSO: Nível ${level} gravado no Santuário.`);
      } catch (e: any) {
        addLog(`FALHA: Nível ${level} - ${e.message}`);
        if (e.message.includes('429')) { 
          addLog("MUITAS SOLICITAÇÕES. Pausando 15s...");
          await new Promise(r => setTimeout(r, 15000));
        }
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    setIsProcessing(false);
    onFinished();
  };

  return (
    <div className="max-w-4xl mx-auto py-20 space-y-16 animate-in fade-in duration-700">
      <div className="text-center space-y-8">
        <div className="relative inline-block">
          <Hammer className={`w-24 h-24 text-amber-500 mx-auto ${isProcessing ? 'animate-bounce' : ''}`} />
          <Sparkles className="absolute -top-4 -right-4 text-amber-500 animate-pulse" size={32} />
        </div>
        <h3 className="text-6xl lg:text-8xl font-black bible-text italic text-white uppercase tracking-tighter leading-none">O Santuário</h3>
        <p className="text-[11px] text-amber-500/40 uppercase tracking-[1em]">Oficina de Edificação Gamificada</p>
      </div>
      
      <div className="bg-[#080808] p-16 rounded-[4rem] border border-white/5 shadow-2xl space-y-16">
        {!isProcessing ? (
          <div className="space-y-16 text-center">
            <div className="flex justify-center gap-6">
              <button onClick={() => setType('mosaic')} className={`px-12 py-6 rounded-3xl font-black uppercase text-[11px] tracking-widest border transition-all ${type === 'mosaic' ? 'bg-amber-600 text-black border-amber-600 shadow-2xl' : 'text-white/20 border-white/5 hover:text-white'}`}>Mosaicos 5x5</button>
              <button onClick={() => setType('crossword')} className={`px-12 py-6 rounded-3xl font-black uppercase text-[11px] tracking-widest border transition-all ${type === 'crossword' ? 'bg-amber-600 text-black border-amber-600 shadow-2xl' : 'text-white/20 border-white/5 hover:text-white'}`}>Caça-Palavras</button>
            </div>
            
            <div className="flex justify-center gap-24">
              <div className="text-center"><span className="block text-7xl font-black text-white">{storedLevels.length}</span><span className="text-[10px] font-black uppercase tracking-widest opacity-40">Edificados</span></div>
              <div className="text-center"><span className="block text-7xl font-black text-amber-500/10">{100 - storedLevels.length}</span><span className="text-[10px] font-black uppercase tracking-widest opacity-40">Planos</span></div>
            </div>

            <button onClick={startGreatWork} className="bg-amber-600 hover:bg-amber-500 text-black px-20 py-8 rounded-[3rem] font-black uppercase text-sm tracking-widest flex items-center gap-6 mx-auto transition-all shadow-3xl hover:scale-105 active:scale-95"><Zap size={28} /> Iniciar Geração em Massa</button>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <div className="text-8xl font-black text-amber-500 animate-pulse">{curr}</div>
              <p className="text-white bible-text italic text-3xl">{SACRED_MOMENTS[curr-1]}</p>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden max-w-md mx-auto">
                 <div className="h-full bg-amber-600 transition-all duration-1000 shadow-[0_0_20px_rgba(245,158,11,0.5)]" style={{ width: `${curr}%` }} />
              </div>
            </div>
            <div className="bg-black/80 p-10 rounded-[2.5rem] h-80 overflow-y-auto font-mono text-[11px] text-amber-500/30 border border-white/5 custom-scrollbar" ref={logRef}>
              {logs.map((l, i) => <div key={i} className="mb-2 leading-relaxed tracking-wider">{">"} {l}</div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bible' | 'harpa' | 'games'>('bible');
  const [gamesSubTab, setGamesSubTab] = useState<'mosaic' | 'crossword' | 'sanctuary'>('mosaic');
  const [isGameActive, setIsGameActive] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [galleryWords, setGalleryWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hymnSearch, setHymnSearch] = useState('');
  const [bibleSearch, setBibleSearch] = useState('');
  const [selectedHymn, setSelectedHymn] = useState<any | null>(null);
  const [hymns, setHymns] = useState<any[]>([]);
  const [currentBook, setCurrentBook] = useState('Gênesis');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [verses, setVerses] = useState<any[]>([]);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [lightbox, setLightbox] = useState<any>({ isOpen: false });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('agape_sacred_progress');
    if (saved) setCompletedLevels(JSON.parse(saved));
    loadContent();
  }, [activeTab, gamesSubTab, currentBook, currentChapter]);

  const loadContent = async () => {
    setLoading(true);
    try {
      if (activeTab === 'bible') {
        let data = await fetchVerses(currentBook, currentChapter);
        if (!data.length) {
          const remote = await fetchChapter(currentBook, currentChapter);
          if (remote.length) {
            await saveVerses(remote.map(v => ({ book_name: currentBook, chapter: currentChapter, verse: v.verse, text: v.text })));
            data = await fetchVerses(currentBook, currentChapter);
          }
        }
        setVerses(data);
      } else if (activeTab === 'harpa') {
        const data = await fetchHymns(hymnSearch);
        setHymns(data);
      } else if (activeTab === 'games') {
        setGalleryImages(await fetchAllMosaicImages());
        setGalleryWords(await fetchAllCrosswords());
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleBibleSearch = async () => {
    const q = bibleSearch.trim();
    if (!q) return;
    const regex = /(\d?\s?[a-zA-Z\u00C0-\u017F\s]+)\s(\d+)(?::|\s)?(\d+)?/;
    const match = q.match(regex);
    if (match) {
      const bName = match[1].trim();
      const chap = parseInt(match[2]);
      const found = BIBLE_BOOKS_MASTER.find(b => b.name.toLowerCase().includes(bName.toLowerCase()));
      if (found) {
        setCurrentBook(found.name);
        setCurrentChapter(chap);
        setBibleSearch("");
      }
    }
  };

  const markComplete = (lv: number) => {
    const next = [...new Set([...completedLevels, lv])];
    setCompletedLevels(next);
    localStorage.setItem('agape_sacred_progress', JSON.stringify(next));
  };

  return (
    <div className="flex h-screen w-full bg-[#020202] text-[#e5e5e5] font-sans overflow-hidden">
      <FullImageModal {...lightbox} onClose={() => setLightbox({ isOpen: false })} />

      {!isGameActive && (
        <aside className={`fixed inset-y-0 left-0 z-[150] w-80 lg:w-96 bg-[#080808] border-r border-white/5 transition-transform duration-700 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="p-14 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-6"><Compass className="w-12 h-12 text-amber-500" /><h1 className="text-sm font-black tracking-[0.6em] text-white">ÁGAPE</h1></div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500"><X size={32} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar">
              <nav className="space-y-4">
                <button onClick={() => { setActiveTab('bible'); setIsGameActive(false); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-8 p-7 rounded-[2.5rem] transition-all duration-300 ${activeTab === 'bible' ? 'bg-amber-600 text-black shadow-2xl scale-[1.03]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}><BookOpen size={28} /><span className="text-xs font-black uppercase tracking-widest">Escrituras</span></button>
                <button onClick={() => { setActiveTab('games'); setIsGameActive(false); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-8 p-7 rounded-[2.5rem] transition-all duration-300 ${activeTab === 'games' ? 'bg-amber-600 text-black shadow-2xl scale-[1.03]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}><Gamepad2 size={28} /><span className="text-xs font-black uppercase tracking-widest">Jornada</span></button>
                <button onClick={() => { setActiveTab('harpa'); setIsGameActive(false); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-8 p-7 rounded-[2.5rem] transition-all duration-300 ${activeTab === 'harpa' ? 'bg-amber-600 text-black shadow-2xl scale-[1.03]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}><Music size={28} /><span className="text-xs font-black uppercase tracking-widest">Louvor</span></button>
              </nav>
              
              <div className="pt-12 border-t border-white/5 space-y-3">
                {activeTab === 'bible' ? (
                   BIBLE_BOOKS_MASTER.map(b => <button key={b.name} onClick={() => { setCurrentBook(b.name); setCurrentChapter(1); setIsSidebarOpen(false); }} className={`w-full text-left py-5 px-10 rounded-2xl transition-all duration-300 ${currentBook === b.name ? 'bg-white/5 text-white shadow-inner' : 'text-gray-600 hover:text-gray-300'}`}><span className="bible-text italic text-3xl">{b.name}</span></button>)
                ) : activeTab === 'games' ? (
                  <div className="space-y-4">
                    <button onClick={() => setGamesSubTab('mosaic')} className={`w-full py-7 rounded-3xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-5 transition-all ${gamesSubTab === 'mosaic' ? 'bg-white/10 text-white shadow-xl' : 'text-white/20 hover:text-white hover:bg-white/5'}`}><Layers size={20} /> Mosaicos</button>
                    <button onClick={() => setGamesSubTab('crossword')} className={`w-full py-7 rounded-3xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-5 transition-all ${gamesSubTab === 'crossword' ? 'bg-white/10 text-white shadow-xl' : 'text-white/20 hover:text-white hover:bg-white/5'}`}><ScrollText size={20} /> Caça-Palavras</button>
                    <button onClick={() => setGamesSubTab('sanctuary')} className={`w-full py-7 rounded-3xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-5 text-amber-500/30 hover:text-amber-500 transition-all`}><Hammer size={20} /> O Santuário</button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </aside>
      )}

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {!isGameActive && (
          <header className="h-32 lg:h-44 flex items-center justify-between px-12 lg:px-24 z-40 border-b border-white/5 bg-black/60 backdrop-blur-3xl">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-6 bg-white/5 rounded-3xl text-amber-500"><Menu size={32} /></button>
            <div className="flex flex-col">
              <h2 className="text-4xl lg:text-7xl font-black bible-text italic text-white uppercase tracking-tighter leading-none">
                {activeTab === 'bible' ? `${currentBook} ${currentChapter}` : activeTab === 'harpa' ? 'Harpa Cristã' : 'A Jornada'}
              </h2>
              <span className="text-[10px] font-black text-amber-500/40 uppercase tracking-[0.6em] mt-3">Santuário Digital Ágape</span>
            </div>
            {activeTab === 'bible' && (
              <div className="hidden md:flex items-center gap-6 bg-white/5 px-10 py-5 rounded-[2.5rem] border border-white/10 w-[450px] focus-within:border-amber-500/40 transition-all shadow-inner">
                <Search size={22} className="text-white/20" />
                <input 
                  value={bibleSearch} 
                  onChange={e => setBibleSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleBibleSearch()}
                  placeholder="Pesquisar por referência..." 
                  className="bg-transparent text-xs font-black uppercase tracking-widest outline-none w-full placeholder:text-white/10"
                />
              </div>
            )}
          </header>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar p-12 lg:p-24 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#050505] to-black">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-10 h-full">
              <div className="relative">
                <Loader2 className="animate-spin text-amber-500 w-24 h-24" />
                <Sparkles className="absolute -top-4 -right-4 text-amber-500 animate-pulse" />
              </div>
              <span className="text-sm font-black uppercase tracking-[0.8em] text-amber-500/50">Manifestando Ambiente de Luz...</span>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              {isGameActive ? (
                gamesSubTab === 'mosaic' ? (
                  <MosaicPuzzle 
                    {...galleryImages.find(img => img.level === currentLevel)} 
                    onBack={() => setIsGameActive(false)} 
                    onViewFull={() => setLightbox({ isOpen: true, ...galleryImages.find(img => img.level === currentLevel) })}
                    onComplete={() => markComplete(currentLevel)}
                  />
                ) : (
                  <WordSearchGame puzzle={galleryWords.find(c => c.level === currentLevel)?.puzzle_data} onBack={() => setIsGameActive(false)} onComplete={() => markComplete(currentLevel)} />
                )
              ) : (
                <>
                  {activeTab === 'bible' && (
                    <div className="space-y-12 animate-in fade-in duration-1000">
                       <div className="flex gap-5 overflow-x-auto pb-12 custom-scrollbar scroll-smooth">
                          {Array.from({ length: BIBLE_BOOKS_MASTER.find(b => b.name === currentBook)?.chapters || 1 }, (_, i) => i + 1).map(chap => (
                            <button key={chap} onClick={() => setCurrentChapter(chap)} className={`min-w-[70px] h-[70px] rounded-[1.8rem] flex items-center justify-center font-black text-lg transition-all duration-500 ${currentChapter === chap ? 'bg-amber-600 text-black shadow-[0_0_40px_rgba(245,158,11,0.4)] scale-110' : 'bg-white/5 text-white/20 hover:text-white hover:bg-white/10 hover:scale-105'}`}>{chap}</button>
                          ))}
                       </div>
                       <div className="space-y-4">
                        {verses.map(v => <div key={v.verse} className="py-14 px-16 rounded-[4rem] hover:bg-white/[0.04] border border-transparent hover:border-white/5 transition-all duration-700 group"><p className="bible-text font-light leading-[2.6] text-gray-300 text-3xl lg:text-4xl"><sup className="text-amber-500/20 font-black mr-12 italic group-hover:text-amber-500 transition-colors duration-500">{v.verse}</sup>{v.text}</p></div>)}
                       </div>
                    </div>
                  )}

                  {activeTab === 'games' && gamesSubTab === 'sanctuary' && (
                    <SanctuaryManager galleryImages={galleryImages} galleryWords={galleryWords} onFinished={() => loadContent()} />
                  )}

                  {activeTab === 'games' && gamesSubTab !== 'sanctuary' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pb-60 animate-in fade-in duration-1000">
                      {SACRED_MOMENTS.map((theme, idx) => {
                        const level = idx + 1;
                        const data = (gamesSubTab === 'mosaic' ? galleryImages : galleryWords).find(d => d.level === level);
                        const isCompleted = completedLevels.includes(level);
                        return (
                          <div key={level} className="group bg-[#080808] rounded-[4rem] border border-white/5 overflow-hidden hover:border-amber-500/40 transition-all duration-700 h-[580px] shadow-3xl relative flex flex-col">
                            <div className="absolute top-10 left-10 z-20 bg-black/90 px-7 py-3 rounded-[1.5rem] border border-white/10 font-black text-amber-500 text-xs flex items-center gap-4">
                               {level} {isCompleted && <Check size={18} className="text-green-500" />}
                            </div>
                            <div className="h-64 w-full bg-black flex items-center justify-center relative overflow-hidden">
                              {data?.image_data ? <img src={data.image_data} alt={theme} className="w-full h-full object-cover transition-all duration-1000 opacity-60 group-hover:opacity-100 group-hover:scale-110" /> : <div className="text-white/5"><ImageIcon size={96} /></div>}
                              <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />
                            </div>
                            <div className="p-12 flex-1 flex flex-col justify-between -mt-16 relative z-10 bg-gradient-to-t from-[#080808] to-transparent">
                              <div className="space-y-3">
                                <h4 className="text-3xl font-black bible-text italic text-white leading-tight line-clamp-2 uppercase tracking-tighter">{theme}</h4>
                                {data?.reference && <span className="text-[10px] font-black text-amber-500/30 uppercase tracking-[0.5em]">{data.reference}</span>}
                              </div>
                              <div className="pt-10 space-y-5">
                                {data ? (
                                  <button onClick={() => { setCurrentLevel(level); setIsGameActive(true); }} className={`w-full py-7 rounded-[2rem] font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-5 transition-all shadow-3xl ${isCompleted ? 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white' : 'bg-white text-black hover:bg-amber-600 hover:scale-105 active:scale-95'}`}><Play size={22} fill="currentColor" /> {isCompleted ? 'Contemplar' : 'Entrar'}</button>
                                ) : (
                                  <div className="p-6 bg-white/5 rounded-3xl text-center border border-dashed border-white/10 opacity-30">
                                    <p className="text-[10px] font-black uppercase tracking-widest">Aguardando Consagração</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {activeTab === 'harpa' && (
                    selectedHymn ? (
                      <div className="text-center space-y-24 animate-in slide-in-from-bottom-12 duration-1000 pb-60">
                         <button onClick={() => setSelectedHymn(null)} className="flex items-center gap-5 text-amber-500 font-black uppercase text-[12px] tracking-widest mx-auto hover:text-white transition-all"><ArrowLeft size={24} /> Voltar aos Salmos</button>
                         <div className="space-y-6">
                            <span className="text-amber-500/20 font-black text-sm tracking-[1.2em] uppercase">Hino Sagrado {selectedHymn.number}</span>
                            <h3 className="text-7xl lg:text-[10rem] font-black bible-text italic text-white uppercase tracking-tighter leading-none">{selectedHymn.title}</h3>
                         </div>
                         <div className="bg-[#050505] p-24 lg:p-40 rounded-[6rem] text-gray-300 italic text-3xl lg:text-5xl whitespace-pre-line leading-relaxed shadow-[0_0_120px_rgba(0,0,0,0.6)] border border-white/5 max-w-6xl mx-auto bible-text">{selectedHymn.lyrics}</div>
                         <div className="pt-24 opacity-20"><Music size={150} className="mx-auto" /></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 pb-60 animate-in fade-in duration-1000">
                        {hymns.length === 0 && !loading && (
                          <div className="col-span-full py-60 text-center space-y-12">
                             <Music size={120} className="mx-auto text-white/5" />
                             <p className="text-white/20 font-black uppercase tracking-[0.8em] text-lg">Busque o cântico sagrado por nome ou número</p>
                             <button onClick={() => setHymnSearch('')} className="bg-amber-600/10 text-amber-500 px-12 py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-widest border border-amber-500/20">Ver Todos</button>
                          </div>
                        )}
                        {hymns.map(h => <button key={h.number} onClick={() => setSelectedHymn(h)} className="p-14 bg-[#080808] rounded-[5rem] border border-white/5 hover:border-amber-500/40 text-left h-80 flex flex-col justify-between transition-all duration-700 shadow-2xl group relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-10 opacity-0 group-hover:opacity-10 transition-opacity"><Music size={100} /></div>
                          <span className="text-xs font-black text-amber-500/20 tracking-[0.6em] group-hover:text-amber-500 transition-colors">HINO {h.number}</span>
                          <h4 className="text-4xl font-black bible-text italic text-white leading-tight uppercase tracking-tighter group-hover:text-amber-500 transition-colors duration-500">{h.title}</h4>
                        </button>)}
                      </div>
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
