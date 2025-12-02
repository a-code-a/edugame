import React from 'react';
import TemplatesList from '../templates/TemplatesList';

const TemplatesPage: React.FC = () => {
    return (
        <div className="px-4 sm:px-8 lg:px-16 py-8 max-w-[1600px] mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Vorlagen</h1>
            <p className="text-slate-600 mb-8">
                Nutze diese Vorlagen, um schnell neue Lernspiele zu erstellen. Kopiere einfach den Prompt in das KI-Studio.
            </p>

            <TemplatesList />
        </div>
    );
};

export default TemplatesPage;
