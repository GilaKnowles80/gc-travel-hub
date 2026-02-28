import React, { useState, useRef, useEffect } from "react";
import { MapPin, Search } from "lucide-react";

// Global train stations grouped by region
const STATIONS = [
  // ── EUROPE ──
  // UK
  { name: "London St Pancras International", code: "STP", country: "United Kingdom", region: "Europe" },
  { name: "London Waterloo", code: "WAT", country: "United Kingdom", region: "Europe" },
  { name: "London Paddington", code: "PAD", country: "United Kingdom", region: "Europe" },
  { name: "London King's Cross", code: "KGX", country: "United Kingdom", region: "Europe" },
  { name: "London Euston", code: "EUS", country: "United Kingdom", region: "Europe" },
  { name: "Manchester Piccadilly", code: "MAN", country: "United Kingdom", region: "Europe" },
  { name: "Birmingham New Street", code: "BHM", country: "United Kingdom", region: "Europe" },
  { name: "Edinburgh Waverley", code: "EDB", country: "United Kingdom", region: "Europe" },
  { name: "Glasgow Central", code: "GLC", country: "United Kingdom", region: "Europe" },
  // France
  { name: "Paris Gare du Nord", code: "CDG", country: "France", region: "Europe" },
  { name: "Paris Gare de Lyon", code: "PLY", country: "France", region: "Europe" },
  { name: "Paris Gare de l'Est", code: "PDE", country: "France", region: "Europe" },
  { name: "Paris Gare Montparnasse", code: "MTP", country: "France", region: "Europe" },
  { name: "Lyon Part-Dieu", code: "LYN", country: "France", region: "Europe" },
  { name: "Marseille Saint-Charles", code: "MRS", country: "France", region: "Europe" },
  { name: "Bordeaux Saint-Jean", code: "BOD", country: "France", region: "Europe" },
  { name: "Lille-Europe", code: "LIL", country: "France", region: "Europe" },
  { name: "Strasbourg", code: "SXB", country: "France", region: "Europe" },
  { name: "Nice Ville", code: "NCE", country: "France", region: "Europe" },
  // Germany
  { name: "Berlin Hauptbahnhof", code: "BLS", country: "Germany", region: "Europe" },
  { name: "Munich Hauptbahnhof", code: "MUC", country: "Germany", region: "Europe" },
  { name: "Frankfurt Hauptbahnhof", code: "FKB", country: "Germany", region: "Europe" },
  { name: "Hamburg Hauptbahnhof", code: "HAM", country: "Germany", region: "Europe" },
  { name: "Cologne Hauptbahnhof", code: "CGN", country: "Germany", region: "Europe" },
  { name: "Stuttgart Hauptbahnhof", code: "STR", country: "Germany", region: "Europe" },
  { name: "Düsseldorf Hauptbahnhof", code: "DUS", country: "Germany", region: "Europe" },
  { name: "Leipzig Hauptbahnhof", code: "LEJ", country: "Germany", region: "Europe" },
  { name: "Nuremberg Hauptbahnhof", code: "NUE", country: "Germany", region: "Europe" },
  { name: "Dresden Hauptbahnhof", code: "DRS", country: "Germany", region: "Europe" },
  // Spain
  { name: "Madrid Atocha", code: "MAD", country: "Spain", region: "Europe" },
  { name: "Madrid Chamartin", code: "MCH", country: "Spain", region: "Europe" },
  { name: "Barcelona Sants", code: "BCN", country: "Spain", region: "Europe" },
  { name: "Valencia Joaquín Sorolla", code: "VLC", country: "Spain", region: "Europe" },
  { name: "Seville Santa Justa", code: "SVQ", country: "Spain", region: "Europe" },
  { name: "Bilbao Abando", code: "BIO", country: "Spain", region: "Europe" },
  { name: "Zaragoza Delicias", code: "ZAZ", country: "Spain", region: "Europe" },
  { name: "Málaga Maria Zambrano", code: "AGP", country: "Spain", region: "Europe" },
  // Italy
  { name: "Rome Termini", code: "ROM", country: "Italy", region: "Europe" },
  { name: "Milan Centrale", code: "MIL", country: "Italy", region: "Europe" },
  { name: "Venice Santa Lucia", code: "VCE", country: "Italy", region: "Europe" },
  { name: "Florence Santa Maria Novella", code: "FLR", country: "Italy", region: "Europe" },
  { name: "Naples Centrale", code: "NAP", country: "Italy", region: "Europe" },
  { name: "Turin Porta Nuova", code: "TRN", country: "Italy", region: "Europe" },
  { name: "Bologna Centrale", code: "BLQ", country: "Italy", region: "Europe" },
  { name: "Genoa Piazza Principe", code: "GOA", country: "Italy", region: "Europe" },
  // Switzerland
  { name: "Zurich Hauptbahnhof", code: "ZRH", country: "Switzerland", region: "Europe" },
  { name: "Geneva Cornavin", code: "GVA", country: "Switzerland", region: "Europe" },
  { name: "Bern Hauptbahnhof", code: "BRN", country: "Switzerland", region: "Europe" },
  { name: "Basel SBB", code: "BSL", country: "Switzerland", region: "Europe" },
  { name: "Lausanne", code: "LSN", country: "Switzerland", region: "Europe" },
  { name: "Lucerne", code: "LUZ", country: "Switzerland", region: "Europe" },
  // Netherlands
  { name: "Amsterdam Centraal", code: "AMS", country: "Netherlands", region: "Europe" },
  { name: "Rotterdam Centraal", code: "RTM", country: "Netherlands", region: "Europe" },
  { name: "The Hague Centraal", code: "HAG", country: "Netherlands", region: "Europe" },
  { name: "Utrecht Centraal", code: "UTC", country: "Netherlands", region: "Europe" },
  // Belgium
  { name: "Brussels Midi/Zuid", code: "BRU", country: "Belgium", region: "Europe" },
  { name: "Brussels Central", code: "BRC", country: "Belgium", region: "Europe" },
  { name: "Bruges", code: "BGG", country: "Belgium", region: "Europe" },
  { name: "Antwerp Central", code: "ANR", country: "Belgium", region: "Europe" },
  // Austria
  { name: "Vienna Hauptbahnhof", code: "VIE", country: "Austria", region: "Europe" },
  { name: "Vienna Westbahnhof", code: "VIW", country: "Austria", region: "Europe" },
  { name: "Salzburg Hauptbahnhof", code: "SZG", country: "Austria", region: "Europe" },
  { name: "Innsbruck Hauptbahnhof", code: "INN", country: "Austria", region: "Europe" },
  // Czech Republic
  { name: "Prague Main Station (Praha hl. n.)", code: "PRG", country: "Czech Republic", region: "Europe" },
  { name: "Brno Main Station", code: "BNO", country: "Czech Republic", region: "Europe" },
  // Hungary
  { name: "Budapest Keleti", code: "BUD", country: "Hungary", region: "Europe" },
  { name: "Budapest Nyugati", code: "BDN", country: "Hungary", region: "Europe" },
  // Poland
  { name: "Warsaw Central (Warszawa Centralna)", code: "WAW", country: "Poland", region: "Europe" },
  { name: "Kraków Główny", code: "KRK", country: "Poland", region: "Europe" },
  { name: "Gdańsk Główny", code: "GDN", country: "Poland", region: "Europe" },
  { name: "Wrocław Główny", code: "WRO", country: "Poland", region: "Europe" },
  // Sweden
  { name: "Stockholm Central", code: "STO", country: "Sweden", region: "Europe" },
  { name: "Gothenburg Central", code: "GOT", country: "Sweden", region: "Europe" },
  { name: "Malmö Central", code: "MMX", country: "Sweden", region: "Europe" },
  // Norway
  { name: "Oslo Central (Oslo S)", code: "OSL", country: "Norway", region: "Europe" },
  { name: "Bergen Station", code: "BGO", country: "Norway", region: "Europe" },
  // Denmark
  { name: "Copenhagen Central (København H)", code: "CPH", country: "Denmark", region: "Europe" },
  // Finland
  { name: "Helsinki Central", code: "HEL", country: "Finland", region: "Europe" },
  // Portugal
  { name: "Lisbon Santa Apolónia", code: "LIS", country: "Portugal", region: "Europe" },
  { name: "Porto São Bento", code: "OPO", country: "Portugal", region: "Europe" },
  // Greece
  { name: "Athens Larissa Station", code: "ATH", country: "Greece", region: "Europe" },
  { name: "Thessaloniki Station", code: "SKG", country: "Greece", region: "Europe" },
  // Romania
  { name: "Bucharest Nord", code: "OTP", country: "Romania", region: "Europe" },
  { name: "Cluj-Napoca Station", code: "CLJ", country: "Romania", region: "Europe" },
  // Croatia
  { name: "Zagreb Glavni kolodvor", code: "ZAG", country: "Croatia", region: "Europe" },

  // ── RUSSIA ──
  { name: "Moscow Leningradsky", code: "MOW-L", country: "Russia", region: "Russia" },
  { name: "Moscow Yaroslavsky", code: "MOW-Y", country: "Russia", region: "Russia" },
  { name: "Moscow Kazansky", code: "MOW-K", country: "Russia", region: "Russia" },
  { name: "Moscow Kievsky", code: "MOW-Ki", country: "Russia", region: "Russia" },
  { name: "Moscow Belorussky", code: "MOW-B", country: "Russia", region: "Russia" },
  { name: "Saint Petersburg Moskovsky", code: "LED", country: "Russia", region: "Russia" },
  { name: "Saint Petersburg Vitebsky", code: "LED-V", country: "Russia", region: "Russia" },
  { name: "Novosibirsk Main", code: "OVB", country: "Russia", region: "Russia" },
  { name: "Yekaterinburg Station", code: "SVX", country: "Russia", region: "Russia" },
  { name: "Kazan Station", code: "KZN", country: "Russia", region: "Russia" },
  { name: "Nizhny Novgorod Station", code: "GOJ", country: "Russia", region: "Russia" },
  { name: "Vladivostok Station", code: "VVO", country: "Russia", region: "Russia" },
  { name: "Irkutsk Station", code: "IKT", country: "Russia", region: "Russia" },
  { name: "Omsk Station", code: "OMS", country: "Russia", region: "Russia" },
  { name: "Krasnoyarsk Station", code: "KJA", country: "Russia", region: "Russia" },
  { name: "Sochi Station", code: "AER", country: "Russia", region: "Russia" },

  // ── USA ──
  { name: "New York Penn Station", code: "NYP", country: "USA", region: "USA" },
  { name: "New York Grand Central Terminal", code: "GCT", country: "USA", region: "USA" },
  { name: "Washington Union Station", code: "WAS", country: "USA", region: "USA" },
  { name: "Chicago Union Station", code: "CHI", country: "USA", region: "USA" },
  { name: "Los Angeles Union Station", code: "LAX", country: "USA", region: "USA" },
  { name: "Boston South Station", code: "BOS", country: "USA", region: "USA" },
  { name: "Philadelphia 30th Street Station", code: "PHL", country: "USA", region: "USA" },
  { name: "Miami Central Station", code: "MIA", country: "USA", region: "USA" },
  { name: "New Orleans Union Passenger Terminal", code: "NOL", country: "USA", region: "USA" },
  { name: "Seattle King Street Station", code: "SEA", country: "USA", region: "USA" },
  { name: "Portland Union Station", code: "PDX", country: "USA", region: "USA" },
  { name: "San Francisco Transbay", code: "SFO", country: "USA", region: "USA" },
  { name: "Denver Union Station", code: "DEN", country: "USA", region: "USA" },
  { name: "Atlanta Peachtree Station", code: "ATL", country: "USA", region: "USA" },
  { name: "Baltimore Penn Station", code: "BAL", country: "USA", region: "USA" },
  { name: "Minneapolis/St. Paul Midway Station", code: "MSP", country: "USA", region: "USA" },
  { name: "Kansas City Union Station", code: "MCI", country: "USA", region: "USA" },
  { name: "San Antonio Amtrak", code: "SAT", country: "USA", region: "USA" },
  { name: "Orlando Amtrak", code: "ORL", country: "USA", region: "USA" },
  { name: "Tampa Union Station", code: "TPA", country: "USA", region: "USA" },
  // Canada
  { name: "Toronto Union Station", code: "TOR", country: "Canada", region: "USA" },
  { name: "Montreal Central Station", code: "YMQ", country: "Canada", region: "USA" },
  { name: "Vancouver Pacific Central", code: "YVR", country: "Canada", region: "USA" },
  { name: "Ottawa VIA Rail", code: "YOW", country: "Canada", region: "USA" },

  // ── ASIA ──
  // Japan
  { name: "Tokyo Station", code: "TYO", country: "Japan", region: "Asia" },
  { name: "Shinjuku Station", code: "SJK", country: "Japan", region: "Asia" },
  { name: "Shibuya Station", code: "SBY", country: "Japan", region: "Asia" },
  { name: "Osaka Station", code: "OSA", country: "Japan", region: "Asia" },
  { name: "Kyoto Station", code: "KIX", country: "Japan", region: "Asia" },
  { name: "Nagoya Station", code: "NGO", country: "Japan", region: "Asia" },
  { name: "Hiroshima Station", code: "HIJ", country: "Japan", region: "Asia" },
  { name: "Sapporo Station", code: "CTS", country: "Japan", region: "Asia" },
  { name: "Fukuoka (Hakata) Station", code: "FUK", country: "Japan", region: "Asia" },
  { name: "Sendai Station", code: "SDJ", country: "Japan", region: "Asia" },
  // China
  { name: "Beijing West Railway Station", code: "BJW", country: "China", region: "Asia" },
  { name: "Beijing South Railway Station", code: "BJS", country: "China", region: "Asia" },
  { name: "Shanghai Hongqiao Railway Station", code: "SHH", country: "China", region: "Asia" },
  { name: "Shanghai Railway Station", code: "SHN", country: "China", region: "Asia" },
  { name: "Guangzhou South Railway Station", code: "GZS", country: "China", region: "Asia" },
  { name: "Shenzhen North Station", code: "SZN", country: "China", region: "Asia" },
  { name: "Chengdu East Railway Station", code: "CTU", country: "China", region: "Asia" },
  { name: "Wuhan Railway Station", code: "WUH", country: "China", region: "Asia" },
  { name: "Xi'an North Railway Station", code: "XIY", country: "China", region: "Asia" },
  { name: "Chongqing North Station", code: "CKG", country: "China", region: "Asia" },
  { name: "Nanjing South Station", code: "NKG", country: "China", region: "Asia" },
  { name: "Hangzhou East Station", code: "HGH", country: "China", region: "Asia" },
  // India
  { name: "Mumbai Chhatrapati Shivaji Terminus", code: "CSTM", country: "India", region: "Asia" },
  { name: "Mumbai Central", code: "MMCT", country: "India", region: "Asia" },
  { name: "New Delhi Railway Station", code: "NDLS", country: "India", region: "Asia" },
  { name: "Delhi Hazrat Nizamuddin", code: "NZM", country: "India", region: "Asia" },
  { name: "Chennai Central", code: "MAS", country: "India", region: "Asia" },
  { name: "Kolkata Howrah Junction", code: "HWH", country: "India", region: "Asia" },
  { name: "Bangalore City Junction", code: "SBC", country: "India", region: "Asia" },
  { name: "Hyderabad Secunderabad Junction", code: "SC", country: "India", region: "Asia" },
  { name: "Ahmedabad Junction", code: "ADI", country: "India", region: "Asia" },
  { name: "Pune Junction", code: "PUNE", country: "India", region: "Asia" },
  { name: "Jaipur Junction", code: "JP", country: "India", region: "Asia" },
  { name: "Lucknow Junction", code: "LKO", country: "India", region: "Asia" },
  // South Korea
  { name: "Seoul Station", code: "SEL", country: "South Korea", region: "Asia" },
  { name: "Busan Station", code: "PUS", country: "South Korea", region: "Asia" },
  { name: "Daegu Station", code: "TAE", country: "South Korea", region: "Asia" },
  { name: "Incheon Station", code: "ICN", country: "South Korea", region: "Asia" },
  // Singapore
  { name: "Woodlands Train Checkpoint", code: "WDL", country: "Singapore", region: "Asia" },
  { name: "Tanjong Pagar Railway Station", code: "TJP", country: "Singapore", region: "Asia" },
  // Malaysia
  { name: "Kuala Lumpur Sentral", code: "KUL", country: "Malaysia", region: "Asia" },
  { name: "Butterworth Station", code: "BTW", country: "Malaysia", region: "Asia" },
  { name: "Johor Bahru Sentral", code: "JHB", country: "Malaysia", region: "Asia" },
  { name: "Ipoh Station", code: "IPH", country: "Malaysia", region: "Asia" },
  // Thailand
  { name: "Bangkok Hua Lamphong", code: "BKK", country: "Thailand", region: "Asia" },
  { name: "Bangkok Krung Thep Aphiwat", code: "BKA", country: "Thailand", region: "Asia" },
  { name: "Chiang Mai Station", code: "CNX", country: "Thailand", region: "Asia" },
  // Philippines
  { name: "Manila Tutuban Station", code: "MNL-T", country: "Philippines", region: "Asia" },
  { name: "Quezon City MRT/LRT", code: "MNL-Q", country: "Philippines", region: "Asia" },
  // Indonesia
  { name: "Jakarta Gambir Station", code: "CGK", country: "Indonesia", region: "Asia" },
  { name: "Jakarta Pasar Senen", code: "CGK-S", country: "Indonesia", region: "Asia" },
  { name: "Surabaya Gubeng Station", code: "SUB", country: "Indonesia", region: "Asia" },
  { name: "Yogyakarta Tugu Station", code: "JOG", country: "Indonesia", region: "Asia" },
  { name: "Bandung Station", code: "BDO", country: "Indonesia", region: "Asia" },
  // Vietnam
  { name: "Hanoi Station", code: "HAN", country: "Vietnam", region: "Asia" },
  { name: "Ho Chi Minh City (Saigon Station)", code: "SGN", country: "Vietnam", region: "Asia" },
  { name: "Da Nang Station", code: "DAD", country: "Vietnam", region: "Asia" },
  // Taiwan
  { name: "Taipei Main Station", code: "TPE", country: "Taiwan", region: "Asia" },
  { name: "Taichung Station", code: "RMQ", country: "Taiwan", region: "Asia" },
  { name: "Kaohsiung Station", code: "KHH", country: "Taiwan", region: "Asia" },
  // Hong Kong
  { name: "Hong Kong West Kowloon Station", code: "HKG", country: "Hong Kong", region: "Asia" },
  { name: "Hung Hom Station", code: "HHM", country: "Hong Kong", region: "Asia" },
  // Kazakhstan
  { name: "Almaty Station", code: "ALA", country: "Kazakhstan", region: "Asia" },
  { name: "Nur-Sultan (Astana) Station", code: "TSE", country: "Kazakhstan", region: "Asia" },
  // Bangladesh
  { name: "Dhaka Kamalapur Railway Station", code: "DAC", country: "Bangladesh", region: "Asia" },
  // Pakistan
  { name: "Lahore Junction", code: "LHE", country: "Pakistan", region: "Asia" },
  { name: "Karachi City Station", code: "KHI", country: "Pakistan", region: "Asia" },

  // ── AFRICA ──
  { name: "Cairo Ramses Station", code: "CAI", country: "Egypt", region: "Africa" },
  { name: "Alexandria Misr Station", code: "ALY", country: "Egypt", region: "Africa" },
  { name: "Johannesburg Park Station", code: "JNB", country: "South Africa", region: "Africa" },
  { name: "Cape Town Station", code: "CPT", country: "South Africa", region: "Africa" },
  { name: "Pretoria Station", code: "PRY", country: "South Africa", region: "Africa" },
  { name: "Durban Station", code: "DUR", country: "South Africa", region: "Africa" },
  { name: "Casablanca Voyageurs", code: "CAS", country: "Morocco", region: "Africa" },
  { name: "Rabat Agdal", code: "RBA", country: "Morocco", region: "Africa" },
  { name: "Marrakech Station", code: "RAK", country: "Morocco", region: "Africa" },
  { name: "Nairobi Railway Station", code: "NBO", country: "Kenya", region: "Africa" },
  { name: "Mombasa Railway Station", code: "MBA", country: "Kenya", region: "Africa" },
  { name: "Dar es Salaam Station", code: "DAR", country: "Tanzania", region: "Africa" },
  { name: "Lagos Railway Station", code: "LOS", country: "Nigeria", region: "Africa" },
  { name: "Abuja Railway Station", code: "ABV", country: "Nigeria", region: "Africa" },
  { name: "Addis Ababa Lebu Station", code: "ADD", country: "Ethiopia", region: "Africa" },
  { name: "Djibouti Station", code: "JIB", country: "Djibouti", region: "Africa" },
  { name: "Tunis Ville", code: "TUN", country: "Tunisia", region: "Africa" },
  { name: "Dakar Gare Central", code: "DKR", country: "Senegal", region: "Africa" },
  { name: "Accra Railway Station", code: "ACC", country: "Ghana", region: "Africa" },
  { name: "Maputo Central Station", code: "MPM", country: "Mozambique", region: "Africa" },
  { name: "Lusaka Railway Station", code: "LUN", country: "Zambia", region: "Africa" },
  { name: "Harare Railway Station", code: "HRE", country: "Zimbabwe", region: "Africa" },
  { name: "Kampala Railway Station", code: "EBB", country: "Uganda", region: "Africa" },

  // ── AUSTRALIA ──
  { name: "Sydney Central Station", code: "SYD", country: "Australia", region: "Australia" },
  { name: "Melbourne Southern Cross Station", code: "MEL", country: "Australia", region: "Australia" },
  { name: "Brisbane Roma Street Station", code: "BNE", country: "Australia", region: "Australia" },
  { name: "Perth Station", code: "PER", country: "Australia", region: "Australia" },
  { name: "Adelaide Station", code: "ADL", country: "Australia", region: "Australia" },
  { name: "Canberra Railway Station", code: "CBR", country: "Australia", region: "Australia" },
  { name: "Hobart Railway Station", code: "HBA", country: "Australia", region: "Australia" },
  { name: "Darwin Railway Station", code: "DRW", country: "Australia", region: "Australia" },
  { name: "Newcastle Interchange", code: "NTL", country: "Australia", region: "Australia" },
  { name: "Gold Coast Railway Station", code: "OOL", country: "Australia", region: "Australia" },
  { name: "Cairns Railway Station", code: "CNS", country: "Australia", region: "Australia" },
  { name: "Geelong Railway Station", code: "GEX", country: "Australia", region: "Australia" },
  // New Zealand
  { name: "Auckland Strand Station", code: "AKL", country: "New Zealand", region: "Australia" },
  { name: "Wellington Railway Station", code: "WLG", country: "New Zealand", region: "Australia" },
  { name: "Christchurch Railway Station", code: "CHC", country: "New Zealand", region: "Australia" },
];

