import { ArrowLayer } from "@/types/canvas";
import { ArrowRight } from "lucide-react";

interface ArrowProps {
  id: string;
  layer: ArrowLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
  selectionColor?: string;
}

export const Arrow = ({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: ArrowProps) => {

    
if (!layer?.start || !layer?.end) {
  return null; // Or show a placeholder/fallback
}

const { start, end, stroke } = layer;

const arrowColor =
  stroke && stroke.r !== undefined
    ? `rgb(${stroke.r}, ${stroke.g}, ${stroke.b})`
    : 'black'; // fallback if stroke is undefined

const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);



  return (
    <>
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke={arrowColor}
        strokeWidth={2}
        onPointerDown={(e) => onPointerDown(e, id)}
      />
      <ArrowRight
        size={16}
        style={{
          position: "absolute",
          left: end.x,
          top: end.y,
          transform: `translate(-50%, -50%) rotate(${angle}deg)`,
          color: arrowColor,
          pointerEvents: "none",
        }}
      />
    </>
  );
};
