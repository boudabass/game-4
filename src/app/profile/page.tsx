import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trophy, Clock, Target, Gamepad2, Medal } from "lucide-react"
import { query } from "@/lib/db"
import { getSessionUser } from "@/app/actions/auth"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
    // Session signée (HMAC) : invalide ou expirée -> retour au login.
    const user = await getSessionUser();
    if (!user) redirect("/login?expired=1&next=/profile");

    let userScores: any[] = [];
    try {
        // Uniquement MES scores (une ligne par jeu = meilleur score).
        const { rows } = await query(
            "SELECT s.game_id, s.score, s.updated_at, g.name AS game_name FROM score s JOIN game g ON g.id = s.game_id WHERE s.user_id = $1 ORDER BY s.score DESC",
            [user.uid]
        );
        userScores = rows;
    } catch(e) {
        console.warn("Could not fetch scores", e);
    }

    const totalGamesPlayed = userScores.length;
    const highestScore = userScores.length > 0 ? Math.max(...userScores.map(s => Number(s.score))) : 0;

    return (
        <div className="container mx-auto py-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Profil</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-bold">{user.name}</p>
                        <p className="text-sm text-slate-500">{user.username}</p>
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