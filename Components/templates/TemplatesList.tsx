import React from 'react';

export const PROMPT_TEMPLATES = [
    {
        id: 't1',
        title: 'Mathe-Quiz',
        description: 'Ein interaktives Quiz für Grundschüler zum Üben von Addition und Subtraktion.',
        prompt: 'Erstelle ein Mathe-Quiz für die 2. Klasse. Es soll 10 Fragen zu Addition und Subtraktion im Zahlenraum bis 100 enthalten. Das Design soll bunt und freundlich sein.'
    },
    {
        id: 't2',
        title: 'Vokabel-Trainer',
        description: 'Ein Memory-Spiel zum Lernen von englischen Vokabeln.',
        prompt: 'Erstelle ein Memory-Spiel zum Vokabellernen. Thema: Tiere. Es soll Paare aus deutschem und englischem Wort geben. Wenn ein Paar gefunden wurde, soll der Tierlaut abgespielt werden (optional).'
    },
    {
        id: 't3',
        title: 'Geschichts-Zeitstrahl',
        description: 'Eine interaktive Zeitleiste zu wichtigen Ereignissen.',
        prompt: 'Erstelle eine interaktive Zeitleiste für den Geschichtsunterricht. Thema: Das Römische Reich. Nutzer sollen auf Ereignisse klicken können, um mehr Details zu erfahren.'
    },
    {
        id: 't4',
        title: 'Physik-Simulation',
        description: 'Eine einfache Simulation zur Schwerkraft.',
        prompt: 'Erstelle eine Physik-Simulation, in der Schüler mit Schwerkraft experimentieren können. Man soll Bälle fallen lassen und sehen, wie sie abprallen. Füge Regler für Schwerkraft und Elastizität hinzu.'
    }
];

interface TemplatesListProps {
    onUseTemplate?: (prompt: string) => void;
}

const TemplatesList: React.FC<TemplatesListProps> = ({ onUseTemplate }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROMPT_TEMPLATES.map((template) => (
                <div key={template.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{template.title}</h3>
                    <p className="text-slate-600 text-sm mb-4">{template.description}</p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                        <p className="text-xs text-slate-500 font-mono">{template.prompt}</p>
                    </div>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(template.prompt);
                            if (onUseTemplate) onUseTemplate(template.prompt);
                        }}
                        className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                    >
                        Prompt kopieren
                    </button>
                </div>
            ))}
        </div>
    );
};

export default TemplatesList;
