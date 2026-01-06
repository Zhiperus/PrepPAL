import { clsx, type ClassValue } from 'clsx';
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import type { MouseEvent, ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import {
  LuArrowRight,
  LuCircleCheck,
  LuShieldCheck,
  LuUsers,
  LuZap,
} from 'react-icons/lu';
import { Link, useSearchParams } from 'react-router'; // Ensure react-router-dom
import { twMerge } from 'tailwind-merge';

import Refresher from '@/assets/light-bulb.png';
import Logo from '@/assets/logo.png';
import Leaderboard from '@/assets/podium.png';
import GoBag from '@/assets/school-bag.png';
import { paths } from '@/config/paths';

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- ANIMATION COMPONENTS ---

// 1. Text Generate Effect (FIXED SPACING)
function TextGenerateEffect({
  words,
  className,
}: {
  words: string;
  className?: string;
}) {
  const wordsArray = words.split(' ');
  return (
    <div className={cn('font-bold', className)}>
      <div className="mt-4">
        <div className="leading-snug tracking-wide text-[#2A4362]">
          {wordsArray.map((word, idx) => {
            return (
              <motion.span
                key={word + idx}
                // 'mr-3' ensures words don't squash together
                className="mr-3 inline-block opacity-0 last:mr-0"
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.15,
                  ease: 'backOut',
                }}
              >
                {word}
              </motion.span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 2. 3D Tilt Card
function TiltCard({ children }: { children: ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['25deg', '-25deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-25deg', '25deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: 'preserve-3d',
      }}
      className="relative h-full w-full"
    >
      <div
        style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}
        className="h-full w-full"
      >
        {children}
      </div>
    </motion.div>
  );
}

// Wrap Link with motion to handle hover states properly
const MotionLink = motion(Link);

function ShinyButton({
  children,
  className,
  to,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <MotionLink
      to={to}
      // Cast props to any to resolve the conflict between React's AnimationEvent
      // and Framer Motion's AnimationDefinition types in the overload.
      {...(props as any)}
      // Added 'inline-flex' to fix the broken layout
      className={cn(
        'group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-[#2A4362] px-8 py-4 font-semibold text-white shadow-xl transition-all hover:scale-105 hover:bg-[#1e3a5f]',
        className,
      )}
      initial="initial"
      whileHover="hover"
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>

      {/* Shimmer Effect */}
      <motion.div
        variants={{
          initial: { x: '-100%' },
          hover: {
            x: '100%',
            transition: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 1,
              ease: 'linear',
            },
          },
        }}
        className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
    </MotionLink>
  );
}

// 4. Spotlight Card
function SpotlightCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
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
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(42, 67, 98, 0.08),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

// 5. Pop In Animation
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
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.6,
        delay,
        type: 'spring',
        stiffness: 100,
        damping: 20,
      }}
    >
      {children}
    </motion.div>
  );
}

// 6. Number Count Up
function CountUp({ to }: { to: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(0, to, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate(value) {
        node.textContent = Math.round(value).toString();
      },
    });

    return () => controls.stop();
  }, [to]);

  return <span ref={nodeRef} />;
}

// 7. Background Grid
function AnimatedGridBackground() {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
      <div className="absolute top-0 right-0 left-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>
    </div>
  );
}

// --- MAIN PAGE ---

