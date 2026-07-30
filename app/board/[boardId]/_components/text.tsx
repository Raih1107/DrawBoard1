import { cn, colorToCss } from "@/lib/utils";
import { TextLayer } from "@/types/canvas";
import { useMutation } from "@liveblocks/react";
import { Kalam } from "next/font/google";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";

const font = Kalam({
    subsets: ["latin"],
    weight: ["400"],
});

interface TextProps {
    id: string; 
    layer: TextLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
};

// Compute font size based purely on the height so width just acts as a wrapping boundary!
const calculateFontSize = (height: number) => {
    const maxFontSize = 1000;
    const scaleFactor = 0.5; // Much better default ratio for a single line of text
    return Math.min(height * scaleFactor, maxFontSize);
}

export const Text = ({
    layer,
    onPointerDown,
    id,
    selectionColor,
}: TextProps ) => {
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
                outline: selectionColor ? `1px solid ${selectionColor}` : "none",
                overflow: "visible", // Prevents text from disappearing when expanding beyond bounds
            }}
        >
            <ContentEditable 
                html={value || "Text"}
                onChange={handleContentChange}
                className={cn(
                    "flex items-center justify-center text-center drop-shadow-md outline-none",
                    font.className
                )}
                style={{
                    // Allow it to grow dynamically inside the foreignObject bounds or scale correctly
                    width: width,
                    height: height,
                    fontSize: calculateFontSize(height),
                    color: fill ? colorToCss(fill) : "#FFF",
                    wordWrap: "break-word",
                    whiteSpace: "pre-wrap",
                }}
            />
        </foreignObject>
    )
}