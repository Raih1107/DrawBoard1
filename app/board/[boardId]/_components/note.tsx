import { cn, colorToCss, getConstrastingTextColor } from "@/lib/utils";
import { NoteLayer } from "@/types/canvas";
import { useMutation } from "@liveblocks/react";
import { Kalam } from "next/font/google";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";

const font = Kalam({
    subsets: ["latin"],
    weight: ["400"],
});

interface NoteProps {
    id: string; 
    layer: NoteLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
};

// Compute font size strictly on height to allow width wrapping without shrinking font
const calculateFontSize = (height: number) => {
    const maxFontSize = 1000;
    const scaleFactor = 0.25; 
    return Math.min(height * scaleFactor, maxFontSize);
}

export const Note = ({
    layer,
    onPointerDown,
    id,
    selectionColor,
}: NoteProps ) => {
    const {x , y, width, height, fill, value} = layer;

    const updateValue = useMutation((
        {storage},
        newValue: string,
    ) => {
        const liveLayers = storage.get("layers");
        // Cast the retrieved layer to 'any' so we can set the "value" property
        const layer = liveLayers.get(id) as any;

        if (layer) {
            layer.set("value", newValue);
        }
    }, []);

    const handleContentChange = (e: ContentEditableEvent) => {
        updateValue(e.target.value);
    }

    return(
        <foreignObject
            x={x}
            y={y}
            width={width}
            height={height}
            onPointerDown={(e) => onPointerDown(e, id)}
            style={{
                outline: selectionColor ? `2px solid ${selectionColor}` : "none",
                backgroundColor: fill ? colorToCss(fill) : "#FFF",
                borderRadius: "8px", // Mostly for modern browsers
                overflow: "visible", // Prevents text from being swallowed if it overruns the sticky note bounds slightly
            }}
            className="shadow-xl drop-shadow-2xl"
        >
            <ContentEditable 
                html={value || "Text"}
                onChange={handleContentChange}
                className={cn(
                    "flex items-center justify-center text-center outline-none",
                    font.className
                )}
                style={{
                    width: width,
                    height: height,
                    fontSize: calculateFontSize(height),
                    color: fill ? getConstrastingTextColor(fill) : "#000",
                    wordWrap: "break-word",
                    whiteSpace: "pre-wrap",
                }}
            />
        </foreignObject>
    )
}