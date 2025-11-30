import React from 'react';
import VibeCoder from '../ai/VibeCoder';
import { Minigame } from '../../types';

interface StudioPageProps {
    onGameCreated: (game: Minigame) => void;
    onGameSaved: (game: Minigame) => void;
}

const StudioPage: React.FC<StudioPageProps> = ({ onGameCreated, onGameSaved }) => {
    return (
        <div className="px-4 sm:px-8 lg:px-16 py-8 max-w-[1600px] mx-auto">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-900 mb-6">KI-Studio</h1>
                <p className="text-slate-600 mb-8">
                    Erstelle deine eigenen Lernspiele mit der Kraft der künstlichen Intelligenz.
                    Beschreibe einfach, was du möchtest, und der Vibe Coder erledigt den Rest.
                </p>
                <VibeCoder onGameCreated={onGameCreated} onGameSaved={onGameSaved} />
            </div>
        </div>
    );
};

export default StudioPage;
