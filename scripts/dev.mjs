import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
// The preview host may append Vite's --strictPort; Webpack owns the port itself.
const args = process.argv.slice(2).filter(value => value !== '--strictPort');
const child = spawn(process.execPath, [require.resolve('webpack-cli/bin/cli.js'), 'serve', '--mode', 'development', ...args], { stdio: 'inherit', env: process.env });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('error', error => { console.error(error); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 0; });
