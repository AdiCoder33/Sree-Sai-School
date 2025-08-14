import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  School,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  Menu,
  X,
  FlaskConical,
  Music,
  Trophy,
  CheckCircle2,
  Sparkles,
  ArrowRightCircle,
  ArrowUp,
} from "lucide-react";
import { ImageCarousel } from "../components/ImageCarousel";
import CampusShowcaseCard from "@/components/CampusShowcaseCard";

/* ---------- Slides for Programs carousel ---------- */
const programSlides = [
  { src: "/images/sreesai_1.JPG", title: "CBSE Curriculum", desc: "Strong academic foundation with experienced mentors." },
  { src: "/images/sreesai_2.JPG", title: "Science Labs", desc: "Hands-on learning with modern equipment." },
  { src: "/images/sreesai_3.JPG", title: "Arts & Music", desc: "Clubs, stage, and competitions for creative growth." },
  { src: "/images/sreesai_1.JPG", title: "Sports & Fitness", desc: "Playgrounds, coaching, house events, and tournaments." },
  { src: "/images/sreesai_2.JPG", title: "Technology", desc: "Smart classrooms, computer labs, coding clubs." },
  { src: "/images/sreesai_3.JPG", title: "Clubs & Values", desc: "Eco club, leadership, service & life skills." },
];

/* ---------- Global decorative background ---------- */
const SiteBackdrop: React.FC = () => (
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden [contain:paint]">
    <div className="absolute inset-0 bg-[radial-gradient(110%_70%_at_10%_-10%,hsl(var(--brand))/0.08,transparent_60%),radial-gradient(90%_60%_at_90%_0%,hsl(var(--brand-cta))/0.10,transparent_65%)]" />
    <div className="hidden sm:block absolute inset-0 opacity-40 [background-size:24px_24px] [background-image:linear-gradient(0deg,rgba(12,18,32,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(12,18,32,0.05)_1px,transparent_1px)] [mask-image:radial-gradient(120%_70%_at_50%_15%,black,transparent_70%)]" />
    <div className="hidden sm:block absolute -top-24 -left-24 h-64 w-64 rounded-full blur-3xl bg-[radial-gradient(closest-side,hsl(var(--brand))/0.25,transparent)]" />
    <div className="absolute -bottom-24 -right-24 h-56 sm:h-72 w-56 sm:w-72 rounded-full blur-3xl bg-[radial-gradient(closest-side,hsl(var(--brand-cta))/0.22,transparent)]" />
  </div>
);

/* ---------- Scroll progress bar ---------- */
const ScrollProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent" aria-hidden="true">
    <span
      className="block h-full w-full origin-left bg-white/95 shadow-[0_0_8px_rgba(255,255,255,.55)] transition-transform duration-150"
      style={{ transform: `scaleX(${Math.max(0, Math.min(1, progress / 100))})` }}
    />
  </div>
);

