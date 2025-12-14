import React from 'react';

const PrivacyPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Datenschutzerklärung (Privacy Policy)</h1>

                    <div className="space-y-6 text-gray-600">
                        <section>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">1. Datenschutz auf einen Blick</h2>
                            <p className="mb-2"><strong>Allgemeine Hinweise</strong></p>
                            <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">2. Datenerfassung auf dieser Website</h2>
                            <p className="mb-2"><strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong></p>
                            <p>Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.</p>

                            <p className="mt-4 mb-2"><strong>Firebase Authentication & Database</strong></p>
                            <p>Wir nutzen Google Firebase zur Authentifizierung und Datenspeicherung. Ihre E-Mail-Adresse und Spiele-Daten werden sicher auf Google-Servern verarbeitet.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">3. Ihre Rechte</h2>
                            <p>Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen.</p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPage;
