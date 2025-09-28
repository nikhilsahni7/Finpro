import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logoutSessionByCredentials } from "@/lib/api";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type Session = {
  id: string;
  ip: string;
  user_agent: string;
  device_type?: string;
  last_seen_at?: string;
  created_at: string;
  expires_at: string;
};

type State = {
  email: string;
  password: string;
  sessions: Session[];
};

const DeviceConflict = () => {
  const nav = useNavigate();
  const loc = useLocation();
  const state = (loc.state || {}) as Partial<State>;
  const [sessions, setSessions] = useState<Session[]>(state.sessions || []);
  const [error, setError] = useState<string | null>(null);

  const logout = async (sid: string) => {
    setError(null);
    try {
      await logoutSessionByCredentials(
        sid,
        state.email || "",
        state.password || ""
      );
      setSessions((s) => s.filter((x) => x.id !== sid));
    } catch (e: any) {
      setError(e?.message || "Failed to logout device");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Log Out 1 Device to Continue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your account is signed in on multiple devices. Please log out from
            one device to continue here.
          </p>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="divide-y">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between py-3"
              >
                <div className="space-y-1">
                  <div className="font-medium">{s.device_type || "Device"}</div>
                  <div className="text-xs text-muted-foreground">
                    Last used:{" "}
                    {s.last_seen_at
                      ? new Date(s.last_seen_at).toLocaleString()
                      : new Date(s.created_at).toLocaleString()}{" "}
                    • IP: {s.ip}
                  </div>
                </div>
                <Button variant="outline" onClick={() => logout(s.id)}>
                  Log Out
                </Button>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="py-6 text-sm text-muted-foreground">
                All other devices are logged out. You can try signing in again.
              </div>
            )}
          </div>
          <div className="pt-2">
            <Button onClick={() => nav("/signin")}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeviceConflict;
