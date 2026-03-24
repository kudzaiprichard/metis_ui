export default function AuthLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    // The animated backdrop is now rendered system-wide from the root
    // layout — auth pages just provide their own `<main>` landmark.
    return (
        <main className="relative min-h-screen overflow-hidden">
            <div className="relative z-10 min-h-screen">{children}</div>
        </main>
    );
}