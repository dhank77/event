import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            {/* Dot pattern background */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                backgroundSize: '24px 24px',
            }} />

            {/* Decorative shapes */}
            <div className="pointer-events-none absolute top-12 left-8 hidden size-16 border-2 border-foreground bg-secondary opacity-50 lg:block" />
            <div className="pointer-events-none absolute right-16 bottom-20 hidden size-10 border-2 border-foreground bg-accent opacity-50 lg:block" />
            <div className="pointer-events-none absolute top-1/3 right-12 hidden size-6 border-2 border-foreground bg-primary opacity-40 lg:block" />

            <div className="relative z-10 w-full max-w-md">
                <div className="flex flex-col gap-8">
                    {/* Logo */}
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex items-center gap-2 font-medium"
                        >
                            <div className="flex size-10 items-center justify-center border-2 border-foreground bg-primary font-mono text-sm font-bold text-primary-foreground shadow-sm">
                                AI
                            </div>
                            <span className="font-mono text-xl font-bold tracking-tight">acarainaja.id</span>
                        </Link>

                        <div className="mt-2 space-y-2 text-center">
                            <h1 className="font-mono text-2xl font-black">{title}</h1>
                            <p className="text-muted-foreground text-sm">
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* Form card */}
                    <div className="border-2 border-foreground bg-card p-6 shadow-md sm:p-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
