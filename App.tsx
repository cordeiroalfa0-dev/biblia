import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  BookOpen,
  Music,
  Loader2,
  Search,
  X,
  Compass,
  Volume2,
  Pause,
  Sparkles,
  Menu,
  ZoomIn,
  ZoomOut,
  Type as TypeIcon,
  Gamepad2,
  Trophy,
  CheckCircle2,
  ImageIcon,
  Move,
  LogOut,
  Maximize2,
  Eye,
  Play,
  HelpCircle,
  Wand2,
  Hammer,
  ScrollText,
} from "lucide-react";
import {
  fetchVerses,
  saveVerses,
  testDatabaseConnection,
  BIBLE_BOOKS_MASTER,
  fetchHymns,
  supabase,
  getStoredMosaicImage,
  saveMosaicImage,
  fetchAllMosaicImages,
  getStoredCrossword,
  saveCrossword,
  fetchAllCrosswords,
} from "./lib/supabase";
import { fetchChapter } from "./services/bibleService";
import {
  generateCrossword,
  generateBiblicalImage,
} from "./services/geminiService";
import { GoogleGenAI, Modality } from "@google/genai";
import { decode, decodeAudioData } from "./lib/audioUtils";
import { QuizGame, MemoryGame, WordSearch } from "./BiblicalGames";

// --- Constantes Globais ---

const SACRED_MOMENTS = [
  "A Criação da Luz",
  "O Jardim do Éden",
  "A Arca de Noé",
  "A Torre de Babel",
  "O Sacrifício de Isaque",
  "A Escada de Jacó",
  "José e a Túnica Colorida",
  "Moisés e a Sarça Ardente",
  "As Dez Pragas do Egito",
  "A Travessia do Mar Vermelho",
  "O Maná no Deserto",
  "Os Dez Mandamentos",
  "Os Muros de Jericó",
  "Sansão e as Colunas",
  "Davi contra o Gigante Golias",
  "O Templo de Salomão",
  "Elias no Carro de Fogo",
  "Eliseu e o Machado Flutuante",
  "A Restauração de Jó",
  "Salmo 23: O Bom Pastor",
  "A Visão de Isaías do Trono",
  "Daniel na Cova dos Leões",
  "Jonas e o Grande Peixe",
  "Neemias Reconstruindo Jerusalém",
  "Ester Salvando seu Povo",
  "A Estrela de Belém",
  "O Nascimento de Jesus",
  "O Batismo no Jordão",
  "A Tentação no Deserto",
  "As Bodas de Caná (Água em Vinho)",
  "O Sermão da Montanha",
  "Jesus Acalma a Tempestade",
  "Caminhando sobre as Águas",
  "A Multiplicação dos Pães",
  "A Transfiguração",
  "A Ressurreição de Lázaro",
  "A Entrada Triunfal em Jerusalém",
  "A Última Ceia",
  "O Getsêmani",
  "A Crucificação no Calvário",
  "A Ressurreição ao Terceiro Dia",
  "A Ascensão aos Céus",
  "Pentecostes: Línguas de Fogo",
  "A Visão de Pedro (O Lençol)",
  "Paulo na Estrada de Damasco",
  "O Naufrágio de Paulo em Malta",
  "Hino ao Amor (Coríntios)",
  "A Visão dos Sete Castiçais",
  "O Cavaleiro do Cavalo Branco",
  "A Nova Jerusalém",
  "O Trono de Marfim",
  "A Queda de Babilônia",
  "Gideão e os Trezentos",
  "A Chamada de Samuel",
  "Rute nos Campos de Boaz",
  "Salomão e a Sabedoria",
  "A Cura do Paralítico",
  "A Mulher do Fluxo de Sangue",
  "Zaqueu na Árvore",
  "O Retorno do Filho Pródigo",
  "O Sonho de Faraó",
  "O Nascimento de Moisés",
  "A Praga das Gafanhotos",
  "A Morte dos Primogênitos",
  "O Cântico de Maria",
  "As Fontes de Elim",
  "O Combate contra Amaleque",
  "O Rosto Resplandecente de Moisés",
  "O Tabernáculo no Deserto",
  "A Rebelião de Corá",
  "A Vara de Arão que Floresceu",
  "A Serpente de Bronze",
  "A Jumenta de Balaão",
  "O Chamado de Josué",
  "A Queda de Jericó",
  "O Sol que Parou em Gibeão",
  "O Voto de Jefté",
  "O Casamento de Rute e Boaz",
  "Ana Orando no Templo",
  "O Chamado de Samuel no Templo",
  "A Arca na Casa de Obede-Edom",
  "A Bondade de Davi com Mefibosete",
  "O Pecado de Davi e Bate-Seba",
  "A Sabedoria de Salomão",
  "A Rainha de Sabá visita Salomão",
  "Elias e a Viúva de Serepta",
  "Elias no Monte Carmelo",
  "Nabote e a Vinha",
  "Eliseu e a Sunamita",
  "A Cura de Naamã",
  "O Machado que Flutuou no Rio",
  "O Cerco de Jerusalém por Senaqueribe",
  "A Oração de Ezequias",
  "O Livro da Lei Encontrado por Josias",
  "A Reconstrução dos Muros por Neemias",
  "O Banquete de Ester",
  "Os Amigos de Jó",
  "A Glória da Segunda Casa",
  "A Visão de Ezequiel dos Ossos Secos",
  "O Nascimento de João Batista",
];

