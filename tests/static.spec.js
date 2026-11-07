import {test,expect} from '@playwright/test';

const site = 'http://localhost:3103';

test('il sito statico funziona senza API e conserva le modifiche sul telefono',async({page})=>{
  const api=[];page.on('request',r=>{if(new URL(r.url()).pathname.startsWith('/api/'))api.push(r.url());});
  await page.setViewportSize({width:390,height:844});await page.goto(site);
  await expect(page.getByRole('heading',{name:'Ciao Endi, come stai oggi?'})).toBeVisible();
  await expect(page.getByText('Salvataggio sul dispositivo · Nessun account richiesto')).toBeVisible();
  await page.getByRole('button',{name:'Spesa',exact:true}).click();
  await page.getByRole('button',{name:'Aggiungi articolo'}).click();
  await page.getByRole('dialog').getByLabel('Nome dell’articolo').fill('Caffè del telefono');
  await page.getByRole('dialog').getByRole('button',{name:'Aggiungi alla lista'}).click();
  const check=page.getByRole('checkbox',{name:'Acquistato: Caffè del telefono',exact:true});await check.click();
  await expect(check).toHaveAttribute('aria-checked','true');
  await page.reload();await page.getByRole('button',{name:'Spesa',exact:true}).click();
  await expect(check).toHaveAttribute('aria-checked','true');
  expect(api).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth)).toBe(false);
});

test('due telefoni vedono la stessa lista iniziale e le spunte restano personali',async({browser})=>{
  const phoneA=await browser.newContext();const phoneB=await browser.newContext();
  try{
    const a=await phoneA.newPage(),b=await phoneB.newPage();
    await Promise.all([a.goto(site),b.goto(site)]);
    for(const p of [a,b])await p.getByRole('button',{name:'Spesa',exact:true}).click();
    const rows=p=>p.locator('.grocery-full .grocery-row .grocery-name strong');
    const names=await rows(a).allTextContents();expect(names.length).toBeGreaterThan(0);expect(await rows(b).allTextContents()).toEqual(names);
    const name='Acquistato: '+names[0];await a.getByRole('checkbox',{name,exact:true}).click();
    await expect(a.getByRole('checkbox',{name,exact:true})).toHaveAttribute('aria-checked','true');
    await expect(b.getByRole('checkbox',{name,exact:true})).toHaveAttribute('aria-checked','false');
  }finally{await phoneA.close();await phoneB.close();}
});
