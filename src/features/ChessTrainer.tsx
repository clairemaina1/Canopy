import { useEffect, useRef, useState } from 'react';
import { Chess, type Move, type Square } from 'chess.js';
import { Button } from '@mantine/core';

type ReviewMove = { fen: string; san: string };
type MoveReview = { san: string; grade: string; explanation: string; improvement?: string };
type RankedMove = { move: Move; score: number };

const pieceValues: Record<string, number> = { p: 100, n: 320, b: 335, r: 500, q: 900, k: 0 };
const pieces: Record<string, string> = {
  wk: '♔', wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙',
  bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟',
};

function evaluate(game: Chess) {
  if (game.isCheckmate()) return game.turn() === 'w' ? -100_000 : 100_000;
  if (game.isDraw()) return 0;
  let score = 0;
  for (const row of game.board()) {
    for (const piece of row) {
      if (piece) score += pieceValues[piece.type] * (piece.color === 'w' ? 1 : -1);
    }
  }
  return score;
}

function search(game: Chess, depth: number, alpha: number, beta: number): number {
  if (depth === 0 || game.isGameOver()) return evaluate(game);
  const maximizing = game.turn() === 'w';
  let best = maximizing ? -Infinity : Infinity;
  const moves = game.moves({ verbose: true }).sort((a, b) => Number(Boolean(b.captured)) - Number(Boolean(a.captured)));
  for (const move of moves) {
    game.move(move);
    const score = search(game, depth - 1, alpha, beta);
    game.undo();
    best = maximizing ? Math.max(best, score) : Math.min(best, score);
    if (maximizing) alpha = Math.max(alpha, best);
    else beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

function scoreMoves(game: Chess, depth: number) {
  const maximizing = game.turn() === 'w';
  return game.moves({ verbose: true }).map((move) => {
    game.move(move);
    const score = search(game, Math.max(0, depth - 1), -Infinity, Infinity);
    game.undo();
    return { move, score };
  }).sort((a, b) => maximizing ? b.score - a.score : a.score - b.score);
}

function moveReason(move: Move) {
  if (move.san.includes('#')) return 'This is checkmate: the king is in check and has no legal escape.';
  if (move.captured) return `This wins a ${move.captured}. Check whether the recapture changes the trade.`;
  if (move.san.includes('+')) return 'This gives check and makes the other side answer the king threat.';
  return 'The short search prefers this move for the next position. Compare its targets and piece safety.';
}

function coachPlayerMove(ranked: RankedMove[], played: Move) {
  const best = ranked[0];
  const chosen = ranked.find((candidate) => candidate.move.san === played.san);
  if (!best || !chosen || best.move.san === played.san) {
    return `GOOD CHOICE · ${moveReason(played)}`;
  }
  const gap = played.color === 'w' ? best.score - chosen.score : chosen.score - best.score;
  if (gap < 80) return `CLOSE ALTERNATIVE · ${best.move.san} — ${moveReason(best.move)}`;
  return `TRY INSTEAD · ${best.move.san} — ${moveReason(best.move)}`;
}

function chooseBotMove(game: Chess, level: number): Move | undefined {
  const depth = level < 3 ? 1 : level < 6 ? 2 : 3;
  const rankedMoves = scoreMoves(game, depth);
  if (rankedMoves.length === 0) return undefined;
  const bestScore = rankedMoves[0].score;
  const tolerance = [Infinity, 1_500, 900, 550, 350, 180, 70, 0][level];
  const reasonableMoves = rankedMoves.filter(({ score }) =>
    maximizingFor(game.turn()) ? bestScore - score <= tolerance : score - bestScore <= tolerance,
  );
  return reasonableMoves[Math.floor(Math.random() * reasonableMoves.length)].move;
}

function maximizingFor(color: string) {
  return color === 'w';
}

function reviewGame(history: ReviewMove[]): MoveReview[] {
  return history.map(({ fen, san }) => {
    const position = new Chess(fen);
    const ranked = scoreMoves(position, 2);
    const best = ranked[0]?.move;
    const playedPosition = new Chess(fen);
    const played = playedPosition.move(san);
    const playedScore = evaluate(playedPosition);
    const bestScore = ranked[0]?.score ?? playedScore;
    const difference = Math.max(0, (bestScore - playedScore) / 100);
    let grade = 'STRONG';
    let explanation = 'This kept the position close to the best line. Keep noticing what your move protects.';
    if (difference > 1.5) {
      grade = 'REVISIT';
      explanation = 'A stronger continuation was available. Compare the candidate below and look at which pieces it develops, protects, or attacks.';
    } else if (difference > 0.6) {
      grade = 'SOLID';
      explanation = 'There was a slightly more accurate option. Try checking for a forcing move before settling on this one.';
    } else if (played.captured) {
      explanation = `You spotted a capture and won a ${played.captured}. Check whether the recapture changes the trade.`;
    } else if (played.san.includes('+')) {
      explanation = 'You found a checking move. Checks can narrow the opponent’s choices—look for their safest reply.';
    }
    return {
      san,
      grade,
      explanation,
      improvement: best && best.san !== san ? best.san : undefined,
    };
  });
}

function getBotDepthLabel(level: number) {
  if (level < 3) return 'CASUAL · QUICK MOVES';
  if (level < 6) return 'CLUB · LOOKS AHEAD';
  return 'EXPERT · DEEPER SEARCH';
}

export default function ChessTrainer() {
  const gameRef = useRef(new Chess());
  const historyRef = useRef<ReviewMove[]>([]);
  const botTimerRef = useRef<number | null>(null);
  const [fen, setFen] = useState(gameRef.current.fen());
  const [level, setLevel] = useState(3);
  const [selected, setSelected] = useState<Square | null>(null);
  const [thinking, setThinking] = useState(false);
  const [review, setReview] = useState<MoveReview[] | null>(null);
  const [moveFeedback, setMoveFeedback] = useState('');
  const [gameMessage, setGameMessage] = useState('YOUR MOVE · WHITE');
  const game = gameRef.current;
  const selectedDestinations = selected
    ? game.moves({ square: selected, verbose: true }).map((move) => move.to)
    : [];
  const board = game.board();

  useEffect(() => () => {
    if (botTimerRef.current !== null) window.clearTimeout(botTimerRef.current);
  }, []);

  function finishGame() {
    const currentGame = gameRef.current;
    if (!currentGame.isGameOver()) return false;
    setThinking(false);
    if (currentGame.isCheckmate()) setGameMessage(currentGame.turn() === 'w' ? 'CHECKMATE · THE BOT WINS' : 'CHECKMATE · YOU WIN');
    else if (currentGame.isStalemate()) {
      setGameMessage('DRAW · STALEMATE');
      setMoveFeedback('Stalemate is a draw: the king is not in check, but has no legal moves. Keep at least one escape square until you can give a safe, supported checkmate.');
    } else {
      setGameMessage('DRAW · WELL PLAYED');
      setMoveFeedback('This position is drawn. A draw can happen in several ways; use the move review below and the Mate Clinic to practise converting a material advantage.');
    }
    setReview(reviewGame(historyRef.current));
    return true;
  }

  function playPlayerMove(from: Square, to: Square) {
    const currentGame = gameRef.current;
    const before = currentGame.fen();
    const ranked = scoreMoves(currentGame, 2);
    const move = currentGame.move({ from, to, promotion: 'q' });
    if (!move) return false;
    setMoveFeedback(coachPlayerMove(ranked, move));
    historyRef.current.push({ fen: before, san: move.san });
    setFen(currentGame.fen());
    setSelected(null);
    if (finishGame()) return true;
    setThinking(true);
    setGameMessage('THE BOT IS THINKING');
    botTimerRef.current = window.setTimeout(() => {
      const botMove = chooseBotMove(currentGame, level);
      if (botMove) currentGame.move(botMove);
      setFen(currentGame.fen());
      setThinking(false);
      if (!finishGame()) setGameMessage(currentGame.isCheck() ? 'YOUR MOVE · YOU ARE IN CHECK' : 'YOUR MOVE · WHITE');
    }, 180);
    return true;
  }

  function handleSquareClick(square: Square) {
    if (thinking || game.isGameOver() || game.turn() !== 'w') return;
    if (selected && selectedDestinations.includes(square)) {
      if (playPlayerMove(selected, square)) return;
    }
    const piece = game.get(square);
    setSelected(piece?.color === 'w' ? square : null);
  }

  function newGame() {
    if (botTimerRef.current !== null) window.clearTimeout(botTimerRef.current);
    gameRef.current = new Chess();
    historyRef.current = [];
    setFen(gameRef.current.fen());
    setSelected(null);
    setThinking(false);
    setReview(null);
    setMoveFeedback('');
    setGameMessage('YOUR MOVE · WHITE');
  }

  return (
    <div className="content learning-page chess-page">
      <header className="page-heading">
        <div className="eyebrow"><span className="eyebrow-dot" /> THINK A MOVE AHEAD</div>
        <h1>Chess, at your pace.</h1>
        <p>Play a local bot, then review the choices you made—without sending games anywhere.</p>
      </header>

      <div className="chess-layout">
        <section className="chess-board-card">
          <div className="chess-toolbar">
            <label>
              <span>BOT LEVEL</span>
              <select aria-label="Bot difficulty" onChange={(event) => setLevel(Number(event.currentTarget.value))} value={level}>
                {Array.from({ length: 7 }, (_, index) => index + 1).map((difficulty) => (
                  <option key={difficulty} value={difficulty}>LEVEL {difficulty}</option>
                ))}
              </select>
            </label>
            <span className="chess-depth">{getBotDepthLabel(level)}</span>
            <Button className="form-button" onClick={newGame}>NEW GAME</Button>
          </div>
          <div aria-label="Chessboard" className="chess-board" role="grid">
            {board.flatMap((row, rowIndex) => row.map((piece, columnIndex) => {
              const square = `${'abcdefgh'[columnIndex]}${8 - rowIndex}` as Square;
              const isLight = (rowIndex + columnIndex) % 2 === 0;
              const isSelected = selected === square;
              const isTarget = selectedDestinations.includes(square);
              return (
                <button
                  aria-label={`${square}${piece ? ` ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}` : ''}${isTarget ? ', legal move' : ''}`}
                  aria-selected={isSelected}
                  className={`chess-square ${isLight ? 'light' : 'dark'}${isSelected ? ' chosen' : ''}${isTarget ? ' legal-target' : ''}`}
                  key={square}
                  onClick={() => handleSquareClick(square)}
                  role="gridcell"
                  type="button"
                >
                  {piece && <span className={`chess-piece ${piece.color === 'w' ? 'white-piece' : 'black-piece'}`}>{pieces[`${piece.color}${piece.type}`]}</span>}
                  {!piece && isTarget && <span className="move-dot" />}
                  {columnIndex === 0 && <span className="rank-label">{8 - rowIndex}</span>}
                  {rowIndex === 7 && <span className="file-label">{'abcdefgh'[columnIndex]}</span>}
                </button>
              );
            }))}
          </div>
          <div aria-live="polite" className={`game-message${thinking ? ' thinking' : ''}`}>{gameMessage}</div>
          {moveFeedback && <p aria-live="polite" className="chess-move-feedback">{moveFeedback}</p>}
          <p className="chess-footnote">Level 1 is exploratory; Level 7 searches further. This lightweight local bot is a practice partner, not a tournament engine.</p>
        </section>

        <aside className="chess-side-panel">
          <section className="surface-card">
            <span className="card-kicker">SEVEN STEPS UP</span>
            <h2>Choose your challenge</h2>
            <div className="difficulty-list">
              {['Playful', 'Easy', 'Steady', 'Club', 'Sharp', 'Strong', 'Expert'].map((name, index) => (
                <button
                  aria-pressed={level === index + 1}
                  className={`difficulty-option${level === index + 1 ? ' active' : ''}`}
                  key={name}
                  onClick={() => setLevel(index + 1)}
                  type="button"
                >
                  <span>{index + 1}</span><b>{name}</b>
                </button>
              ))}
            </div>
          </section>
          <section className="coach-note">
            <span className="card-kicker">A WINNING-ENDGAME ROUTINE</span>
            <ol>
              <li>Give the enemy king a box with your queen or rook.</li>
              <li>Bring your king closer while keeping your pieces protected.</li>
              <li>Before each move, check: “Is the king in check? Does it have a legal square?”</li>
              <li>Do not take away the last escape square unless your move gives checkmate.</li>
            </ol>
            <p><b>Checkmate:</b> in check, with no legal move. <b>Stalemate:</b> not in check, with no legal move—draw.</p>
          </section>
        </aside>
      </div>

      <MateClinic />

      {review && (
        <section className="surface-card chess-review">
          <span className="card-kicker">AFTER-GAME REVIEW · WHITE'S MOVES</span>
          <h2>Keep the good. Learn the next move.</h2>
          {review.length === 0 ? (
            <p>Play at least one move and finish the game to get your review.</p>
          ) : (
            <div className="review-list">
              {review.map((item, index) => (
                <article className="review-move" key={`${index}-${item.san}`}>
                  <div className="review-move-heading"><strong>{index + 1}. {item.san}</strong><span className={`review-grade ${item.grade.toLowerCase()}`}>{item.grade}</span></div>
                  <p>{item.explanation}</p>
                  {item.improvement && <small>BETTER MOVE TO TRY: <b>{item.improvement}</b> — {item.improvement.includes('#') ? 'This finishes with checkmate.' : 'Replay the position and compare what this move attacks and protects.'}</small>}
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

const matePuzzles = [
  { title: 'Queen and king · puzzle 1', fen: 'k7/1Q6/2K5/8/8/8/8/8 w - - 0 1' },
  { title: 'Queen and king · puzzle 2', fen: 'k7/8/1K6/2Q5/8/8/8/8 w - - 0 1' },
];

function MateClinic() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const gameRef = useRef(new Chess(matePuzzles[0].fen));
  const [fen, setFen] = useState(gameRef.current.fen());
  const [selected, setSelected] = useState<Square | null>(null);
  const [feedback, setFeedback] = useState('Find checkmate in one. Select a white piece, then a highlighted square.');
  const game = gameRef.current;
  const board = game.board();
  const destinations = selected ? game.moves({ square: selected, verbose: true }).map((move) => move.to) : [];

  function choosePuzzle() {
    const nextIndex = (puzzleIndex + 1) % matePuzzles.length;
    const nextGame = new Chess(matePuzzles[nextIndex].fen);
    gameRef.current = nextGame;
    setPuzzleIndex(nextIndex);
    setFen(nextGame.fen());
    setSelected(null);
    setFeedback('Find checkmate in one. Select a white piece, then a highlighted square.');
  }

  function handleSquareClick(square: Square) {
    if (game.isGameOver()) return;
    if (selected && destinations.includes(square)) {
      game.move({ from: selected, to: square });
      if (game.isCheckmate()) {
        setFen(game.fen());
        setFeedback('CHECKMATE. The king is under attack and has no legal escape. Notice how your king supports the queen.');
      } else {
        game.undo();
        setFeedback('Not mate yet—the king still has a legal reply. Look for a move that gives check and covers every escape square.');
      }
      setSelected(null);
      return;
    }
    setSelected(game.get(square)?.color === 'w' ? square : null);
  }

  return (
    <section className="mate-clinic">
      <div className="mate-clinic-copy">
        <span className="card-kicker">MATE CLINIC · NO BOT CLOCK</span>
        <h2>Learn the difference between “winning” and “checkmating”.</h2>
        <p>Practise a simple queen-and-king finish. This tiny puzzle only accepts a real checkmate; an attractive-looking move that leaves an escape square is not enough.</p>
        <h3>{matePuzzles[puzzleIndex].title}</h3>
        <div aria-live="polite" className="mate-feedback">{feedback}</div>
        <button className="text-button" onClick={choosePuzzle} type="button">NEXT MATE PUZZLE <span>→</span></button>
      </div>
      <div aria-label="Mate in one puzzle board" className="chess-board mate-board" role="grid">
        {board.flatMap((row, rowIndex) => row.map((piece, columnIndex) => {
          const square = `${'abcdefgh'[columnIndex]}${8 - rowIndex}` as Square;
          const isLight = (rowIndex + columnIndex) % 2 === 0;
          const isSelected = selected === square;
          const isTarget = destinations.includes(square);
          return (
            <button aria-label={`${square}${piece ? ` ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}` : ''}${isTarget ? ', legal move' : ''}`} aria-selected={isSelected} className={`chess-square ${isLight ? 'light' : 'dark'}${isSelected ? ' chosen' : ''}${isTarget ? ' legal-target' : ''}`} key={square} onClick={() => handleSquareClick(square)} role="gridcell" type="button">
              {piece && <span className={`chess-piece ${piece.color === 'w' ? 'white-piece' : 'black-piece'}`}>{pieces[`${piece.color}${piece.type}`]}</span>}
              {!piece && isTarget && <span className="move-dot" />}
              {columnIndex === 0 && <span className="rank-label">{8 - rowIndex}</span>}
              {rowIndex === 7 && <span className="file-label">{'abcdefgh'[columnIndex]}</span>}
            </button>
          );
        }))}
      </div>
    </section>
  );
}
