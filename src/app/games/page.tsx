import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Info, ArrowRight } from "lucide-react"
import Link from "next/link"
import { odooClient } from "@/lib/odoo"
import { cookies } from "next/headers"

export default async function GamesPage() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('arcade_session')?.value;
    
    let games: any[] = [];
    try {
        if (sessionId) {
            games = await odooClient.callKw(
                "x_game_release",
                "search_read",
                [[]],
                { fields: ["id", "x_name", "x_studio_description", "x_studio_url"] },
                sessionId
            );
        }
    } catch (e) {
        console.warn("Could not fetch games", e);
    }

    return (
        <div className="container mx-auto py-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end border-b pb-6 mb-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        <Play className="w-8 h-8 text-indigo-600" />
                        Catalogue de Jeux
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Découvrez tous les titres disponibles sur la plateforme.</p>
                </div>
            </div>

            {games.length === 0 ? (
                <Card className="bg-slate-50 border-dashed border-2 border-slate-200">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                            <Info className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">Aucun jeu disponible</h3>
                        <p className="text-slate-500 max-w-md">La bibliothèque est actuellement vide.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {games.map(game => (
                        <Card key={game.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-slate-200/60 flex flex-col h-full hover:-translate-y-1">
                            <div className="h-48 bg-slate-200 relative overflow-hidden flex items-center justify-center">
                                <Play className="w-12 h-12 text-slate-400 group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl font-bold group-hover:text-indigo-600 transition-colors">
                                        {game.x_name}
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="flex-grow">
                                <p className="text-slate-600 text-sm line-clamp-3">
                                    {game.x_studio_description || "Aucune description disponible pour ce jeu."}
                                </p>
                            </CardContent>
                            
                            <CardFooter className="pt-4 border-t bg-slate-50/50">
                                <Link href={`/play/${game.id}`} className="w-full">
                                    <Button className="w-full bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm font-semibold group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        Jouer maintenant <ArrowRight className="ml-2 w-4 h-4 opacity-70" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}