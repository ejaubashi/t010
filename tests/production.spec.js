import {test, expect} from '@playwright/test';
import {spawn} from 'node:child_process';
import {mkdtemp, rm} from 'node:fs/promises';

test('produzione: accesso protetto e dati conservati dopo il riavvio',async({playwright})=>{
  const dir=await mkdtemp('/tmp/tavola-production-');
  const password='password-solo-per-il-test';
  let child;
  const stop=()=>new Promise(resolve=>{if(!child||child.exitCode!==null)return resolve();child.once('exit',resolve);child.kill('SIGTERM');});
  const start=async()=>{
    child=spawn(process.execPath,['server.js'],{env:{...process.env,NODE_ENV:'production',PORT:'3102',TAVOLA_ACCESS_PASSWORD:password,TAVOLA_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});
    await new Promise((resolve,reject)=>{child.stdout.once('data',resolve);child.once('error',reject);child.once('exit',code=>reject(Error(`Server terminato: ${code}`)));});
  };
  const anonymous=await playwright.request.newContext({baseURL:'http://localhost:3102'});
  const authenticated=await playwright.request.newContext({baseURL:'http://localhost:3102',httpCredentials:{username:'tavola',password}});
  try{
    await start();
    expect((await anonymous.get('/healthz')).status()).toBe(200);
    expect((await anonymous.get('/api/state')).status()).toBe(401);
    expect((await anonymous.get('/')).status()).toBe(401);
    expect((await anonymous.post('/api/action',{data:{type:'addGrocery',name:'Non autorizzato',amount:1,unit:'pz'}})).status()).toBe(401);
    expect((await authenticated.get('/')).status()).toBe(200);
    const response=await authenticated.post('/api/action',{data:{type:'addGrocery',name:'Caffè persistente',amount:1,unit:'pz'}});
    expect(response.status()).toBe(200);
    await stop();await start();
    const state=await(await authenticated.get('/api/state')).json();
    expect(state.manual.some(i=>i.name==='Caffè persistente')).toBe(true);
  }finally{await stop();await anonymous.dispose();await authenticated.dispose();await rm(dir,{recursive:true,force:true});}
});
