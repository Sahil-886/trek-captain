import Link from "next/link";
import {
  Users,
  CreditCard,
  Map,
  ArrowRight,
  Mountain,
  Shield,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-charcoal topo-bg relative overflow-hidden flex flex-col justify-between">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-trail-orange/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-alpine-green/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Nav */}
      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-trail-orange flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-trail-orange/20">
              ⛰
            </div>
            <span className="font-extrabold text-xl font-[family-name:var(--font-sora-family)] text-text-primary tracking-tight">
              Trek <span className="text-trail-orange">Captain</span>
            </span>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-trail-orange text-white text-sm font-semibold rounded-lg hover:bg-trail-orange-hover transition-all duration-300 shadow-md shadow-trail-orange/10 hover:shadow-trail-orange/20 cursor-pointer"
          >
            Open Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-20 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-trail-orange/10 border border-trail-orange/20 text-trail-orange text-xs font-semibold rounded-full tracking-wide uppercase">
              <Mountain className="w-3.5 h-3.5" />
              Built for Indian Trek Organizers
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold font-[family-name:var(--font-sora-family)] text-text-primary leading-[1.1] tracking-tight">
              Run your treks <br />
              <span className="bg-gradient-to-r from-trail-orange to-amber-500 bg-clip-text text-transparent">
                like a seasoned pro
              </span>
            </h1>
            <p className="text-base md:text-lg text-text-muted max-w-xl leading-relaxed">
              Stop juggling chaotic spreadsheets, messy payments, and endless WhatsApp threads.
              Trek Captain gives you one streamlined dashboard to organize participants, reconcile payments,
              and build interactive itineraries.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-trail-orange text-white text-sm font-bold rounded-xl hover:bg-trail-orange-hover transition-all duration-300 shadow-lg shadow-trail-orange/25 hover:translate-y-[-1px] cursor-pointer"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2 text-xs text-text-muted font-medium bg-card/60 border border-border/80 rounded-lg px-4 py-3">
                <Shield className="w-4 h-4 text-alpine-green" />
                Demo dataset pre-loaded • Ready to test
              </div>
            </div>
          </div>

          {/* Interactive Mockup Graphic */}
          <div className="lg:col-span-5 relative w-full">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-trail-orange to-alpine-green rounded-2xl opacity-15 blur-xl pointer-events-none" />
            <div className="relative bg-card/95 border border-border/80 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
              {/* Header inside mockup */}
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[10px] font-mono text-text-dim uppercase tracking-widest">Live Preview</span>
              </div>

              {/* simulated trek card */}
              <div className="bg-charcoal/80 border border-border rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold font-[family-name:var(--font-sora-family)] text-xs text-text-primary">
                      Harishchandragad via Nalichi Vaat
                    </h3>
                    <p className="text-[10px] text-text-muted mt-0.5">Ahmednagar, Sahyadris</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-danger/10 text-danger font-medium border border-danger/25">
                    Hard
                  </span>
                </div>

                {/* progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-text-muted">
                    <span>Capacity (16/20)</span>
                    <span className="text-trail-orange font-semibold">80%</span>
                  </div>
                  <div className="h-1.5 bg-border/80 rounded-full overflow-hidden">
                    <div className="h-full bg-trail-orange rounded-full w-[80%]" />
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-text-muted pt-1">
                  <span>Collected: <span className="text-alpine-green font-semibold">₹56,000</span></span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/25">Upcoming</span>
                </div>
              </div>

              {/* quick actions demo */}
              <div className="flex gap-2">
                <div className="flex-1 bg-charcoal border border-border rounded-lg p-3 text-center">
                  <p className="text-[9px] text-text-dim uppercase tracking-wider">Total Paid</p>
                  <p className="text-sm font-bold text-alpine-green mt-0.5">₹1,24,500</p>
                </div>
                <div className="flex-1 bg-charcoal border border-border rounded-lg p-3 text-center">
                  <p className="text-[9px] text-text-dim uppercase tracking-wider">Pending Dues</p>
                  <p className="text-sm font-bold text-danger mt-0.5">₹24,500</p>
                </div>
              </div>

              {/* micro updates row */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] bg-charcoal/40 px-3 py-2 rounded-lg border border-border/40">
                  <span className="text-text-primary flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-alpine-green" />
                    Priya Sharma paid ₹3,500
                  </span>
                  <span className="text-text-dim text-[9px]">Just now</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="max-w-6xl mx-auto px-6 pb-24 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold font-[family-name:var(--font-sora-family)] text-text-primary">
              Engineered for the Outdoors
            </h2>
            <p className="text-sm text-text-muted">
              Every detail is designed to be highly legible on trail coordinates and rugged environments.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Users className="w-5 h-5" />}
              title="Group Roster Management"
              description="Add, filter, and track participant statuses. Access emergency contacts, blood groups, and trigger direct WhatsApp coordinates with one click."
            />
            <FeatureCard
              icon={<CreditCard className="w-5 h-5" />}
              title="Automated Payment Trackers"
              description="Record payments across UPI, Bank transfers, or Cash. Keep a running ledger of partial payments and expected revenue."
            />
            <FeatureCard
              icon={<Map className="w-5 h-5" />}
              title="Day-Wise Itinerary Timeline"
              description="Build detailed timelines with transit, climbing, dining, and camp setup cards. Copy the completed itinerary formatted for WhatsApp groups."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/20 py-8 z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-text-muted text-sm font-medium">
            <span className="text-lg">⛰</span>
            Trek Captain — Built by summit seekers.
          </div>
          <p className="text-xs text-text-dim">
            © {new Date().getFullYear()} Trek Captain. Made with premium adventure aesthetics.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card border border-border/80 hover:border-trail-orange/30 rounded-xl p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(255,107,44,0.06)] hover:translate-y-[-2px] group">
      <div className="p-3 rounded-xl bg-trail-orange/10 border border-trail-orange/20 text-trail-orange w-fit mb-4 transition-colors group-hover:bg-trail-orange/15">
        {icon}
      </div>
      <h3 className="text-lg font-bold font-[family-name:var(--font-sora-family)] text-text-primary mb-2">
        {title}
      </h3>
      <p className="text-sm text-text-muted leading-relaxed">{description}</p>
    </div>
  );
}