export function Landing() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-[#2A4362] selection:bg-[#2A4362] selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <img src={Logo} alt="Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold tracking-tight">PrepPAL</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to={paths.auth.login.getHref(redirectTo)}
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#2A4362]"
            >
              Log in
            </Link>
            <Link
              to={paths.auth.register.getHref(redirectTo)}
              className="hidden rounded-full bg-[#2A4362] px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-[#1e3a5f] hover:shadow-lg sm:block"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative pt-20">
        <AnimatedGridBackground />

        {/* --- HERO SECTION --- */}
        <section className="relative overflow-visible px-6 pt-16 pb-20 lg:pt-24">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
            {/* Left Content */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <PopIn>
                <div className="mb-6 inline-flex items-center rounded-full border border-blue-100 bg-blue-50/50 px-3 py-1 shadow-sm backdrop-blur-sm">
                  <span className="mr-2 flex h-2 w-2 rounded-full bg-blue-600"></span>
                  <span className="text-xs font-bold tracking-wide text-blue-600 uppercase">
                    Community-First Safety
                  </span>
                </div>
              </PopIn>

              {/* Headline */}
              <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:leading-[1.1]">
                <TextGenerateEffect
                  words="Disaster readiness starts at home."
                  className="text-[#2A4362]"
                />
              </h1>

              <PopIn delay={0.4}>
                <p className="mb-8 max-w-lg text-lg leading-relaxed text-slate-600">
                  PrepPAL empowers households with personalized checklists,
                  automated reminders, and community-driven tools. Be ready when
                  it counts.
                </p>
              </PopIn>

              <PopIn delay={0.5}>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <ShinyButton to={paths.auth.register.getHref(redirectTo)}>
                    Start Preparing
                    <LuArrowRight className="h-4 w-4" />
                  </ShinyButton>

                  <Link
                    to={paths.auth.login.getHref(redirectTo)}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition-all hover:border-[#2A4362]/30 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Log In
                  </Link>
                </div>
              </PopIn>

              <PopIn delay={0.6}>
                <div className="mt-10 flex items-center gap-4 border-t border-slate-200 pt-6">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-10 w-10 rounded-full border-2 border-white bg-slate-200 ring-1 ring-slate-100"
                      />
                    ))}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900">
                      Trusted by <CountUp to={500} />+ households
                    </p>
                  </div>
                </div>
              </PopIn>
            </div>

            {/* Right Visual */}
            <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none">
              <div className="relative aspect-square rounded-3xl border border-white/50 bg-gradient-to-br from-blue-50/80 to-slate-100/80 p-8 shadow-2xl backdrop-blur-xl">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-50"></div>

                <div className="relative flex h-full w-full items-center justify-center">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <img
                      src={GoBag}
                      alt="Go Bag"
                      className="relative z-10 w-64 drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
                    />
                  </motion.div>

                  {/* 3D Tilt Logo */}
                  <div className="absolute -top-6 -right-6 z-30 h-32 w-32 cursor-pointer">
                    <TiltCard>
                      <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-transform">
                        <img
                          src={Logo}
                          alt="PrepPAL"
                          className="w-16 drop-shadow-md"
                        />
                        <span className="mt-1 text-xs font-bold text-[#2A4362]">
                          PrepPAL
                        </span>
                      </div>
                    </TiltCard>
                  </div>

                  <motion.div
                    className="absolute -bottom-8 -left-8 z-20"
                    animate={{ y: [0, -12, 0] }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 2,
                    }}
                  >
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <LuCircleCheck size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">
                          Status
                        </p>
                        <p className="text-sm font-bold text-green-600">
                          100% Ready
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- FEATURES SECTION --- */}
        <section id="features" className="relative bg-white py-24">
          <div className="mx-auto max-w-7xl px-6">
            <PopIn>
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  More than just a checklist.
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  PrepPAL combines personal responsibility with community
                  resilience. Here is how we help you stay safe.
                </p>
              </div>
            </PopIn>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Feature 1 */}
              <PopIn delay={0.1} className="h-full">
                <SpotlightCard className="h-full p-8">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <img src={GoBag} alt="Icon" className="h-8 w-8" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900">
                    Smart Go Bag Tracking
                  </h3>
                  <p className="leading-relaxed text-slate-500">
                    Interactive inventory management for your emergency kit. We
                    track expiration dates and suggest essential missing items.
                  </p>
                </SpotlightCard>
              </PopIn>

              {/* Feature 2 */}
              <PopIn delay={0.2} className="h-full">
                <SpotlightCard className="h-full p-8">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <img src={Refresher} alt="Icon" className="h-8 w-8" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900">
                    Micro-Learning Modules
                  </h3>
                  <p className="leading-relaxed text-slate-500">
                    Bite-sized educational content to brush up on the DOs and
                    DON&apos;Ts of disaster management without the overwhelm.
                  </p>
                </SpotlightCard>
              </PopIn>

              {/* Feature 3 */}
              <PopIn delay={0.3} className="h-full">
                <SpotlightCard className="h-full p-8">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                    <img src={Leaderboard} alt="Icon" className="h-8 w-8" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900">
                    Community Leaderboards
                  </h3>
                  <p className="leading-relaxed text-slate-500">
                    Gamify your preparedness. Earn points for completing tasks
                    and see how your neighborhood ranks in resilience.
                  </p>
                </SpotlightCard>
              </PopIn>
            </div>
          </div>
        </section>

        {/* --- VALUE PROP SECTION --- */}
        <section className="relative overflow-hidden bg-slate-900 py-24 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:20px_20px] opacity-10"></div>
          <div className="absolute top-0 right-0 -mt-20 -mr-20 h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[100px]"></div>

          <div className="relative z-10 mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
              <PopIn delay={0.1}>
                <div>
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold tracking-wider text-blue-300 uppercase">
                    <LuZap className="h-3 w-3" />
                    Why it matters
                  </div>
                  <h2 className="mb-6 text-3xl leading-tight font-bold sm:text-4xl">
                    Prepare today.
                    <br />
                    <span className="text-blue-400">Safe tomorrow.</span>
                  </h2>
                  <div className="space-y-8">
                    <div className="flex gap-4">
                      <div className="mt-1 flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-blue-400 shadow-lg">
                          <LuShieldCheck className="h-6 w-6" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold">Rapid Response</h4>
                        <p className="mt-2 leading-relaxed text-slate-400">
                          By being prepared with go bags and safety knowledge,
                          households can respond instantly to warnings, reducing
                          panic time.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="mt-1 flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-blue-400 shadow-lg">
                          <LuUsers className="h-6 w-6" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold">
                          Community Resilience
                        </h4>
                        <p className="mt-2 leading-relaxed text-slate-400">
                          When individuals are ready, local governments can
                          focus resources on the most vulnerable, ensuring
                          faster overall recovery.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </PopIn>

              <PopIn delay={0.3}>
                <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-800/50 p-8 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-transparent opacity-50"></div>

                  <div className="relative z-10 text-center">
                    <img
                      src={Logo}
                      alt="PrepPAL"
                      className="mx-auto mb-6 w-24 drop-shadow-lg"
                    />
                    <h3 className="mb-4 text-2xl font-bold text-white">
                      Ready to join PrepPAL?
                    </h3>
                    <p className="mb-8 text-slate-400">
                      Join thousands of households making safety a priority
                      today. It takes less than 2 minutes.
                    </p>
                    <ShinyButton
                      to={paths.auth.register.getHref(redirectTo)}
                      className="w-full justify-center"
                    >
                      Create Free Account
                    </ShinyButton>
                    <p className="mt-4 text-xs text-slate-500">
                      Free for all Filipinos.
                    </p>
                  </div>
                </div>
              </PopIn>
            </div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="border-t border-slate-200 bg-white py-12">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
            <div className="flex items-center gap-2">
              <img src={Logo} alt="Logo" className="h-8 opacity-80" />
              <span className="font-bold text-slate-700">PrepPAL</span>
            </div>
            <div className="text-sm text-slate-500">
              © {new Date().getFullYear()} PrepPAL. All rights reserved.
            </div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group flex items-center gap-1 text-sm font-medium text-[#2A4362] transition-colors hover:text-blue-600"
            >
              Back to Top
              <LuArrowRight className="h-3 w-3 -rotate-45 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
