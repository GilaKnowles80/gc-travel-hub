import { useEffect, useRef } from "react";

/**
 * Renders the 12Go Asia country-level travel widget.
 * @param {string} country - ISO country code (e.g. "PH", "TH")
 * @param {string|number} width - Widget width (default "100%")
 * @param {string} lang - Language code (default "en")
 * @param {string} fxcode - Currency code (default "USD")
 */
export default function TwelveGoCountryWidget({ country = "BE", width = "400", lang = "en", fxcode = "USD" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Load script only once
    if (!document.querySelector('script[src="https://agent.12go.asia/tools/widget/country_widget.js"]')) {
      const script = document.createElement("script");
      script.src = "https://agent.12go.asia/tools/widget/country_widget.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // Re-render widget element each time props change
    containerRef.current.innerHTML = "";
    const widget = document.createElement("onetwogo-country-widget");
    widget.setAttribute("country", country);
    widget.setAttribute("width", width);
    widget.setAttribute("agent", "15166459");
    widget.setAttribute("lang", lang);
    widget.setAttribute("fxcode", fxcode);
    widget.setAttribute("wl", "12go.asia");
    containerRef.current.appendChild(widget);
  }, [country, width, lang, fxcode]);

  return <div ref={containerRef} className="w-full" />;
}