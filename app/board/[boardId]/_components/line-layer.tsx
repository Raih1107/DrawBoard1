import { colorToCss } from "@/lib/utils";
import { LineLayer } from "@/types/canvas";

interface LineLayerComponentProps {
    id: string;
    layer: LineLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
}

export const LineLayerComponent = ({
    id,
    layer,
    onPointerDown,
    selectionColor,
}: LineLayerComponentProps) => {
    const { x, y, x2, y2, fill, strokeWidth = 3 } = layer;
    const color = colorToCss(fill);

    return (
        <line
            x1={x}
            y1={y}
            x2={x2}
            y2={y2}
            stroke={selectionColor || color}
            strokeWidth={selectionColor ? strokeWidth + 2 : strokeWidth}
            strokeLinecap="round"
            onPointerDown={(e) => onPointerDown(e, id)}
            style={{ cursor: "move" }}
        />
    );
};
