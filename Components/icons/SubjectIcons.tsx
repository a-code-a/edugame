import React from 'react';

export const SubjectIcons: Record<string, React.ReactNode> = {
    All: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10S2 17.514 2 12 6.486 2 12 2Zm0 2c-4.418 0-8 3.582-8 8 0 1.321.323 2.568.894 3.662L15.662 6.894A7.962 7.962 0 0 0 12 4Zm7.106 4.338L8.338 19.106A7.962 7.962 0 0 0 12 20c4.418 0 8-3.582 8-8 0-1.321-.323-2.568-.894-3.662Z" />
        </svg>
    ),
    Math: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6h15M4.5 12h15M4.5 18h7.5m6 0h-3" />
        </svg>
    ),
    'Language Arts': (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
        </svg>
    ),
    Science: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75v5.17a4 4 0 00.8 2.4l2.2 2.933a1 1 0 001.5 0l2.2-2.933a4 4 0 00.8-2.4V6.75m-7.5 0h7.5M8.25 6.75h7.5" />
        </svg>
    ),
    'Social Studies': (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6a4 4 0 110 8 4 4 0 010-8zm0 10c-4.418 0-8 1.79-8 4v1h16v-1c0-2.21-3.582-4-8-4z" />
        </svg>
    ),
    Art: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5a7 7 0 00-7 7 7 7 0 007 7h6a5 5 0 005-5 5 5 0 00-5-5H9zm0 0a3 3 0 013-3" />
        </svg>
    ),
};
