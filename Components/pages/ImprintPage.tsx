import React from 'react';

const ImprintPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Impressum</h1>

                    <div className="space-y-6 text-gray-600">
                        <section>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Angaben gemäß § 5 TMG</h2>
                            <p>[Name des Unternehmens / Inhabers]</p>
                            <p>[Straße Hausnummer]</p>
                            <p>[PLZ Ort]</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Kontakt</h2>
                            <p>Telefon: [Telefonnummer]</p>
                            <p>E-Mail: [E-Mail-Adresse]</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
                            <p>[Name]</p>
                            <p>[Anschrift]</p>
                        </section>

                        <section className="mt-8 pt-6 border-t border-gray-100 text-sm">
                            <p>Disclaimer: Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.</p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ImprintPage;
