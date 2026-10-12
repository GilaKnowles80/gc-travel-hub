import { useEffect, useRef } from "react";

/**
 * Embeds the 12Go Asia booking form widget using the official script embed.
 * Uses affiliate ID 15166459.
 */
export default function TwelveGoFormWidget({ width = 250, height = 320 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "//cdn0.trainbusferry.com/tools/form/en/?id=15166459&domain=12go.asia";
    script.setAttribute("data-one2go", "15166459");
    script.setAttribute("data-color", "default");
    script.setAttribute("data-language", "en");
    script.setAttribute("data-width", String(width));
    script.setAttribute("data-height", String(height));
    script.setAttribute("data-border", "1");
    script.setAttribute("data-logo", "https://media.base44.com/images/public/698ba6f12468e8d5e020a7b5/ccc1d0359_logo.jpg");
    script.setAttribute("data-domain", "12go.asia");
    script.async = true;

    containerRef.current.appendChild(script);

    const powered = document.createElement("div");
    powered.innerHTML = `Powered by <a href="https://12go.asia/?z=15166459" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline;">12Go system</a>`;
    powered.style.fontSize = "11px";
    powered.style.marginTop = "4px";
    powered.style.color = "#64748b";
    containerRef.current.appendChild(powered);
  }, [width, height]);

  return <div ref={containerRef} className="w-full" />;
}