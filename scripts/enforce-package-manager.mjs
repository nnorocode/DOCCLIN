// Security overrides and the reviewed braces patch live in pnpm-workspace.yaml.
// An npm install using the legacy template lock would omit those corrections.
if (!process.env.npm_config_user_agent?.startsWith('pnpm/')) {
  console.error('Use pnpm install. O lockfile auditado e os patches de segurança pertencem ao pnpm; package-lock.json é legado do template.');
  process.exitCode=1;
}
