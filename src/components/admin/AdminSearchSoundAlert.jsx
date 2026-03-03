import { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";

// Tracks recent search events and plays a sound for admins
// Uses entity subscriptions on multiple entities to detect live user activity

const SEARCH_PAGES = ["Flights", "HotelSearch", "Tours", "BusSearch", "FerrySearch"];

export default function AdminSearchSoundAlert({ user }) {
  const audioCtxRef = useRef(null);
  const [enabled, setEnabled] = useState(true);

  // Play a soft notification chime using Web Audio API
  const playChime = () => {
    if (!enabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      // Audio not supported
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    // Subscribe to new FlightBooking, HotelBooking, BusBooking, FerryBooking creations
    // as a proxy for active user searches (visitors filling search forms)
    // We also subscribe to PriceAlert creation as users set alerts after searching

    const unsubs = [];

    // Track when users create price alerts (they searched and found a flight)
    unsubs.push(base44.entities.PriceAlert.subscribe((event) => {
      if (event.type === 'create') playChime();
    }));

    // Track when users start a booking flow
    unsubs.push(base44.entities.FlightBooking.subscribe((event) => {
      if (event.type === 'create') playChime();
    }));

    unsubs.push(base44.entities.HotelBooking.subscribe((event) => {
      if (event.type === 'create') playChime();
    }));

    unsubs.push(base44.entities.BusBooking.subscribe((event) => {
      if (event.type === 'create') playChime();
    }));

    unsubs.push(base44.entities.FerryBooking.subscribe((event) => {
      if (event.type === 'create') playChime();
    }));

    return () => unsubs.forEach(u => u());
  }, [user, enabled]);

  if (!user || user.role !== 'admin') return null;

  return (
    <button
      onClick={() => setEnabled(v => !v)}
      title={enabled ? "Search alerts ON — click to mute" : "Search alerts OFF — click to enable"}
      className={`fixed bottom-20 right-4 z-50 w-9 h-9 rounded-full shadow-lg flex items-center justify-center text-sm transition-all ${
        enabled ? "bg-amber-500 text-white" : "bg-slate-300 text-slate-500"
      }`}
    >
      {enabled ? "🔔" : "🔕"}
    </button>
  );
}