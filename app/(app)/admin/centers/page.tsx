import { createSupabaseServerClient } from "@/lib/supabase/server";
import CentersReview from "./_components.tsx/centers-review";

export default async function AdminCentersPage() {
  const supabase = await createSupabaseServerClient();

  const { data: centers, error } = await supabase
    .from("centers")
    .select(
      "id,name,email,phone,status,created_at,address,city,state,country,country_code,postal_code,business_id,contact_person,contact_person_phone,created_by",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-4">
        <div className="text-sm text-destructive">Failed to load centers: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* <CentersTable centers={centers ?? []} /> */}
      <CentersReview centers={centers ?? []} />
    </div>
  );
}
