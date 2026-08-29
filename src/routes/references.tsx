import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

export const Route = createFileRoute("/references")({
  head: () => ({
    meta: [
      { title: "References & Data Sources — SlabSense" },
      {
        name: "description",
        content:
          "Tariff data, standby-power research and the open-source libraries used to build the SlabSense electricity dashboard.",
      },
      { property: "og:title", content: "References & Data Sources — SlabSense" },
      {
        property: "og:description",
        content: "Every external source, dataset and library behind SlabSense.",
      },
    ],
  }),
  component: ReferencesPage,
});

const groups = [
  {
    title: "Tariff & energy data",
    items: [
      {
        label: "Kerala State Electricity Board Ltd — domestic tariff schedule",
        url: "https://www.kseb.in/",
        note: "Slab ranges, energy charges and fixed charges. Rates in this demo are indicative and rounded for the prototype.",
      },
      {
        label: "Kerala State Electricity Regulatory Commission — tariff orders",
        url: "https://erckerala.org/",
        note: "Official telescopic tariff structure and electricity duty.",
      },
      {
        label: "Bureau of Energy Efficiency (BEE), India",
        url: "https://beeindia.gov.in/",
        note: "Appliance star ratings and typical wattage figures.",
      },
      {
        label: "Lawrence Berkeley National Laboratory — Standby Power project",
        url: "https://standby.lbl.gov/",
        note: "Measured standby wattage for TVs, set-top boxes, routers and chargers.",
      },
    ],
  },
  {
    title: "Technology used",
    items: [
      { label: "React", url: "https://react.dev/", note: "User interface library." },
      {
        label: "TanStack Router & Query",
        url: "https://tanstack.com/",
        note: "Page routing and data fetching.",
      },
      { label: "Recharts", url: "https://recharts.org/", note: "Usage graph rendering." },
      { label: "Tailwind CSS", url: "https://tailwindcss.com/", note: "Responsive styling system." },
      { label: "Lucide icons", url: "https://lucide.dev/", note: "Icon set." },
      {
        label: "PostgreSQL (Lovable Cloud)",
        url: "https://www.postgresql.org/",
        note: "Database storing households, slabs, readings and appliances.",
      },
    ],
  },
];

function ReferencesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-accent">Last page</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">References</h1>
        <p className="mt-3 text-muted-foreground">
          External resources, data sources and open-source libraries used in SlabSense.
        </p>
      </header>

      {groups.map((g) => (
        <section key={g.title} className="panel mt-6 p-6">
          <h2 className="text-xl font-bold">{g.title}</h2>
          <ul className="mt-4 space-y-4">
            {g.items.map((item) => (
              <li key={item.label}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                >
                  {item.label}
                  <ExternalLink className="size-3.5" />
                </a>
                <p className="text-sm text-muted-foreground">{item.note}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="panel mt-6 p-6">
        <h2 className="text-xl font-bold">Public API endpoints</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The dashboard data is also served as JSON, under both naming conventions used by the team.
        </p>
        <ul className="num mt-4 space-y-2 text-sm">
          <li>/api/public/usage/&#123;householdId&#125;</li>
          <li>/api/public/bill-projection/&#123;id&#125;</li>
          <li>/api/public/usage-summary?householdId=…</li>
          <li>/api/public/slab-status?householdId=…</li>
        </ul>
      </section>
    </div>
  );
}
