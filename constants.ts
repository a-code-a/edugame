
import { Minigame } from './types';

export const GRADES = Array.from({ length: 13 }, (_, i) => i + 1);
export const SUBJECTS = ['Math', 'Language Arts', 'Science', 'Social Studies', 'Art'];

export const INITIAL_MINIGAMES: Minigame[] = [];

export const SUBJECT_SHORTCUTS = [
    { id: 'All', label: 'Alle Fächer', value: 'All', gradient: 'from-slate-100 to-slate-200' },
    { id: 'Math', label: 'Mathe Labor', value: 'Math', gradient: 'from-sky-100 to-sky-200' },
    { id: 'Language Arts', label: 'Sprachatelier', value: 'Language Arts', gradient: 'from-pink-100 to-rose-200' },
    { id: 'Science', label: 'Science Lab', value: 'Science', gradient: 'from-green-100 to-emerald-200' },
    { id: 'Social Studies', label: 'Gesellschaft', value: 'Social Studies', gradient: 'from-amber-100 to-orange-200' },
    { id: 'Art', label: 'Kreativstudio', value: 'Art', gradient: 'from-purple-100 to-indigo-200' },
];

export const HERO_FILTERS = [
    { id: 'library', label: 'Bibliothek' },
    { id: 'templates', label: 'Vorlagen' },
    { id: 'ai', label: 'EduGame AI' },
];
