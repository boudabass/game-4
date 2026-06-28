"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth, LocalUser } from "@/components/auth-provider";
import { signInAction } from "@/app/actions/auth";
import { getUsersAction } from "@/app/actions/user-management";
import { Shield, User, Gamepad2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const [users, setUsers] = useState<LocalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingInId, setSigningInId] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      const res = await getUsersAction();
      if (res.success && res.users) {
        setUsers(res.users);
      } else {
        toast.error("Impossible de charger les profils locaux");
      }
      setLoading(false);
    }
    loadUsers();
  }, []);

  const handleSignIn = async (userId: string) => {
    setSigningInId(userId);
    const res = await signInAction(userId);
    if (res.success) {
      toast.success("Connexion réussie !");
      await refreshAuth();
      router.push("/dashboard");
    } else {
      toast.error(res.error || "Erreur de connexion");
      setSigningInId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 selection:bg-indigo-500/30 relative overflow-hidden">
      {/* Arrière-plan dégradé dynamique */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950 z-0"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>

      <Card className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-indigo-500/10 relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-4 border border-indigo-500/20 shadow-lg shadow-indigo-500/5 animate-pulse">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-200 via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            ARCADE.OS
          </CardTitle>
          <CardDescription className="text-slate-400 mt-2 font-medium">
            Choisissez un profil local pour lancer la console
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          {loading ? (
            <div className="space-y-3 py-4">
              <div className="h-14 bg-slate-800/50 rounded-xl animate-pulse"></div>
              <div className="h-14 bg-slate-800/50 rounded-xl animate-pulse"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-6 text-slate-400 space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-amber-500" />
              <p className="text-sm font-medium">Aucun profil détecté en base.</p>
              <p className="text-xs text-slate-500">
                Veuillez réinitialiser la base de données ou créer un utilisateur.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {users.map((u) => {
                const isAdmin = u.role === 'admin';
                const isSigningIn = signingInId === u.id;
                return (
                  <button
                    key={u.id}
                    disabled={signingInId !== null}
                    onClick={() => handleSignIn(u.id)}
                    className="w-full text-left p-4 rounded-xl border border-white/5 bg-slate-950/40 hover:bg-slate-950/90 hover:border-indigo-500/40 transition-all flex items-center justify-between group transform hover:-translate-y-[1px] disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                        isAdmin 
                          ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' 
                          : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                      }`}>
                        {isAdmin ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors">
                          {u.name || u.email.split('@')[0]}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {u.email}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full border ${
                        isAdmin 
                          ? 'bg-purple-950/40 border-purple-500/30 text-purple-300' 
                          : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="text-center">
            <span className="text-xs text-slate-600 bg-slate-950/50 px-3 py-1.5 rounded-full border border-white/5 font-mono">
              Mode Autonome Offline
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}