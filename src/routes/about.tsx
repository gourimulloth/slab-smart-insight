import { createFileRoute } from "@tanstack/react-router";
import { Building2, Gauge, Home, Leaf, Server, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "The Problem: Kerala's Hidden Household Electricity Waste — SlabSense" },
      {
        name: "description",
        content:
          "Why KSEB slab tariffs and invisible standby power push Kerala households into higher bills and higher emissions, who is affected, and how SlabSense solves it with IT.",
      },
      { property: "og:title", content: "The Environmental Problem SlabSense Solves" },
      {
        property: "og:description",
        content:
          "Bi-monthly meter readings hide daily waste. SlabSense makes household electricity visible, slab by slab.",
      },
    ],
  }),
  component: AboutPage,
});

const users = [
  {
    icon: Home,
    title: "KSEB domestic consumers",
    body: "Families in Kerala on telescopic domestic tariffs who only discover their consumption when the bill arrives, often after they have already crossed a slab.",
  },
  {
    icon: Users,
    title: "Cost-sensitive renters and students",
    body: "Shared households where nobody knows which appliance is responsible for the bill, so nobody changes behaviour.",
  },
  {
    icon: Building2,
    title: "Residents' associations & campuses",
    body: "Groups that want a simple, shared dashboard to compare blocks or hostels and run energy-saving drives.",
  },
];


function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-accent">Chapter 1 & 2</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          Electricity you cannot see is electricity you cannot save
        </h1>
      </header>

      <section className="panel mt-8 p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Leaf className="size-5 text-safe" /> The environmental problem
        </h2>
        <div className="mt-4 space-y-4 text-muted-foreground">
          <p>
            Kerala draws a large share of its electricity from outside the state, much of it
            thermal. Every extra unit a household burns has a carbon cost, yet the feedback loop for
            a consumer is almost non-existent: the meter is read once every two months, and the bill
            arrives long after the behaviour that caused it.
          </p>
          <p>
            Two failures make this worse. First, KSEB's <strong className="text-foreground">telescopic slab tariff</strong>{" "}
            means crossing a boundary raises the rate on the units above it, so a household can pay
            noticeably more for a handful of extra units without ever knowing it was close to the
            line. Second, <strong className="text-foreground">phantom load</strong> — set-top boxes,
            TVs, routers and chargers drawing power while "off" — silently adds units around the
            clock. Studies of Indian homes put standby consumption in the range of 4–10% of the
            household total, and it is invisible on a bi-monthly bill.
          </p>
          <p>
            The result is avoidable consumption, avoidable emissions and avoidable expense — all
            because the information arrives too late to act on.
          </p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Users className="size-5 text-accent" /> Target users
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {users.map((u) => (
            <div key={u.title} className="panel p-5">
              <u.icon className="size-5 text-primary" />
              <h3 className="mt-3 text-base font-semibold">{u.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{u.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel mt-8 p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Server className="size-5 text-primary" /> The IT-enabled solution
        </h2>
        <p className="mt-4 text-muted-foreground">
          SlabSense turns raw daily meter data into decisions a family can act on today, not in six
          weeks. It is a responsive web application backed by a database and an API.
        </p>
        <ol className="mt-5 space-y-4">
          {[
            {
              t: "Capture",
              d: "Daily unit readings per household are stored in a database (households, tariff slabs, meter readings, appliances).",
            },
            {
              t: "Compute",
              d: "A tariff engine applies the telescopic slab rates, fixed charge and 10% electricity duty to give a live bill and an end-of-cycle projection.",
            },
            {
              t: "Warn",
              d: "The Slab Countdown widget shows exactly how many units and how many days remain before the household falls into a costlier slab, and what the jump will cost.",
            },
            {
              t: "Diagnose",
              d: "A phantom-load detection routine compares each appliance's standby drain against its active use and flags the ones quietly wasting units.",
            },
            {
              t: "Act",
              d: "Two interactive tools — the unplug simulator and the what-if bill simulator — let users test a change before making it.",
            },
          ].map((s, i) => (
            <li key={s.t} className="flex gap-4">
              <span className="num flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-sm font-bold text-primary">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold">{s.t}</p>
                <p className="text-sm text-muted-foreground">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel mt-8 p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Gauge className="size-5 text-warn" /> Expected outcome
        </h2>
        <p className="mt-4 text-muted-foreground">
          Households that see consumption daily typically cut usage by 5–15%. For a home near a slab
          boundary the saving is larger still, because avoiding the crossing protects every unit
          below it from a higher rate. Fewer units means a smaller bill and a smaller carbon
          footprint from the same comfort level.
        </p>
      </section>
    </div>
  );
}
