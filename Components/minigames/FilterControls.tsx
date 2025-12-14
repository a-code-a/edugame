import React, { useState, useRef, useEffect } from 'react';
import { GRADES, SUBJECTS, SUBJECT_DISPLAY_OPTIONS } from '../../constants';

interface FilterControlsProps {
  selectedGrade: string;
  setSelectedGrade: (grade: string) => void;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  sortOption: 'newest' | 'likes' | 'plays';
  setSortOption: (option: 'newest' | 'likes' | 'plays') => void;
}

interface DropdownOption {
  label: string;
  value: string;
}

const FilterDropdown: React.FC<{
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: any) => void;
  icon?: React.ReactNode;
}> = ({ label, value, options, onChange, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find((opt) => opt.value === value)?.label || value;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${isOpen
          ? 'border-purple-500 ring-2 ring-purple-100 bg-purple-50/50 text-purple-700'
          : 'border-slate-200 bg-white text-slate-700 hover:border-purple-300 hover:bg-slate-50'
          }`}
      >
        {icon && <span className="text-slate-400">{icon}</span>}
        <span className="text-sm font-medium">{label}: <span className="text-slate-900">{selectedLabel}</span></span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${value === option.value
                ? 'bg-purple-50 text-purple-700 font-medium'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const FilterControls: React.FC<FilterControlsProps> = ({
  selectedGrade,
  setSelectedGrade,
  selectedSubject,
  setSelectedSubject,
  sortOption,
  setSortOption,
}) => {
  const gradeOptions: DropdownOption[] = [
    { label: 'Alle Klassen', value: 'All' },
    ...GRADES.map((g) => ({ label: `Klasse ${g}`, value: g.toString() })),
  ];

  const subjectOptions: DropdownOption[] = [
    { label: 'Alle Fächer', value: 'All' },
    ...SUBJECTS.map((s) => ({ label: SUBJECT_DISPLAY_OPTIONS[s]?.label || s, value: s })),
  ];

  const sortOptions: DropdownOption[] = [
    { label: 'Neueste zuerst', value: 'newest' },
    { label: 'Beliebteste', value: 'likes' },
    { label: 'Meistgespielt', value: 'plays' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-2 rounded-2xl border border-slate-200/60 shadow-sm">
      <div className="flex flex-wrap gap-3">
        <FilterDropdown
          label="Klasse"
          value={selectedGrade}
          options={gradeOptions}
          onChange={setSelectedGrade}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
        <FilterDropdown
          label="Fach"
          value={selectedSubject}
          options={subjectOptions}
          onChange={setSelectedSubject}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
        />
      </div>

      <div className="w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
        <FilterDropdown
          label="Sortierung"
          value={sortOption}
          options={sortOptions}
          onChange={setSortOption}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          }
        />
      </div>
    </div>
  );
};

export default FilterControls;