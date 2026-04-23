// One-off script to backfill missed subscribers to Beehiiv
const API_KEY = 'McVENKziZPPcXB5fNUU3mNZTJBYMzEiOyDOEDwkqyOkqBPUhGprvSOk3CSvrPqAz';
const PUB_TV = 'pub_6c3bff32-b1eb-4069-919e-953a45d61d61';
const PUB_CATALYST = 'pub_fa376b28-d99e-4ef0-8788-26e9db50b70f';
const PUB_LAB = 'pub_c248791e-d935-4c60-bbf5-efde481bbd69';

const subscribers = [
  { email: 'kenw44orama@gmail.com', pubs: ['tv'] },
  { email: 'gbasilallen@yahoo.com', pubs: ['tv'] },
  { email: 'aje4aje@gmail.com', pubs: ['tv', 'catalyst', 'lab'] },
  { email: 'daccullen@protonmail.com', pubs: ['tv', 'catalyst', 'lab'] },
  { email: 'WA9YJA@GMAIL.COM', pubs: ['tv'] },
  { email: 'dshildt@gmail.com', pubs: ['tv'] },
  { email: 'mark@markferryauctioneers.com', pubs: ['tv', 'catalyst', 'lab'] },
  { email: 'dokterchristina@gmail.com', pubs: ['tv'] },
];

const PUB_MAP = { tv: PUB_TV, catalyst: PUB_CATALYST, lab: PUB_LAB };

async function subscribe(pubId, email, sendWelcome) {
  const res = await fetch(`https://api.beehiiv.com/v2/publications/${pubId}/subscriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email.toLowerCase().trim(),
      reactivate_existing: true,
      send_welcome_email: sendWelcome,
      utm_source: 'backfill',
    }),
  });
  const data = await res.json();
  return { ok: res.ok, id: data?.data?.id, status: res.status };
}

async function main() {
  for (const sub of subscribers) {
    console.log(`\n--- ${sub.email} ---`);
    let first = true;
    for (const pub of sub.pubs) {
      const pubId = PUB_MAP[pub];
      // Send welcome email only for the first/primary pub
      const result = await subscribe(pubId, sub.email, first);
      console.log(`  ${pub}: ${result.ok ? '✅' : '❌'} (id: ${result.id || 'none'}, status: ${result.status})`);
      first = false;
    }
  }
  console.log('\nDone!');
}

main();
