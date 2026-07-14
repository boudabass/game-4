# tri_apply.ps1 — Tri du pack kenney_tiny-farm (passe Claude du 10/07/2026)
#
# Ce script termine la passe de tri fait par Claude : les 132 tuiles ont deja
# ete extraites, renommees et copiees dans assets/tri/<categorie>/ et
# assets/_rejetes/kenney_tiny-farm/ (via git, car le montage Cowork ne
# permettait ni de lister ni de supprimer les fichiers de
# kenney_tiny-farm/ directement). Il ne reste qu'a supprimer le dossier
# original desormais redondant.
#
# A executer depuis la racine du repo game-4 (double-clic ou clic droit
# > Executer avec PowerShell), APRES avoir verifie les planches de
# controle dans assets/tri/_references/planche_*.png.

$ErrorActionPreference = "Stop"
$base = "public\games\system\assets\Assets_pack"
$original = Join-Path $base "kenney_tiny-farm"

if (-not (Test-Path $original)) {
    Write-Host "Dossier deja absent : $original (rien a faire)."
    exit 0
}

Write-Host "Sur le point de supprimer : $original"
Write-Host "(son contenu a ete recopie et renomme dans assets/tri/ et assets/_rejetes/kenney_tiny-farm/)"
$confirm = Read-Host "Confirmer la suppression ? (o/n)"
if ($confirm -ne "o") {
    Write-Host "Annule."
    exit 0
}

Remove-Item -Recurse -Force $original
Write-Host "Supprime : $original"
Write-Host ""
Write-Host "Etape suivante : verifier 'git status' dans le repo, puis committer"
Write-Host "(GitHub Desktop) : tri kenney_tiny-farm + suppression du pack original."
