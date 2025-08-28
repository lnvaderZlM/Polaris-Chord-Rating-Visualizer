type HeroLayoutProps = {
  align: string;
  children: React.ReactNode;
}

export default function HeroLayout({align, children}:HeroLayoutProps) {
  return (
    <main className="flex flex-col">
      <section className={`flex-grow justify-center ${align} flex-col flex relative max-w-7xl px-4 md:px-24 lg:px-42 mx-auto`}>
        {children}
      </section>
    </main>
  );
}