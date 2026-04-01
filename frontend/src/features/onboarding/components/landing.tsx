import { clsx, type ClassValue } from 'clsx';
import { motion, useMotionTemplate, useMotionValue } from 'motion/react';
import type { MouseEvent, ReactNode } from 'react';
import { LuArrowRight, LuBuilding2, LuCompass, LuHeart } from 'react-icons/lu';
import { Link, useSearchParams } from 'react-router';
import { twMerge } from 'tailwind-merge';

import LguMonitoringImg from '@/assets/lgu_go_bag_checking.png';
import LguModerationImg from '@/assets/lgu_moderation.png';
import Logo from '@/assets/logo.png';
import GoBag from '@/assets/school-bag.png';
import { paths } from '@/config/paths';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── ANIMATIONS ──────────────────────────────────────────────────────────────

function PopIn({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.65,
        delay,
        type: 'spring',
        stiffness: 90,
        damping: 18,
      }}
    >
      {children}
    </motion.div>
  );
}

function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Floating blob background
function WarmBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-amber-100 opacity-60 blur-[80px]" />
      <div className="absolute top-1/2 -right-40 h-[400px] w-[400px] rounded-full bg-sky-100 opacity-50 blur-[80px]" />
      <div className="absolute -bottom-20 left-1/3 h-[350px] w-[350px] rounded-full bg-rose-100 opacity-40 blur-[80px]" />
    </div>
  );
}

// Wavy SVG divider
function WaveDivider({
  fill = '#fff',
  className = '',
}: {
  fill?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'pointer-events-none relative -mb-[1px] w-full overflow-hidden leading-none',
        className,
      )}
    >
      <svg
        viewBox="0 0 1440 80"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="block h-16 w-[102%] -translate-x-[1%] md:h-20"
      >
        <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill={fill} />
      </svg>
    </div>
  );
}

// ─── MARQUEE STRIP ────────────────────────────────────────────────────────────

const marqueeItems = [
  { emoji: '🎒', label: 'Go-Bag Tracker' },
  { emoji: '📋', label: 'Family Checklists' },
  { emoji: '💡', label: 'Bite-sized Lessons' },
  { emoji: '🏆', label: 'Barangay Leaderboard' },
  { emoji: '🤝', label: 'LGU Dashboard' },
  { emoji: '🛡️', label: 'DRRM-Aligned' },
  { emoji: '📸', label: 'Photo Verification' },
  { emoji: '🌟', label: 'Earn Points & Badges' },
  { emoji: '🏘️', label: 'Community Feed' },
  { emoji: '🇵🇭', label: 'Made for Filipinos' },
  { emoji: '🔔', label: 'Expiry Reminders' },
  { emoji: '👨‍👩‍👧', label: 'Household Profiles' },
];

