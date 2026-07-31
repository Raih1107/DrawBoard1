"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { ToolButton } from "./tool-button";
import {
  Circle,
  MousePointer2,
  Pencil,
  Redo2,
  Square,
  StickyNote,
  Type,
  Undo,
  Minus,
  Eraser,
} from "lucide-react";

import { CanvasMode, CanvasState, LayerType } from "@/types/canvas";
import { useEffect, useState, useRef } from "react";

interface ToolbarProps {
  canvasState: CanvasState;
  setCanvasState: (newState: CanvasState) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  eraserSize: number;
  setEraserSize: (s: number) => void;
}

export const Toolbar = ({
  canvasState,
  setCanvasState,
  undo,
  redo,
  canUndo,
  canRedo,
  eraserSize,
  setEraserSize,
}: ToolbarProps) => {
  const [showEraserSlider, setShowEraserSlider] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const isEraserActive = canvasState.mode === CanvasMode.Eraser;
  const isLineActive   = canvasState.mode === CanvasMode.Line;

  useEffect(() => {
    setShowEraserSlider(isEraserActive);
  }, [isEraserActive]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case "1": setCanvasState({ mode: CanvasMode.None }); break;
        case "2": setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Text }); break;
        case "3": setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Note }); break;
        case "4": setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Rectangle }); break;
        case "5": setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Ellipse }); break;
        case "6": setCanvasState({ mode: CanvasMode.Pencil }); break;
        case "7": setCanvasState({ mode: CanvasMode.Line }); break;
        case "8": setCanvasState({ mode: CanvasMode.Eraser }); break;
        case "9": undo(); break;
        case "0": redo(); break;
        default: break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setCanvasState, undo, redo]);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-y-2 z-50 pointer-events-none">
      <div
        className="pointer-events-auto flex gap-1 items-center px-1.5 py-1.5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        style={{
          background: "rgba(15,17,23,0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)"
        }}
      >
        <ToolButton label="Select (1)"    icon={MousePointer2} onClick={() => setCanvasState({ mode: CanvasMode.None })} isActive={
          canvasState.mode === CanvasMode.None ||
          canvasState.mode === CanvasMode.Translating ||
          canvasState.mode === CanvasMode.SelectionNet ||
          canvasState.mode === CanvasMode.Pressing ||
          canvasState.mode === CanvasMode.Resizing
        } />
        <ToolButton label="Text (2)"      icon={Type}       onClick={() => setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Text })}      isActive={canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Text} />
        <ToolButton label="Sticky (3)"    icon={StickyNote} onClick={() => setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Note })}      isActive={canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Note} />
        <ToolButton label="Rectangle (4)" icon={Square}     onClick={() => setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Rectangle })} isActive={canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Rectangle} />
        <ToolButton label="Ellipse (5)"   icon={Circle}     onClick={() => setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Ellipse })}   isActive={canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Ellipse} />
        <ToolButton label="Pen (6)"       icon={Pencil}     onClick={() => setCanvasState({ mode: CanvasMode.Pencil })} isActive={canvasState.mode === CanvasMode.Pencil} />
        <ToolButton label="Line (7)"      icon={Minus}      onClick={() => setCanvasState({ mode: CanvasMode.Line })}   isActive={isLineActive} />
        <ToolButton label="Eraser (8)"    icon={Eraser}     onClick={() => setCanvasState({ mode: CanvasMode.Eraser })} isActive={isEraserActive} />

        <div className="w-[1px] h-6 bg-white/10 mx-1" />
        <ToolButton label="Undo (9)" icon={Undo}  onClick={undo} isDisabled={!canUndo} />
        <ToolButton label="Redo (0)" icon={Redo2} onClick={redo} isDisabled={!canRedo} />
      </div>

      {/* Eraser size slider — appears below toolbar when eraser is active */}
      {showEraserSlider && (
        <div
          ref={sliderRef}
          className="pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-xl shadow-2xl"
          style={{
            background: "rgba(15,17,23,0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Eraser className="w-3.5 h-3.5 text-white/50" />
          <span className="text-white/50 text-[11px] font-medium w-8">Size</span>
          <input
            type="range" min={8} max={80} step={2}
            value={eraserSize}
            onChange={(e) => setEraserSize(Number(e.target.value))}
            className="w-28 accent-indigo-500 cursor-pointer"
          />
          <div
            className="rounded-full border-2 border-white/40 bg-white/5 flex-shrink-0"
            style={{ width: Math.max(8, eraserSize / 2), height: Math.max(8, eraserSize / 2) }}
          />
        </div>
      )}
    </div>
  );
};

export const ToolbarSkeleton = () => {
  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-row gap-x-1 px-2 py-1.5 rounded-2xl z-50 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      style={{
        background: "rgba(15,17,23,0.8)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)"
      }}
    >
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-10 rounded-xl bg-white/5" />
      ))}
    </div>
  );
};
