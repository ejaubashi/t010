import {dateKey} from './data.js';

export const weekdays = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
export const foodStyles = ['Onnivora', 'Vegetariana', 'Vegetale', 'Pescetariana'];
export const personalGoals = ['Benessere', 'Mantenimento', 'Dimagrimento', 'Aumento di peso', 'Prestazione'];
export const trainingGoals = ['Benessere', 'Forza', 'Ipertrofia', 'Resistenza', 'Mobilità'];
export const levels = ['Da definire', 'Principiante', 'Intermedio', 'Avanzato'];
export const activities = ['Da definire', 'Sedentaria', 'Leggera', 'Moderata', 'Intensa'];

export function profileDetails(raw) {
  return {
    ...raw,
    body: {weight:null, goalWeight:null, height:null, age:null, goal:'Benessere', activity:'Da definire', ...raw.body},
    food: {style:'Onnivora', allergies:'', avoid:'', preferred:'', cookingMinutes:null, ...raw.food},
    nutrition: {planName:'', protein:null, carbs:null, fat:null, water:null, notes:'', ...raw.nutrition},
    training: {planName:'', goal:'Benessere', level:'Da definire', notes:'', sessions:[], ...raw.training},
    weightHistory: raw.weightHistory || [],
  };
}

function text(value, label, max=300) {
  if (value !== undefined && typeof value !== 'string') throw Error(`${label}: valore non valido.`);
  const s = (value || '').trim();
  if (s.length > max) throw Error(`${label}: massimo ${max} caratteri.`);
  return s;
}
function number(value, label, min, max, integer=false) {
  if (value === '' || value === null || value === undefined) return null;
  if (typeof value !== 'string' && typeof value !== 'number') throw Error(`${label}: valore non valido.`);
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max || (integer && !Number.isInteger(n))) throw Error(`${label}: inserisci un valore tra ${min} e ${max}.`);
  return n;
}
function choice(value, choices, label) {
  if (!choices.includes(value)) throw Error(`${label}: selezione non valida.`);
  return value;
}

export function updateProfile(raw, section, values) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) throw Error('Dati del profilo non validi.');
  const current = profileDetails(raw);
  const result = {...raw};
  switch(section) {
    case 'body': {
      const name = text(values.name, 'Nome', 40);
      if (!name) throw Error('Inserisci il nome.');
      result.name = name; result.initial = name[0].toUpperCase();
      result.body = {
        weight:number(values.weight, 'Peso', 1, 500), goalWeight:number(values.goalWeight, 'Peso obiettivo', 1, 500),
        height:number(values.height, 'Altezza', 30, 260), age:number(values.age, 'Età', 1, 120, true),
        goal:choice(values.goal, personalGoals, 'Obiettivo'), activity:choice(values.activity, activities, 'Attività quotidiana'),
      };
      if (result.body.weight !== null && result.body.weight !== current.body.weight) {
        const today = dateKey(new Date());
        result.weightHistory = [...current.weightHistory.filter(entry=>entry.date!==today), {date:today, weight:result.body.weight}].slice(-365);
      }
      break;
    }
    case 'food':
      result.food = {
        style:choice(values.style, foodStyles, 'Stile alimentare'), allergies:text(values.allergies, 'Allergie e intolleranze'),
        avoid:text(values.avoid, 'Alimenti da evitare'), preferred:text(values.preferred, 'Alimenti preferiti'),
        cookingMinutes:number(values.cookingMinutes, 'Tempo in cucina', 5, 240, true),
      };
      break;
    case 'nutrition': {
      const target = number(values.target, 'Obiettivo calorico', 500, 6000, true);
      if (target === null) throw Error('Inserisci l’obiettivo calorico.');
      result.target = target;
      result.nutrition = {
        planName:text(values.planName, 'Nome del piano', 80), protein:number(values.protein, 'Proteine', 0, 500),
        carbs:number(values.carbs, 'Carboidrati', 0, 1000), fat:number(values.fat, 'Grassi', 0, 500),
        water:number(values.water, 'Acqua', .1, 10), notes:text(values.notes, 'Note alimentari', 2000),
      };
      break;
    }
    case 'training': {
      if (!Array.isArray(values.sessions) || values.sessions.length > 7) throw Error('Controlla i giorni di allenamento.');
      const days = new Set();
      const sessions = values.sessions.map(session=>{
        if (!session || !Number.isInteger(session.day) || session.day<0 || session.day>6 || days.has(session.day)) throw Error('I giorni di allenamento devono essere diversi e validi.');
        days.add(session.day);
        const name = text(session.name, 'Nome della sessione', 80);
        const duration = number(session.duration, 'Durata', 5, 240, true);
        if (!name || duration === null) throw Error('Inserisci nome e durata per ogni allenamento.');
        return {day:session.day, name, duration, exercises:text(session.exercises, 'Esercizi', 2000)};
      }).sort((a,b)=>a.day-b.day);
      result.training = {
        planName:text(values.planName, 'Nome del programma', 80), goal:choice(values.goal, trainingGoals, 'Obiettivo allenamento'),
        level:choice(values.level, levels, 'Esperienza'), notes:text(values.notes, 'Note allenamento', 2000), sessions,
      };
      break;
    }
    default: throw Error('Sezione del profilo non valida.');
  }
  return result;
}

export function sessionFor(profile, date) {
  const day = (new Date(date+'T12:00:00Z').getUTCDay()+6)%7;
  return profileDetails(profile).training.sessions.find(session=>session.day===day);
}

// Explicit ingredient-name matches are reminders, not an allergen safety check.
export function ingredientReminders(recipe, profile) {
  const normalize = s=>s.toLocaleLowerCase('it').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const terms = profileDetails(profile).food.avoid.split(/[,;\n]/).map(s=>normalize(s.trim())).filter(Boolean);
  return recipe.ingredients.filter(i=>terms.some(term=>normalize(i.name).includes(term))).map(i=>i.name);
}
