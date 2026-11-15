# Limpieza de la copia local del repositorio en la computadora del autor (pedido del 14 de noviembre de 2026, recordado el 15).
# Borra las carpetas de trabajo (worktrees) y las ramas locales cuyo trabajo ya está unido a main en GitHub, y compacta Git.
# No toca nada sin confirmar: primero muestra la lista, después pregunta. Nunca borra una carpeta con cambios sin guardar ni una rama
# que no esté unida (esas solo las muestra).
#
# Uso, desde PowerShell en la carpeta del proyecto:
#   powershell -ExecutionPolicy Bypass -File scripts\limpiar_repositorio.ps1
# Con -SoloMirar muestra lo que haría y no borra nada.
param([switch]$SoloMirar)

$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent $PSScriptRoot
Set-Location $raiz
if (-not (Test-Path (Join-Path $raiz ".git"))) { throw "Esto no es la carpeta principal del repositorio: $raiz" }

# git escribe avisos comunes (como los de fetch) por la salida de errores: en PowerShell 5 eso cortaría el script, así que solo se corta
# cuando git termina con error
function G {
    $previa = $ErrorActionPreference; $ErrorActionPreference = "Continue"
    $salida = & git.exe @args 2>&1 | ForEach-Object { "$_" }
    $codigo = $LASTEXITCODE; $ErrorActionPreference = $previa
    if ($codigo -ne 0) { throw "git $args`n$($salida -join "`n")" }
    return $salida
}

Write-Host "1. Trayendo el estado de GitHub (git fetch --prune)..." -ForegroundColor Cyan
G fetch --prune origin | Out-Null
$antes = (G count-objects -vH | Select-String "size-pack").ToString()

# ramas unidas a main en GitHub
$unidas = G branch --merged origin/main --format "%(refname:short)" | ForEach-Object { $_.Trim() } | Where-Object { $_ -and $_ -ne "main" }
$actual = (G rev-parse --abbrev-ref HEAD).Trim()

# carpetas de trabajo (la primera es la principal y no se toca)
$wts = @(); $wt = $null
foreach ($l in (G worktree list --porcelain)) {
    if ($l -like "worktree *") { if ($wt) { $wts += $wt }; $wt = @{ ruta = $l.Substring(9); rama = "" } }
    elseif ($l -like "branch *") { $wt.rama = $l.Substring(7) -replace "^refs/heads/", "" }
}
if ($wt) { $wts += $wt }
$wtBorrar = @(); $wtDejar = @()
foreach ($w in ($wts | Select-Object -Skip 1)) {
    if (-not (Test-Path $w.ruta)) { $wtBorrar += $w; continue }  # carpeta que ya no existe: solo se limpia el registro
    # la carpeta desde la que se corre el script nunca se borra
    if ([IO.Path]::GetFullPath($w.ruta).TrimEnd('\') -eq [IO.Path]::GetFullPath($raiz).TrimEnd('\')) { $wtDejar += $w; continue }
    $sucio = (& git.exe -C $w.ruta status --porcelain 2>$null)
    if ($w.rama -and ($unidas -contains $w.rama) -and -not $sucio) { $wtBorrar += $w } else { $wtDejar += $w }
}
$ramasEnWt = $wtDejar | ForEach-Object { $_.rama }
$ramasBorrar = $unidas | Where-Object { $_ -ne $actual -and ($ramasEnWt -notcontains $_) }
$noUnidas = G branch --format "%(refname:short)" | ForEach-Object { $_.Trim() } | Where-Object { $_ -and $_ -ne "main" -and ($unidas -notcontains $_) }

Write-Host "`n2. Carpetas de trabajo que se borran (su rama ya está unida y no tienen cambios sin guardar):" -ForegroundColor Cyan
if ($wtBorrar) { $wtBorrar | ForEach-Object { Write-Host "   $($_.ruta)  [$($_.rama)]" } } else { Write-Host "   ninguna" }
if ($wtDejar) {
    Write-Host "   Quedan, porque tienen cambios sin guardar o su rama no está unida:" -ForegroundColor Yellow
    $wtDejar | ForEach-Object { Write-Host "   $($_.ruta)  [$($_.rama)]" }
}
Write-Host "`n3. Ramas locales que se borran (ya unidas a main):" -ForegroundColor Cyan
if ($ramasBorrar) { $ramasBorrar | ForEach-Object { Write-Host "   $_" } } else { Write-Host "   ninguna" }
if ($noUnidas) {
    Write-Host "   Quedan, porque no están unidas (revisalas vos antes de borrarlas):" -ForegroundColor Yellow
    $noUnidas | ForEach-Object { Write-Host "   $_" }
}
Write-Host "`n4. Al final se compacta Git (git gc). Tamaño actual: $antes" -ForegroundColor Cyan

if ($SoloMirar) { Write-Host "`nSolo mirar: no se borró nada." -ForegroundColor Green; exit 0 }
$r = Read-Host "`n¿Borro lo de arriba y compacto? Escribí si para seguir"
if ($r -ne "si" -and $r -ne "sí") { Write-Host "No se borró nada." -ForegroundColor Green; exit 0 }

foreach ($w in $wtBorrar) {
    if (Test-Path $w.ruta) { G worktree remove $w.ruta | Out-Null }
    Write-Host "   borrada la carpeta $($w.ruta)"
}
G worktree prune | Out-Null
foreach ($b in $ramasBorrar) { G branch -d $b | Out-Null; Write-Host "   borrada la rama $b" }
Write-Host "Compactando (puede tardar unos minutos)..." -ForegroundColor Cyan
G gc | Out-Null
$despues = (G count-objects -vH | Select-String "size-pack").ToString()
Write-Host "`nListo. Antes: $antes. Ahora: $despues" -ForegroundColor Green
