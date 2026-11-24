import Link from "next/link";

// ── Data ──────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    title: "Post in minutes",
    body: "Describe your cargo, route, weight, and price. No phone calls, no brokers, no guessing.",
  },
  {
    number: "02",
    title: "Carriers compete for your load",
    body: "Pre-vetted carriers browse and accept. Every document is hash-verified on the Stellar blockchain.",
  },
  {
    number: "03",
    title: "Pay only on delivery",
    body: "Funds sit in on-chain escrow until you confirm receipt. No delivery, no payment. Simple.",
  },
];

const SHIPPER_FEATURES = [
  {
    icon: "⚡",
    title: "Post in 2 minutes",
    body: "Fill one form. Reach thousands of carriers instantly.",
  },
  {
    icon: "🔒",
    title: "Escrow protection",
    body: "Your payment is locked until you confirm safe delivery.",
  },
  {
    icon: "📄",
    title: "Tamper-proof docs",
    body: "Bill of lading and delivery proofs stored on-chain.",
  },
  {
    icon: "📍",
    title: "Live status updates",
    body: "Know exactly where your cargo is at every stage.",
  },
];

const CARRIER_FEATURES = [
  {
    icon: "🌍",
    title: "Loads near you",
    body: "Filter marketplace by route, weight, and payout.",
  },
  {
    icon: "💳",
    title: "Fast payments",
    body: "Funds release the moment shipper confirms delivery.",
  },
  {
    icon: "⭐",
    title: "Build your reputation",
    body: "On-chain reputation score follows you across the platform.",
  },
  {
    icon: "🛡️",
    title: "No hidden fees",
    body: "See the full payout before you accept any job.",
  },
];

