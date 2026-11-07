import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { initialState, recipes } from './src/data.js';
import { createAccessGuard } from './access.js';
const production = process.env.NODE_ENV === 'production';
const password = process.env.TAVOLA_ACCESS_PASSWORD || '';
if (production && password.length < 12) throw new Error('Imposta TAVOLA_ACCESS_PASSWORD con almeno 12 caratteri prima di pubblicare Tavola.');
const dataDirectory = process.env.TAVOLA_DATA_DIR || '.data';
mkdirSync(dataDirectory, {recursive: true});
const db = new DatabaseSync(`${dataDirectory}/tavola.sqlite`);
db.exec('CREATE TABLE IF NOT EXISTS household (id INTEGER PRIMARY KEY, content TEXT NOT NULL)');
if (!db.prepare('SELECT id FROM household WHERE id = 1').get()) db.prepare('INSERT INTO household VALUES (1, ?)').run(JSON.stringify(initialState()));
const getState = () => JSON.parse(db.prepare('SELECT content FROM household WHERE id = 1').get().content);
const app = express();
app.disable('x-powered-by');
app.get('/healthz', (req, res) => res.json({status: 'ok'}));
if (password) app.use(createAccessGuard(password));
app.use(express.json({ limit: '100kb' }));
app.use('/api', (req, res, next) => {res.set('Cache-Control', 'no-store'); next();});
const listeners = new Set();
app.get('/api/state', (req, res) => res.json(getState()));
app.get('/api/events', (req, res) => {
  res.set({'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no'}); res.flushHeaders(); res.write(': connected\n\n'); listeners.add(res);
  const keepalive = setInterval(() => res.write(': heartbeat\n\n'), 20000);
  req.on('close', () => {listeners.delete(res); clearInterval(keepalive);});
});
app.post('/api/action', (req, res) => {
  try {
    const {type, ...p} = req.body; const s = getState();
    const person = () => {if (!['me', 'her'].includes(p.person)) throw Error('Profilo non valido.');};
    const plan = () => {person(); if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date)) throw Error('Data non valida.'); return s.plans[p.person][p.date] ||= [];};
    switch(type) {
      case 'toggleGrocery': if (typeof p.key !== 'string') throw Error('Articolo non valido.'); s.checked[p.key] = !s.checked[p.key]; break;
      case 'pantry': if (typeof p.key !== 'string') throw Error('Articolo non valido.'); s.pantry[p.key] = !s.pantry[p.key]; break;
      case 'addGrocery': {
        const name = String(p.name || '').trim().slice(0, 80); const amount = Number(p.amount);
        if (!name || !Number.isFinite(amount) || amount <= 0 || !['pz','g','ml'].includes(p.unit)) throw Error('Controlla nome, quantità e unità.');
        s.manual.push({key: 'manual-' + crypto.randomUUID(), name, amount, unit:p.unit, category: 'Extra e casa'}); break;
      }
      case 'removeGrocery': s.manual = s.manual.filter(i => i.key !== p.key); delete s.checked[p.key]; break;
      case 'meal': {
        const list = plan(); const recipe = recipes.find(r => r.id === p.recipe); const portion = Number(p.portion);
        if (!recipe || !Number.isInteger(p.slot) || p.slot < 0 || p.slot > 3 || !Number.isFinite(portion) || portion < .25 || portion > 3) throw Error('Pasto non valido.');
        const entry = {id: crypto.randomUUID(), recipe: recipe.id, slot: p.slot, portion, eaten: false};
        if (p.replace) { const index = list.findIndex(m => m.id === p.replace); if(index < 0) throw Error('Pasto non trovato.'); list[index] = entry; } else list.push(entry); break;
      }
      case 'eaten': { const m = plan().find(m => m.id === p.id); if (!m) throw Error('Pasto non trovato.'); m.eaten = !m.eaten; break; }
      case 'removeMeal': {const list = plan(); s.plans[p.person][p.date] = list.filter(m => m.id !== p.id); break;}
      case 'favorite': if(!recipes.some(r=>r.id===p.id)) throw Error('Ricetta non valida.'); s.favorites = s.favorites.includes(p.id) ? s.favorites.filter(id=>id!==p.id) : [...s.favorites,p.id]; break;
      case 'profile': person(); if (!String(p.name || '').trim() || !Number.isFinite(Number(p.target)) || Number(p.target) < 500 || Number(p.target) > 6000) throw Error('Inserisci un nome e un obiettivo tra 500 e 6.000 kcal.'); s.profiles[p.person] = {...s.profiles[p.person], name: p.name.trim().slice(0,40), initial: p.name.trim()[0].toUpperCase(), target: Number(p.target)}; break;
      default: throw Error('Azione non riconosciuta.');
    }
    db.prepare('UPDATE household SET content = ? WHERE id = 1').run(JSON.stringify(s));
    for(const client of listeners) client.write('data: update\n\n');
    res.json(s);
  } catch (error) {res.status(400).json({error: error.message});}
});
if (production) { app.use(express.static('dist')); app.get('/{*path}', (req,res)=>res.sendFile(process.cwd()+'/dist/index.html')); }
else {const {createServer} = await import('vite'); const vite = await createServer({server: {middlewareMode: true, allowedHosts: true}, appType:'spa'}); app.use(vite.middlewares);}
const port = Number(process.env.PORT || 3000);
const server = app.listen(port,'0.0.0.0',()=>console.log(`Tavola in ascolto sulla porta ${port}`));
function shutdown() {
  for (const client of listeners) client.end();
  server.close(() => {db.close(); process.exit(0);});
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
