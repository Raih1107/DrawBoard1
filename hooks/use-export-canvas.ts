import { useCallback } from "react";

/**
 * Serializes the board's <svg> element to a PNG data-URL via an
 * off-screen HTML Canvas, then optionally wraps it in a jsPDF document.
 *
 * Strategy
 * --------
 * 1. Grab the SVG element from the DOM (we give it a stable `id`).
 * 2. Clone it so we can safely mutate dimensions & inline fonts.
 * 3. Convert SVG → Blob URL → Image → draw on <canvas> → export.
 */

const SVG_ELEMENT_ID = "board-canvas-svg";

/** Returns a Promise<string> resolving to a PNG data URL. */
async function svgToPngDataUrl(svgEl: SVGSVGElement): Promise<string> {
  // Capture the visible viewport size (the whole SVG area)
  const { width, height } = svgEl.getBoundingClientRect();

  // Clone so we can strip camera transform and set explicit dimensions
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  // 1. Remove specific objects that taint the canvas (avatars)
  const images = clone.querySelectorAll("image");
  images.forEach((img) => img.remove());

  // 2. Convert all text & notes (foreignObject HTML) into pure SVG primitives!
  // Chrome aggressively taints canvases if drawn SVGs contain foreignObject HTML (due to CSS history leaks).
  const foreignObjects = Array.from(clone.querySelectorAll("foreignObject"));
  foreignObjects.forEach((fo) => {
    const hasText = fo.querySelector("[contenteditable]") as HTMLElement | null;
    if (!hasText) {
      // It's a cursor or other overlay - strip it completely
      fo.remove();
    } else {
      // Convert HTML ContentEditable into a pure SVG group
      const x = Number(fo.getAttribute("x") || 0);
      const y = Number(fo.getAttribute("y") || 0);
      const width = Number(fo.getAttribute("width") || 0);
      const height = Number(fo.getAttribute("height") || 0);

      // Extract inline styles directly (since the clone is detached from DOM)
      const bgColor = (fo as unknown as HTMLElement).style.backgroundColor;
      const fgColor = hasText.style.color || "#000";
      const fontSize = hasText.style.fontSize || "20px";
      const textContent = hasText.innerText || hasText.textContent || "";
      
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

      // Draw background if sticky note
      if (bgColor && bgColor !== "transparent" && bgColor !== "rgba(0, 0, 0, 0)") {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", String(x));
        rect.setAttribute("y", String(y));
        rect.setAttribute("width", String(width));
        rect.setAttribute("height", String(height));
        rect.setAttribute("fill", bgColor);
        rect.setAttribute("rx", "8"); // rounded corners like the HTML note
        group.appendChild(rect);
      }

      // Draw text
      const svgText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      svgText.setAttribute("x", String(x + width / 2));
      svgText.setAttribute("fill", fgColor);
      svgText.setAttribute("font-size", fontSize);
      svgText.setAttribute("font-family", "sans-serif, Kalam, cursive");
      svgText.setAttribute("text-anchor", "middle"); // Horizontally centered
      
      // Basic multiline support
      const lines = textContent.split('\n');
      const fontSizeNum = parseInt(fontSize, 10) || 20;
      const lineHeight = fontSizeNum * 1.2;
      // Start Y so the entire text block is roughly vertically centered
      const startY = (height / 2) - ((lines.length - 1) * lineHeight) / 2;

      lines.forEach((line, index) => {
        const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        tspan.setAttribute("x", String(x + width / 2));
        tspan.setAttribute("y", String(y + startY + (index * lineHeight)));
        tspan.setAttribute("dominant-baseline", "central"); // Vertically centered tspan
        tspan.textContent = line;
        svgText.appendChild(tspan);
      });

      group.appendChild(svgText);
      fo.parentNode?.replaceChild(group, fo);
    }
  });

  // Prepend a background rect so the PNG isn't transparent
  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("width", "100%");
  bg.setAttribute("height", "100%");
  bg.setAttribute("fill", "#0f1117");
  clone.insertBefore(bg, clone.firstChild);

  const svgString = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // Use device pixel ratio for crisp exports on HiDPI screens
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
}

/** Triggers a browser file download. */
function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export function useExportCanvas(boardTitle: string) {
  const exportAsPng = useCallback(async () => {
    const svgEl = document.getElementById(SVG_ELEMENT_ID) as SVGSVGElement | null;
    if (!svgEl) return;
    try {
      const dataUrl = await svgToPngDataUrl(svgEl);
      const safeName = boardTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      triggerDownload(dataUrl, `${safeName}.png`);
    } catch (err) {
      console.error("PNG export failed:", err);
    }
  }, [boardTitle]);

  const exportAsPdf = useCallback(async () => {
    const svgEl = document.getElementById(SVG_ELEMENT_ID) as SVGSVGElement | null;
    if (!svgEl) return;
    try {
      // Dynamic import keeps jspdf out of the main bundle
      const { jsPDF } = await import("jspdf");
      const dataUrl = await svgToPngDataUrl(svgEl);
      const { width, height } = svgEl.getBoundingClientRect();

      // Landscape PDF sized to the canvas viewport
      const pdf = new jsPDF({
        orientation: width > height ? "landscape" : "portrait",
        unit: "px",
        format: [width, height],
        hotfixes: ["px_scaling"],
      });

      pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
      const safeName = boardTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      pdf.save(`${safeName}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    }
  }, [boardTitle]);

  return { exportAsPng, exportAsPdf };
}
