import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import EditUsernameForm from "@/components/EditUsernameForm";
import AvatarUpload from "@/components/AvatarUpload";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="fade-up max-w-sm">
      <h1 className="mb-10 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.9] tracking-[0.02em]">
        PROFILE
      </h1>

      <div className="border border-edge p-8">

        {/* Avatar + identity */}
        <div className="mb-8 flex flex-col items-center gap-3 border-b border-edge pb-8">
          <AvatarUpload
            userId={user.id}
            currentAvatarUrl={profile?.avatar_url ?? null}
          />
          <div className="text-center">
            <p className="font-display text-[1.4rem] tracking-[0.05em]">
              {profile?.username ?? (
                <span className="text-muted">NO USERNAME</span>
              )}
            </p>
            <p className="text-sm text-muted">{user.email}</p>
          </div>
        </div>

        {/* Edit form */}
        <EditUsernameForm currentUsername={profile?.username ?? ""} />
      </div>
    </div>
  );
}
