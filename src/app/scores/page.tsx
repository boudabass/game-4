import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trophy, Medal, AlertCircle } from "lucide-react"
import { query } from "@/lib/db"
import { getSessionUser } from "@/app/actions/auth"
import { redirect } from "next/navigation"

export default async function ScoresPage() {
    // Session signée (HMAC) : invalide ou expirée -> retour au login.
    const user = await getSessionUser();
    if (!user) redirect("/login?expired=1&next=/scores");

    let scores: any[] = [];
    try {
        // Classement global : meilleur score par joueur et par jeu.
        const { rows } = await query(
            "SELECT s.game_id, s.user_id, s.user_name, s.score, g.name AS game_name FROM score s JOIN game g ON g.id = s.game_id ORDER BY s.score DESC LIMIT 50"
        );
        scores = rows;
    } catch(e) {
        console.warn("Could not fetch scores", e);
    }

    return (
        <div className="container mx-auto py-8 animate-in fade-in duration-500">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3 mb-8">
                <Trophy className="w-8 h-8 text-yellow-500" />
                Classement Global
            </h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Meilleurs Scores</CardTitle>
                </CardHeader>
                <CardContent>
                    {scores.length === 0 ? (
                        <p>Aucun score enregistré.</p>
                    ) : (
                        <div className="space-y-4">
                            {scores.map((score, idx) => (
                                <div key={`${score.game_id}-${score.user_id}`} className="flex justify-between p-2 border-b">
                                    <span>#{idx + 1} - {score.game_name} — {score.user_name || "Joueur"}</span>
                                    <span className="font-bold">{score.score}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}