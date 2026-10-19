import {createCipheriv,createDecipheriv,randomBytes,createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {open,unlink,readFile,stat} from 'node:fs/promises';
import {pipeline} from 'node:stream/promises';
import {Writable} from 'node:stream';
import {pathToFileURL} from 'node:url';

const magic=Buffer.from('DOCCLIN_BACKUP_V1\n'),ivBytes=12,tagBytes=16;
function validKey(key){if(!Buffer.isBuffer(key)||key.length!==32)throw Error('Use uma chave AES de 32 bytes.');}
export async function encryptBackup(input,output,key){
  validKey(key);
  if(!(await stat(input)).size)throw Error('O arquivo de backup está vazio.');
  const handle=await open(output,'wx',0o600); // Never overwrite a backup or the input.
  let success=false;
  try {
    const iv=randomBytes(ivBytes),header=Buffer.concat([magic,iv]);
    await handle.writeFile(header);
    const cipher=createCipheriv('aes-256-gcm',key,iv);
    // Own the handle explicitly; pipeline must not wait for a stream to close it.
    const destination=new Writable({write(chunk,_encoding,callback){handle.writeFile(chunk).then(()=>callback(),callback);}});
    await pipeline(createReadStream(input),cipher,destination);
    await handle.writeFile(cipher.getAuthTag());
    await handle.sync();success=true;
  } finally {await handle.close();if(!success)await unlink(output).catch(()=>{});}
}
export async function verifyBackup(input,key){
  validKey(key);
  const handle=await open(input,'r');
  let iv,tag,size;
  try {
    size=(await handle.stat()).size;
    const header=Buffer.alloc(magic.length+ivBytes);
    const read=await handle.read(header,0,header.length,0);
    if(read.bytesRead!==header.length||!header.subarray(0,magic.length).equals(magic)||size<=header.length+tagBytes)throw Error('Backup inválido ou truncado.');
    iv=header.subarray(magic.length);tag=Buffer.alloc(tagBytes);
    if((await handle.read(tag,0,tagBytes,size-tagBytes)).bytesRead!==tagBytes)throw Error('Backup truncado.');
  } finally {await handle.close();}
  const decipher=createDecipheriv('aes-256-gcm',key,iv);decipher.setAuthTag(tag);
  const hash=createHash('sha256');let bytes=0;
  const sink=new Writable({write(chunk,_encoding,callback){hash.update(chunk);bytes+=chunk.length;callback();}});
  await pipeline(createReadStream(input,{start:magic.length+ivBytes,end:size-tagBytes-1}),decipher,sink);
  return {bytes,sha256:hash.digest('hex')}; // Authentication must succeed before any success is reported.
}
async function main(){
  const [command,input,outputOrKey,keyArg]=process.argv.slice(2);
  if(!['encrypt','verify'].includes(command)||!input||!outputOrKey||command==='encrypt'&&!keyArg)throw Error('Uso: encrypt entrada saída chave-base64.txt | verify arquivo chave-base64.txt');
  const keyFile=command==='encrypt'?keyArg:outputOrKey;
  if(process.platform!=='win32'&&((await stat(keyFile)).mode&0o077))throw Error('Proteja a chave com permissão 600.');
  const text=(await readFile(keyFile,'utf8')).trim();
  const key=Buffer.from(text,'base64');if(key.toString('base64')!==text)throw Error('Chave base64 inválida.');validKey(key);
  try {
    if(command==='encrypt'){await encryptBackup(input,outputOrKey,key);await verifyBackup(outputOrKey,key);console.log('Backup cifrado e integridade verificada.');}
    else {const result=await verifyBackup(input,key);console.log(JSON.stringify({verified:true,...result}));}
  }finally{key.fill(0);}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(()=>{console.error('Falha no backup. Verifique os argumentos, a chave, as permissões e a integridade do arquivo.');process.exitCode=1;});
