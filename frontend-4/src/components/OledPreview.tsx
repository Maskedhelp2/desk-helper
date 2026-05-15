import { useEffect, useRef } from "react";
import { useDeviceStore } from "../store/deviceStore";

function OledPreview() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const { oled, currentLayer, currentProfile } = useDeviceStore();

  useEffect(() => {
    let animationFrame = 0;

    // Load image once
    if (oled?.logo) {
      const img = new Image();
      img.src = oled.logo;
      imgRef.current = img;
    } else {
      imgRef.current = null;
    }

    const draw = (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // clear canvas
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "white";
      ctx.font = "10px monospace";

      // ================= IMAGE MODE =================
      if (imgRef.current && imgRef.current.complete) {
        const img = imgRef.current;

        const scale = Math.min(
          canvas.width / img.width,
          canvas.height / img.height
        );

        const w = img.width * scale;
        const h = img.height * scale;

        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;

        if (oled?.effect === "pulse") {
          const alpha = 0.5 + 0.5 * Math.sin(time / 300);
          ctx.globalAlpha = alpha;
        }

        ctx.drawImage(img, x, y, w, h);
        ctx.globalAlpha = 1;
      } else {
        // ================= TEXT MODE =================

        const getValue = (type?: string) => {
          if (!type) return "";

          if (type === "Layer") return `Layer ${currentLayer}`;
          if (type === "Profile") return currentProfile ?? "";
          if (type === "Custom") return "Hello OLED";

          return "";
        };

        let offset = 0;

        if (oled?.effect === "scroll") {
          offset = (time / 50) % 100;
        }

        const layout = oled?.layout || { A: "", B: "", C: "" };

        ctx.fillText(getValue(layout.A), 5 - offset, 12);
        ctx.fillText(getValue(layout.B), 5 - offset, 40);
        ctx.fillText(getValue(layout.C), 70 - offset, 40);
      }

      animationFrame = requestAnimationFrame(draw);
    };

    animationFrame = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animationFrame);
  }, [oled, currentLayer, currentProfile]);

  return (
    <canvas
      ref={canvasRef}
      width={128}
      height={64}
      className="border border-gray-600 bg-black"
    />
  );
}

export default OledPreview;