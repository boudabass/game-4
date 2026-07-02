import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trophy, Clock, Target, Gamepad2, Medal } from "lucide-react"
import { odooClient, isSessionExpired } from "@/lib/odoo"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('arcade_session')?.value;
    const userCookie = cookieStore.get('arcade_user')?.value;

    if (!sessionId) {
        redirect('/login')
    }

    let user;
    try {
        user = userCookie ? JSON.parse(userCookie) : null;
    } catch(e) {}

    if (!user) {
        redirect('/login')
    }

    let userScores: any[] = [];
    let sessionExpired = false;
    try {
        userScores = await odooClient.callKw(
            "x_game_score",
            "search_read",
            [[]], 
            { fields: ["id", "x_studio_game", "x_studio_score", "create_date"] },
            sessionId
        );
    } catch(e) {
        if (isSessionExpired(e)) sessionExpired = true;
    }
    // Session Odoo expirée : direction la page de connexion, avec retour ici.
    if (sessionExpired) redirect("/login?expired=1&next=/profile");

    const totalGamesPlayed = userScores.length;
    const highestScore = userScores.length > 0 ? Math.max(...userScores.map(s => s.x_studio_score)) : 0;

    return (
        <div className="container mx-auto py-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Profil</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-bold">{user.name}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                    </CardContent>
                </Card>
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>Statistiques</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                           <div>Total parties: {totalGamesPlayed}</div>
                           <div>Meilleur score: {highestScore}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}