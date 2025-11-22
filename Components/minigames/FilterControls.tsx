import React from 'react';
import { GRADES, SUBJECTS } from '../../constants';

interface FilterControlsProps {
  selectedGrade: string;
  setSelectedGrade: (grade: string) => void;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
}

const FilterPill: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive
        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
        : 'bg-white text-slate-600 border border-slate-200 hover:border-purple-300 hover:bg-purple-50'
      }`}
  >
    {label}
  </button>
);

const FilterControls: React.FC<FilterControlsProps> = ({
  selectedGrade,
  setSelectedGrade,
  selectedSubject,
  setSelectedSubject,
}) => {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Klassenstufe
        </p>
        <div className="flex flex-wrap gap-2">
          <FilterPill
            label="Alle"
            isActive={selectedGrade === 'All'}
            onClick={() => setSelectedGrade('All')}
          />
          {GRADES.map((grade) => {
            const value = grade.toString();
            return (
              <FilterPill
                key={value}
                label={`Klasse ${value}`}
                isActive={selectedGrade === value}
                onClick={() => setSelectedGrade(value)}
              />
            );
          })}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Fachbereich
        </p>
        <div className="flex flex-wrap gap-2">
          <FilterPill
            label="Alle"
            isActive={selectedSubject === 'All'}
            onClick={() => setSelectedSubject('All')}
          />
          {SUBJECTS.map((subject) => (
            <FilterPill
              key={subject}
              label={subject}
              isActive={selectedSubject === subject}
              onClick={() => setSelectedSubject(subject)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterControls;