import { getSpainCpi } from "@/lib/sources/es";
import { getUsCpi } from "@/lib/sources/us";
import { monthlyToObservations, saveObservations } from "@/lib/observations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Vercel Cron sends this header automatically when CRON_SECRET is set.
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const [es, us] = await Promise.all([
    getSpainCpi().then(monthlyToObservations),
    getUsCpi().then(monthlyToObservations),
  ]);

  await saveObservations("cpi", "ES", es);
  await saveObservations("cpi", "US", us);

  return Response.json({ ok: true, saved: { ES: es.length, US: us.length } });
}