// --- Sub-componentes de UI ---

const LoadingOverlay = ({ message = "Carregando..." }) => (
  <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-pulse p-12 text-center">
    <div className="relative">
      <Loader2 className="animate-spin text-amber-500/20 w-16 h-16" />
      <Sparkles className="absolute inset-0 m-auto text-amber-500 w-6 h-6 animate-pulse" />
    </div>
    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500/30">
      {message}
    </span>
  </div>
);

const EmptyState = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div className="flex-1 flex flex-col items-center justify-center gap-6 p-20 text-center opacity-20">
    <Icon className="w-16 h-16 text-amber-500" />
    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">
      {title}
    </span>
  </div>
);

const VisionModal = ({
  image,
  onClose,
}: {
  image: any;
  onClose: () => void;
}) => (
  <div
    className="fixed inset-0 z-[250] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 lg:p-20 animate-in zoom-in-95"
    onClick={onClose}
  >
    <div
      className="relative w-full max-w-3xl flex flex-col items-center gap-8"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute -top-12 right-0 p-3 text-white/50 hover:text-white"
      >
        <X size={32} />
      </button>
      <div className="w-full aspect-square rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(245,158,11,0.1)] bg-black">
        <img
          src={image.image_data}
          alt={image.theme}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="text-center space-y-2">
        <h4 className="text-3xl lg:text-5xl font-black bible-text italic text-white uppercase tracking-tighter">
          {image.theme}
        </h4>
        <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.4em]">
          Visão Sagrada • Nível {image.level}
        </p>
      </div>
    </div>
  </div>
);

// --- Componente: Santuário de Criação (Geração em Lote) ---

