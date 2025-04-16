import React, { useState, useEffect, useRef } from "react";

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

const SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  L: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  J: [
    [0, 0, 1],
    [1, 1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
};

const randomShape = () => {
  const keys = Object.keys(SHAPES);
  const rand = keys[Math.floor(Math.random() * keys.length)];
  return { shape: SHAPES[rand], type: rand };
};

const Tetris = () => {
  const [board, setBoard] = useState(
    Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(0))
  );
  const [current, setCurrent] = useState({ ...randomShape(), row: 0, col: 3 });
  const [gameOver, setGameOver] = useState(false);
  const gameLoop = useRef(null);

  const merge = (shape, board, row, col) => {
    return board.map((r, y) =>
      r.map((val, x) => (shape[y - row]?.[x - col] ? 1 : val))
    );
  };

  const isValid = (shape, board, row, col) => {
    return shape.every((r, y) =>
      r.every((cell, x) => {
        if (!cell) return true;
        const newY = y + row;
        const newX = x + col;
        return (
          newY >= 0 &&
          newY < ROWS &&
          newX >= 0 &&
          newX < COLS &&
          board[newY][newX] === 0
        );
      })
    );
  };

  const rotate = (shape) =>
    shape[0].map((_, i) => shape.map((row) => row[i]).reverse());

  const move = (dy, dx, rotateShape = false) => {
    const newShape = rotateShape ? rotate(current.shape) : current.shape;
    const newRow = current.row + dy;
    const newCol = current.col + dx;
    if (isValid(newShape, board, newRow, newCol)) {
      setCurrent({ ...current, shape: newShape, row: newRow, col: newCol });
    } else if (dy === 1 && dx === 0 && !rotateShape) {
      const newBoard = merge(current.shape, board, current.row, current.col);
      clearLines(newBoard);
    }
  };

  const clearLines = (newBoard) => {
    const cleared = newBoard.filter((row) => row.some((cell) => !cell));
    const lines = ROWS - cleared.length;
    const newFull = Array(lines).fill(Array(COLS).fill(0));
    const finalBoard = [...newFull, ...cleared];
    setBoard(finalBoard);
    const newCurrent = { ...randomShape(), row: 0, col: 3 };
    if (!isValid(newCurrent.shape, finalBoard, 0, 3)) {
      setGameOver(true);
    } else {
      setCurrent(newCurrent);
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return;
      switch (e.key) {
        case "ArrowLeft":
          move(0, -1);
          break;
        case "ArrowRight":
          move(0, 1);
          break;
        case "ArrowDown":
          move(1, 0);
          break;
        case "ArrowUp":
          move(0, 0, true);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [current, board, gameOver]);

  useEffect(() => {
    if (gameOver) return;
    gameLoop.current = setInterval(() => move(1, 0), 500);
    return () => clearInterval(gameLoop.current);
  }, [current]);

  return (
    <div style={{ textAlign: "center", marginTop: 20 }}>
      <h1>Tetris</h1>
      {gameOver && (
        <div style={{ color: "red", fontWeight: "bold" }}>Game Over</div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${ROWS}, ${BLOCK_SIZE}px)`,
          gridTemplateColumns: `repeat(${COLS}, ${BLOCK_SIZE}px)`,
          border: "2px solid #333",
          margin: "0 auto",
          width: `${COLS * BLOCK_SIZE}px`,
        }}
      >
        {merge(current.shape, board, current.row, current.col)
          .flat()
          .map((cell, i) => (
            <div
              key={i}
              style={{
                width: BLOCK_SIZE,
                height: BLOCK_SIZE,
                backgroundColor: cell ? "dodgerblue" : "white",
                border: "1px solid #ccc",
              }}
            />
          ))}
      </div>
    </div>
  );
};

export default Tetris;
