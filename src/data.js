export const slots = ['Colazione', 'Pranzo', 'Spuntino', 'Cena'];
export const times = ['08:00', '13:00', '16:30', '20:00'];
const ingredient = (name, amount, unit, category) => ({ name, amount, unit, category });
export const recipes = [
  { id: 'yogurt', name: 'Yogurt, frutti di bosco e granola', description: 'Un risveglio dolce, fresco e croccante.', photo: 0, time: 5, kcal: 340, protein: 22, carbs: 42, fat: 10, tag: 'Vegetariano', slot: 0, ingredients: [ingredient('Yogurt greco', 170, 'g', 'Latticini e uova'), ingredient('Frutti di bosco', 80, 'g', 'Frutta e verdura'), ingredient('Granola', 40, 'g', 'Cereali e dispensa')], steps: ['Versa lo yogurt in una ciotola.', 'Lava e aggiungi i frutti di bosco.', 'Completa con la granola appena prima di servire.'] },
  { id: 'bowl', name: 'Bowl di quinoa, ceci e avocado', description: 'Colori, fibre e un pieno di cose buone.', photo: 1, time: 20, kcal: 520, protein: 19, carbs: 64, fat: 21, tag: 'Vegetale', slot: 1, ingredients: [ingredient('Quinoa', 80, 'g', 'Cereali e dispensa'), ingredient('Ceci cotti', 120, 'g', 'Cereali e dispensa'), ingredient('Avocado', 0.5, 'pz', 'Frutta e verdura'), ingredient('Pomodorini', 100, 'g', 'Frutta e verdura'), ingredient('Spinacini', 40, 'g', 'Frutta e verdura')], steps: ['Sciacqua la quinoa e cuocila seguendo le indicazioni sulla confezione.', 'Lava le verdure e taglia avocado e pomodorini.', 'Disponi tutto in una ciotola con i ceci. Condisci a piacere.'] },
  { id: 'apple', name: 'Una mela e una manciata di mandorle', description: 'La pausa semplice che ti fa stare bene.', photo: 2, time: 2, kcal: 195, protein: 5, carbs: 24, fat: 10, tag: 'Senza lattosio', slot: 2, ingredients: [ingredient('Mele', 1, 'pz', 'Frutta e verdura'), ingredient('Mandorle', 20, 'g', 'Cereali e dispensa')], steps: ['Lava la mela e tagliala se preferisci.', 'Accompagna con una porzione di mandorle.'] },
  { id: 'salmon', name: 'Salmone, riso integrale e broccoli', description: 'Una cena equilibrata, da gustare con calma.', photo: 3, time: 30, kcal: 610, protein: 38, carbs: 56, fat: 25, tag: 'Ricco di proteine', slot: 3, ingredients: [ingredient('Salmone', 150, 'g', 'Pesce'), ingredient('Riso integrale', 70, 'g', 'Cereali e dispensa'), ingredient('Broccoli', 200, 'g', 'Frutta e verdura')], steps: ['Cuoci il riso seguendo le indicazioni sulla confezione.', 'Cuoci i broccoli al vapore per 8–10 minuti.', 'Cuoci il salmone in forno a 180 °C per circa 15–20 minuti, fino a completa cottura. Servi con riso e broccoli.'] },
  { id: 'porridge', name: 'Porridge con yogurt e frutti di bosco', description: 'Una coccola cremosa per iniziare la giornata.', photo: 0, time: 10, kcal: 380, protein: 20, carbs: 51, fat: 10, tag: 'Vegetariano', slot: 0, ingredients: [ingredient('Fiocchi di avena', 50, 'g', 'Cereali e dispensa'), ingredient('Yogurt greco', 100, 'g', 'Latticini e uova'), ingredient('Frutti di bosco', 80, 'g', 'Frutta e verdura')], steps: ['Cuoci i fiocchi di avena in acqua per 5 minuti, mescolando.', 'Lascia intiepidire e incorpora lo yogurt.', 'Completa con i frutti di bosco.'] },
  { id: 'chickpeas', name: 'Insalata di ceci e quinoa', description: 'Un pranzo vegetale da portare anche fuori.', photo: 1, time: 15, kcal: 440, protein: 18, carbs: 62, fat: 13, tag: 'Vegetale', slot: 1, ingredients: [ingredient('Quinoa', 60, 'g', 'Cereali e dispensa'), ingredient('Ceci cotti', 140, 'g', 'Cereali e dispensa'), ingredient('Pomodorini', 120, 'g', 'Frutta e verdura'), ingredient('Spinacini', 50, 'g', 'Frutta e verdura')], steps: ['Cuoci la quinoa e lasciala raffreddare.', 'Unisci ceci scolati, pomodorini e spinacini lavati.', 'Mescola e condisci a piacere.'] },
];
export const recipeById = id => recipes.find(r => r.id === id);
export function dateKey(date) { return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(date); }
export function addDays(key, days) { const d = new Date(key + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); }
export function weekFor(key) { const weekday = new Date(key + 'T12:00:00Z').getUTCDay(); const monday = addDays(key, -(weekday === 0 ? 6 : weekday - 1)); return Array.from({length: 7}, (_, i) => addDays(monday, i)); }
export function initialState() {
  const today = dateKey(new Date());
  const plans = {};
  for (const [index, person] of ['me', 'her'].entries()) {
    plans[person] = {};
    for (const [dayIndex, date] of weekFor(today).entries()) {
      plans[person][date] = [index ? 'porridge' : 'yogurt', (dayIndex + index) % 2 ? 'chickpeas' : 'bowl', 'apple', 'salmon'].map((recipe, slot) => ({ id: `${person}-${date}-${slot}`, recipe, slot, portion: index ? 0.85 : 1, eaten: false }));
    }
  }
  return { profiles: { me: { name: 'Endi', initial: 'E', description: 'Il mio percorso', target: 2200 }, her: { name: 'Giulia', initial: 'G', description: 'Il suo percorso', target: 1800 } }, plans, checked: {}, manual: [], pantry: {}, favorites: ['bowl', 'salmon'] };
}
export const groceryKey = (name, unit) => `${name.toLocaleLowerCase('it')}|${unit}`;
export function groceriesFor(state, dates) {
  const items = new Map();
  for (const person of ['me', 'her']) for (const date of dates) for (const meal of state.plans[person][date] || []) {
    const recipe = recipeById(meal.recipe);
    for (const i of recipe.ingredients) {
      const key = groceryKey(i.name, i.unit);
      if (!items.has(key)) items.set(key, { ...i, key, amount: 0, people: {}, meals: [] });
      const item = items.get(key); const quantity = i.amount * meal.portion;
      item.amount += quantity; item.people[person] = (item.people[person] || 0) + quantity;
      item.meals.push({ person, date, name: recipe.name, amount: quantity });
    }
  }
  for (const manual of state.manual) items.set(manual.key, { ...manual, people: {}, meals: [] });
  return [...items.values()].sort((a, b) => a.category.localeCompare(b.category, 'it') || a.name.localeCompare(b.name, 'it'));
}
export function quantity(n, unit) { return `${new Intl.NumberFormat('it-IT', {maximumFractionDigits: unit === 'porzioni' ? 2 : 1}).format(n >= 100 ? Math.round(n) : n)} ${unit === 'porzioni' && n === 1 ? 'porzione' : unit}`; }
