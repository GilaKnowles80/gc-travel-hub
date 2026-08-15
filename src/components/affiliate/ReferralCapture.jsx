import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Global referral-capture component (renders nothing).
 *
 * When a visitor arrives with ?ref=AFFILIATE_CODE, the code is stashed in
 * localStorage and the URL is cleaned. Once that visitor logs in, we invoke
 * captureAffiliateReferral to link them to the referring affiliate — so the
 * affiliate earns commission on the customer's future bookings.
 */
export default function ReferralCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      localStorage.setItem("gc_ref_code", ref);
      const url = new URL(window.location.href);
      url.searchParams.delete("ref");
      window.history.replaceState({}, document.title, url.toString());
    }

    const code = localStorage.getItem("gc_ref_code");
    if (!code) return;

    let cancelled = false;
    (async () => {
      try {
        const user = await base44.auth.me();
        if (!user || cancelled) return;
        await base44.functions.invoke("captureAffiliateReferral", {
          affiliate_code: code,
        });
        localStorage.removeItem("gc_ref_code");
      } catch {
        /* not logged in or already captured — retry on next load */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}