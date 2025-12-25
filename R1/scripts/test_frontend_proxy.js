// ESM Node script to smoke-test frontend dev server proxy (expects dev server running on :3000 and backend on :8000)
// Uses global fetch (Node 18+)

try {
  const res = await fetch('http://localhost:3000/api/cottages');
  console.log('status', res.status);
  const json = await res.json().catch(async () => {
    const txt = await res.text();
    throw new Error(`Non-JSON response: ${txt.substring(0, 200)}`);
  });

  if (!json || !Array.isArray(json.items)) {
    throw new Error('Unexpected response shape; expected { items: [] }');
  }

  const hasEmpty = json.items.some((it) => !it.rooms || !(Array.isArray(it.rooms)) || it.rooms.length === 0);
  if (hasEmpty) {
    console.error('Smoke check failed: one or more accommodations returned empty rooms arrays');
    process.exitCode = 2;
  } else {
    console.log('Smoke check passed: all accommodations include non-empty rooms arrays');
  }
} catch (err) {
  console.error('error', err && err.message ? err.message : err);
  process.exitCode = 1;
}