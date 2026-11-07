import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { initialState } from './src/data.js';
import { applyAction } from './src/actions.js';
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
    const s = applyAction(getState(), req.body);
    db.prepare('UPDATE household SET content = ? WHERE id = 1').run(JSON.stringify(s));
    for(const client of listeners) client.write('data: update\n\n');
    res.json(s);
  } catch (error) {res.status(400).json({error: error.message});}
});
if (production) { app.use(express.static('dist-server')); app.get('/{*path}', (req,res)=>res.sendFile(process.cwd()+'/dist-server/index.html')); }
else {const {createServer} = await import('vite'); const vite = await createServer({server: {middlewareMode: true, allowedHosts: true}, appType:'spa'}); app.use(vite.middlewares);}
const port = Number(process.env.PORT || 3000);
const server = app.listen(port,'0.0.0.0',()=>console.log(`Tavola in ascolto sulla porta ${port}`));
function shutdown() {
  for (const client of listeners) client.end();
  server.close(() => {db.close(); process.exit(0);});
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
