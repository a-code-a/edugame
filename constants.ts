
import { Minigame } from './types';

export const GRADES = Array.from({ length: 13 }, (_, i) => i + 1);
export const SUBJECTS = ['Math', 'Language Arts', 'Science', 'Social Studies', 'Art'];

export const INITIAL_MINIGAMES: Minigame[] = [];

export const SUBJECT_DISPLAY_OPTIONS: Record<string, { label: string; icon: string; color: string; gradient?: string }> = {
    'All': { label: 'Alle Fächer', icon: '📚', color: 'bg-slate-100 text-slate-700', gradient: 'from-slate-100 to-slate-200' },
    'Math': { label: 'Mathe', icon: '🔢', color: 'bg-sky-100 text-sky-700', gradient: 'from-sky-100 to-sky-200' },
    'Language Arts': { label: 'Sprache', icon: '📖', color: 'bg-rose-100 text-rose-700', gradient: 'from-pink-100 to-rose-200' },
    'Science': { label: 'Wissenschaft', icon: '🔬', color: 'bg-emerald-100 text-emerald-700', gradient: 'from-green-100 to-emerald-200' },
    'Social Studies': { label: 'Gesellschaft', icon: '🌍', color: 'bg-amber-100 text-amber-700', gradient: 'from-amber-100 to-orange-200' },
    'Art': { label: 'Kunst', icon: '🎨', color: 'bg-purple-100 text-purple-700', gradient: 'from-purple-100 to-indigo-200' },
};

export const SUBJECT_SHORTCUTS = [
    { id: 'All', value: 'All', ...SUBJECT_DISPLAY_OPTIONS['All'] },
    { id: 'Math', value: 'Math', ...SUBJECT_DISPLAY_OPTIONS['Math'] },
    { id: 'Language Arts', value: 'Language Arts', ...SUBJECT_DISPLAY_OPTIONS['Language Arts'] },
    { id: 'Science', value: 'Science', ...SUBJECT_DISPLAY_OPTIONS['Science'] },
    { id: 'Social Studies', value: 'Social Studies', ...SUBJECT_DISPLAY_OPTIONS['Social Studies'] },
    { id: 'Art', value: 'Art', ...SUBJECT_DISPLAY_OPTIONS['Art'] },
];

export const HERO_FILTERS = [
    { id: 'library', label: 'Bibliothek' },
    { id: 'templates', label: 'Vorlagen' },
    { id: 'ai', label: 'EduGamer AI' },
];
