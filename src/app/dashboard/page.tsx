import { redirect } from 'next/navigation'
import { Card, CardFooter, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Trophy, Star, ArrowRight, LogOut } from "lucide-react"
import Link from "next/link"
import { query } from "@/lib/db"
import { signOutAction, getSessionUser } from "@/app/actions/auth"

export default async function DashboardPage() {
    // Session signée (HMAC) : invalide ou expirée -> retour au login.
    const user = await getSessionUser();
    if (!user) {
        redirect("/login?expired=1&next=/dashboard");
    }

    // L'admin voit aussi les jeux masqués (pour les tester avant publication).
    const isAdmin = !!process.env.ADMIN_UID && String(user.uid) === process.env.ADMIN_UID;

    let latestGames: any[] = [];
    try {
      const { rows } = await query(
        isAdmin
          ? "SELECT id, name FROM game ORDER BY created_at DESC LIMIT 3"
          : "SELECT id, name FROM game WHERE published ORDER BY created_at DESC LIMIT 3"
      );
      latestGames = rows;
    } catch (e: any) {
      console.warn("Could not fetch games", e);
    }

    const userName = user.name || user.username?.split('@')[0] || "Joueur"

    return (
        <div className="space-y-8 animate-in fade-in duration-700 container mx-auto py-8">
            {/* Hero Quick Welcome */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b pb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Bonjour, <span className="text-indigo-600">{userName}</span>
                    </h1>
                    <p className="text-slate-500 mt-1">Prêt pour une nouvelle partie ?</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/games">
                        <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg text-white font-bold">
                            <Play className="mr-2 w-5 h-5 fill-current" /> Lancer un Jeu
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Section Quick Stats / Info */}
                <Card className="md:col-span-2 bg-slate-50 border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="text-yellow-500 w-5 h-5" /> Nouveautés sur la plateforme
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {latestGames.length > 0 ? latestGames.map(game => (
                                <div key={game.id} className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-indigo-200 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-md bg-slate-200 overflow-hidden flex items-center justify-center text-slate-400">
                                            <Play className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{game.name}</h4>
                                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">v1.0</span>
                                        </div>
                                    </div>
                                    <Link href={`/play/${game.id}`}>
                                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600">
                                            Jouer <ArrowRight className="ml-1 w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            )) : <p className="text-slate-400 italic">Aucun jeu récent (ou session expirée).</p>}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Link href="/games" className="w-full">
                            <Button variant="outline" className="w-full">Voir tout le catalogue</Button>
                        </Link>
                    </CardFooter>
                </Card>

                {/* Section Profile / Shortcuts */}
                <div className="space-y-6">
                    <Card className="bg-indigo-600 text-white border-0 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <CardHeader>
                            <CardTitle className="text-lg">Mon Espace</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 relative z-10">
                            <div className="p-3 bg-white/10 rounded-lg flex items-center justify-between backdrop-blur-sm">
                                <span className="text-indigo-100 font-medium">Statut</span>
                                <span className="bg-green-400 text-green-900 text-xs px-2 py-0.5 rounded-full font-bold">EN LIGNE</span>
                            </div>
                            <Link href="/profile" className="block">
                                <Button variant="secondary" className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold border-0">
                                    Mon Profil
                                </Button>
                            </Link>
                            <Link href="/scores" className="block">
                                <Button variant="outline" className="w-full border-indigo-400 text-indigo-100 hover:bg-indigo-700 hover:text-white hover:border-indigo-300">
                                    <Trophy className="mr-2 w-4 h-4" /> Mes Scores
                                </Button>
                            </Link>
                            
                            <hr className="border-indigo-500/50 my-2" />
                            
                            <form action={async () => {
                                "use server";
                                await signOutAction();
                                redirect('/login');
                            }}>
                                <Button type="submit" variant="ghost" className="w-full text-red-200 hover:text-white hover:bg-red-500/30 transition-colors">
                                    <LogOut className="mr-2 w-4 h-4" /> Déconnexion
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}