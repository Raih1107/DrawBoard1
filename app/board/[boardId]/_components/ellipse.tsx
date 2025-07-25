import { colorToCss } from "@/lib/utils";
import { EllipseLayer } from "@/types/canvas";




interface EllipseProps {
    id: string;
    layer: EllipseLayer;
    onPointerDown: (e: React.PointerEvent, layerId: string) => void;
    selectionColor?: string;
};


export const Ellipse = ({
    id,
    layer,
    onPointerDown,
    selectionColor,
}: EllipseProps ) => {
    return (
        <ellipse 
            className="drop-shadow-md"
            onPointerDown={(e) => onPointerDown(e, id)}
            style={{
                transform: `translate(${layer.x}px , ${layer.y}px)`
            }}
            cx={layer.width / 2}
            cy={layer.height / 2}
            rx={layer.width / 2}
            ry={layer.height / 2}
            stroke={layer.fill ? colorToCss(layer.fill) : "#FFF"}
            fill={selectionColor || "transparent"}
            strokeWidth="3"

        />
    )
}
