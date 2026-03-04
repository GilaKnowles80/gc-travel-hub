/**
 * 12Go Asia Timetable Embed Component
 * Mirrors the WordPress [timetable] shortcode from the 12Go Widgets plugin.
 *
 * Props:
 *  country    - ISO country code (default "PH")
 *  from       - Origin city (default "Manila")
 *  to         - Destination city (optional)
 *  lang       - Language code (default "en")
 *  curr       - Currency code (default "USD")
 *  noreturn   - Hide return trip (default false)
 *  lesslinks  - Minimal links mode (default false)
 *  domain     - Domain (default "12go.asia")
 *  height     - iframe height (default "500px")
 */
export default function TwelveGoTimetable({
  country = "PH",
  from = "Manila",
  to = "",
  lang = "en",
  curr = "USD",
  noreturn = false,
  lesslinks = false,
  domain = "12go.asia",
  height = "500px",
}) {
  const AGENT_ID = "15166459";

  let path = `/${lang}/timetable/${country}`;
  if (from) {
    path += "/" + from.replace(/ /g, "-");
    if (to) path += "/" + to.replace(/ /g, "-");
  }

  const params = new URLSearchParams();
  params.set("embedded", "");
  params.set("css", "yes");
  params.set("z", AGENT_ID);
  if (curr) params.set("currency", curr);
  if (noreturn) params.set("noreturn", "1");
  if (lesslinks) params.set("lesslinks", "1");

  const src = `https://${domain}${path}?${params.toString()}`;

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