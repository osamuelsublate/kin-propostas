// Builds both versions and assembles the GitHub Pages site:
//   site/index.html      cover page (the two magazine covers)
//   site/capa/           cover images
//   site/versao-1/       versao-1 build
//   site/versao-2/       versao-2 build
import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'

const out = 'site'
rmSync(out, { recursive: true, force: true })
mkdirSync(out)

for (const version of ['versao-1', 'versao-2']) {
  const run = (command) => execSync(command, { cwd: version, stdio: 'inherit' })
  if (!existsSync(`${version}/node_modules`)) run('npm ci')
  run('npm test')
  run('npm run build')
  cpSync(`${version}/dist`, `${out}/${version}`, { recursive: true })
}

cpSync('index.html', `${out}/index.html`)
cpSync('capa', `${out}/capa`, { recursive: true })
writeFileSync(`${out}/.nojekyll`, '')
console.log(`\nSite pronto em ./${out}`)
