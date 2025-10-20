import React from 'react';
import { GRADES, SUBJECTS } from '../constants';

interface FilterControlsProps {
  selectedGrade: string;
  setSelectedGrade: (grade: string) => void;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  selectedGrade,
  setSelectedGrade,
  selectedSubject,
  setSelectedSubject,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="grade-select" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
          Grade
        </label>
        <select
          id="grade-select"
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="custom-select block w-full pl-3 py-2 text-base border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100"
        >
          <option value="All">All Grades</option>
          {GRADES.map((grade) => (
            <option key={grade} value={grade}>{`Grade ${grade}`}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="subject-select" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
          Subject
        </label>
        <select
          id="subject-select"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="custom-select block w-full pl-3 py-2 text-base border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100"
        >
          <option value="All">All Subjects</option>
          {SUBJECTS.map((subject) => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterControls;