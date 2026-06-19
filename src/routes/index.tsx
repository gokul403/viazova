import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Ticket, Percent, Gift, Loader2, ShieldCheck, MapPin, Mail, Phone, Plane } from "lucide-react";
import { enterLuckyDraw, type DrawResult } from "@/lib/draw.functions";
import heroImage from "@/assets/thailand-hero.jpg";
import { Confetti } from "@/components/Confetti";
import { ViazovaLogo } from "@/components/ViazovaLogo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Travel Lucky Draw — Win a FREE Flight to Thailand" },
      {
        name: "description",
        content:
          "Enter your details for a chance to win a FREE flight ticket to Thailand, ₹1000 off, or 10% discount on your next tour package.",
      },
      { property: "og:title", content: "Travel Lucky Draw — Win a Flight to Thailand" },
      {
        property: "og:description",
        content: "Limited campaign. Try your luck and win premium travel rewards.",
      },
    ],
  }),
  component: LandingPage,
});

type FormErrors = { name?: string; mobile?: string; general?: string };

function LandingPage() {
  const draw = useServerFn(enterLuckyDraw);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DrawResult | null>(null);

  function validate(): boolean {
    const next: FormErrors = {};
    if (name.trim().length < 2) next.name = "Please enter your full name (min 2 characters).";
    if (!/^[6-9][0-9]{9}$/.test(mobile.trim()))
      next.mobile = "Enter a valid 10-digit Indian mobile number.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || loading) return;
    setLoading(true);
    setErrors({});
    try {
      const res = await draw({ data: { name: name.trim(), mobile: mobile.trim() } });
      setResult(res);
      setTimeout(() => {
        document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setName("");
    setMobile("");
    setErrors({});
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HERO */}
      <header className="relative isolate flex min-h-svh flex-col overflow-hidden">
        <img
          src={heroImage}
          alt="Aerial view of Thailand's turquoise waters and limestone islands"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-hero" />

        {/* Floating decorative icons */}
        <Plane className="absolute left-[8%] top-44 size-8 text-accent/80 animate-float sm:top-48" style={{ animationDelay: "0.5s" }} />
        <Sparkles className="absolute right-[10%] top-36 size-7 text-white/70 animate-float" style={{ animationDelay: "1.2s" }} />
        <MapPin className="absolute right-[20%] bottom-32 size-6 text-accent/80 animate-float hidden md:block" />

        <nav className="flex w-full shrink-0 items-center justify-between py-3 pl-2 pr-4 sm:pl-3 sm:pr-6 md:pl-4">
          <ViazovaLogo variant="header" />
          <span className="hidden items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm backdrop-blur-sm md:inline-flex">
            <Sparkles className="size-4 text-accent" /> Limited Edition Campaign
          </span>
        </nav>

        <div className="mx-auto flex w-full max-w-7xl flex-1 items-center px-6 py-8 lg:py-10">
          <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="text-white animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-widest backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-accent" /> VIAZOVA
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl xl:text-7xl">
              ✈️ Viazova Travel <span className="text-gradient-gold">Lucky Draw</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/90 sm:text-lg lg:mt-5 lg:text-xl">
              Enter your details and stand a chance to win exciting travel rewards including a{" "}
              <strong className="font-semibold text-accent">FREE Flight Ticket to Thailand</strong>.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:mt-8">
              {[
                { icon: Ticket, label: "Thailand Flight", v: "Grand Prize" },
                { icon: Gift, label: "₹1000 Off", v: "200 winners" },
                { icon: Percent, label: "10% Discount", v: "50 winners" },
                { icon: ShieldCheck, label: "Fair Draw", v: "Server-verified" },
              ].map(({ icon: Icon, label, v }) => (
                <div
                  key={label}
                  className="rounded-2xl bg-white/10 p-3 backdrop-blur-md ring-1 ring-white/20"
                >
                  <Icon className="size-5 text-accent" />
                  <div className="mt-2 text-sm font-semibold tabular-nums">{label}</div>
                  <div className="text-xs tabular-nums text-white/75">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PARTICIPATION FORM */}
          <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl bg-card p-7 shadow-elegant ring-1 ring-black/5 sm:p-9"
            >
              <h2 className="text-2xl font-bold tracking-tight">Try your luck now</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                One entry per mobile number. Results revealed instantly.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                    disabled={loading}
                    maxLength={80}
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="mobile" className="text-sm font-medium">
                    Mobile Number
                  </label>
                  <div className="mt-1.5 flex overflow-hidden rounded-xl border border-input bg-background transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
                    <span className="grid place-items-center bg-muted px-3 text-sm font-medium text-muted-foreground">
                      +91
                    </span>
                    <input
                      id="mobile"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="10-digit mobile"
                      className="w-full bg-transparent px-4 py-3 text-base outline-none"
                      disabled={loading}
                    />
                  </div>
                  {errors.mobile && (
                    <p className="mt-1.5 text-sm text-destructive">{errors.mobile}</p>
                  )}
                </div>

                {errors.general && (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {errors.general}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-brand px-6 py-4 text-base font-semibold text-primary-foreground shadow-elegant transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-80"
                >
                  <span className="relative z-10 inline-flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        Checking your luck...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-5" /> Try My Luck
                      </>
                    )}
                  </span>
                </button>

                <p className="text-center text-xs text-muted-foreground">
                  By participating you accept the campaign terms below.
                </p>
              </div>
            </form>
          </div>
          </div>
        </div>
      </header>

      {/* RESULT */}
      {result && (
        <section id="result" className="mx-auto max-w-3xl px-6 py-16">
          <ResultCard result={result} onReset={reset} name={name} />
        </section>
      )}

      {/* PRIZES */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">The Prize Pool</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            300 guaranteed outcomes. Every participant gets a result. The pool is locked, fair,
            and verified server-side.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          <PrizeCard
            badge="Grand Prize"
            title="FREE Flight to Thailand"
            count="1"
            description="Round-trip flight ticket to Bangkok or Phuket for the lucky grand prize winner."
            icon={Plane}
            featured
          />
          <PrizeCard
            badge="200 Winners"
            title="₹1000 Off"
            count="200"
            description="Instant ₹1000 discount on any tour package booked with us."
            icon={Gift}
          />
          <PrizeCard
            badge="50 Winners"
            title="10% Discount"
            count="50"
            description="A flat 10% off on your next tour package booking."
            icon={Percent}
          />
          {/* <PrizeCard
            badge="49 Outcomes"
            title="Better Luck Next Time"
            count="49"
            description="Not every entry wins — but every participant matters."
            icon={Sparkles}
          /> */}
        </div>
      </section>

      {/* TERMS */}
      <section className="bg-muted/40">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-3xl font-bold">Campaign Terms &amp; Conditions</h2>
          <ul className="mt-8 grid gap-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {[
              "The campaign is open to Indian residents aged 18 years and above with a valid 10-digit mobile number.",
              "Only one entry is allowed per mobile number. Duplicate entries are automatically rejected.",
              "The prize pool consists of exactly 300 guaranteed outcomes and is allocated on a first-come, first-served random basis.",
              "Rewards are non-transferable, non-refundable, and cannot be exchanged for cash equivalent.",
              "The grand-prize Thailand flight ticket is subject to availability of travel dates, valid travel documents, and applicable taxes borne by the winner.",
              "Discount rewards are valid only on tour packages booked with Viazova Travel Solutions and cannot be combined with other offers.",
              "The organizer reserves the right to modify or terminate the campaign at any time without prior notice.",
              "By participating, you consent to being contacted by our team regarding your reward and future travel offers.",
            ].map((t, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-2 inline-block size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <span className="grid size-9 place-items-center rounded-xl bg-white/15">
                <Plane className="size-5" />
              </span>
              <span className="text-lg">Viazova Travel Solutions</span>
            </div>
            <p className="mt-4 text-sm text-primary-foreground/80">
              Viazova represents a new era in travel - We seek forward shielded and trusted space during the travel along with the assistance. By combining the latest technologies and personalised services, we go extra miles for the satisfaction of our value travelers..
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/85">
              <li className="flex items-center gap-2">
                <Phone className="size-4" /> +91 90578888800
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4" /> info@viazova.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4" /> 1st floor , Safa Complex Ravipuram Junction, MG Road , Kochi, Kerala 682016
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/85">
              <li><a href="#" className="hover:text-accent">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-accent">Terms of Service</a></li>
              <li><a href="#" className="hover:text-accent">Campaign Disclaimer</a></li>
              <li><a href="#" className="hover:text-accent">Refund Policy</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Disclaimer</h3>
            <p className="mt-4 text-sm text-primary-foreground/80">
              This is a promotional lucky-draw campaign. Rewards are subject to verification and
              campaign terms. Viazova Travel Solutions' decision is final.
            </p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-primary-foreground/70 sm:flex-row">
            <span>© {new Date().getFullYear()} Viazova Travel Solutions. All rights reserved.</span>
            <span>Made with care for travelers.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PrizeCard({
  badge,
  title,
  count,
  description,
  icon: Icon,
  featured,
}: {
  badge: string;
  title: string;
  count: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  featured?: boolean;
}) {
  return (
    <div
      className={
        "group relative overflow-hidden rounded-3xl border bg-card p-6 shadow-card-soft transition hover:-translate-y-1 hover:shadow-elegant " +
        (featured ? "ring-2 ring-accent" : "border-border")
      }
    >
      {featured && (
        <span className="absolute right-4 top-4 rounded-full bg-gradient-gold px-3 py-1 text-xs font-semibold text-accent-foreground shadow-gold-glow">
          Grand Prize
        </span>
      )}
      <div className={"grid size-12 place-items-center rounded-2xl " + (featured ? "bg-gradient-gold text-accent-foreground" : "bg-primary/10 text-primary")}>
        <Icon className="size-6" />
      </div>
      <div className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {badge}
      </div>
      <h3 className="mt-1 text-xl font-bold tabular-nums">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="font-numeric text-3xl font-bold tracking-tight text-gradient-brand">{count}</span>
        <span className="text-sm text-muted-foreground">total in pool</span>
      </div>
    </div>
  );
}

function ResultCard({
  result,
  onReset,
  name,
}: {
  result: DrawResult;
  onReset: () => void;
  name: string;
}) {
  const { reward, alreadyParticipated } = result;

  if (alreadyParticipated) {
    return (
      <div className="animate-pop-in rounded-3xl border bg-card p-10 text-center shadow-card-soft">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-muted">
          <ShieldCheck className="size-8 text-muted-foreground" />
        </div>
        <h2 className="mt-5 text-2xl font-bold">You have already participated</h2>
        <p className="mt-2 text-muted-foreground">
          This mobile number has already entered the lucky draw. Only one entry is allowed per
          participant.
        </p>
        {reward && (
          <p className="mt-4 text-sm text-muted-foreground">
            Your previous result: <strong>{rewardLabel(reward)}</strong>
          </p>
        )}
        <button
          onClick={onReset}
          className="mt-6 rounded-xl border border-input px-5 py-2.5 text-sm font-medium hover:bg-muted"
        >
          Close
        </button>
      </div>
    );
  }

  const showConfetti = reward !== "BETTER_LUCK_NEXT_TIME";

  if (reward === "THAILAND_FLIGHT") {
    return (
      <>
        <Confetti count={180} />
        <div className="animate-pop-in overflow-hidden rounded-3xl bg-gradient-brand p-1 shadow-elegant">
          <div className="rounded-3xl bg-card p-10 text-center">
            <div className="mx-auto grid size-20 place-items-center rounded-2xl bg-gradient-gold text-accent-foreground shadow-gold-glow">
              <Plane className="size-10" />
            </div>
            <p className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-accent">
              🎉 Grand Prize Winner
            </p>
            <h2 className="mt-3 text-4xl font-bold tabular-nums sm:text-5xl">
              Congratulations{name ? `, ${name.split(" ")[0]}` : ""}!
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
              You have won a <strong className="text-foreground">FREE Flight Ticket to Thailand</strong>.
              Our team will contact you shortly with the next steps.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-2 text-sm font-medium text-accent-foreground">
              <Sparkles className="size-4" /> A once-in-a-lifetime journey awaits ✈️
            </div>
          </div>
        </div>
      </>
    );
  }

  if (reward === "INR_1000_OFF") {
    return (
      <>
        {showConfetti && <Confetti count={120} />}
        <div className="animate-pop-in rounded-3xl border bg-card p-10 text-center shadow-card-soft">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Gift className="size-8" />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-widest text-primary">🎉 Congratulations</p>
          <h2 className="mt-2 text-3xl font-bold tabular-nums sm:text-4xl">You won ₹1000 Off!</h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Use this reward on your next tour package booking with Viazova Travel Solutions. Our team will reach
            out with your unique code.
          </p>
        </div>
      </>
    );
  }

  if (reward === "TEN_PERCENT_DISCOUNT") {
    return (
      <>
        {showConfetti && <Confetti count={120} />}
        <div className="animate-pop-in rounded-3xl border bg-card p-10 text-center shadow-card-soft">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-secondary/15 text-secondary">
            <Percent className="size-8" />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-widest text-secondary">🎉 Congratulations</p>
          <h2 className="mt-2 text-3xl font-bold tabular-nums sm:text-4xl">You won a 10% Discount!</h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Enjoy a flat 10% off on your next tour package booking with Viazova Travel Solutions.
          </p>
        </div>
      </>
    );
  }

  // BETTER_LUCK_NEXT_TIME
  return (
    <div className="animate-pop-in rounded-3xl border bg-card p-10 text-center shadow-card-soft">
      <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <Sparkles className="size-8" />
      </div>
      <h2 className="mt-5 text-2xl font-bold sm:text-3xl">Better Luck Next Time!</h2>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        Thank you for participating{name ? `, ${name.split(" ")[0]}` : ""}. We hope to see you on
        your next adventure with us.
      </p>
      <a
        href="#"
        className="mt-6 inline-flex rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant"
      >
        Explore our tour packages
      </a>
    </div>
  );
}

function rewardLabel(r: DrawResult["reward"]): string {
  switch (r) {
    case "THAILAND_FLIGHT":
      return "FREE Flight to Thailand";
    case "INR_1000_OFF":
      return "₹1000 Off";
    case "TEN_PERCENT_DISCOUNT":
      return "10% Discount";
    default:
      return "Better Luck Next Time";
  }
}
