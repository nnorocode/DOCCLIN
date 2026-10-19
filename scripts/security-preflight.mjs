import {pathToFileURL} from 'node:url';
export function deploymentPreflight(env){
  const checks=[];
  function check(id,condition){checks.push({id,status:condition?'configured':'missing_or_invalid'});}
  function httpsOrigin(value){try{const u=new URL(value);return u.protocol==='https:'&&!['localhost','127.0.0.1','[::1]'].includes(u.hostname)&&!u.username&&!u.password&&u.pathname==='/'&&!u.search&&!u.hash;}catch{return false;}}
  check('application_https_origin',httpsOrigin(env.APP_ORIGIN));
  check('supabase_https_origin',httpsOrigin(env.NEXT_PUBLIC_SUPABASE_URL));
  check('supabase_publishable_key',/^sb_publishable_[A-Za-z0-9_-]+$/.test(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'')&&!/REPLACE|YOUR_PROJECT/i.test(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??''));
  return {readyForRemoteValidation:checks.every(c=>c.status==='configured'),checks,
    limits:'Configuration syntax only. Does not contact services or prove deployments, RLS, MFA, rate-limiter bindings, backups, restoration, encryption at rest or alerts.'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const report=deploymentPreflight(process.env);console.log(JSON.stringify(report,null,2));if(!report.readyForRemoteValidation)process.exitCode=1;}
