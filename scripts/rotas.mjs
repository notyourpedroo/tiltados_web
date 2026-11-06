// Rotas recebidas na linha de comando pelo capturas.mjs e pelo rolagem.mjs, sem as
// barras das pontas. No Git Bash, uma rota com barra inicial chega convertida num
// caminho do Windows ("/2026" vira "C:/Program Files/Git/2026"); essa rota encerra o
// script antes de abrir qualquer página.
export function routesFrom(args) {
  const converted = args.filter((route) => /^[A-Za-z]:[\\/]/.test(route));
  if (converted.length > 0) {
    console.error(
      `Rota convertida em caminho do Windows pelo Git Bash: ${converted.join(", ")}.\n` +
        'Passe a rota sem a barra inicial ("2026/pilotos/5") ou rode pelo PowerShell.',
    );
    process.exit(1);
  }
  return args.map((route) => route.replace(/^\/+|\/+$/g, ""));
}
