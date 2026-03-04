import { useEffect, useRef } from "react";

/**
 * Renders the 12Go Asia travel widget for a given city.
 * @param {string} city - The destination city
 * @param {number} width - Widget width (default 400)
 * @param {string} lang - Language code (default "en")
 * @param {string} fxcode - Currency code (default "USD")
 */
export default function TwelveGoWidget({ city = "Manila", width = "100%", lang = "en", fxcode = "USD" }) {
  const containerRef = useRef(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Load script only once
    if (!document.querySelector('script[src="https://agent.12go.asia/tools/widget/widget.js"]')) {
      const script = document.createElement("script");
      script.src = "https://agent.12go.asia/tools/widget/widget.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // Clear and re-render widget element each time props change
    containerRef.current.innerHTML = "";
    const widget = document.createElement("onetwogo-travelto-widget");
    widget.setAttribute("city", city);
    widget.setAttribute("width", width);
    widget.setAttribute("agent", "15166459");
    widget.setAttribute("lang", lang);
    widget.setAttribute("fxcode", fxcode);
    widget.setAttribute("wl", "12go.asia");
    containerRef.current.appendChild(widget);
  }, [city, width, lang, fxcode]);

  return <div ref={containerRef} className="w-full" />;
}