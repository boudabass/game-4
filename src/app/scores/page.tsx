import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trophy, Medal, AlertCircle } from "lucide-react"
import { odooClient, isSessionExpired } from "@/lib/odoo"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function ScoresPage() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('arcade_session')?.value;
    
    let scores: any[] = [];
    let sessionExpired = false;
    try {
        if (sessionId) {
            scores = await odooClient.callKw(
                "x_game_score",
                "search_read",
                [[]],
                { fields: ["id", "x_studio_game", "x_studio_score", "create_date"], limit: 50, order: "x_studio_score desc" },
                sessionId
            );
        }
    } catch(e) {
        if (isSessionExpired(e)) sessionExpired = true;
    }
    // Session Odoo expirée : direction la page de connexion, avec retour ici.
    if (sessionExpired) redirect("/login?expired=1&next=/scores");

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
                                <div key={score.id} className="flex justify-between p-2 border-b">
                                    <span>#{idx + 1} - Jeu ID: {score.x_studio_game?.[1] || score.x_studio_game}</span>
                                    <span className="font-bold">{score.x_studio_score}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}