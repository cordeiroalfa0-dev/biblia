// ========================================
// JOGOS BÍBLICOS - SEM IA
// BiblicalGames.tsx
// ========================================

import React, { useState, useEffect } from 'react';
import { Trophy, Star, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

// ========================================
// DADOS DOS JOGOS
// ========================================

const QUIZ_QUESTIONS = [
  {
    question: "Quem foi o primeiro homem criado por Deus?",
    options: ["Noé", "Adão", "Abraão", "Moisés"],
    correct: 1,
    verse: "Gênesis 2:7"
  },
  {
    question: "Quantos dias Deus levou para criar o mundo?",
    options: ["5 dias", "6 dias", "7 dias", "8 dias"],
    correct: 1,
    verse: "Gênesis 1:31"
  },
  {
    question: "Quem construiu a arca para sobreviver ao dilúvio?",
    options: ["Abraão", "Moisés", "Noé", "Davi"],
    correct: 2,
    verse: "Gênesis 6:14"
  },
  {
    question: "Quantos apóstolos Jesus escolheu?",
    options: ["10", "11", "12", "13"],
    correct: 2,
    verse: "Mateus 10:1-4"
  },
  {
    question: "Quem foi engolido por um grande peixe?",
    options: ["Pedro", "Jonas", "João", "Paulo"],
    correct: 1,
    verse: "Jonas 1:17"
  },
  {
    question: "Qual era o nome da mãe de Jesus?",
    options: ["Marta", "Maria", "Isabel", "Ana"],
    correct: 1,
    verse: "Lucas 1:27"
  },
  {
    question: "Quem traiu Jesus por 30 moedas de prata?",
    options: ["Pedro", "Judas", "Tomé", "Tiago"],
    correct: 1,
    verse: "Mateus 26:14-15"
  },
  {
    question: "Quantos livros tem a Bíblia?",
    options: ["66", "73", "77", "80"],
    correct: 0,
    verse: "Toda a Bíblia"
  },
  {
    question: "Quem venceu o gigante Golias?",
    options: ["Sansão", "Josué", "Davi", "Saul"],
    correct: 2,
    verse: "1 Samuel 17:49"
  },
  {
    question: "Onde Jesus nasceu?",
    options: ["Jerusalém", "Nazaré", "Belém", "Cafarnaum"],
    correct: 2,
    verse: "Mateus 2:1"
  },
  {
    question: "Quem abriu o Mar Vermelho?",
    options: ["Josué", "Moisés", "Arão", "Elias"],
    correct: 1,
    verse: "Êxodo 14:21"
  },
  {
    question: "Quantos mandamentos Deus deu a Moisés?",
    options: ["8", "10", "12", "15"],
    correct: 1,
    verse: "Êxodo 20:1-17"
  },
  {
    question: "Quem foi lançado na cova dos leões?",
    options: ["Daniel", "Davi", "José", "Pedro"],
    correct: 0,
    verse: "Daniel 6:16"
  },
  {
    question: "Qual foi o primeiro milagre de Jesus?",
    options: ["Multiplicar pães", "Andar sobre águas", "Transformar água em vinho", "Curar cego"],
    correct: 2,
    verse: "João 2:1-11"
  },
  {
    question: "Quem batizou Jesus?",
    options: ["Pedro", "João Batista", "Paulo", "André"],
    correct: 1,
    verse: "Mateus 3:13"
  },
  {
    question: "Quantos anos Jesus tinha quando começou seu ministério?",
    options: ["25", "30", "33", "35"],
    correct: 1,
    verse: "Lucas 3:23"
  },
  {
    question: "Qual foi o sinal da aliança de Deus com Noé?",
    options: ["Uma estrela", "Um arco-íris", "Uma pomba", "Uma oliveira"],
    correct: 1,
    verse: "Gênesis 9:13"
  },
  {
    question: "Quem foi vendido como escravo por seus irmãos?",
    options: ["Jacó", "José", "Benjamim", "Judá"],
    correct: 1,
    verse: "Gênesis 37:28"
  },
  {
    question: "Qual o nome do jardim onde Jesus orou antes de ser preso?",
    options: ["Éden", "Getsêmani", "Oliveiras", "Betânia"],
    correct: 1,
    verse: "Mateus 26:36"
  },
  {
    question: "Quem negou Jesus três vezes?",
    options: ["João", "Judas", "Pedro", "Tiago"],
    correct: 2,
    verse: "Mateus 26:69-75"
  }
];

const MEMORY_CARDS = [
  { id: 1, name: "Moisés", emoji: "⚖️", pair: 2 },
  { id: 2, name: "10 Mandamentos", emoji: "📜", pair: 1 },
  { id: 3, name: "Noé", emoji: "🚢", pair: 4 },
  { id: 4, name: "Arca", emoji: "🌊", pair: 3 },
  { id: 5, name: "Davi", emoji: "👑", pair: 6 },
  { id: 6, name: "Golias", emoji: "⚔️", pair: 5 },
  { id: 7, name: "Jesus", emoji: "✝️", pair: 8 },
  { id: 8, name: "Cruz", emoji: "⛪", pair: 7 },
  { id: 9, name: "Adão", emoji: "🍎", pair: 10 },
  { id: 10, name: "Eva", emoji: "🐍", pair: 9 },
  { id: 11, name: "Jonas", emoji: "🐋", pair: 12 },
  { id: 12, name: "Grande Peixe", emoji: "🌊", pair: 11 },
  { id: 13, name: "Daniel", emoji: "🦁", pair: 14 },
  { id: 14, name: "Cova dos Leões", emoji: "🏛️", pair: 13 },
  { id: 15, name: "Maria", emoji: "👶", pair: 16 },
  { id: 16, name: "Bebê Jesus", emoji: "⭐", pair: 15 },
];

const WORD_SEARCH_THEMES = [
  {
    theme: "Personagens Bíblicos",
    words: ["MOISES", "DAVI", "ABRAAO", "NOE", "JONAS", "DANIEL", "PEDRO", "PAULO"],
    gridSize: 10
  },
  {
    theme: "Livros da Bíblia",
    words: ["GENESIS", "EXODO", "SALMOS", "ISAIAS", "MATEUS", "JOAO", "ATOS", "APOCALIPSE"],
    gridSize: 12
  },
  {
    theme: "Lugares Bíblicos",
    words: ["BELEM", "NAZARE", "JERUSALEM", "EGITO", "SINAI", "JORDAO", "GALILEA"],
    gridSize: 10
  },
  {
    theme: "Milagres de Jesus",
    words: ["AGUA", "VINHO", "PAES", "PEIXES", "CEGO", "LEPROSO", "LAZARO", "TEMPESTADE"],
    gridSize: 11
  },
  {
    theme: "Frutos do Espírito",
    words: ["AMOR", "ALEGRIA", "PAZ", "PACIENCIA", "BONDADE", "FE", "MANSIDAO", "DOMINIO"],
    gridSize: 10
  }
];

// ========================================
// COMPONENTE 1: QUIZ BÍBLICO
// ========================================

interface QuizGameProps {
  onBack: () => void;
}

const QuizGame: React.FC<QuizGameProps> = ({ onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  const question = QUIZ_QUESTIONS[currentQuestion];

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    setShowResult(true);
    
    if (index === question.correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGameFinished(true);
      }
    }, 2000);
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setGameFinished(false);
  };

  if (gameFinished) {
    const percentage = (score / QUIZ_QUESTIONS.length) * 100;
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 rounded-3xl border border-white/10 p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-600 rounded-full mx-auto flex items-center justify-center">
            <Trophy size={40} className="text-black" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white mb-2">Quiz Concluído!</h2>
            <p className="text-amber-500 text-6xl font-black my-6">{score}/{QUIZ_QUESTIONS.length}</p>
            <p className="text-gray-400 text-sm">
              {percentage >= 80 ? "🌟 Excelente! Você domina a Bíblia!" : 
               percentage >= 60 ? "👍 Muito bem! Continue estudando!" :
               "📖 Continue lendo a Bíblia para melhorar!"}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={resetGame} className="flex-1 bg-amber-600 text-black py-4 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-amber-500">
              Jogar Novamente
            </button>
            <button onClick={onBack} className="flex-1 bg-white/5 text-white py-4 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-white/10">
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-2xl mx-auto pt-12">
        <div className="flex justify-between items-center mb-8">
          <button onClick={onBack} className="text-gray-500 hover:text-white text-sm font-bold">
            ← Voltar
          </button>
          <div className="flex items-center gap-4">
            <div className="text-amber-500 font-black text-sm">
              {currentQuestion + 1}/{QUIZ_QUESTIONS.length}
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
              <Star size={16} className="text-amber-500" />
              <span className="text-white font-black text-sm">{score}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-3xl border border-white/10 p-8 space-y-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-white leading-tight">
              {question.question}
            </h3>
            <p className="text-xs text-amber-500 font-bold">📖 {question.verse}</p>
          </div>

          <div className="grid gap-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correct;
              const showFeedback = showResult && isSelected;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`w-full p-5 rounded-xl text-left font-bold transition-all ${
                    showFeedback
                      ? isCorrect
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  } ${selectedAnswer !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showFeedback && (
                      isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================
// COMPONENTE 2: JOGO DA MEMÓRIA
// ========================================

interface MemoryGameProps {
  onBack: () => void;
}

const MemoryGame: React.FC<MemoryGameProps> = ({ onBack }) => {
  const [cards, setCards] = useState<typeof MEMORY_CARDS>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    const shuffled = [...MEMORY_CARDS].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameWon(false);
  };

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].id)) {
      return;
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlipped;
      
      if (cards[first].pair === cards[second].id) {
        setMatched([...matched, cards[first].id, cards[second].id]);
        setFlipped([]);
        
        if (matched.length + 2 === MEMORY_CARDS.length) {
          setTimeout(() => setGameWon(true), 500);
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  if (gameWon) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 rounded-3xl border border-white/10 p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-600 rounded-full mx-auto flex items-center justify-center animate-bounce">
            <Trophy size={40} className="text-black" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white mb-2">Parabéns!</h2>
            <p className="text-amber-500 text-5xl font-black my-4">{moves} Jogadas</p>
            <p className="text-gray-400 text-sm">
              {moves <= 12 ? "🌟 Incrível! Memória perfeita!" : 
               moves <= 20 ? "👍 Muito bem!" :
               "💪 Continue praticando!"}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={resetGame} className="flex-1 bg-amber-600 text-black py-4 rounded-xl font-black text-xs uppercase tracking-wider">
              Jogar Novamente
            </button>
            <button onClick={onBack} className="flex-1 bg-white/5 text-white py-4 rounded-xl font-black text-xs uppercase tracking-wider">
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto pt-12">
        <div className="flex justify-between items-center mb-8">
          <button onClick={onBack} className="text-gray-500 hover:text-white text-sm font-bold">
            ← Voltar
          </button>
          <div className="flex items-center gap-4">
            <button onClick={resetGame} className="text-amber-500 hover:text-amber-400 text-sm font-bold flex items-center gap-2">
              <RefreshCw size={16} /> Reiniciar
            </button>
            <div className="bg-white/5 px-4 py-2 rounded-full">
              <span className="text-white font-black text-sm">{moves} Jogadas</span>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-black text-white text-center mb-8">
          Jogo da Memória Bíblica
        </h2>

        <div className="grid grid-cols-4 gap-4">
          {cards.map((card, index) => {
            const isFlipped = flipped.includes(index) || matched.includes(card.id);
            
            return (
              <button
                key={index}
                onClick={() => handleCardClick(index)}
                className={`aspect-square rounded-2xl border-2 transition-all duration-300 ${
                  isFlipped
                    ? 'bg-amber-600 border-amber-500 scale-100'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:scale-105'
                }`}
              >
                <div className={`flex flex-col items-center justify-center h-full transition-opacity ${
                  isFlipped ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="text-4xl mb-2">{card.emoji}</div>
                  <div className="text-xs font-bold text-black">{card.name}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ========================================
// COMPONENTE 3: CAÇA-PALAVRAS
// ========================================

interface WordSearchProps {
  onBack: () => void;
}

const WordSearch: React.FC<WordSearchProps> = ({ onBack }) => {
  const [themeIndex, setThemeIndex] = useState(0);
  const [grid, setGrid] = useState<string[][]>([]);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const theme = WORD_SEARCH_THEMES[themeIndex];

  useEffect(() => {
    generateGrid();
  }, [themeIndex]);

  const generateGrid = () => {
    const size = theme.gridSize;
    const newGrid: string[][] = Array(size).fill(null).map(() => 
      Array(size).fill(null).map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
    );

    // Coloca as palavras no grid
    theme.words.forEach(word => {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 100) {
        attempts++;
        const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);
        
        if (direction === 'horizontal' && col + word.length <= size) {
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            if (newGrid[row][col + i] !== word[i] && !/^[A-Z]$/.test(newGrid[row][col + i])) {
              canPlace = false;
              break;
            }
          }
          if (canPlace) {
            for (let i = 0; i < word.length; i++) {
              newGrid[row][col + i] = word[i];
            }
            placed = true;
          }
        } else if (direction === 'vertical' && row + word.length <= size) {
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            if (newGrid[row + i][col] !== word[i] && !/^[A-Z]$/.test(newGrid[row + i][col])) {
              canPlace = false;
              break;
            }
          }
          if (canPlace) {
            for (let i = 0; i < word.length; i++) {
              newGrid[row + i][col] = word[i];
            }
            placed = true;
          }
        }
      }
    });

    setGrid(newGrid);
    setFoundWords(new Set());
    setSelectedCells(new Set());
    setGameWon(false);
  };

  const handleCellClick = (row: number, col: number) => {
    const cellId = `${row}-${col}`;
    const newSelected = new Set(selectedCells);
    
    if (newSelected.has(cellId)) {
      newSelected.delete(cellId);
    } else {
      newSelected.add(cellId);
    }
    
    setSelectedCells(newSelected);
    checkForWord(newSelected);
  };

  const checkForWord = (selected: Set<string>) => {
    const cells = Array.from(selected).sort();
    if (cells.length < 3) return;

    const word = cells.map(cellId => {
      const [row, col] = cellId.split('-').map(Number);
      return grid[row][col];
    }).join('');

    if (theme.words.includes(word) && !foundWords.has(word)) {
      const newFound = new Set(foundWords);
      newFound.add(word);
      setFoundWords(newFound);
      setSelectedCells(new Set());
      
      if (newFound.size === theme.words.length) {
        setTimeout(() => setGameWon(true), 500);
      }
    }
  };

  const nextTheme = () => {
    setThemeIndex((themeIndex + 1) % WORD_SEARCH_THEMES.length);
  };

  if (gameWon) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 rounded-3xl border border-white/10 p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-600 rounded-full mx-auto flex items-center justify-center animate-bounce">
            <Trophy size={40} className="text-black" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white mb-2">Parabéns!</h2>
            <p className="text-amber-500 text-lg font-bold my-4">
              Você encontrou todas as {theme.words.length} palavras!
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={nextTheme} className="flex-1 bg-amber-600 text-black py-4 rounded-xl font-black text-xs uppercase tracking-wider">
              Próximo Tema
            </button>
            <button onClick={onBack} className="flex-1 bg-white/5 text-white py-4 rounded-xl font-black text-xs uppercase tracking-wider">
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto pt-12">
        <div className="flex justify-between items-center mb-8">
          <button onClick={onBack} className="text-gray-500 hover:text-white text-sm font-bold">
            ← Voltar
          </button>
          <div className="flex items-center gap-4">
            <button onClick={generateGrid} className="text-amber-500 hover:text-amber-400 text-sm font-bold flex items-center gap-2">
              <RefreshCw size={16} /> Novo Jogo
            </button>
            <button onClick={nextTheme} className="text-amber-500 hover:text-amber-400 text-sm font-bold">
              Próximo Tema →
            </button>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white mb-2">Caça-Palavras</h2>
          <p className="text-amber-500 font-bold text-sm">{theme.theme}</p>
          <p className="text-gray-500 text-xs mt-2">
            {foundWords.size}/{theme.words.length} palavras encontradas
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${theme.gridSize}, 1fr)` }}>
              {grid.map((row, rowIndex) =>
                row.map((letter, colIndex) => {
                  const cellId = `${rowIndex}-${colIndex}`;
                  const isSelected = selectedCells.has(cellId);
                  
                  return (
                    <button
                      key={cellId}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={`w-8 h-8 flex items-center justify-center text-xs font-black rounded transition-all ${
                        isSelected
                          ? 'bg-amber-600 text-black'
                          : 'bg-white/5 text-white hover:bg-white/10'
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 min-w-[200px]">
            <h3 className="text-white font-black text-sm mb-4 uppercase tracking-wider">
              Palavras para Encontrar:
            </h3>
            <div className="space-y-2">
              {theme.words.map(word => (
                <div
                  key={word}
                  className={`text-sm font-bold transition-all ${
                    foundWords.has(word)
                      ? 'text-green-500 line-through'
                      : 'text-gray-400'
                  }`}
                >
                  {word}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================
// EXPORTAR COMPONENTES
// ========================================

export { QuizGame, MemoryGame, WordSearch };