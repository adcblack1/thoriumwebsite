// Maps the campaign UTMs we capture into the fields beehiiv actually stores AND
// reports on. beehiiv only surfaces utm_source / utm_medium / utm_campaign in its
// subscriber report (it ignores utm_content and utm_term), so we put the AD name
// in utm_campaign to make per-ad breakdowns visible. Platform (fb/ig) stays in
// utm_source; the Meta campaign name goes in utm_medium.
//
// Captured -> beehiiv native:
//   utm_source  (fb/ig)        -> utm_source
//   utm_campaign (meta campaign)-> utm_medium
//   utm_content  (ad name)      -> utm_campaign   <- the reportable per-ad slot
export function beehiivUtm(p: {
  utm_source?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
}): Record<string, string> {
  const out: Record<string, string> = {
    utm_source: p.utm_source || 'subscribe_flow',
  };
  if (p.utm_campaign) out.utm_medium = p.utm_campaign; // Meta campaign name
  if (p.utm_content) out.utm_campaign = p.utm_content; // ad name (reportable in beehiiv)
  return out;
}
