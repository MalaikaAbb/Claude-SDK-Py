/**
 * NOT DOC CODE. Borrowed from the aws-strands-py harness
 * (frontend/src/app/generative-ui/components/_shared/scaffolding.tsx).
 *
 * Adopt from A2UI's "After" catalog registers `Airport` and `Arrow` and never
 * defines either. These are the smallest components that let it render.
 */

export function Airport({ code, city }: { code: string; city: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold">{code}</p>
      <p className="text-xs text-slate-500">{city}</p>
    </div>
  );
}

export function Arrow() {
  return <span className="text-2xl">→</span>;
}
