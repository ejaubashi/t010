import {recipes} from './data.js';

export function applyAction(s, action) {
  const {type, ...p} = action;
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
  return s;
}