function MarqueeStrip() {
  const doubled = [...marqueeItems, ...marqueeItems];

  return (
    <div className="relative overflow-hidden bg-white py-8">
      {/* Fades */}
      <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-28 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute top-0 right-0 z-10 h-full w-28 bg-gradient-to-l from-white to-transparent" />

      <motion.div
        className="flex w-max gap-3"
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          duration: 32,
          ease: 'linear',
          repeat: Infinity,
        }}
      >
        {doubled.map((item, i) => (
          <div
            key={i}
            className="flex flex-shrink-0 items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3 shadow-sm"
          >
            <span className="text-lg">{item.emoji}</span>
            <span className="text-sm font-semibold whitespace-nowrap text-slate-500">
              {item.label}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── BUTTONS ─────────────────────────────────────────────────────────────────

const MotionLink = motion(Link);

function PrimaryButton({
  children,
  to,
  className,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    /* @ts-expect-error - framer-motion and react-router type clash on event handlers */
    <MotionLink
      to={to}
      {...props}
      className={cn(
        'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#2A4362] px-8 py-4 font-bold text-white shadow-lg shadow-[#2A4362]/20 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-[#2A4362]/30',
        className,
      )}
      whileHover="hover"
      initial="initial"
    >
      <motion.span
        variants={{
          initial: { x: '-110%' },
          hover: {
            x: '110%',
            transition: { duration: 0.55, ease: 'easeInOut' },
          },
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </MotionLink>
  );
}

function GhostButton({
  children,
  to,
  className,
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#2A4362]/20 bg-white/80 px-8 py-4 font-bold text-[#2A4362] backdrop-blur-sm transition-all hover:border-[#2A4362]/50 hover:bg-white hover:shadow-md',
        className,
      )}
    >
      {children}
    </Link>
  );
}

// ─── FEATURE CARD ────────────────────────────────────────────────────────────

function FeatureCard({
  emoji,
  title,
  description,
  bgColor,
}: {
  emoji?: string;
  title: string;
  description: string;
  accentColor: string;
  bgColor: string;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className="group relative h-full overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`radial-gradient(500px circle at ${mouseX}px ${mouseY}px, rgba(42,67,98,0.05), transparent 80%)`,
        }}
      />
      <div
        className={cn(
          'mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl text-3xl',
          bgColor,
        )}
      >
        <span>{emoji}</span>
      </div>
      <h3 className="mb-3 text-xl font-bold text-slate-800">{title}</h3>
      <p className="leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}

// ─── STEP CARD ───────────────────────────────────────────────────────────────

function StepCard({
  number,
  emoji,
  title,
  description,
  delay,
}: {
  number: string;
  emoji: string;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <PopIn delay={delay} className="flex flex-col items-center text-center">
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#2A4362] text-3xl shadow-lg shadow-[#2A4362]/20">
          {emoji}
        </div>
        <div className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-white shadow">
          {number}
        </div>
      </div>
      <h3 className="mb-2 text-xl font-bold text-slate-800">{title}</h3>
      <p className="max-w-xs leading-relaxed text-slate-500">{description}</p>
    </PopIn>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export function Landing() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#FAFAF8] font-sans text-[#2A4362] selection:bg-[#2A4362]/20">
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-100/80 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <img src={Logo} alt="PrepPAL" className="h-8 w-auto" />
            <span className="text-xl font-black tracking-tight text-[#2A4362]">
              PrepPAL
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to={paths.explore.community.getHref()}
              className="hidden text-sm font-semibold text-slate-500 transition-colors hover:text-[#2A4362] md:block"
            >
              Explore
            </Link>
            <Link
              to={paths.auth.login.getHref(redirectTo)}
              className="text-sm font-semibold text-slate-500 transition-colors hover:text-[#2A4362]"
            >
              Log in
            </Link>
            <Link
              to={paths.auth.register.getHref(redirectTo)}
              className="hidden rounded-xl bg-[#2A4362] px-5 py-2 text-sm font-bold text-white shadow-md shadow-[#2A4362]/20 transition-all hover:bg-[#1e3a5f] hover:shadow-lg sm:block"
            >
              Get Started →
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative pt-16">
        {/* ── HERO ── */}
        <section className="relative min-h-screen overflow-hidden px-6 pt-20 pb-0 lg:pt-28">
          <WarmBlobs />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#2A436218_1px,transparent_1px)] [background-size:28px_28px]" />

          <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <FadeUp delay={0}>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold tracking-wider text-amber-700 uppercase shadow-sm">
                  <span>🇵🇭</span> Made for Filipino Families
                </div>
              </FadeUp>

              <FadeUp delay={0.1}>
                <h1 className="mb-6 text-5xl leading-[1.1] font-black tracking-tight text-[#2A4362] sm:text-6xl xl:text-7xl">
                  Your family&apos;s{' '}
                  <span className="relative inline-block">
                    <span className="relative z-10 text-[#2A4362]">safety</span>
                    <motion.span
                      className="absolute right-0 -bottom-1 left-0 z-0 h-4 rounded-full bg-amber-200/70"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{
                        delay: 0.6,
                        duration: 0.5,
                        ease: 'easeOut',
                      }}
                      style={{ originX: 0 }}
                    />
                  </span>{' '}
                  starts at home.
                </h1>
              </FadeUp>

              <FadeUp delay={0.2}>
                <p className="mb-10 max-w-xl text-lg leading-relaxed text-slate-500">
                  PrepPAL helps your household get ready for any disaster — from
                  packing go-bags together to earning community badges. Simple,
                  warm, and built with Filipino families in mind.
                </p>
              </FadeUp>

              <FadeUp delay={0.3}>
                <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
                  <PrimaryButton to={paths.auth.register.getHref(redirectTo)}>
                    Start for Free <LuArrowRight className="h-4 w-4" />
                  </PrimaryButton>
                  <GhostButton to={paths.explore.community.getHref()}>
                    See Community Posts
                  </GhostButton>
                </div>
              </FadeUp>

              <FadeUp delay={0.45}>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-5 lg:justify-start">
                  {[
                    { emoji: '⭐', text: 'Free for everyone' },
                    { emoji: '🛡️', text: 'DRRM-aligned' },
                  ].map((item) => (
                    <div
                      key={item.text}
                      className="flex items-center gap-1.5 text-sm font-semibold text-slate-500"
                    >
                      <span>{item.emoji}</span> {item.text}
                    </div>
                  ))}
                </div>
              </FadeUp>
            </div>

            {/* Right – floating visual */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-[460px]">
                <motion.div
                  className="relative overflow-hidden rounded-[2.5rem] border border-white bg-gradient-to-br from-blue-50 via-white to-amber-50 p-10 shadow-2xl shadow-slate-200"
                  initial={{ opacity: 0, scale: 0.92, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(#2A436210_1px,transparent_1px)] [background-size:20px_20px]" />
                  <div className="relative flex flex-col items-center">
                    <motion.div
                      animate={{ y: [0, -12, 0] }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="mb-6"
                    >
                      <img
                        src={GoBag}
                        alt="Go Bag"
                        className="w-52 drop-shadow-2xl"
                      />
                    </motion.div>

                    {/* Mini checklist */}
                    <div className="w-full rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                      <p className="mb-3 text-xs font-bold tracking-wider text-slate-400 uppercase">
                        Today&apos;s Go-Bag Check ✅
                      </p>
                      <div className="space-y-2.5">
                        {[
                          { label: 'Water (3 days supply)', done: true },
                          { label: 'First Aid Kit', done: true },
                          { label: 'Flashlight & batteries', done: true },
                          { label: 'Family documents', done: false },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center gap-3"
                          >
                            <div
                              className={cn(
                                'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs',
                                item.done
                                  ? 'bg-emerald-100 text-emerald-600'
                                  : 'border-2 border-slate-200',
                              )}
                            >
                              {item.done && '✓'}
                            </div>
                            <span
                              className={cn(
                                'text-sm font-medium',
                                item.done
                                  ? 'text-slate-400 line-through'
                                  : 'text-slate-700',
                              )}
                            >
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                          initial={{ width: 0 }}
                          animate={{ width: '75%' }}
                          transition={{
                            delay: 1,
                            duration: 1,
                            ease: 'easeOut',
                          }}
                        />
                      </div>
                      <p className="mt-1.5 text-right text-xs font-bold text-emerald-600">
                        75% ready!
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating badge – top right */}
                <motion.div
                  className="absolute -top-5 -right-5 z-10 flex items-center gap-2 rounded-2xl border border-amber-100 bg-white px-4 py-2.5 shadow-lg"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                >
                  <span className="text-xl">🏆</span>
                  <div>
                    <p className="text-xs font-black text-amber-600">
                      +50 pts!
                    </p>
                    <p className="text-[10px] text-slate-400">Go-bag updated</p>
                  </div>
                </motion.div>

                {/* Floating badge – bottom left */}
                <motion.div
                  className="absolute -bottom-4 -left-5 z-10 flex items-center gap-2 rounded-2xl border border-sky-100 bg-white px-4 py-2.5 shadow-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                >
                  <span className="text-xl">🏘️</span>
                  <div>
                    <p className="text-xs font-black text-sky-700">
                      #3 in Barangay!
                    </p>
                    <p className="text-[10px] text-slate-400">Community rank</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="relative mx-auto mt-16 flex max-w-7xl justify-center">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-1 text-slate-400"
            >
              <span className="text-xs font-semibold tracking-widest uppercase">
                Scroll to explore
              </span>
              <span className="text-lg">↓</span>
            </motion.div>
          </div>
        </section>

        {/* ── WAVE + MARQUEE ── */}
        <WaveDivider fill="#fff" className="relative z-10 -mt-12" />
        <MarqueeStrip />
        <WaveDivider fill="#FAFAF8" className="bg-white" />

        {/* ── FEATURES ── */}
        <section id="features" className="relative bg-[#FAFAF8] py-24">
          <div className="mx-auto max-w-7xl px-6">
            <PopIn>
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <span className="mb-4 inline-block rounded-full bg-[#2A4362]/8 px-4 py-1.5 text-xs font-bold tracking-widest text-[#2A4362] uppercase">
                  What PrepPAL does
                </span>
                <h2 className="text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">
                  Everything your family needs,{' '}
                  <span className="text-[#2A4362]">all in one place.</span>
                </h2>
                <p className="mt-4 text-lg text-slate-500">
                  We&apos;ve made disaster preparedness feel less scary and more
                  like a fun family project.
                </p>
              </div>
            </PopIn>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <PopIn delay={0.1} className="h-full">
                <FeatureCard
                  emoji="🎒"
                  title="Pack Together"
                  description="Turn go-bag prep into a family activity. Check off items, snap photos, and make sure everyone's ready — even the kids!"
                  accentColor="text-sky-600"
                  bgColor="bg-sky-50"
                />
              </PopIn>
              <PopIn delay={0.2} className="h-full">
                <FeatureCard
                  emoji="💡"
                  title="Learn in Minutes"
                  description="Short, friendly lessons on what to do during earthquakes, floods, and fires. No boring manuals — just practical tips you'll actually remember."
                  accentColor="text-amber-600"
                  bgColor="bg-amber-50"
                />
              </PopIn>
              <PopIn delay={0.3} className="h-full">
                <FeatureCard
                  emoji="🏆"
                  title="Barangay Pride"
                  description="Earn points for every checklist completed and see how your household ranks in your neighborhood. A little friendly competition never hurt!"
                  accentColor="text-rose-600"
                  bgColor="bg-rose-50"
                />
              </PopIn>
              <PopIn delay={0.4} className="h-full">
                <FeatureCard
                  emoji="🤝"
                  title="LGU-Connected"
                  description="Your barangay leaders can see which families may need extra support during a disaster — helping resources reach the right people faster."
                  accentColor="text-emerald-600"
                  bgColor="bg-emerald-50"
                />
              </PopIn>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <WaveDivider fill="#fff" />
        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-6">
            <PopIn>
              <div className="mx-auto mb-16 max-w-xl text-center">
                <span className="mb-4 inline-block rounded-full bg-amber-50 px-4 py-1.5 text-xs font-bold tracking-widest text-amber-700 uppercase">
                  Getting started is easy
                </span>
                <h2 className="text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">
                  Ready in 3 simple steps
                </h2>
              </div>
            </PopIn>

            <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
              <div className="absolute top-10 left-1/2 hidden h-0.5 w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-slate-200 to-transparent md:block" />
              <StepCard
                number="1"
                emoji="👋"
                title="Create a free account"
                description="Sign up in under 2 minutes. No credit card, no complicated forms — just your household name and you're in."
                delay={0.1}
              />
              <StepCard
                number="2"
                emoji="🎒"
                title="Pack your go-bag together"
                description="Follow our friendly checklist with your family. Take photos to verify, earn your first points, and feel the peace of mind."
                delay={0.25}
              />
              <StepCard
                number="3"
                emoji="🌟"
                title="Level up your safety"
                description="Complete lessons, update your kit, and climb the community board. The more you prepare, the safer your barangay becomes."
                delay={0.4}
              />
            </div>

            <FadeUp delay={0.5} className="mt-14 text-center">
              <PrimaryButton
                to={paths.auth.register.getHref(redirectTo)}
                className="mx-auto"
              >
                Start for Free <LuArrowRight className="h-4 w-4" />
              </PrimaryButton>
            </FadeUp>
          </div>
        </section>

        {/* ── EXPLORE SECTION ── */}
        <WaveDivider fill="#F0F4F8" className="bg-white" />
        <section className="bg-[#F0F4F8] py-24">
          <div className="mx-auto max-w-7xl px-6">
            <PopIn>
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 shadow-sm">
                  <LuCompass className="h-4 w-4 text-sky-600" />
                  <span className="text-xs font-bold tracking-wider text-sky-600 uppercase">
                    No account needed to look around
                  </span>
                </div>
                <h2 className="text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">
                  Peek inside PrepPAL
                </h2>
                <p className="mt-4 text-lg text-slate-500">
                  Browse what our community is up to before you sign up.
                </p>
              </div>
            </PopIn>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                {
                  to: paths.explore.community.getHref(),
                  emoji: '👨‍👩‍👧‍👦',
                  gradientFrom: 'from-sky-400',
                  gradientTo: 'to-blue-500',
                  shadowColor: 'shadow-blue-400/25',
                  hoverBg: 'from-sky-500/8 to-blue-500/8',
                  title: 'Community Posts',
                  description:
                    'See what other families have packed. Get inspired by real go-bags from real households near you.',
                  linkLabel: 'Browse Posts',
                  linkColor: 'text-sky-600',
                },
                {
                  to: paths.explore.leaderboard.getHref(),
                  emoji: '🏅',
                  gradientFrom: 'from-amber-400',
                  gradientTo: 'to-orange-500',
                  shadowColor: 'shadow-amber-400/25',
                  hoverBg: 'from-amber-400/8 to-orange-500/8',
                  title: 'Leaderboard',
                  description:
                    'Who&apos;s the most prepared barangay? Cheer on your neighbors and see where your household ranks.',
                  linkLabel: 'See Rankings',
                  linkColor: 'text-amber-600',
                },
                {
                  to: paths.explore.modules.getHref(),
                  emoji: '📖',
                  gradientFrom: 'from-emerald-400',
                  gradientTo: 'to-teal-500',
                  shadowColor: 'shadow-emerald-400/25',
                  hoverBg: 'from-emerald-400/8 to-teal-500/8',
                  title: 'Learning Modules',
                  description:
                    'Short, friendly lessons on flood prep, earthquake drills, fire safety, and more. Done in 5 minutes.',
                  linkLabel: 'Start Learning',
                  linkColor: 'text-emerald-600',
                },
              ].map((card, i) => (
                <PopIn
                  key={card.title}
                  delay={0.1 * (i + 1)}
                  className="h-full"
                >
                  <Link
                    to={card.to}
                    className="group relative block h-full overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                  >
                    <div
                      className={cn(
                        'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                        card.hoverBg,
                      )}
                    />
                    <div className="relative p-8">
                      <div
                        className={cn(
                          'mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl shadow-lg transition-transform duration-300 group-hover:scale-110',
                          card.gradientFrom,
                          card.gradientTo,
                          card.shadowColor,
                        )}
                      >
                        {card.emoji}
                      </div>
                      <h3 className="mb-3 text-xl font-bold text-slate-800">
                        {card.title}
                      </h3>
                      <p className="mb-6 leading-relaxed text-slate-500">
                        {card.description}
                      </p>
                      <div
                        className={cn(
                          'flex items-center gap-2 font-bold transition-all group-hover:gap-3',
                          card.linkColor,
                        )}
                      >
                        {card.linkLabel}{' '}
                        <LuArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </PopIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── LGU SECTION ── */}
        <WaveDivider fill="#0f1b2d" className="bg-[#F0F4F8]" />
        <section className="relative overflow-hidden bg-[#0f1b2d] py-24">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute top-0 left-1/2 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[100px]" />

          <div className="relative z-10 mx-auto max-w-7xl px-6">
            <PopIn>
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5">
                  <LuBuilding2 className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-bold tracking-wider text-blue-400 uppercase">
                    For LGU Partners
                  </span>
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Helping leaders{' '}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    protect their people
                  </span>
                </h2>
                <p className="mt-4 text-lg text-slate-400">
                  PrepPAL gives barangay officials a gentle, privacy-respecting
                  overview of who may need extra support when disaster strikes —
                  so no family gets left behind.
                </p>
              </div>
            </PopIn>

            <div className="flex flex-col gap-20">
              {/* Content Moderation */}
              <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                <PopIn delay={0.1}>
                  <div>
                    <div className="mb-6 flex items-center gap-4">
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-2xl shadow-lg shadow-rose-500/20">
                        🛡️
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white">
                          Safe Community Space
                        </h3>
                        <p className="text-slate-400">
                          Keep posts helpful and kind
                        </p>
                      </div>
                    </div>
                    <p className="mb-6 text-lg leading-relaxed text-slate-400">
                      LGU admins can review flagged posts and keep the community
                      feed a safe, supportive space for all residents — right
                      from their dashboard.
                    </p>
                    <div className="space-y-3.5">
                      {[
                        'Quickly review flagged go-bag submissions',
                        'Manage community reports with ease',
                        'Remove harmful content, protect your residents',
                        'Full moderation history for accountability',
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 text-slate-300"
                        >
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-xs text-rose-400">
                            ✓
                          </span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopIn>
                <PopIn delay={0.2}>
                  <div className="overflow-hidden rounded-2xl border border-slate-700/50 shadow-2xl shadow-rose-500/10 transition-transform duration-500 hover:scale-[1.02]">
                    <img
                      src={LguModerationImg}
                      alt="LGU Moderation Dashboard"
                      className="h-auto w-full object-cover"
                    />
                  </div>
                </PopIn>
              </div>

              {/* Resident Monitoring */}
              <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                <PopIn delay={0.3} className="order-2 lg:order-1">
                  <div className="overflow-hidden rounded-2xl border border-slate-700/50 shadow-2xl shadow-cyan-500/10 transition-transform duration-500 hover:scale-[1.02]">
                    <img
                      src={LguMonitoringImg}
                      alt="LGU Resident Monitoring"
                      className="h-auto w-full object-cover"
                    />
                  </div>
                </PopIn>
                <PopIn delay={0.2} className="order-1 lg:order-2">
                  <div>
                    <div className="mb-6 flex items-center gap-4">
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-2xl shadow-lg shadow-cyan-500/20">
                        🔎
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white">
                          Neighborhood Overview
                        </h3>
                        <p className="text-slate-400">Know who needs support</p>
                      </div>
                    </div>
                    <p className="mb-6 text-lg leading-relaxed text-slate-400">
                      See a bird&apos;s-eye view of household preparedness
                      across your barangay. Spot families who may need help and
                      reach them before disaster strikes.
                    </p>
                    <div className="space-y-3.5">
                      {[
                        'Track go-bag status across all households',
                        'See preparedness scores at a glance',
                        'Filter by barangay zone or status',
                        'Identify at-risk families proactively',
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 text-slate-300"
                        >
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs text-cyan-400">
                            ✓
                          </span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopIn>
              </div>
            </div>

            <PopIn delay={0.5}>
              <div className="mt-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 text-center backdrop-blur-sm">
                <p className="text-slate-300">
                  <span className="font-bold text-white">
                    Are you a barangay captain or LGU official?
                  </span>{' '}
                  <Link
                    to={paths.auth.register.getHref(redirectTo)}
                    className="font-bold text-cyan-400 underline underline-offset-2 hover:text-cyan-300"
                  >
                    Contact us to get set up for free →
                  </Link>
                </p>
              </div>
            </PopIn>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <WaveDivider fill="#FAFAF8" />
        <section className="relative overflow-hidden bg-[#FAFAF8] py-28">
          <WarmBlobs />
          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
            <PopIn>
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="mb-8 inline-block text-6xl"
              >
                🏠
              </motion.div>
            </PopIn>
            <PopIn delay={0.1}>
              <h2 className="mb-6 text-4xl leading-tight font-black tracking-tight text-[#2A4362] sm:text-5xl">
                Your family deserves to feel safe.
                <br />
                <span className="text-amber-500">
                  Let&apos;s make it happen together.
                </span>
              </h2>
            </PopIn>
            <PopIn delay={0.2}>
              <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-slate-500">
                Join hundreds of Filipino families who are already prepared,
                connected, and earning barangay pride — one go-bag at a time.
              </p>
            </PopIn>
            <PopIn delay={0.3}>
              <div className="flex flex-wrap items-center justify-center gap-5">
                <PrimaryButton
                  to={paths.auth.register.getHref(redirectTo)}
                  className="px-10 py-5 text-base"
                >
                  Create Your Free Account <LuArrowRight className="h-5 w-5" />
                </PrimaryButton>
                <GhostButton
                  to={paths.explore.community.getHref()}
                  className="text-base"
                >
                  Explore First
                </GhostButton>
              </div>
            </PopIn>
            <PopIn delay={0.4}>
              <p className="mt-8 text-sm font-medium text-slate-400">
                Free for all Filipino families · No credit card required · Takes
                2 minutes
              </p>
            </PopIn>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-slate-100 bg-white py-12">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex items-center gap-3">
                <img
                  src={Logo}
                  alt="PrepPAL"
                  className="h-8 w-auto opacity-80"
                />
                <div>
                  <span className="block font-black text-[#2A4362]">
                    PrepPAL
                  </span>
                  <span className="text-xs text-slate-400">
                    Disaster Readiness for Filipino Families
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-slate-500">
                <Link
                  to={paths.explore.community.getHref()}
                  className="hover:text-[#2A4362]"
                >
                  Community
                </Link>
                <Link
                  to={paths.explore.leaderboard.getHref()}
                  className="hover:text-[#2A4362]"
                >
                  Leaderboard
                </Link>
                <Link
                  to={paths.explore.modules.getHref()}
                  className="hover:text-[#2A4362]"
                >
                  Learn
                </Link>
                <Link
                  to={paths.auth.login.getHref(redirectTo)}
                  className="hover:text-[#2A4362]"
                >
                  Log In
                </Link>
              </div>

              <div className="flex flex-col items-center gap-2 md:items-end">
                <p className="text-sm text-slate-400">
                  © {new Date().getFullYear()} PrepPAL. All rights reserved.
                </p>
                <button
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                  className="flex items-center gap-1.5 text-xs font-bold text-[#2A4362] transition-colors hover:text-blue-600"
                >
                  Back to top ↑
                </button>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6 text-center">
              <p className="flex items-center justify-center gap-1.5 text-sm text-slate-400">
                Made with <LuHeart className="h-4 w-4 text-rose-400" /> for
                Filipino communities. Stay safe. 🇵🇭
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
