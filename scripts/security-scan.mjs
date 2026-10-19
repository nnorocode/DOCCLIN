import {readFile,readdir,writeFile,mkdir,stat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';

// Offline source/build/history scan. Output locations/types only, never secrets.
const patterns={
  private_key:/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  supabase_secret:/\bsb_secret_[A-Za-z0-9_-]{16,}/g,
  openai_secret:/\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{24,}/g,
  aws_access:/\bAKIA[0-9A-Z]{16}\b/g,
  github_token:/\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b/g,
};
const files=new Set();
async function walk(dir){
  for(const entry of await readdir(dir,{withFileTypes:true}).catch(()=>[])) {
    const file=path.join(dir,entry.name);
    if(entry.isDirectory())await walk(file);
    else if(entry.isFile() && /\.(?:tsx?|jsx?|mjs|json|sql|map|html|ya?ml|toml|css)$/.test(file))files.add(file);
  }
}
for(const dir of ['app','lib','worker','build','supabase','public','dist/client','scripts'])await walk(dir);
for(const file of ['package.json','pnpm-lock.yaml','pnpm-workspace.yaml','middleware.ts','vite.config.ts','next.config.ts'])files.add(file);
for(const name of await readdir('.'))if(name.startsWith('.env')){if((await stat(name)).isFile())files.add(name);}
const candidates=[];let scanned=0;
function examine(text,file,commit){
  for(const [type,pattern] of Object.entries(patterns))for(const match of text.matchAll(pattern))candidates.push({file,commit,type,line:text.slice(0,match.index).split('\n').length});
}
for(const file of files){if((await stat(file)).size>15000000)continue;scanned++;examine(await readFile(file,'utf8'),file);}
const commits=execFileSync('git',['rev-list','--all'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
for(const commit of commits) {
  const diff=execFileSync('git',['show','--format=','--no-ext-diff','--unified=0',commit],{encoding:'utf8',maxBuffer:20000000});
  let file='';for(const line of diff.split('\n')){if(line.startsWith('+++ b/'))file=line.slice(6);if(line.startsWith('+')&&!line.startsWith('+++'))examine(line,file,commit.slice(0,12));}
}
const result={scannedFiles:scanned,reachableCommits:commits.length,candidates,limits:'Selected secret patterns; reachable Git history and current source/client build only. No browser, hosting, remote database, deleted commits or proof of absence of every secret.'};
await mkdir('.functional-review/correcoes-seguranca-2026-10-19',{recursive:true});
await writeFile('.functional-review/correcoes-seguranca-2026-10-19/scanner-segredos.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));if(candidates.length)process.exitCode=1;
