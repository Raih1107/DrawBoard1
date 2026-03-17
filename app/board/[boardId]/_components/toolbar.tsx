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
} from "lucide-react";

import { CanvasMode, CanvasState, LayerType } from "@/types/canvas";
import { useEffect } from "react";

interface ToolbarProps {
  canvasState: CanvasState;
  setCanvasState: (newState: CanvasState) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const Toolbar = ({
  canvasState,
  setCanvasState,
  undo,
  redo,
  canUndo,
  canRedo,
}: ToolbarProps) => {

   useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Ignore shortcuts while typing in inputs
      }

      switch (e.key) {
        case "1":
          setCanvasState({ mode: CanvasMode.None });
          break;
        case "2":
          setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Text });
          break;
        case "3":
          setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Note });
          break;
        case "4":
          setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Rectangle });
          break;
        case "5":
          setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Ellipse });
          break;
        case "6":
          setCanvasState({ mode: CanvasMode.Pencil });
          break;
        case "7":
          setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Arrow });
          break;
        case "8":
          setCanvasState({ mode: CanvasMode.Eraser });
          break;
        case "9":
          undo();
          break;
        case "0":
          redo();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setCanvasState, undo, redo]);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-row gap-x-2 z-50 pointer-events-none">
      <div 
        className="pointer-events-auto flex gap-1 items-center px-1.5 py-1.5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        style={{
          background: "rgba(15,17,23,0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)"
        }}
      >
        <ToolButton label="Select (1)" icon={MousePointer2} onClick={() => setCanvasState({ mode: CanvasMode.None })} isActive={
          canvasState.mode === CanvasMode.None ||
          canvasState.mode === CanvasMode.Translating ||
          canvasState.mode === CanvasMode.SelectionNet ||
          canvasState.mode === CanvasMode.Pressing ||
          canvasState.mode === CanvasMode.Resizing
        } />
        <ToolButton label="Text (2)" icon={Type} onClick={() => setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Text })} isActive={
          canvasState.mode === CanvasMode.Inserting &&
          canvasState.layerType === LayerType.Text
        } />
        <ToolButton label="Sticky note (3)" icon={StickyNote} onClick={() => setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Note })} isActive={
          canvasState.mode === CanvasMode.Inserting &&
          canvasState.layerType === LayerType.Note
        } />
        <ToolButton label="Rectangle (4)" icon={Square} onClick={() => setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Rectangle })} isActive={
          canvasState.mode === CanvasMode.Inserting &&
          canvasState.layerType === LayerType.Rectangle
        } />
        <ToolButton label="Ellipse (5)" icon={Circle} onClick={() => setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Ellipse })} isActive={
          canvasState.mode === CanvasMode.Inserting &&
          canvasState.layerType === LayerType.Ellipse
        } />
        <ToolButton label="Pen (6)" icon={Pencil} onClick={() => setCanvasState({ mode: CanvasMode.Pencil })} isActive={canvasState.mode === CanvasMode.Pencil} />
        
        <div className="w-[1px] h-6 bg-white/10 mx-1" />
        
        <ToolButton label="Undo (9)" icon={Undo} onClick={undo} isDisabled={!canUndo} />
        <ToolButton label="Redo (0)" icon={Redo2} onClick={redo} isDisabled={!canRedo} />
      </div>
    </div>
  );
};

export const ToolbarSkeleton = () => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-row gap-x-1 px-2 py-1.5 rounded-2xl z-50 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      style={{
        background: "rgba(15,17,23,0.8)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)"
      }}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-10 rounded-xl bg-white/5" />
      ))}
    </div>
  );
};