export const Home: React.FC = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  /* scroll progress */
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? (doc.scrollTop / max) * 100 : 0;
      setProgress(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* programs carousel controls */
  const progTrackRef = React.useRef<HTMLDivElement>(null);
  const scrollPrograms = (dir: number) => {
    const track = progTrackRef.current;
    if (!track) return;
    const slide = track.querySelector("figure") as HTMLElement | null;
    const gap = 16;
    const step = (slide?.offsetWidth ?? track.clientWidth) + gap;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  /* data */
  const alumni = [
    { name: "Ananya Sharma", role: "Medical Student", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400", chip: "Batch 2020" },
    { name: "Ravi Verma", role: "Software Engineer", img: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=400", chip: "Batch 2019" },
    { name: "Priya Patel", role: "Marketing Manager", img: "https://images.unsplash.com/photo-1544005316-04ce1f1a9c20?q=80&w=400", chip: "Batch 2018" },
  ];

  const events = [
    { title: "Science Fair", date: "June 15, 2024", desc: "Student projects, live demos, awards & keynote.", Icon: FlaskConical, tint: "from-emerald-400/20 to-cyan-400/20", dot: "bg-emerald-400" },
    { title: "Art Exhibition", date: "July 20, 2024", desc: "Gallery walk, performances and parent preview.", Icon: Music, tint: "from-fuchsia-400/20 to-indigo-400/20", dot: "bg-fuchsia-400" },
    { title: "Sports Day", date: "August 10, 2024", desc: "Track & field, team games and house championship.", Icon: Trophy, tint: "from-amber-400/25 to-orange-400/20", dot: "bg-amber-400" },
  ];

  // --- Contact section helpers ---
  const ADDRESS =
    "14/96, 3, Tirupati- Renigunta Flyover Bridge, Gowri Nagar, Renigunta, Tirupati, Andhra Pradesh 517520";

  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1200);
  };

  // floating "back to top" visibility (shows near page bottom)
  const [showToTop, setShowToTop] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const nearBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 300;
      setShowToTop(nearBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div id="top" className="relative min-h-screen flex flex-col bg-[hsl(var(--bg))] text-[hsl(var(--body))] overflow-x-clip">
      <SiteBackdrop />
      <ScrollProgressBar progress={progress} />

      {/* Skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] rounded-md bg-[hsl(var(--brand-cta))] px-3 py-2 text-white shadow"
      >
        Skip to content
      </a>

      {/* Header / Nav (fixed) */}
      <header className="fixed inset-x-0 top-0 z-50 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--brand))] via-[hsl(var(--brand))] to-[hsl(var(--brand-cta))] opacity-95" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <div className="absolute inset-0 supports-[backdrop-filter]:backdrop-blur-md" />

        {/* full-width, no side padding */}
        <div className="relative w-full px-0 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 pl-3" aria-label="Sree Sai English Medium High School">
            <School className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
            <div className="leading-tight">
              <span className="block text-base sm:text-xl font-extrabold text-white">
                Sree Sai English Medium High School
              </span>
              <span className="block text-[10px] sm:text-[11px] text-white/80">Excellence in Education Since 1995</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm text-white/90" aria-label="Primary">
            {[
              ["About", "#about"],
              ["Programs", "#programs"],
              ["Events", "#events"],
              ["Gallery", "#gallery"],
              ["Contact", "#contact"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="group relative rounded-md px-3 py-2 hover:text-white focus-visible:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                {label}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 right-3 -bottom-[3px] h-0.5 scale-x-0 transform-gpu transition bg-white/70 group-hover:scale-x-100 group-focus-visible:scale-x-100 rounded-full"
                />
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2 pr-3">
            <Link to="/login" onClick={() => localStorage.removeItem("smartschool_user")}>
              <Button variant="outline" className="bg-white text-[hsl(var(--ink))] hover:bg-blue-50 ring-1 ring-white/50">
                Login
              </Button>
            </Link>
            <a href="#admissions">
              <Button className="bg-white text-[hsl(var(--ink))] hover:bg-blue-50 ring-1 ring-white/50">Enroll Now</Button>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center pr-2">
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/30 text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
            {/* overlay */}
            <div className="absolute inset-0 bg-black/25" onClick={() => setMobileOpen(false)} />
            {/* panel */}
            <div className="relative z-10 ml-auto h-dvh w-3/5 rounded-l-2xl bg-white shadow-2xl ring-1 ring-slate-200 p-6 flex flex-col gap-4 overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <School className="h-6 w-6 text-[hsl(var(--brand-cta))]" />
                  <span className="font-bold text-[hsl(var(--ink))]">Sree Sai School</span>
                </div>
                <button
                  className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white/80 hover:bg-white shadow-sm transition"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-5 w-5 text-slate-700" />
                </button>
              </div>

              <nav className="grid gap-1.5 text-[hsl(var(--ink))]">
                {[
                  ["About", "#about"],
                  ["Programs", "#programs"],
                  ["Events", "#events"],
                  ["Gallery", "#gallery"],
                  ["Contact", "#contact"],
                ].map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 rounded-lg hover:bg-blue-50 focus:bg-blue-50 transition-colors"
                  >
                    {label}
                  </a>
                ))}
              </nav>

              <div className="mt-auto grid grid-cols-1 gap-3">
                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-xl text-white bg-[linear-gradient(90deg,hsl(var(--brand))_0%,hsl(var(--brand-cta))_100%)] shadow-md hover:brightness-110 active:brightness-105 active:scale-[.99] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-cta))]/40"
                >
                  <Link
                    to="/login"
                    onClick={() => {
                      localStorage.removeItem("smartschool_user");
                      setMobileOpen(false);
                    }}
                    aria-label="Login"
                  >
                    Login
                    <ArrowRightCircle className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-xl text-white bg-[linear-gradient(90deg,hsl(var(--brand))_0%,hsl(var(--brand-cta))_100%)] shadow-md hover:brightness-110 active:brightness-105 active:scale-[.99] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-cta))]/40"
                >
                  <a href="#admissions" onClick={() => setMobileOpen(false)} aria-label="Go to admissions">
                    Enroll Now
                    <ArrowRightCircle className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* MAIN grows to push footer to bottom */}
      <main id="main" className="pt-16 flex-1">
        {/* ===== HERO ===== */}
        <section className="relative isolate overflow-hidden overflow-x-clip -mt-16">
          <div className="absolute inset-0 -z-10">
            <ImageCarousel
              className="h-[60vh] sm:h-[72vh] lg:h-[78vh]"
              interval={5000}
              autoPlay
              showArrows={false}
              showDots
              slides={[
                { src: "/images/sreesai_1.JPG", alt: "Students arriving at campus" },
                { src: "/images/sreesai_3.JPG", alt: "Annual day celebration" },
                { src: "/images/sreesai_2.JPG", alt: "School building exterior" },
              ]}
            />
          </div>
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,16,28,0.55) 0%, rgba(10,16,28,0.40) 40%, rgba(10,16,28,0.25) 100%)",
            }}
          />
          {/* full-width hero content */}
          <div className="relative z-10 w-full px-0">
            <div className="min-h-[60vh] sm:min-h-[72vh] lg:min-h-[78vh] pb-24 sm:pb-36 lg:pb-44 flex flex-col items-center justify-center text-center">
              <h2 className="mt-6 sm:mt-10 text-white text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight drop-shadow-md">
                Welcome to Sreesai <br className="hidden sm:block" /> School
              </h2>
              <p className="mt-4 sm:mt-6 text-white/95 text-lg sm:text-2xl max-w-3xl px-2">
                Inspiring young minds to Dream, Learn, and Achieve — Since 1995
              </p>
              <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <a href="#admissions">
                  <Button className="bg-[hsl(var(--brand-cta))] hover:bg-[hsl(var(--brand-cta-hover))] focus:ring-4 ring-[hsl(var(--ring))]">
                    Enroll Now
                  </Button>
                </a>
                <a href="#contact">
                  <Button variant="secondary" className="bg-white text-[hsl(var(--ink))] hover:bg-[#EFF6FF]">
                    Contact Us
                  </Button>
                </a>
                <Link
                  to="/prospectus"
                  className="text-white/90 underline underline-offset-4 hover:text-white text-sm sm:text-base text-center sm:self-center"
                >
                  Download Prospectus
                </Link>
              </div>
            </div>
          </div>

          {/* wave */}
          <svg
            className="pointer-events-none absolute bottom-0 left-0 w-full h-[100px] sm:h-[160px] lg:h-[220px] z-0"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path fill="#fff" d="M0,160 C240,220 480,100 720,160 C960,220 1200,100 1440,160 L1440,320 L0,320 Z" />
          </svg>

          {/* Road + School Bus animation */}
          <svg
            className="pointer-events-none absolute bottom-0 left-0 w-full h-[100px] sm:h-[160px] lg:h-[220px] z-10 motion-reduce:hidden"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <path id="busWavePath" d="M0,160 C240,220 480,100 720,160 C960,220 1200,100 1440,160" />
              <filter id="busShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity=".4" />
              </filter>
            </defs>

            <use href="#busWavePath" fill="none" stroke="rgba(3, 4, 5, 0.77)" strokeWidth="10" />
            <use href="#busWavePath" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="2" strokeDasharray="16 12" />

            <g transform="translate(0,-10)">
              <g filter="url(#busShadow)">
                <g id="schoolBus" transform="scale(1)">
                  <rect x="-36" y="-18" width="90" height="36" rx="7" fill="#FACC15" stroke="#111827" strokeWidth="2" />
                  <rect x="32" y="-18" width="22" height="36" rx="6" fill="#EAB308" stroke="#111827" strokeWidth="2" />
                  <rect x="-28" y="-12" width="20" height="14" rx="3" fill="#BFDBFE" />
                  <rect x="-6" y="-12" width="20" height="14" rx="3" fill="#BFDBFE" />
                  <rect x="16" y="-12" width="20" height="14" rx="3" fill="#BFDBFE" />
                  <rect x="36" y="-10" width="12" height="20" rx="2" fill="#FED7AA" />
                  <rect x="52" y="6" width="12" height="4" fill="#374151" />
                  <circle cx="58" cy="-4" r="3" fill="#FDE68A" />
                  <circle cx="-16" cy="18" r="8" fill="#111827" />
                  <circle cx="20" cy="18" r="8" fill="#111827" />
                  <circle cx="-16" cy="18" r="3" fill="#9CA3AF" />
                  <circle cx="20" cy="18" r="3" fill="#9CA3AF" />
                </g>
                <animateMotion dur="14s" repeatCount="indefinite" rotate="auto">
                  <mpath href="#busWavePath" />
                </animateMotion>
              </g>
            </g>
          </svg>
        </section>

        {/* ===== ABOUT ===== */}
        <section id="about" className="relative -mt-4 sm:-mt-10 z-20 rounded-t-2xl" aria-labelledby="about-heading">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-emerald-50" />
          <div className="pointer-events-none absolute -top-24 -left-24 h-56 sm:h-72 w-56 sm:w-72 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 sm:h-72 w-56 sm:w-72 rounded-full bg-indigo-200/30 blur-3xl" />

          {/* full width */}
          <div className="w-full grid lg:grid-cols-2 gap-10 sm:gap-12 items-center py-10 sm:py-16 px-0">
            <div className="px-3 sm:px-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-3 py-1 text-xs sm:text-sm text-[#92400E] shadow-sm">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Since 1995
              </span>

              <h3 id="about-heading" className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight text-[hsl(var(--ink))]">
                About Us
              </h3>

              <p className="mt-4 leading-relaxed max-w-prose">
                Serving excellence and an integrated academic experience with strong character development since 1995. Our
                mission is to become a beacon of academic excellence and socially responsible citizenship.
              </p>

              <ul className="mt-6 space-y-3">
                {["CBSE Affiliation", "Modern Infrastructure", "Experienced Faculty", "Strong Parent Partnership"].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-[hsl(var(--brand-cta))]" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  ["1995", "Established"],
                  ["1,200+", "Students"],
                  ["80+", "Faculty"],
                  ["K–12", "Grades"],
                ].map(([n, l]) => (
                  <div key={n} className="rounded-2xl border border-[hsl(var(--line))] bg-white p-4 text-center shadow-sm">
                    <div className="text-xl sm:text-2xl font-bold text-[hsl(var(--ink))]">{n}</div>
                    <div className="text-[11px] sm:text-xs text-[hsl(var(--body))]/70">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-3 sm:px-6">
              <CampusShowcaseCard
                imageSrc="/images/sreesai_3.JPG"
                alt="Annual day group photo at Sree Sai School"
                chip="Since 1995"
                title="Sree Sai"
                blurb="Excellence in education since 1995. Nurturing minds with strong values, modern facilities, and dedicated faculty for holistic development."
                className="w-full max-w-[820px] justify-self-center ring-1 ring-[hsl(var(--line))] bg-white/90 backdrop-blur-sm"
              />
            </div>
          </div>
        </section>

        {/* ===== PROGRAMS (Carousel) ===== */}
        <section id="programs" className="py-10 sm:py-16 px-0">
          <div className="w-full relative">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute -top-16 -left-16 h-40 sm:h-56 w-40 sm:w-56 rounded-full blur-3xl bg-[hsl(var(--brand))]/8" />
              <div className="absolute -bottom-20 -right-12 h-40 sm:h-56 w-40 sm:w-56 rounded-full blur-3xl bg-[hsl(var(--brand-cta))]/10" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-[hsl(var(--ink))] mb-6 sm:mb-8 px-3 sm:px-6">
              Programs & Facilities
            </h3>

            <div className="relative">
              <div
                ref={progTrackRef}
                className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-3 sm:px-6"
                aria-label="Programs & Facilities carousel"
              >
                {programSlides.map((s) => (
                  <figure
                    key={s.title}
                    className="relative w-[88%] sm:w-[420px] lg:w-[520px] flex-shrink-0 snap-center rounded-2xl overflow-hidden border border-[hsl(var(--line))] bg-white/95 backdrop-blur-sm shadow-sm"
                  >
                    <div className="relative">
                      <img src={s.src} alt={s.title} className="h-56 sm:h-64 w-full object-cover" loading="lazy" decoding="async" />
                      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
                    </div>

                    <figcaption className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4">
                      <div className="relative mx-auto sm:mx-0 max-w-[92%] sm:max-w-none rounded-xl px-4 py-3 sm:px-5 sm:py-4 text-white bg-blue-600/95 shadow-lg ring-1 ring-white/15 text-center sm:text-left">
                        <span className="hidden sm:block absolute -left-3 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[12px] border-y-transparent border-r-[12px] border-r-blue-600/95" />
                        <span className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[12px] border-y-transparent border-l-[12px] border-l-blue-600/95" />
                        <div className="font-semibold text-sm sm:text-base">{s.title}</div>
                        <p className="mt-1 text-xs sm:text-sm text-white/90">{s.desc}</p>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>

              <button
                type="button"
                aria-label="Previous"
                onClick={() => scrollPrograms(-1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 ring-1 ring-[hsl(var(--line))] shadow hover:bg-white"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => scrollPrograms(1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 ring-1 ring-[hsl(var(--line))] shadow hover:bg-white"
              >
                ›
              </button>
            </div>
          </div>
        </section>

        {/* ===== ALUMNI + EVENTS ===== */}
        <section id="events" className="relative py-10 sm:py-16 px-0">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 opacity-[0.06] [background-size:22px_22px] [background-image:linear-gradient(0deg,#0b1220_1px,transparent_1px),linear-gradient(90deg,#0b1220_1px,transparent_1px)] [mask-image:radial-gradient(140%_80%_at_50%_0%,black,transparent_70%)]" />
            <div className="absolute -top-16 -left-20 h-56 w-56 rounded-full blur-3xl bg-[hsl(var(--brand))]/15" />
            <div className="absolute -bottom-20 -right-16 h-64 w-64 rounded-full blur-3xl bg-[hsl(var(--brand-cta))]/15" />
          </div>

          <div className="w-full grid lg:grid-cols-2 gap-8">
            {/* Alumni */}
            <div className="relative px-3 sm:px-6">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[hsl(var(--ink))]">Passed Out Students</h3>
                <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--brand-cta))]" />
              </div>

              <ul className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {alumni.map((alum, i) => {
                  const isLastCentered = alumni.length % 2 === 1 && i === alumni.length - 1;
                  return (
                    <li key={alum.name} className={`group ${isLastCentered ? "col-span-2 md:col-span-1 place-self-center max-w-[78%] md:max-w-none" : ""}`}>
                      <div className="relative overflow-hidden rounded-2xl border border-[hsl(var(--line))] bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                        <span aria-hidden="true" className="pointer-events-none absolute -top-12 -left-12 h-24 w-24 rounded-full blur-2xl bg-[hsl(var(--brand-cta))]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="p-6 text-center">
                          <div className="mx-auto mb-3 h-24 w-24 rounded-full p-[2px] bg-[conic-gradient(from_140deg,hsl(var(--brand)),hsl(var(--brand-cta)),hsl(var(--brand)))]">
                            <img src={alum.img} alt={alum.name} loading="lazy" decoding="async" className="h-full w-full rounded-full object-cover ring-4 ring-white" />
                          </div>
                          <div className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand-cta))]/10 text-[hsl(var(--brand-cta))] px-2.5 py-1 text-[10px] ring-1 ring-[hsl(var(--brand-cta))]/20">
                            <Sparkles className="h-3.5 w-3.5" />
                            {alum.chip}
                          </div>

                          <div className="mt-3 font-semibold text-[hsl(var(--ink))]">{alum.name}</div>
                          <div className="text-sm text-[hsl(var(--body))]/75">{alum.role}</div>
                        </div>

                        <div className="h-1 bg-gradient-to-r from-[hsl(var(--brand))]/0 via-[hsl(var(--brand-cta))]/25 to-[hsl(var(--brand))]/0" />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Events */}
            <div aria-labelledby="events-heading" className="relative px-3 sm:px-6">
              <div className="mb-4 sm:mb-6">
                <h3 id="events-heading" className="text-2xl sm:text-3xl font-extrabold text-[hsl(var(--ink))]">
                  Events & Academic Calendar
                </h3>
                <div className="mt-2 h-1 w-28 rounded-full bg-gradient-to-r from-[hsl(var(--brand-cta))] to-[hsl(var(--brand))]" />
              </div>

              <Card className="overflow-hidden bg-white/90 backdrop-blur">
                <CardContent className="p-4 sm:p-6">
                  <ol role="list" className="relative space-y-4 sm:space-y-6 sm:pl-10">
                    <span
                      aria-hidden="true"
                      className="hidden sm:block pointer-events-none absolute left-5 top-0 bottom-0 w-[2px] rounded bg-gradient-to-b from-[hsl(var(--brand))]/40 via-[hsl(var(--line))] to-[hsl(var(--brand-cta))]/40"
                    />
                    {events.map((e, i) => (
                      <li key={e.title} className="relative group">
                        <span aria-hidden="true" className="hidden sm:flex absolute left-[1.075rem] top-6 h-4 w-4 items-center justify-center">
                          <span className={`absolute inset-0 rounded-full ${e.dot} opacity-25 blur-[6px]`} />
                          <span className={`relative h-4 w-4 rounded-full bg-white ring-2 ${e.dot} ring-offset-2`} />
                        </span>

                        <div
                          className={`relative rounded-2xl p-[1px] overflow-hidden bg-gradient-to-r ${e.tint} shadow-[0_8px_30px_rgba(2,6,23,0.06)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_18px_48px_rgba(2,6,23,0.14)]`}
                        >
                          <div className="relative rounded-2xl bg-white">
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 bg-[radial-gradient(600px_120px_at_10%_-20%,rgba(59,130,246,0.12),transparent),radial-gradient(600px_120px_at_90%_-20%,rgba(16,185,129,0.10),transparent)] transition-opacity duration-300 group-hover:opacity-100"
                            />
                            <div className="p-4 sm:p-5 relative">
                              <div className="flex items-start gap-3 sm:gap-4">
                                <span
                                  className="inline-grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[hsl(var(--brand-cta))]/10 text-[hsl(var(--brand-cta))] ring-1 ring-[hsl(var(--brand-cta))]/20 transition-transform duration-300 group-hover:scale-[1.06] group-hover:rotate-1"
                                  aria-hidden="true"
                                >
                                  <e.Icon className="h-5 w-5" />
                                </span>

                                <div className="min-w-0 pr-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-semibold text-[hsl(var(--ink))]">{e.title}</h4>

                                    <time
                                      className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[hsl(var(--brand))]/10 to-[hsl(var(--brand-cta))]/10 px-2.5 py-1 text-[10px] font-medium text-[hsl(var(--body))] ring-1 ring-[hsl(var(--line))]"
                                      dateTime={new Date(e.date).toISOString()}
                                    >
                                      <CalendarDays className="h-3.5 w-3.5 text-[hsl(var(--brand))]" />
                                      {e.date}
                                    </time>
                                  </div>

                                  <p className="mt-1 text-sm text-[hsl(var(--body))]/80">{e.desc}</p>
                                </div>
                              </div>
                            </div>

                            <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${e.tint}`} />
                          </div>
                        </div>

                        {i !== events.length - 1 && (
                          <span
                            aria-hidden="true"
                            className="hidden sm:block pointer-events-none absolute left-5 top-[3.25rem] bottom-[-1.25rem] w-[2px] bg-[linear-gradient(to_bottom,transparent,rgba(2,6,23,0.08),transparent)]"
                          />
                        )}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ===== GALLERY ===== */}
        <section id="gallery" className="py-10 sm:py-16 px-0">
          <div className="w-full">
            <div className="flex items-center justify-between mb-5 sm:mb-6 px-3 sm:px-6">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[hsl(var(--ink))]">Campus Gallery</h3>
            </div>
            <ImageCarousel
              className="h-[220px] sm:h-[300px] lg:h-[360px] rounded-xl overflow-hidden ring-1 ring-[hsl(var(--line))] mx-3 sm:mx-6"
              interval={4000}
              autoPlay
              showArrows
              showDots
              slides={[
                { src: "/images/sreesai_1.JPG", alt: "Assembly at campus" },
                { src: "/images/sreesai_2.JPG", alt: "Labs and classrooms" },
                { src: "/images/sreesai_3.JPG", alt: "Cultural program" },
              ]}
            />
          </div>
        </section>

        {/* ===== ADMISSIONS CTA ===== */}
        <section id="admissions" className="py-10 sm:py-16 px-0">
          <div className="w-full relative">
            <div className="pointer-events-none absolute inset-0 blur-2xl opacity-60 rounded-[24px] sm:rounded-[28px] bg-[radial-gradient(120%_120%_at_0%_0%,hsl(var(--brand-cta))_0%,transparent_60%)]" />
            <div className="relative rounded-[24px] sm:rounded-[28px] p-6 sm:p-10 text-white shadow-xl ring-1 ring-white/15 overflow-hidden bg-[linear-gradient(90deg,hsl(var(--brand))_0%,hsl(var(--brand-cta))_100%)] mx-3 sm:mx-6">
              <div className="pointer-events-none absolute -top-24 left-1/3 h-40 sm:h-48 w-[140%] rotate-[-8deg] bg-white/10 blur-2xl" />
              <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 items-center">
                <div className="lg:col-span-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Admissions Open</h3>
                  <p className="mt-2 text-white/90">
                    Start your child’s learning journey with a school that nurtures curiosity, confidence, and character.
                  </p>
                  <ol className="mt-4 sm:mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {["Enquiry", "Campus Visit", "Apply", "Interview & Decision"].map((step, i) => (
                      <li key={step} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs sm:text-sm ring-1 ring-white/15">
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-white/90 text-[hsl(var(--brand))] text-[10px] sm:text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="text-white/95">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="#contact" className="flex-1 sm:flex-initial">
                    <Button variant="secondary" className="w-full sm:w-auto bg-white text-[hsl(var(--brand))] hover:bg-blue-50 ring-1 ring-white/40 shadow-sm">
                      Visit School
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== PRINCIPAL MESSAGE ===== */}
        <section id="principal" className="relative py-10 sm:py-16 px-0">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-12 left-1/4 h-32 sm:h-40 w-32 sm:w-40 rounded-full blur-3xl bg-[hsl(var(--brand))]/10" />
            <div className="absolute -bottom-12 right-10 h-36 sm:h-48 w-36 sm:w-48 rounded-full blur-3xl bg-[hsl(var(--brand-cta))]/10" />
          </div>

          <div className="w-full grid lg:grid-cols-3 gap-8 items-stretch">
            <div className="order-2 lg:order-1 px-3 sm:px-6">
              <div className="relative mx-auto w-full max-w-xs sm:max-w-sm">
                <div className="rounded-2xl p-[2px] bg-[conic-gradient(from_140deg,hsl(var(--brand)),hsl(var(--brand-cta)),hsl(var(--brand)))]">
                  <div className="rounded-2xl bg-white shadow-lg">
                    <div className="p-6 text-center">
                      <div className="mx-auto mb-4 h-24 w-24 sm:h-32 sm:w-32 rounded-full overflow-hidden ring-4 ring-white shadow">
                        <img
                          src="https://images.unsplash.com/photo-1608929806738-9e30e92b9a53?q=80&w=300"
                          alt="Principal portrait"
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="font-semibold text-[hsl(var(--ink))] text-base sm:text-lg">Mr. Prakash</div>
                      <div className="text-xs sm:text-sm text-[hsl(var(--body))]/75">Principal</div>

                      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                        {[
                          ["15+", "Years"],
                          ["98%", "Pass"],
                          ["Top 5", "District"],
                        ].map(([n, l]) => (
                          <div key={n} className="rounded-xl border border-[hsl(var(--line))] bg-white/80 px-3 py-2">
                            <div className="text-sm font-bold text-[hsl(var(--ink))]">{n}</div>
                            <div className="text-[10px] text-[hsl(var(--body))]/70">{l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <span className="absolute -top-2 -right-2 rounded-full bg-white/90 px-3 py-1 text-[10px] sm:text-xs font-medium text-[hsl(var(--brand))] ring-1 ring-[hsl(var(--line))] shadow">
                  Guided by Values
                </span>
              </div>
            </div>

            <div className="lg:col-span-2 order-1 lg:order-2 px-3 sm:px-6">
              <div className="relative overflow-hidden rounded-2xl border border-[hsl(var(--line))] bg-white/95 backdrop-blur-sm shadow-lg">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[hsl(var(--brand-cta))] via-[hsl(var(--brand))] to-[hsl(var(--brand-cta))]" />
                <div className="pointer-events-none absolute -top-6 -left-2 text-[hsl(var(--brand))]/10 text-[96px] sm:text-[120px] leading-none select-none">“</div>

                <div className="p-5 sm:p-8">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[hsl(var(--ink))] mb-4">Principal’s Message</h3>

                  <div className="flex items-start gap-3 sm:gap-4">
                    <svg className="h-6 w-6 sm:h-8 sm:w-8 text-[hsl(var(--brand-cta))] mt-1 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M7.17 6A5.17 5.17 0 0 0 2 11.17V22h8V10H6.83C7.45 8.2 8.76 6.95 10.8 6.3L9.9 4.05C8.85 4.4 7.96 5.05 7.17 6Zm10 0A5.17 5.17 0 0 0 12 11.17V22h8V10h-3.17c.62-1.8 1.93-3.05 3.97-3.7l-.9-2.25c-1.05.35-1.94 1-2.73 1.95Z" />
                    </svg>

                    <blockquote className="relative">
                      <p className="text-base sm:text-lg leading-relaxed text-[hsl(var(--body))]">
                        We believe in nurturing each child’s potential and guiding them toward a bright future. Our team is committed to academic
                        excellence and holistic development through <span className="font-semibold text-[hsl(var(--ink))]">values, curiosity, and creativity</span>. Every day
                        at Sree Sai, we strive to make learning joyful, purposeful, and future-ready.
                      </p>
                      <footer className="mt-4 text-xs sm:text-sm text-[hsl(var(--body))]/75">— <span className="font-medium text-[hsl(var(--ink))]">Mr. Prakash</span>, Principal</footer>
                    </blockquote>
                  </div>

                  <div className="mt-5 sm:mt-6 flex flex-wrap gap-2">
                    {["Excellence", "Integrity", "Curiosity", "Compassion"].map((v) => (
                      <span key={v} className="inline-flex items-center rounded-full bg-[hsl(var(--brand-cta))]/10 text-[hsl(var(--brand-cta))] px-2.5 py-1 text-[10px] sm:text-xs ring-1 ring-[hsl(var(--brand-cta))]/20">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CONTACT ===== */}
        <section id="contact" className="relative py-10 sm:py-16 px-0">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 opacity-[0.06] [background-size:22px_22px] [background-image:linear-gradient(0deg,#0b1220_1px,transparent_1px),linear-gradient(90deg,#0b1220_1px,transparent_1px)] [mask-image:radial-gradient(140%_80%_at_50%_0%,black,transparent_70%)]" />
            <div className="absolute -top-16 -left-12 h-60 w-60 rounded-full blur-3xl bg-[hsl(var(--brand))]/15" />
            <div className="absolute -bottom-16 -right-12 h-60 w-60 rounded-full blur-3xl bg-[hsl(var(--brand-cta))]/15" />
          </div>

          <div className="w-full">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[hsl(var(--ink))] mb-2 sm:mb-3 px-3 sm:px-6">Get in touch</h3>
            <p className="text-[hsl(var(--body))]/80 mb-6 sm:mb-8 px-3 sm:px-6">We’re here to help with admissions, campus visits, and general queries.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-start px-3 sm:px-6">
              {/* PHONE */}
              <div className="group relative self-start rounded-2xl p-[1px] bg-gradient-to-b from-blue-300/25 to-indigo-200/20">
                <Card className="relative overflow-hidden text-center bg-white/95 backdrop-blur-sm border border-[hsl(var(--line))] shadow-sm group-hover:shadow-lg transition-all rounded-2xl">
                  <span aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/3 h-48 w-[140%] rotate-[-10deg] bg-blue-500/10 blur-2xl" />
                  <CardHeader>
                    <div className="mx-auto inline-grid h-12 w-12 place-items-center rounded-2xl text-[hsl(var(--brand-cta))] bg-[hsl(var(--brand-cta))]/12 ring-1 ring-[hsl(var(--brand-cta))]/20 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1">
                      <Phone className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-[hsl(var(--ink))] text-xl">Phone</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: "+919440479822", tel: "+919440479822", key: "tel1" },
                      { label: "+919440479822", tel: "+919440479822", key: "tel2" },
                    ].map((p) => (
                      <div key={p.key} className="flex items-center justify-center gap-2">
                        <a href={`tel:${p.tel}`} className="font-medium text-[hsl(var(--ink))] hover:underline" aria-label={`Call ${p.label}`}>
                          {p.label}
                        </a>
                        <button
                          onClick={() => copyToClipboard(p.key, p.tel)}
                          className="text-xs rounded-full px-2 py-1 bg-[hsl(var(--brand-cta))]/10 text-[hsl(var(--brand-cta))] ring-1 ring-[hsl(var(--brand-cta))]/20 hover:bg-[hsl(var(--brand-cta))]/15"
                          aria-label={`Copy ${p.label}`}
                        >
                          {copiedKey === p.key ? "Copied" : "Copy"}
                        </button>
                      </div>
                    ))}
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand))]/6 px-3 py-1 text-xs text-[hsl(var(--body))] ring-1 ring-[hsl(var(--line))]">
                      <CalendarDays className="h-4 w-4 text-[hsl(var(--brand))]" />
                      Mon–Sat, 9:00 AM – 5:00 PM
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* EMAIL */}
              <div className="group relative self-start rounded-2xl p-[1px] bg-gradient-to-b from-emerald-300/25 to-teal-200/20">
                <Card className="relative overflow-hidden text-center bg-white/95 backdrop-blur-sm border border-[hsl(var(--line))] shadow-sm group-hover:shadow-lg transition-all rounded-2xl">
                  <span aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/4 h-48 w-[140%] rotate-[8deg] bg-emerald-500/10 blur-2xl" />
                  <CardHeader>
                    <div className="mx-auto inline-grid h-12 w-12 place-items-center rounded-2xl text-green-600 bg-green-600/12 ring-1 ring-green-600/20 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1">
                      <Mail className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-[hsl(var(--ink))] text-xl">Email</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { e: "info@sreesaischool.edu", key: "email1" },
                      { e: "admissions@sreesaischool.edu", key: "email2" },
                    ].map(({ e, key }) => (
                      <div key={key} className="flex items-center justify-center gap-2">
                        <a href={`mailto:${e}`} className="font-medium text-[hsl(var(--ink))] hover:underline break-all" aria-label={`Email ${e}`}>
                          {e}
                        </a>
                        <button
                          onClick={() => copyToClipboard(key, e)}
                          className="text-xs rounded-full px-2 py-1 bg-green-600/10 text-green-700 ring-1 ring-green-600/20 hover:bg-green-600/15"
                          aria-label={`Copy ${e}`}
                        >
                          {copiedKey === key ? "Copied" : "Copy"}
                        </button>
                      </div>
                    ))}
                    <p className="text-xs text-[hsl(var(--body))]/70">We reply within one working day.</p>
                  </CardContent>
                </Card>
              </div>

              {/* ADDRESS */}
              <div className="group relative self-start rounded-2xl p-[1px] bg-gradient-to-b from-fuchsia-300/25 to-violet-200/20">
                <Card className="relative overflow-hidden text-center bg-white/95 backdrop-blur-sm border border-[hsl(var(--line))] shadow-sm group-hover:shadow-lg transition-all rounded-2xl">
                  <span aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-[120%] rotate-[-5deg] bg-fuchsia-500/10 blur-2xl" />
                  <CardHeader>
                    <div className="mx-auto inline-grid h-12 w-12 place-items-center rounded-2xl text-[#7C3AED] bg-[#7C3AED]/12 ring-1 ring-[#7C3AED]/20 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-[hsl(var(--ink))] text-xl">Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <address className="not-italic text-[hsl(var(--body))] leading-relaxed max-w-[40ch] mt-0 mx-auto">
                      {ADDRESS}
                    </address>

                    <div className="mt-0 flex flex-wrap items-center justify-center gap-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand))]/10 px-3 py-1.5 text-sm font-medium text-[hsl(var(--brand))] ring-1 ring-[hsl(var(--brand))]/20 hover:bg-[hsl(var(--brand))]/15"
                        aria-label="Open address in Google Maps"
                      >
                        Open in Maps
                      </a>
                      <button
                        onClick={() => copyToClipboard("addr", ADDRESS)}
                        className="text-sm rounded-full px-3 py-1.5 bg-[hsl(var(--body))]/10 text-[hsl(var(--ink))] ring-1 ring-[hsl(var(--line))] hover:bg-[hsl(var(--body))]/15"
                        aria-label="Copy address"
                      >
                        {copiedKey === "addr" ? "Copied" : "Copy address"}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* admissions strip CTA */}
            <div className="mt-8 relative overflow-hidden rounded-2xl p-5 sm:p-7 text-white ring-1 ring-white/15 bg-[linear-gradient(90deg,hsl(var(--brand))_0%,hsl(var(--brand-cta))_100%)] mx-3 sm:mx-6">
              <div className="pointer-events-none absolute -top-24 left-1/3 h-40 sm:h-48 w-[140%] rotate-[-8deg] bg-white/10 blur-2xl" />
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-between">
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm text-white/80">Need help right away?</p>
                  <h4 className="text-lg sm:text-xl font-semibold">Admissions Helpline</h4>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <a href="tel:+919876543210" className="flex-1 sm:flex-initial">
                    <Button className="w-full sm:w-auto bg-white text-[hsl(var(--brand))] hover:bg-blue-50 ring-1 ring-white/40">
                      Call Now
                    </Button>
                  </a>
                  <a href="mailto:admissions@sreesaischool.edu" className="flex-1 sm:flex-initial">
                    <Button variant="secondary" className="w-full sm:w-auto bg-transparent text-white border border-white/40 hover:bg-white/10">
                      Email Admissions
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===== FOOTER (full-width, sticks to bottom because parent is flex-col) ===== */}
      <footer className="relative bg-[#0B1220] text-white overflow-x-clip">
        <svg className="pointer-events-none absolute -top-[1px] left-0 w-full h-[64px] sm:h-[80px] lg:h-[120px]" viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden="true">
          <path fill="#0B1220" d="M0,64 C240,96 480,48 720,64 C960,80 1200,48 1440,64 L1440,160 L0,160 Z" />
        </svg>

        <div className="pointer-events-none absolute inset-0">
          <div className="hidden sm:block absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-20%,rgba(99,102,241,0.18),transparent)] opacity-80" />
          <div className="absolute inset-0 bg-[radial-gradient(600px_400px_at_90%_120%,rgba(59,130,246,0.15),transparent)] opacity-70" />
        </div>

        {/* full-width: no side padding */}
        <div className="relative w-full px-0 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 px-3 sm:px-6">
            <div>
              <div className="flex items-center gap-3">
                <School className="h-7 w-7 text-[hsl(var(--brand-cta))]" />
                <span className="font-semibold tracking-tight">Sree Sai English Medium High School</span>
              </div>
              <p className="mt-3 text-white/80">Excellence in Education Since 1995</p>

              <div className="mt-5">
                <Link to="/prospectus" className="inline-block">
                  <Button className="bg-white text-[hsl(var(--brand))] hover:bg-blue-50 ring-1 ring-white/30">
                    Download Prospectus
                  </Button>
                </Link>
              </div>
            </div>

            <nav aria-label="Footer navigation">
              <h4 className="text-sm font-semibold text-white/90">Quick Links</h4>
              <ul className="mt-3 grid grid-cols-2 gap-2 text-sm max-w-xs">
                {[
                  ["About", "#about"],
                  ["Programs", "#programs"],
                  ["Events", "#events"],
                  ["Gallery", "#gallery"],
                  ["Contact", "#contact"],
                  ["Admissions", "#admissions"],
                ].map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="text-white/80 hover:text-white underline-offset-4 hover:underline">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h4 className="text-sm font-semibold text-white/90">Contact</h4>
              <ul className="mt-3 space-y-2 text-sm text-white/80">
                <li>
                  <a href="tel:+919876543210" className="hover:text-white">+91 98765 43210</a>
                  <span className="mx-2 text-white/30">•</span>
                  <a href="tel:+919876543211" className="hover:text-white">+91 98765 43211</a>
                </li>
                <li className="break-all">
                  <span className="mx-2 text-white/30">•</span>
                  <a href="mailto:info@sreesaischool.edu" className="hover:text-white">info@sreesaischool.edu</a><br/>
                  <span className="mx-2 text-white/30">•</span>
                  <a href="mailto:admissions@sreesaischool.edu" className="hover:text-white">admissions@sreesaischool.edu</a>
                </li>
                <li className="text-white/75">14/96, 3, Tirupati–Renigunta Flyover Bridge, Gowri Nagar, Renigunta, Tirupati, Andhra Pradesh 517520</li>
              </ul>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <a href="#admissions">
                  <Button className="bg-[hsl(var(--brand-cta))] hover:bg-[hsl(var(--brand-cta-hover))]">Enroll Now</Button>
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    "14/96, 3, Tirupati- Renigunta Flyover Bridge, Gowri Nagar, Renigunta, Tirupati, Andhra Pradesh 517520",
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-sm text-white/80 hover:text-white underline underline-offset-4"
                >
                  Open in Maps
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 md:mt-10 border-t border-white/10 pt-5 md:pt-6 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 px-3 sm:px-6">
            <p className="text-white/60 text-xs sm:text-sm text-center md:text-left">
              © {new Date().getFullYear()} Sree Sai English Medium High School. All rights reserved.
            </p>
            <div className="flex items-center gap-4 sm:gap-6 text-sm">
              <Link to="#" className="text-white/70 hover:text-white">Privacy</Link>
              <Link to="#" className="text-white/70 hover:text-white">Terms</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating “back to top” arrow (shows near bottom) */}
      {showToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-4 md:right-6 z-[60] h-12 w-12 grid place-items-center rounded-full bg-[linear-gradient(135deg,#3B82F6_0%,#6366F1_50%,#22D3EE_100%)] shadow-[0_12px_28px_rgba(59,130,246,.35)] ring-1 ring-white/40 text-white transition-all duration-300 hover:brightness-110 active:scale-95"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};
