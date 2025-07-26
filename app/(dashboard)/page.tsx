// app/(dashboard)/page.tsx

interface DashboardPageProps {
  searchParams?: { [key: string]: string | string[] };
}

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  const view = Array.isArray(searchParams?.view) ? searchParams.view[0] : searchParams?.view ?? "default";

  return (
    <main>
      <h1>Dashboard View: {view}</h1>
    </main>
  );
}