const BatchGenerator = ({
  type,
  onFinished,
}: {
  type: "images" | "crosswords";
  onFinished: () => void;
}) => {
  const [status, setStatus] = useState<"idle" | "running" | "finished">("idle");
  const [currentLevel, setCurrentLevel] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const startBatch = async () => {
    setStatus("running");
    setLog([
      `Iniciando Revelação dos 100 ${type === "images" ? "Visões" : "Enigmas"}...`,
    ]);

    for (let i = 1; i <= 100; i++) {
      setCurrentLevel(i);

      if (type === "images") {
        const exists = await getStoredMosaicImage(i);
        if (!exists) {
          const theme = SACRED_MOMENTS[(i - 1) % SACRED_MOMENTS.length];
          setLog((prev) => [
            `Pintando Nível ${i}: ${theme}`,
            ...prev.slice(0, 5),
          ]);
          const img = await generateBiblicalImage(theme);
          if (img) await saveMosaicImage(i, theme, img);
        } else {
          setLog((prev) => [`Visão ${i} já registrada.`, ...prev.slice(0, 5)]);
        }
      } else {
        const exists = await getStoredCrossword(i);
        if (!exists) {
          const theme = SACRED_MOMENTS[(i - 1) % SACRED_MOMENTS.length];
          setLog((prev) => [
            `Tecendo Enigma Nível ${i}: ${theme}`,
            ...prev.slice(0, 5),
          ]);
          const puzzle = await generateCrossword(i);
          if (puzzle) await saveCrossword(i, puzzle.theme || theme, puzzle);
        } else {
          setLog((prev) => [`Enigma ${i} já registrado.`, ...prev.slice(0, 5)]);
        }
      }
    }

    setStatus("finished");
    onFinished();
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 space-y-8 animate-in fade-in zoom-in-95">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-20 h-20 bg-amber-600 rounded-full flex items-center justify-center text-black shadow-2xl">
          {status === "running" ? (
            <Loader2 className="animate-spin" size={32} />
          ) : type === "images" ? (
            <Wand2 size={32} />
          ) : (
            <ScrollText size={32} />
          )}
        </div>
        <div className="space-y-1">
          <h4 className="text-2xl font-black bible-text italic text-white uppercase tracking-tighter">
            {type === "images" ? "Pintor de Visões" : "Escriba de Enigmas"}
          </h4>
          <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em]">
            Processamento Sagrado em Lote (1-100)
          </p>
        </div>
      </div>

      {status === "idle" && (
        <button
          onClick={startBatch}
          className="w-full py-6 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase text-[10px] tracking-[0.5em] rounded-2xl transition-all shadow-xl"
        >
          Iniciar Revelação
        </button>
      )}

      {status === "running" && (
        <div className="space-y-6">
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-700"
              style={{ width: `${(currentLevel / 100) * 100}%` }}
            />
          </div>
          <div className="space-y-2">
            {log.map((line, idx) => (
              <p
                key={idx}
                className={`text-[10px] font-bold uppercase tracking-widest ${idx === 0 ? "text-amber-500 animate-pulse" : "text-gray-600"}`}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      )}

      {status === "finished" && (
        <div className="flex flex-col items-center gap-4">
          <CheckCircle2 size={40} className="text-green-500" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.5em]">
            Tudo foi Consumado!
          </span>
        </div>
      )}
    </div>
  );
};

// --- Componente: Mosaico Sagrado ---

const MosaicPuzzle = ({
  level,
  onComplete,
  onExit,
}: {
  level: number;
  onComplete: () => void;
  onExit: () => void;
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);

  const gridSize = 5;
  const totalPieces = gridSize * gridSize;

  const [availablePieces, setAvailablePieces] = useState<number[]>([]);
  const [placedPieces, setPlacedPieces] = useState<(number | null)[]>(
    Array(totalPieces).fill(null),
  );

  useEffect(() => {
    const initMosaic = async () => {
      setLoading(true);
      const stored = await getStoredMosaicImage(level);
      if (stored) {
        setTheme(stored.theme);
        setImageUrl(stored.image_data);
      } else {
        const selectedMoment =
          SACRED_MOMENTS[(level - 1) % SACRED_MOMENTS.length];
        setTheme(selectedMoment);
        const img = await generateBiblicalImage(selectedMoment);
        if (img) {
          setImageUrl(img);
          await saveMosaicImage(level, selectedMoment, img);
        }
      }
      const initial = Array.from({ length: totalPieces }, (_, i) => i + 1).sort(
        () => Math.random() - 0.5,
      );
      setAvailablePieces(initial);
      setPlacedPieces(Array(totalPieces).fill(null));
      setLoading(false);
    };
    initMosaic();
  }, [level]);

  const onDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const pieceId = parseInt(e.dataTransfer.getData("pieceId"));
    if (pieceId === targetIndex + 1) {
      const newPlaced = [...placedPieces];
      newPlaced[targetIndex] = pieceId;
      setPlacedPieces(newPlaced);
      setAvailablePieces((prev) => prev.filter((p) => p !== pieceId));
      if (newPlaced.every((p, i) => p === i + 1)) setTimeout(onComplete, 1200);
    }
  };

  if (loading)
    return <LoadingOverlay message="Revelando a Obra do Criador..." />;
  if (!imageUrl)
    return (
      <div className="text-center p-20 opacity-20">
        A visão não pôde ser revelada.
      </div>
    );

  return (
    <div className="fixed inset-0 bg-[#020202] z-[100] flex flex-col items-center p-4 lg:p-12 animate-in fade-in duration-700 overflow-y-auto">
      <div className="w-full max-w-6xl flex flex-col items-center gap-6 mt-4 mb-32">
        <div className="text-center space-y-1">
          <h3 className="text-2xl lg:text-5xl font-black bible-text italic text-white uppercase tracking-tighter">
            Mosaico Sagrado
          </h3>
          <p className="text-[9px] text-amber-500 font-black uppercase tracking-[0.4em]">
            {theme} • Nível {level}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 w-full">
          <div className="relative shrink-0 w-full max-w-[340px] lg:max-w-[480px]">
            <div className="grid grid-cols-5 gap-0.5 bg-white/[0.03] p-1 rounded-2xl border border-white/10 shadow-2xl aspect-square relative">
              {placedPieces.map((pieceId, idx) => {
                const r = Math.floor(idx / gridSize);
                const c = idx % gridSize;
                return (
                  <div
                    key={idx}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onDrop(e, idx)}
                    className={`relative rounded-sm transition-all duration-500 overflow-hidden ${pieceId ? "border-transparent" : "bg-white/5 border border-white/5 flex items-center justify-center"}`}
                  >
                    {pieceId ? (
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundImage: `url(${imageUrl})`,
                          backgroundSize: "500% 500%",
                          backgroundPosition: `${((idx % gridSize) / (gridSize - 1)) * 100}% ${(Math.floor(idx / gridSize) / (gridSize - 1)) * 100}%`,
                        }}
                      />
                    ) : (
                      <Sparkles size={8} className="text-white/5" />
                    )}
                  </div>
                );
              })}
              {showHint && (
                <div className="absolute inset-0 z-10 p-1 animate-in fade-in duration-300">
                  <img
                    src={imageUrl}
                    className="w-full h-full object-cover rounded-xl opacity-80"
                  />
                </div>
              )}
            </div>

            <button
              onMouseDown={() => setShowHint(true)}
              onMouseUp={() => setShowHint(false)}
              onTouchStart={() => setShowHint(true)}
              onTouchEnd={() => setShowHint(false)}
              className="absolute -right-2 -bottom-2 lg:-right-4 lg:-bottom-4 w-12 h-12 lg:w-16 lg:h-16 bg-amber-600 rounded-full flex items-center justify-center text-black shadow-2xl transition-all z-20"
            >
              <HelpCircle size={24} />
            </button>
          </div>

          <div className="w-full max-w-[340px] lg:max-sm bg-white/[0.02] backdrop-blur-3xl p-6 rounded-[2rem] border border-white/5 space-y-4">
            <div className="flex items-center justify-between text-[8px] font-black text-gray-500 uppercase tracking-widest px-1">
              <span>Peças Disponíveis</span>
              <span className="text-amber-500">
                {availablePieces.length} Restantes
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2 max-h-[160px] lg:max-h-none overflow-y-auto p-1">
              {availablePieces.map((pId) => {
                const r = Math.floor((pId - 1) / gridSize);
                const c = (pId - 1) % gridSize;
                return (
                  <div
                    key={pId}
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData("pieceId", pId.toString())
                    }
                    className="aspect-square rounded-md border border-white/10 cursor-grab active:scale-90 transition-all overflow-hidden"
                    style={{
                      backgroundImage: `url(${imageUrl})`,
                      backgroundSize: "500% 500%",
                      backgroundPosition: `${(c / (gridSize - 1)) * 100}% ${(r / (gridSize - 1)) * 100}%`,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-[110] px-6">
        <button
          onClick={onExit}
          className="flex items-center gap-3 bg-black/90 hover:bg-black px-8 py-4 rounded-full border border-white/10 shadow-2xl transition-all"
        >
          <LogOut size={18} className="text-amber-500" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">
            Sair
          </span>
        </button>
      </div>
    </div>
  );
};

// --- Componente: Cruzadinha ---
const CrosswordGame = ({
  level,
  onComplete,
}: {
  level: number;
  onComplete: () => void;
}) => {
  const [puzzle, setPuzzle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userGrid, setUserGrid] = useState<string[][]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const stored = await getStoredCrossword(level);
      if (stored) {
        setPuzzle(stored.puzzle_data);
        setUserGrid(
          Array(12)
            .fill(null)
            .map(() => Array(12).fill("")),
        );
      } else {
        const data = await generateCrossword(level);
        if (data) {
          setPuzzle(data);
          setUserGrid(
            Array(12)
              .fill(null)
              .map(() => Array(12).fill("")),
          );
          await saveCrossword(level, data.theme, data);
        }
      }
      setLoading(false);
    };
    load();
  }, [level]);

  if (loading) return <LoadingOverlay message="Tecendo o Enigma..." />;
  if (!puzzle)
    return (
      <div className="text-center p-20 opacity-20">
        Falha ao carregar desafio.
      </div>
    );

  return (
    <div className="space-y-10 animate-in fade-in max-w-4xl mx-auto px-4 pb-20">
      <div className="text-center space-y-1">
        <h3 className="text-3xl font-black bible-text italic text-white uppercase tracking-tighter">
          Cruzadinha
        </h3>
        <p className="text-[9px] text-amber-500 font-black uppercase tracking-widest">
          {puzzle.theme}
        </p>
      </div>
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        <div className="grid grid-cols-12 gap-0.5 bg-white/5 p-2 rounded-xl border border-white/10">
          {userGrid.map((row, r) =>
            row.map((cell, c) => {
              const isWordCell = puzzle.words.some((w: any) => {
                if (w.direction === "across")
                  return r === w.row && c >= w.col && c < w.col + w.word.length;
                return c === w.col && r >= w.row && r < w.row + w.word.length;
              });
              if (!isWordCell)
                return (
                  <div
                    key={`${r}-${c}`}
                    className="w-5 h-5 lg:w-8 lg:h-8 bg-black/40 rounded-sm"
                  />
                );
              return (
                <input
                  key={`${r}-${c}`}
                  type="text"
                  maxLength={1}
                  value={userGrid[r][c]}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    const newGrid = [...userGrid];
                    newGrid[r][c] = val;
                    setUserGrid(newGrid);
                    let win = true;
                    puzzle.words.forEach((w: any) => {
                      for (let i = 0; i < w.word.length; i++) {
                        const row =
                          w.direction === "across" ? w.row : w.row + i;
                        const col =
                          w.direction === "across" ? w.col + i : w.col;
                        if (newGrid[row][col] !== w.word[i].toUpperCase())
                          win = false;
                      }
                    });
                    if (win) onComplete();
                  }}
                  className="w-5 h-5 lg:w-8 lg:h-8 bg-white/5 text-white text-center font-bold text-[10px] lg:text-sm outline-none focus:bg-amber-600 focus:text-black"
                />
              );
            }),
          )}
        </div>
        <div className="flex-1 space-y-4 max-w-sm">
          {["across", "down"].map((dir) => (
            <div key={dir} className="space-y-2">
              <h4 className="text-[8px] font-black text-amber-500 uppercase tracking-widest border-l border-amber-500 pl-3">
                {dir === "across" ? "Horizontal" : "Vertical"}
              </h4>
              {puzzle.words
                .filter((w: any) => w.direction === dir)
                .map((w: any, i: number) => (
                  <p
                    key={i}
                    className="text-[10px] text-gray-500 leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/5"
                  >
                    {w.clue}
                  </p>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"bible" | "harpa" | "games">(
    "bible",
  );
  const [gamesSubTab, setGamesSubTab] = useState<
    "mosaic" | "crossword" | "generator"
  >("mosaic");
  const [activeGame, setActiveGame] = useState<
    "quiz" | "memory" | "wordsearch" | null
  >(null);
  const [genType, setGenType] = useState<"images" | "crosswords">("images");
  const [isMosaicActive, setIsMosaicActive] = useState(false);
  const [currentBook, setCurrentBook] = useState("Salmos");
  const [currentChapter, setCurrentChapter] = useState(23);
  const [testamentFilter, setTestamentFilter] = useState<
    "Todos" | "Velho" | "Novo"
  >("Todos");

  const [verses, setVerses] = useState<any[]>([]);
  const [hymns, setHymns] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [galleryCrosswords, setGalleryCrosswords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hymnSearch, setHymnSearch] = useState("");
  const [selectedHymn, setSelectedHymn] = useState<any | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [fontScale, setFontScale] = useState(1.0);
  const [selectedVision, setSelectedVision] = useState<any | null>(null);

  const [currentMosaicLevel, setCurrentMosaicLevel] = useState(1);
  const [currentGameLevel, setCurrentGameLevel] = useState(1);
  const [showLevelComplete, setShowLevelComplete] = useState(false);

  useEffect(() => {
    testDatabaseConnection().then((res) => {
      if (res.success) loadContent();
    });
  }, [currentBook, currentChapter, activeTab, hymnSearch, gamesSubTab]);

  const loadContent = async () => {
    setLoading(true);
    if (activeTab === "bible") {
      let data = await fetchVerses(currentBook, currentChapter);
      if (data.length === 0) {
        const cData = await fetchChapter(currentBook, currentChapter);
        if (cData.length) {
          await saveVerses(
            cData.map((v) => ({
              book_name: currentBook,
              chapter: currentChapter,
              verse: v.verse,
              text: v.text,
            })),
          );
          data = await fetchVerses(currentBook, currentChapter);
        }
      }
      setVerses(data);
    } else if (activeTab === "harpa") {
      setHymns(await fetchHymns(hymnSearch));
    } else if (activeTab === "games") {
      const imgs = await fetchAllMosaicImages();
      const cross = await fetchAllCrosswords();
      setGalleryImages(imgs);
      setGalleryCrosswords(cross);
    }
    setLoading(false);
  };

  const filteredBooks = useMemo(
    () =>
      BIBLE_BOOKS_MASTER.filter(
        (b) => testamentFilter === "Todos" || b.testament === testamentFilter,
      ),
    [testamentFilter],
  );

  // Se um jogo novo está ativo, renderize ele em tela cheia
  if (activeGame === "quiz")
    return <QuizGame onBack={() => setActiveGame(null)} />;
  if (activeGame === "memory")
    return <MemoryGame onBack={() => setActiveGame(null)} />;
  if (activeGame === "wordsearch")
    return <WordSearch onBack={() => setActiveGame(null)} />;

  return (
    <div className="flex h-screen w-full bg-[#020202] text-[#e5e5e5] font-sans overflow-hidden">
      {!isMosaicActive && (
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-80 lg:w-96 bg-[#080808] border-r border-white/5 transition-transform duration-500 lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex flex-col h-full">
            <div className="p-10 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4">
                <Compass className="w-8 h-8 text-amber-500" />
                <h1 className="text-sm font-black tracking-[0.5em] text-white">
                  ÁGAPE
                </h1>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 text-gray-500"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="bg-black/40">
                <button
                  onClick={() => setActiveTab("bible")}
                  className={`w-full flex items-center gap-5 p-6 border-b border-white/[0.02] ${activeTab === "bible" ? "bg-amber-600 text-black" : "text-gray-500"}`}
                >
                  <BookOpen size={24} />
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    Escrituras
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("games")}
                  className={`w-full flex items-center gap-5 p-6 border-b border-white/[0.02] ${activeTab === "games" ? "bg-amber-600 text-black" : "text-gray-500"}`}
                >
                  <Gamepad2 size={24} />
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    Jornada
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("harpa")}
                  className={`w-full flex items-center gap-5 p-6 border-b border-white/[0.02] ${activeTab === "harpa" ? "bg-amber-600 text-black" : "text-gray-500"}`}
                >
                  <Music size={24} />
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    Louvor
                  </span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {activeTab === "bible" && (
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between px-4 sticky top-0 bg-[#080808] py-3 z-10 border-b border-white/5">
                      {["Todos", "Velho", "Novo"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setTestamentFilter(t as any)}
                          className={`text-[9px] font-black uppercase tracking-widest ${testamentFilter === t ? "text-amber-500 border-b border-amber-500 pb-1" : "text-gray-600"}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    {filteredBooks.map((book) => (
                      <button
                        key={book.name}
                        onClick={() => {
                          setCurrentBook(book.name);
                          setCurrentChapter(1);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full text-left py-4 px-6 rounded-2xl flex items-center justify-between ${currentBook === book.name ? "bg-white/[0.03] text-white" : "text-gray-500"}`}
                      >
                        <span className="bible-text italic truncate text-2xl">
                          {book.name}
                        </span>
                        {currentBook === book.name && (
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {activeTab === "games" && (
                  <div className="p-8 space-y-8">
                    <div className="flex flex-col gap-2">
                      <div className="flex bg-white/5 p-1 rounded-2xl">
                        <button
                          onClick={() => setGamesSubTab("mosaic")}
                          className={`flex-1 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${gamesSubTab === "mosaic" ? "bg-amber-600 text-black" : "text-gray-500"}`}
                        >
                          🖼️ Mosaicos
                        </button>
                        <button
                          onClick={() => setGamesSubTab("crossword")}
                          className={`flex-1 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${gamesSubTab === "crossword" ? "bg-amber-600 text-black" : "text-gray-500"}`}
                        >
                          🧩 Cruzadas
                        </button>
                      </div>

                      {/* NOVOS JOGOS */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => setActiveGame("quiz")}
                          className="py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all bg-white/5 text-gray-400 hover:bg-amber-600 hover:text-black"
                        >
                          📝 Quiz
                        </button>
                        <button
                          onClick={() => setActiveGame("memory")}
                          className="py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all bg-white/5 text-gray-400 hover:bg-amber-600 hover:text-black"
                        >
                          🃏 Memória
                        </button>
                        <button
                          onClick={() => setActiveGame("wordsearch")}
                          className="py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all bg-white/5 text-gray-400 hover:bg-amber-600 hover:text-black"
                        >
                          🔍 Caça-Palavras
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setGamesSubTab("generator");
                            setGenType("images");
                          }}
                          className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest border border-amber-500/20 text-amber-500 flex items-center justify-center gap-2 ${gamesSubTab === "generator" && genType === "images" ? "bg-amber-500/10" : ""}`}
                        >
                          <ImageIcon size={12} /> Visões
                        </button>
                        <button
                          onClick={() => {
                            setGamesSubTab("generator");
                            setGenType("crosswords");
                          }}
                          className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest border border-amber-500/20 text-amber-500 flex items-center justify-center gap-2 ${gamesSubTab === "generator" && genType === "crosswords" ? "bg-amber-500/10" : ""}`}
                        >
                          <TypeIcon size={12} /> Enigmas
                        </button>
                      </div>
                    </div>

                    {gamesSubTab !== "generator" && (
                      <div className="grid grid-cols-4 gap-2 pb-20">
                        {Array.from({ length: 100 }, (_, i) => i + 1).map(
                          (lv) => {
                            const vision = galleryImages.find(
                              (img) => img.level === lv,
                            );
                            const puzzle = galleryCrosswords.find(
                              (c) => c.level === lv,
                            );
                            const isAct =
                              (gamesSubTab === "mosaic"
                                ? currentMosaicLevel
                                : currentGameLevel) === lv;
                            return (
                              <div key={lv} className="relative group">
                                <button
                                  onClick={() => {
                                    if (gamesSubTab === "mosaic") {
                                      setCurrentMosaicLevel(lv);
                                      setIsMosaicActive(true);
                                    } else setCurrentGameLevel(lv);
                                    setIsSidebarOpen(false);
                                  }}
                                  className={`w-full aspect-square rounded-xl text-[10px] font-black flex items-center justify-center transition-all ${isAct ? "bg-amber-600 text-black" : "bg-white/5 text-gray-600"}`}
                                >
                                  {lv}
                                </button>
                                {gamesSubTab === "mosaic" && vision && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedVision(vision);
                                    }}
                                    className="absolute -top-1 -right-1 bg-amber-500 text-black p-1 rounded-full shadow-lg hover:scale-125 transition-all"
                                  >
                                    <Eye size={10} />
                                  </button>
                                )}
                                {gamesSubTab === "crossword" && puzzle && (
                                  <div className="absolute -top-1 -right-1 bg-green-500 text-black p-1 rounded-full pointer-events-none">
                                    <CheckCircle2 size={8} />
                                  </div>
                                )}
                              </div>
                            );
                          },
                        )}
                      </div>
                    )}
                  </div>
                )}
                {activeTab === "harpa" && (
                  <div className="p-4 space-y-4">
                    <div className="sticky top-0 bg-[#080808] pb-4 z-10 px-2">
                      <input
                        type="text"
                        placeholder="Buscar hino..."
                        value={hymnSearch}
                        onChange={(e) => setHymnSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-xs font-bold outline-none text-white focus:border-amber-500/30"
                      />
                    </div>
                    {hymns.map((h) => (
                      <button
                        key={h.number}
                        onClick={() => {
                          setSelectedHymn(h);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full text-left p-5 rounded-2xl flex items-center gap-4 ${selectedHymn?.number === h.number ? "bg-amber-500/10 text-amber-500" : "text-gray-500"}`}
                      >
                        <span className="text-[10px] font-black text-amber-500 w-8">
                          {h.number}
                        </span>
                        <span className="text-sm font-bold truncate">
                          {h.title}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      )}

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {!isMosaicActive && (
          <header className="h-24 lg:h-32 glass border-b border-white/5 flex items-center justify-between px-6 lg:px-16 z-40">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-4 bg-white/5 rounded-2xl text-amber-500 lg:hidden"
              >
                <Menu size={24} />
              </button>
              <h2 className="text-2xl lg:text-4xl font-black bible-text italic text-white uppercase tracking-tighter">
                {activeTab === "bible" ? (
                  <>
                    <span className="text-amber-500">{currentBook}</span>{" "}
                    <span className="text-gray-800 font-light">/</span>{" "}
                    {currentChapter}
                  </>
                ) : activeTab === "harpa" ? (
                  "Harpa"
                ) : (
                  "Jornada"
                )}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-white/5 p-1 rounded-xl">
                <button
                  onClick={() => setFontScale((s) => Math.max(0.6, s - 0.1))}
                  className="p-2 text-gray-500 hover:text-white"
                >
                  <ZoomOut size={18} />
                </button>
                <button
                  onClick={() => setFontScale((s) => Math.min(2.5, s + 0.1))}
                  className="p-2 text-gray-500 hover:text-white"
                >
                  <ZoomIn size={18} />
                </button>
              </div>
            </div>
          </header>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <LoadingOverlay message="Conectando aos Registros Sagrados..." />
          ) : (
            <div
              className={`${isMosaicActive ? "" : "max-w-4xl mx-auto py-12 lg:py-20 px-6 pb-40"}`}
            >
              {activeTab === "bible" ? (
                <div className="space-y-10">
                  {verses.map((v) => (
                    <div
                      key={v.verse}
                      className="group relative py-6 px-8 rounded-[2rem] hover:bg-white/[0.02] transition-all"
                    >
                      <p
                        className="bible-text font-light leading-[1.8] text-gray-400 group-hover:text-white"
                        style={{ fontSize: `${28 * fontScale}px` }}
                      >
                        <sup className="text-amber-500/40 font-black mr-6 italic">
                          {v.verse}
                        </sup>
                        {v.text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : activeTab === "harpa" ? (
                selectedHymn ? (
                  <div className="space-y-16 text-center animate-in slide-in-from-bottom-12">
                    <div className="space-y-4">
                      <h3 className="text-5xl lg:text-7xl font-black bible-text italic text-white uppercase tracking-tighter">
                        {selectedHymn.title}
                      </h3>
                      <p className="text-amber-500 font-black tracking-[0.8em] text-xs uppercase">
                        HINO Nº {selectedHymn.number}
                      </p>
                    </div>
                    <div
                      className="bg-[#050505] rounded-[3rem] p-12 lg:p-20 border border-white/5 text-gray-300 italic text-2xl lg:text-3xl leading-[2.2] whitespace-pre-line"
                      style={{ fontSize: `${24 * fontScale}px` }}
                    >
                      {selectedHymn.lyrics}
                    </div>
                  </div>
                ) : (
                  <EmptyState icon={Music} title="Harpa de Sião" />
                )
              ) : gamesSubTab === "mosaic" ? (
                isMosaicActive && (
                  <MosaicPuzzle
                    level={currentMosaicLevel}
                    onComplete={() => setShowLevelComplete(true)}
                    onExit={() => setIsMosaicActive(false)}
                  />
                )
              ) : gamesSubTab === "generator" ? (
                <div className="max-w-md mx-auto">
                  <BatchGenerator type={genType} onFinished={loadContent} />
                </div>
              ) : (
                <CrosswordGame
                  level={currentGameLevel}
                  onComplete={() => setShowLevelComplete(true)}
                />
              )}
            </div>
          )}
        </div>

        {showLevelComplete && (
          <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-8 backdrop-blur-3xl animate-in zoom-in-95">
            <div className="w-full max-w-sm bg-[#0a0a0a] rounded-[4rem] border border-amber-500/30 p-16 text-center space-y-10">
              <div className="w-24 h-24 bg-amber-600 rounded-[3rem] mx-auto flex items-center justify-center text-black shadow-2xl animate-bounce">
                <Trophy size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black bible-text italic text-white uppercase tracking-tighter">
                  Vitória!
                </h3>
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                  Nível Concluído
                </p>
              </div>
              <button
                onClick={() => {
                  setShowLevelComplete(false);
                  if (gamesSubTab === "mosaic") {
                    setCurrentMosaicLevel((prev) => prev + 1);
                  } else {
                    setCurrentGameLevel((prev) => prev + 1);
                  }
                }}
                className="w-full py-6 bg-white text-black rounded-3xl font-black uppercase text-[10px] tracking-[0.5em] hover:bg-amber-500 transition-all"
              >
                AVANÇAR
              </button>
            </div>
          </div>
        )}

        {selectedVision && (
          <VisionModal
            image={selectedVision}
            onClose={() => setSelectedVision(null)}
          />
        )}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.1); border-radius: 10px; }
        .bible-text { font-family: 'Crimson Pro', serif; }
        .glass { background: rgba(2, 2, 2, 0.98); backdrop-filter: blur(60px); }
        @media (max-width: 1024px) { .custom-scrollbar::-webkit-scrollbar { width: 0px; } }
      `}</style>
    </div>
  );
};

export default App;
