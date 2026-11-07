import React, {useEffect, useRef} from 'react';
import {ChevronLeft, ChevronRight, Check, Plus} from 'lucide-react';
import {addDays, dateKey, weekFor} from './data';

export const today = dateKey(new Date());
export const formatDate = (date, options) => new Intl.DateTimeFormat('it-IT',options).format(new Date(date+'T12:00:00Z'));
export const capitalize = s=>s[0].toUpperCase()+s.slice(1);
export const shortNumber = n=>new Intl.NumberFormat('it-IT',{maximumFractionDigits:1}).format(n);
export function Photo({recipe,className=''}) {return <div role="img" aria-label={recipe.name} className={`food-photo photo-${recipe.photo} ${className}`}/>;}
export function Avatar({profile,person}) {return <span aria-hidden="true" className={`avatar ${person}`}>{profile.initial}</span>;}
export function Heading({eyebrow,title,description,action}) {return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;}
export function Empty({icon:Icon,title,text,action}) {return <div className="empty-state"><span className="empty-icon"><Icon size={25}/></span><h3>{title}</h3><p>{text}</p>{action}</div>;}
export function Progress({value,max,label}) {return <div className="progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max || 1} aria-valuenow={Math.min(value,max || 1)}><span style={{width:`${max?Math.min(100,value/max*100):0}%`}}/></div>;}
export function CheckButton({checked,label,onClick,disabled=false}) {return <button role="checkbox" aria-label={label} aria-checked={checked} className={`check-button ${checked?'checked':''}`} onClick={onClick} disabled={disabled}>{checked&&<Check size={14}/>}</button>;}
export function WeekPicker({date,onChange,counts={}}) {
  const week=weekFor(date),ref=useRef();
  useEffect(()=>{ref.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({block:'nearest',inline:'center'});},[date]);
  return <section className="week-picker" aria-label="Selezione giorno"><div className="week-toolbar"><strong>{capitalize(formatDate(date,{month:'long',year:'numeric'}))}</strong><div><button className="icon-button" aria-label="Settimana precedente" onClick={()=>onChange(addDays(date,-7))}><ChevronLeft size={18}/></button><span>{formatDate(week[0],{day:'numeric'})}–{formatDate(week[6],{day:'numeric',month:'short'})}</span><button className="icon-button" aria-label="Settimana successiva" onClick={()=>onChange(addDays(date,7))}><ChevronRight size={18}/></button><button className="button subtle small" onClick={()=>onChange(today)}>Oggi</button></div></div><div className="week-days" ref={ref}>{week.map(d=><button key={d} onClick={()=>onChange(d)} aria-label={formatDate(d,{weekday:'long',day:'numeric',month:'long'})} aria-pressed={date===d} className={`${date===d?'selected':''} ${d===today?'today':''}`}><span>{formatDate(d,{weekday:'short'})}</span><strong>{formatDate(d,{day:'numeric'})}</strong><small>{counts[d]!==undefined?`${counts[d]} ${counts[d]===1?'pasto':'pasti'}`:d===today?'Oggi':' '}</small></button>)}</div></section>;
}
export function AddButton({onClick,children='Aggiungi'}) {return <button className="button primary" onClick={onClick}><Plus size={16}/>{children}</button>;}
