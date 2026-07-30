export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <div className="max-w-md text-center">
        <p className="text-eyebrow text-gold-deep">PENTARIVA</p>
        <h1 className="mt-4 font-serif-display text-7xl text-forest-deep">404</h1>
        <h2 className="mt-4 font-serif-display text-2xl text-forest-deep">
          Stránka nenalezena
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Hledaná stránka neexistuje nebo byla přesunuta.
        </p>
        <a
          href="/"
          className="mt-7 inline-flex bg-gold px-6 py-3 text-eyebrow text-ink transition-colors hover:bg-gold-deep hover:text-cream"
        >
          Zpět na hlavní stranu
        </a>
      </div>
    </main>
  );
}