const FOOTER_LINKS = {
  Product: [
    "How it works",
    "For Shippers",
    "For Carriers",
    "Pricing",
    "Security",
  ],
  Company: ["About", "Blog", "Careers", "Press", "Contact"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <style>{`
        @keyframes route-dash {
          to { stroke-dashoffset: -40; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
        }
        .fade-up { animation: fade-up 0.7s ease forwards; }
        .fade-up-1 { animation: fade-up 0.7s 0.1s ease both; }
        .fade-up-2 { animation: fade-up 0.7s 0.25s ease both; }
        .fade-up-3 { animation: fade-up 0.7s 0.4s ease both; }
        .route-line { animation: route-dash 1.5s linear infinite; }
        .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
        .hero-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .gradient-text {
          background: linear-gradient(135deg, #ffffff 0%, #a8a8a8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .card-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }
      `}</style>

      <div className="bg-background text-foreground">
        {/* ── Navigation ──────────────────────────────────────────────────── */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <span className="text-[#0a0a0a] font-black text-sm tracking-tight">
                  FF
                </span>
              </div>
              <span className="font-bold text-white text-lg tracking-tight">
                FreightFlow
              </span>
            </Link>

            {/* Links */}
            <div className="hidden md:flex items-center gap-8">
              {["How it works", "For Carriers", "Security"].map((link) => (
                <span
                  key={link}
                  className="text-sm text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  {link}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-sm bg-white text-[#0a0a0a] font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
              >
                Get started free
              </Link>
            </div>
          </nav>
        </header>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="relative min-h-screen bg-[#0a0a0a] hero-grid flex flex-col items-center justify-center overflow-hidden pt-16">
          {/* Ambient glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

          {/* Route SVG decoration */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none select-none">
            <svg width="900" height="500" viewBox="0 0 900 500" fill="none">
              {/* Dotted route line across continent */}
              <path
                d="M 80 280 C 200 180 400 320 520 200 C 640 80 750 240 820 220"
                stroke="white"
                strokeWidth="1.5"
                strokeDasharray="6 6"
                fill="none"
                className="route-line"
              />
              {/* Origin dot */}
              <circle
                cx="80"
                cy="280"
                r="5"
                fill="white"
                className="pulse-dot"
              />
              {/* Midpoint dot */}
              <circle cx="520" cy="200" r="3" fill="white" opacity="0.5" />
              {/* Destination dot */}
              <circle
                cx="820"
                cy="220"
                r="5"
                fill="white"
                className="pulse-dot"
                style={{ animationDelay: "1s" }}
              />
              {/* City labels */}
              <text
                x="55"
                y="304"
                fill="white"
                fontSize="11"
                opacity="0.6"
                fontFamily="monospace"
              >
                Lagos
              </text>
              <text
                x="495"
                y="218"
                fill="white"
                fontSize="11"
                opacity="0.6"
                fontFamily="monospace"
              >
                Nairobi
              </text>
              <text
                x="795"
                y="238"
                fill="white"
                fontSize="11"
                opacity="0.6"
                fontFamily="monospace"
              >
                Dubai
              </text>
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
            {/* Badge */}
            <div className="fade-up-1 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs text-white/70 mb-8 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot inline-block" />
              Blockchain-verified freight
            </div>

            {/* Headline */}
            <h1 className="fade-up-2 text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
              Move cargo.
              <br />
              <span className="gradient-text">Not paperwork.</span>
            </h1>

            {/* Subheadline */}
            <p className="fade-up-3 text-lg sm:text-xl text-white/55 max-w-xl mx-auto leading-relaxed mb-10">
              FreightFlow connects shippers and carriers on a transparent,
              blockchain-secured platform. Post a load, find a carrier, track
              every step — and pay only on delivery.
            </p>

            {/* CTA buttons */}
            <div className="fade-up-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register?role=shipper"
                className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-[#0a0a0a] font-bold px-7 py-3.5 rounded-xl hover:bg-white/90 transition-all text-sm"
              >
                Post a shipment
                <span className="group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </Link>
              <Link
                href="/register?role=carrier"
                className="group w-full sm:w-auto flex items-center justify-center gap-2 border border-white/20 text-white font-medium px-7 py-3.5 rounded-xl hover:bg-white/8 transition-all text-sm backdrop-blur-sm"
              >
                Find loads to carry
                <span className="group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </Link>
            </div>

            {/* Social proof */}
            <p className="fade-up-3 mt-8 text-xs text-white/35">
              No credit card required · Free to join · Payments released on
              delivery
            </p>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
            <span className="text-white text-xs tracking-widest uppercase">
              Scroll
            </span>
            <div className="h-8 w-px bg-white/40" />
          </div>
        </section>


        {/* ── How it works ────────────────────────────────────────────────── */}
        <section className="py-24 px-6">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                The process
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                Three steps.
                <br className="hidden sm:block" /> No surprises.
              </h2>
              <p className="text-muted-foreground mt-4 max-w-md mx-auto">
                We cut out the brokers, the phone calls, and the uncertainty.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 relative">
              {/* Connector lines between steps */}
              <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px border-t-2 border-dashed border-border z-0" />

              {STEPS.map((step, i) => (
                <div
                  key={step.number}
                  className="relative bg-card border border-border rounded-2xl p-8 card-hover z-10"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-5xl font-black text-foreground/8 select-none leading-none">
                      {step.number}
                    </span>
                    <div
                      className={`h-px flex-1 border-t border-dashed border-border ${i === 2 ? "hidden" : "block"}`}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── For Shippers & Carriers ─────────────────────────────────────── */}
        <section className="py-24 px-6 bg-muted/30">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                Built for both sides
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                Whether you send it
                <br className="hidden sm:block" /> or drive it.
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Shippers card */}
              <div className="relative bg-[#0a0a0a] rounded-3xl overflow-hidden p-8 md:p-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs text-white/70 mb-6">
                    <span>📦</span> For Shippers
                  </div>
                  <h3 className="text-3xl font-black text-white mb-3">
                    Your cargo.
                    <br />
                    Your terms.
                  </h3>
                  <p className="text-white/50 text-sm mb-8 max-w-xs">
                    Set your route, price, and schedule. Carriers come to you —
                    not the other way around.
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {SHIPPER_FEATURES.map((f) => (
                      <div
                        key={f.title}
                        className="bg-white/6 border border-white/8 rounded-xl p-4"
                      >
                        <span className="text-xl mb-2 block">{f.icon}</span>
                        <p className="text-white text-xs font-semibold mb-1">
                          {f.title}
                        </p>
                        <p className="text-white/45 text-xs leading-relaxed">
                          {f.body}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/register?role=shipper"
                    className="inline-flex items-center gap-2 bg-white text-[#0a0a0a] font-bold text-sm px-6 py-3 rounded-xl hover:bg-white/90 transition-colors"
                  >
                    Start shipping →
                  </Link>
                </div>
              </div>

              {/* Carriers card */}
              <div className="relative bg-card border border-border rounded-3xl overflow-hidden p-8 md:p-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/3 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-muted rounded-full px-3 py-1 text-xs text-muted-foreground mb-6">
                    <span>🚛</span> For Carriers
                  </div>
                  <h3 className="text-3xl font-black text-foreground mb-3">
                    More loads.
                    <br />
                    Less chasing.
                  </h3>
                  <p className="text-muted-foreground text-sm mb-8 max-w-xs">
                    Browse loads near your route, accept with one tap, and get
                    paid the moment delivery is confirmed.
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {CARRIER_FEATURES.map((f) => (
                      <div
                        key={f.title}
                        className="bg-muted/60 border border-border rounded-xl p-4"
                      >
                        <span className="text-xl mb-2 block">{f.icon}</span>
                        <p className="text-foreground text-xs font-semibold mb-1">
                          {f.title}
                        </p>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                          {f.body}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/register?role=carrier"
                    className="inline-flex items-center gap-2 bg-foreground text-background font-bold text-sm px-6 py-3 rounded-xl hover:bg-foreground/90 transition-colors"
                  >
                    Find loads →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust / Blockchain section ───────────────────────────────────── */}
        <section className="py-24 px-6 border-y border-border">
          <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Built on trust
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-6">
                Every shipment.
                <br />
                On-chain.
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6 max-w-md">
                FreightFlow uses the Stellar blockchain to make freight honest.
                Documents are hash-verified and immutable. Payments are held in
                smart-contract escrow and released automatically — no one can
                move the money early.
              </p>
              <div className="flex flex-col gap-4">
                {[
                  {
                    icon: "🔐",
                    label: "Document integrity",
                    detail:
                      "SHA-256 hash stored on Stellar. Any tampering is instantly detectable.",
                  },
                  {
                    icon: "🏦",
                    label: "Escrow payments",
                    detail:
                      "Funds locked until delivery confirmed. No delivery, no payment.",
                  },
                  {
                    icon: "⭐",
                    label: "Reputation on-chain",
                    detail:
                      "Carrier scores are permanent and publicly verifiable.",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex gap-4">
                    <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-base shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {item.label}
                      </p>
                      <p className="text-muted-foreground text-sm mt-0.5">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual: chain blocks */}
            <div className="relative flex flex-col gap-3 select-none">
              {[
                {
                  label: "Shipment Created",
                  hash: "0x4f2a...8e1c",
                  status: "Confirmed",
                  color:
                    "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
                },
                {
                  label: "Carrier Accepted",
                  hash: "0x9c1b...3f7a",
                  status: "Confirmed",
                  color:
                    "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
                },
                {
                  label: "Cargo In Transit",
                  hash: "0x2d8e...5a9b",
                  status: "Confirmed",
                  color:
                    "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
                },
                {
                  label: "Escrow Released",
                  hash: "0x7f3c...1d4e",
                  status: "Pending…",
                  color:
                    "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
                },
              ].map((block, i) => (
                <div
                  key={block.label}
                  className="relative flex items-center gap-4"
                >
                  {i < 3 && (
                    <div className="absolute left-4 top-full h-3 w-px bg-border z-10" />
                  )}
                  <div className="h-8 w-8 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                    <span className="text-muted-foreground text-xs font-mono font-bold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex-1 flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {block.label}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {block.hash}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${block.color}`}
                    >
                      {block.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ── Final CTA ───────────────────────────────────────────────────── */}
        <section className="relative py-32 px-6 bg-[#0a0a0a] overflow-hidden">
          <div className="absolute inset-0 hero-grid opacity-100" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
              Your next shipment
              <br />
              <span className="gradient-text">starts here.</span>
            </h2>
            <p className="text-white/50 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
              Join thousands of shippers and carriers who moved their operations
              to FreightFlow. Free to sign up. No contracts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="group flex items-center gap-2 bg-white text-[#0a0a0a] font-bold px-8 py-4 rounded-xl hover:bg-white/90 transition-all text-sm"
              >
                Create free account
                <span className="group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </Link>
              <Link
                href="/login"
                className="text-sm text-white/60 hover:text-white transition-colors px-4 py-4"
              >
                Already have an account? Sign in
              </Link>
            </div>

            {/* Bottom trust markers */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/30 text-xs">
              {[
                "✓ No credit card required",
                "✓ Cancel anytime",
                "✓ Stellar blockchain secured",
                "✓ 24/7 support",
              ].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer className="bg-[#0a0a0a] border-t border-white/8">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-12 border-b border-white/8">
              {/* Brand */}
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center">
                    <span className="text-[#0a0a0a] font-black text-xs">
                      FF
                    </span>
                  </div>
                  <span className="font-bold text-white text-base">
                    FreightFlow
                  </span>
                </div>
                <p className="text-white/40 text-sm leading-relaxed max-w-xs">
                  The freight platform built for the people who move things.
                </p>
              </div>

              {Object.entries(FOOTER_LINKS).map(([category, links]) => (
                <div key={category}>
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">
                    {category}
                  </p>
                  <ul className="space-y-2.5">
                    {links.map((link) => (
                      <li key={link}>
                        <span className="text-white/40 text-sm hover:text-white/70 transition-colors cursor-pointer">
                          {link}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom bar */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-white/30 text-xs">
                © {new Date().getFullYear()} FreightFlow. All rights reserved.
              </p>
              <div className="flex items-center gap-2 text-white/30 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot inline-block" />
                All systems operational
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
