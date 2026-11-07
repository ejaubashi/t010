import {test,expect} from '@playwright/test';
import {dateKey,addDays,groceriesFor,recipeById,groceryKey} from '../src/data.js';

test('pasti separati, porzioni aggregate e salvataggio dopo il ricaricamento',async({page,request})=>{
  const date=addDays(dateKey(new Date()),35);
  await page.goto('/');
  await page.getByRole('button',{name:'Piano alimentare',exact:true}).click();
  await page.getByRole('button',{name:'Aggiungi pasto',exact:true}).click();
  const dialog=page.getByRole('dialog');
  await dialog.getByLabel('Giorno',{exact:true}).fill(date);
  await dialog.getByRole('button',{name:/Bowl di quinoa/}).click();
  await dialog.getByLabel('Porzioni',{exact:true}).fill('1.5');
  await dialog.getByRole('button',{name:'Salva nel piano'}).click();
  await expect(dialog).not.toBeVisible();
  let s=await (await request.get('/api/state')).json();
  const meal=s.plans.me[date].find(m=>m.recipe==='bowl');
  expect(meal.portion).toBe(1.5);expect(s.plans.her[date]||[]).toHaveLength(0);
  await request.post('/api/action',{data:{type:'meal',person:'her',date,recipe:'bowl',slot:1,portion:.5}});
  s=await (await request.get('/api/state')).json();
  const groceries=groceriesFor(s,[date]);
  const quinoa=groceries.find(g=>g.key===groceryKey('Quinoa','g'));
  expect(quinoa.amount).toBe(160);expect(quinoa.people).toEqual({me:120,her:40});
  await page.reload();
  expect((await(await request.get('/api/state')).json()).plans.me[date].find(m=>m.id===meal.id).portion).toBe(1.5);
  await request.post('/api/action',{data:{type:'removeMeal',person:'me',date,id:meal.id}});
  const hers=s.plans.her[date].find(m=>m.recipe==='bowl');
  await request.post('/api/action',{data:{type:'removeMeal',person:'her',date,id:hers.id}});
});

test('la spesa si aggiorna tra due finestre e conserva gli acquisti',async({browser,request})=>{
  const context=await browser.newContext();const a=await context.newPage();const b=await context.newPage();
  await Promise.all([a.goto('/'),b.goto('/')]);
  for(const p of [a,b])await p.getByRole('button',{name:'Spesa',exact:true}).click();
  await a.getByRole('button',{name:'Aggiungi articolo'}).click();
  const name=`Caffè prova ${Date.now()}`;
  const dialog=a.getByRole('dialog');await dialog.getByLabel('Nome dell’articolo').fill(name);
  await dialog.getByRole('button',{name:'Aggiungi alla lista'}).click();
  const checkbox=b.getByRole('checkbox',{name:`Acquistato: ${name}`,exact:true});
  await expect(checkbox).toBeVisible();await checkbox.click();
  await expect(a.getByRole('checkbox',{name:`Acquistato: ${name}`,exact:true})).toHaveAttribute('aria-checked','true');
  await a.reload();await a.getByRole('button',{name:'Spesa',exact:true}).click();
  await expect(a.getByRole('checkbox',{name:`Acquistato: ${name}`,exact:true})).toHaveAttribute('aria-checked','true');
  await a.getByRole('button',{name:`Elimina ${name}`,exact:true}).click();await expect(checkbox).not.toBeVisible();
  await context.close();
});

test('segnare un pasto cambia solo il profilo scelto',async({page,request})=>{
  const before=await(await request.get('/api/state')).json();const today=dateKey(new Date());
  await page.goto('/');await page.getByRole('button',{name:'Piano alimentare',exact:true}).click();await page.getByRole('button',{name:'Segna mangiato',exact:true}).first().click();
  await expect(page.getByRole('button',{name:'Mangiato',exact:true}).first()).toBeVisible();
  const after=await(await request.get('/api/state')).json();
  expect(after.plans.her[today]).toEqual(before.plans.her[today]);
  const changed=after.plans.me[today].find(m=>m.eaten!==before.plans.me[today].find(x=>x.id===m.id).eaten);
  expect(changed).toBeTruthy();
  await request.post('/api/action',{data:{type:'eaten',person:'me',date:today,id:changed.id}});
});

test('ricerca ricette, dialogo accessibile e menu mobile senza overflow',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:390,height:844});await page.goto('/');
  await page.getByRole('button',{name:'Piano alimentare',exact:true}).click();
  await page.getByRole('button',{name:'Ricettario',exact:true}).click();
  await page.getByRole('textbox',{name:'Cerca una ricetta'}).fill('inesistente');
  await expect(page.getByRole('heading',{name:'Nessuna ricetta trovata'})).toBeVisible();
  await page.getByRole('textbox',{name:'Cerca una ricetta'}).fill('Salmone');
  await expect(page.locator('.recipe-card')).toHaveCount(1);
  await page.locator('.recipe-card .meal-title').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth)).toBe(false);
  for(const label of ['Panoramica','Piano alimentare','Spesa','Allenamento','Profili']){
    await page.locator('.sidebar').getByRole('button',{name:label,exact:true}).click();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth)).toBe(false);
  }
  expect(errors).toEqual([]);
});

test('il server rifiuta porzioni e articoli non validi',async({request})=>{
  for(const data of [{type:'meal',person:'me',date:dateKey(new Date()),recipe:'bowl',slot:1,portion:-1},{type:'addGrocery',name:'',amount:1,unit:'g'},{type:'profile',person:'her',name:'Giulia',target:0}]){
    const response=await request.post('/api/action',{data});expect(response.status()).toBe(400);
  }
});

test('un profilo non valido non sovrascrive i dati già salvati',async({request})=>{
  const before=await(await request.get('/api/state')).json();
  const invalid=[
    {type:'profileSection',person:'me',section:'body',values:{name:'Endi',weight:-5,goal:'Benessere',activity:'Moderata'}},
    {type:'profileSection',person:'me',section:'training',values:{goal:'Forza',level:'Intermedio',sessions:[{day:0,name:'Forza',duration:45},{day:0,name:'Corsa',duration:30}]}},
  ];
  for(const data of invalid)expect((await request.post('/api/action',{data})).status()).toBe(400);
  const after=await(await request.get('/api/state')).json();
  expect(after.profiles).toEqual(before.profiles);
});