const REGIONS = ["All Regions", "Europe", "Russia", "USA", "Asia", "Africa", "Australia"];

export default function StationSelector({ value, onChange, placeholder = "Search station..." }) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [regionFilter, setRegionFilter] = useState("All Regions");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = STATIONS.filter(s => {
    const matchesQuery = !query || 
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.code.toLowerCase().includes(query.toLowerCase()) ||
      s.country.toLowerCase().includes(query.toLowerCase());
    const matchesRegion = regionFilter === "All Regions" || s.region === regionFilter;
    return matchesQuery && matchesRegion;
  }).slice(0, 50);

  const handleSelect = (station) => {
    setQuery(station.name);
    onChange(station.name);
    setOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    onChange("");
  };

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {query && (
          <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">✕</button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[320px] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          {/* Region filter tabs */}
          <div className="flex gap-1 p-2 overflow-x-auto border-b border-slate-100 bg-slate-50">
            {REGIONS.map(r => (
              <button
                key={r}
                onClick={() => setRegionFilter(r)}
                className={`flex-shrink-0 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  regionFilter === r ? "bg-green-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          {/* Results */}
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-sm">No stations found</div>
            ) : (
              filtered.map(s => (
                <button
                  key={s.code}
                  onClick={() => handleSelect(s)}
                  className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-green-50 text-left transition-colors"
                >
                  <MapPin className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.country} · {s.region} · {s.code}</p>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-xs text-slate-400">
            {filtered.length} station{filtered.length !== 1 ? "s" : ""} found
          </div>
        </div>
      )}
    </div>
  );
}