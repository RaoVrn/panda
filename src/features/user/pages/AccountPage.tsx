import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, LogOut } from "lucide-react";
import { useAuth } from "@/features/user/auth/authContext";
import {
  useProfile,
  useUpdateProfile,
} from "@/features/user/hooks/useProfile";
import { Avatar, AvatarPicker } from "@/features/user/components/Avatar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { motion, AnimatePresence } from "framer-motion";

const INPUT =
  "w-full rounded-lg border border-border-subtle bg-base-subtle px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted transition-colors focus:border-border-strong focus:bg-base-subtle focus:outline-none";

export function AccountPage() {
  const { userId, user, configured, signOut } = useAuth();
  const { data: profile } = useProfile(userId ?? undefined);
  const updateProfile = useUpdateProfile(userId ?? undefined);

  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setUsername(profile.username ?? "");
      setAvatar(profile.avatarUrl ?? "");
    }
  }, [profile]);

  const [saved, setSaved] = useState(false);

  // Save is disabled until something actually changed.
  const dirty =
    profile != null &&
    (name !== (profile.name ?? "") ||
      (username || "") !== (profile.username ?? "") ||
      (avatar || "") !== (profile.avatarUrl ?? ""));

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!userId || !dirty) return;
    try {
      await updateProfile.mutateAsync({
        name,
        username: username || undefined,
        avatarUrl: avatar || undefined,
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaved(false);
      setSaveError(err instanceof Error ? err.message : "Couldn't save your changes.");
    }
  };

  const onSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const [saveError, setSaveError] = useState<string | null>(null);

  if (!configured || !userId) {
    return (
      <div className="mx-auto w-full max-w-2xl py-12 text-center text-text-secondary">
        <p>Sign in to manage your account.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl py-8">
      <PageHeader
        title="Account"
        subtitle="Manage your profile and sign-in details."
        back={{ to: "/profile", label: "Profile" }}
      />

      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 flex items-center gap-2 rounded-xl border border-accent/30 bg-accent-soft/40 px-4 py-3 text-sm text-text"
          >
            <span className="flex size-5 items-center justify-center rounded-full bg-accent text-base">
              <Check className="size-3.5" aria-hidden="true" />
            </span>
            Profile updated successfully.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Avatar profile={{ avatarUrl: avatar }} size={64} />
            <div>
              <h2 className="text-base font-semibold text-text">Profile</h2>
              <p className="text-sm text-text-muted">Choose an avatar and your display name.</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
            <AvatarPicker value={avatar} onSelect={setAvatar} />

            <label className="flex flex-col gap-1.5 text-sm font-medium text-text">
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={INPUT}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-text">
              Username
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className={INPUT}
              />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={!dirty} loading={updateProfile.isPending}>
                {updateProfile.isPending ? "Saving…" : "Save changes"}
              </Button>
              {saveError && <span className="text-sm text-danger">{saveError}</span>}
              <Link
                to="/profile"
                className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text"
              >
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                Back to profile
              </Link>
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-text-secondary">
            Sign in
          </h2>
          <p className="mt-1.5 text-sm text-text-secondary">
            {user?.email ?? "N/A"}
            {user?.app_metadata?.provider === "google" ? " · via Google" : ""}
          </p>
          <Button
            variant="danger"
            className="mt-4"
            leftIcon={<LogOut className="size-4" aria-hidden="true" />}
            onClick={() => void onSignOut()}
          >
            Sign out
          </Button>
        </Card>
      </div>
    </div>
  );
}
