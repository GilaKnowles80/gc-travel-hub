/**
 * 12Go Asia Timetable Embed Component
 * Mirrors the WordPress [timetable] shortcode from the 12Go Widgets plugin.
 *
 * Props:
 *  country    - ISO country code (default "PH")
 *  from       - Origin city (default "Manila")
 *  to         - Destination city (optional)
 *  transportClass - Transport type: 'bus','train','ferry','van','avia','charter' (optional)
 *  lang       - Language code (default "en")
 *  curr       - Currency code (default "USD")
 *  noreturn   - Hide return trip (default false)
 *  lesslinks  - Remove unnecessary links (default false)
 *  domain     - Domain (default "12go.asia")
 *  height     - iframe height (default "500px")
 */
export default function TwelveGoTimetable({
  country = "PH",
  from = "Manila",
  to = "",
  transportClass = "",
  lang = "en",
  curr = "USD",
  noreturn = false,
  lesslinks = false,
  domain = "12go.asia",
  height = "500px",
}) {
  const AGENT_ID = "15166459";

  // Build path: /{lang}/timetable/{country}/{from}/{to}/{class}
  let path = `/${lang}/timetable/${country}`;
  path += "/" + from.replace(/ /g, "-");
  if (to) path += "/" + to.replace(/ /g, "-");
  if (transportClass) path += "/" + transportClass.replace(/ /g, "");

  // Build query string (matches PHP v2.0 logic exactly)
  let query = `${path}?embedded&css=yes&z=${AGENT_ID}`;
  if (noreturn) query += "&noreturn";
  if (lesslinks) query += "&lesslinks";
  if (lang) query += `&lang=${lang}`;
  if (curr) query += `&currency=${curr}`;

  const src = `https://${domain}${query}`;

  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <iframe
        src={src}
        style={{ width: "100%", height, border: "none" }}
        title={`12Go Timetable: ${from}${to ? " → " + to : ""}`}
        loading="lazy"
      />
      <div className="text-xs text-slate-400 px-3 py-1.5 bg-slate-50 border-t border-slate-100">
        Powered by{" "}
        <a
          href={`https://12go.asia/?z=${AGENT_ID}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          12Go system
        </a>
      </div>
    </div>
  );
}