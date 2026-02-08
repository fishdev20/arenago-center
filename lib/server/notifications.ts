import type { SupabaseClient } from "@supabase/supabase-js";

type NotifyInput = {
  recipientUserId: string;
  type: string;
  title: string;
  message: string;
  payload?: Record<string, unknown>;
};

function isMissingNotificationsTable(message?: string) {
  if (!message) return false;
  return message.includes("Could not find the table 'public.notifications'");
}

export async function createNotification(admin: SupabaseClient, input: NotifyInput) {
  const { error } = await admin.from("notifications").insert({
    recipient_user_id: input.recipientUserId,
    type: input.type,
    title: input.title,
    message: input.message,
    payload: input.payload ?? {},
  });
  if (error) {
    if (isMissingNotificationsTable(error.message)) return;
    throw new Error(error.message);
  }
}

export async function notifyAdminsNewCenterRegistration(
  admin: SupabaseClient,
  input: { centerId: string; centerName: string; submittedByUserId: string },
) {
  const { data: admins, error } = await admin
    .from("profiles")
    .select("id")
    .in("role", ["admin", "superadmin"])
    .eq("is_active", true);

  if (error) throw new Error(error.message);
  if (!admins?.length) return;

  const rows = admins.map((a) => ({
    recipient_user_id: a.id,
    type: "center_registration_submitted",
    title: "New center registration",
    message: `${input.centerName} submitted a registration request.`,
    payload: {
      centerId: input.centerId,
      submittedByUserId: input.submittedByUserId,
      route: "/admin/centers",
    },
  }));

  const { error: insertError } = await admin.from("notifications").insert(rows);
  if (insertError) {
    if (isMissingNotificationsTable(insertError.message)) return;
    throw new Error(insertError.message);
  }
}

export async function notifyCenterRegistrationReviewed(
  admin: SupabaseClient,
  input: { centerId: string; status: "active" | "rejected" },
) {
  const { data: center, error } = await admin
    .from("centers")
    .select("id,name,created_by")
    .eq("id", input.centerId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!center?.created_by) return;

  const approved = input.status === "active";
  await createNotification(admin, {
    recipientUserId: center.created_by,
    type: approved ? "center_registration_approved" : "center_registration_rejected",
    title: approved ? "Center approved" : "Center registration rejected",
    message: approved
      ? `${center.name} has been approved by admin.`
      : `${center.name} has been rejected by admin.`,
    payload: {
      centerId: center.id,
      route: approved ? "/center/dashboard" : "/center/pending",
    },
  });
}
