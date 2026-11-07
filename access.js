import {createHash, timingSafeEqual} from 'node:crypto';

export function createAccessGuard(password) {
  const expected = createHash('sha256').update(`tavola:${password}`).digest();
  return (req, res, next) => {
    const header = req.get('authorization') || '';
    if (header.startsWith('Basic ')) {
      const supplied = Buffer.from(header.slice(6), 'base64').toString('utf8');
      const actual = createHash('sha256').update(supplied).digest();
      if (timingSafeEqual(actual, expected)) return next();
    }
    res.set('WWW-Authenticate', 'Basic realm="La vostra Tavola", charset="UTF-8"');
    res.set('Cache-Control', 'no-store');
    res.status(401).type('text/plain').send('La vostra cucina è privata. Accedi con il nome utente tavola e la password condivisa impostata sul server.');
  };
}
