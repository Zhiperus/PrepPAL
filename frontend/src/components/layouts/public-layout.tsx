import { LuArrowRight, LuBookOpen, LuTrophy, LuUsers } from 'react-icons/lu';
import { Link, NavLink, Outlet } from 'react-router';

import Logo from '@/assets/logo.png';
import { paths } from '@/config/paths';

const exploreLinks = [
    {
        to: paths.explore.community.getHref(),
        label: 'Community',
        icon: LuUsers,
    },
    {
        to: paths.explore.leaderboard.getHref(),
        label: 'Leaderboard',
        icon: LuTrophy,
    },
    {
        to: paths.explore.modules.getHref(),
        label: 'Modules',
        icon: LuBookOpen,
    },
];

export function PublicLayout() {

    return (
        <div className="relative min-h-screen bg-gray-50">
            {/* Top Navbar */}
            <nav className="fixed top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-6">
                        <Link to={paths.home.getHref()} className="flex items-center gap-2">
                            <img src={Logo} alt="Logo" className="h-8 w-auto" />
                            <span className="text-xl font-bold tracking-tight text-[#2A4362]">
                                PrepPAL
                            </span>
                        </Link>

                        {/* Explore nav links */}
                        <div className="hidden items-center gap-1 md:flex">
                            {exploreLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                            ? 'bg-[#2A4362]/10 text-[#2A4362]'
                                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                        }`
                                    }
                                >
                                    <link.icon className="h-4 w-4" />
                                    {link.label}
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to={paths.auth.login.getHref()}
                            className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#2A4362]"
                        >
                            Log in
                        </Link>
                        <Link
                            to={paths.auth.register.getHref()}
                            className="rounded-full bg-[#2A4362] px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-[#1e3a5f] hover:shadow-lg"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>

                {/* Mobile nav links */}
                <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
                    {exploreLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${isActive
                                    ? 'bg-[#2A4362]/10 text-[#2A4362]'
                                    : 'text-slate-500 hover:bg-slate-100'
                                }`
                            }
                        >
                            <link.icon className="h-3.5 w-3.5" />
                            {link.label}
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* Main content with top padding for fixed navbar */}
            <main className="pt-16 md:pt-16">
                <div className="pt-0 md:pt-0">
                    <Outlet />
                </div>
            </main>

            {/* Floating CTA banner at bottom */}
            <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-slate-200 bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
                    <p className="text-sm text-slate-600">
                        <span className="font-semibold text-[#2A4362]">
                            Sign up for free
                        </span>{' '}
                        to unlock all features — track your go bag, earn points, and more!
                    </p>
                    <Link
                        to={paths.auth.register.getHref()}
                        className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#2A4362] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#1e3a5f] hover:shadow-lg"
                    >
                        Sign Up Free
                        <LuArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
