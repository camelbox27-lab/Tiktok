export interface PrebuiltSentence {
  germanSentence: string;
  isCorrect: boolean;
  correctVersion?: string;
  level: 'A1' | 'A2';
  category: string;
}

const germanContent: PrebuiltSentence[] = [
  // === GREETINGS / SELAMLAŞMA ===
  { germanSentence: 'Guten Morgen! Wie geht es Ihnen?', isCorrect: true, level: 'A1', category: 'Begrüßung' },
  { germanSentence: 'Guten Morgen! Wie geht es dir?', isCorrect: true, level: 'A1', category: 'Begrüßung' },
  { germanSentence: 'Guten Tag! Ich heiße Anna.', isCorrect: true, level: 'A1', category: 'Begrüßung' },
  { germanSentence: 'Guten Abend! Wie gehts?', isCorrect: true, level: 'A1', category: 'Begrüßung' },
  { germanSentence: 'Ich bin gut, danke.', isCorrect: false, correctVersion: 'Mir geht es gut, danke.', level: 'A1', category: 'Begrüßung' },
  { germanSentence: 'Tschüss! Bis morgen!', isCorrect: true, level: 'A1', category: 'Begrüßung' },

  // === ARTICLES / ARTIKELLER (der/die/das) ===
  { germanSentence: 'Der Hund ist groß.', isCorrect: true, level: 'A1', category: 'Artikel' },
  { germanSentence: 'Die Katze schläft.', isCorrect: true, level: 'A1', category: 'Artikel' },
  { germanSentence: 'Das Kind spielt im Garten.', isCorrect: true, level: 'A1', category: 'Artikel' },
  { germanSentence: 'Die Sonne scheint heute.', isCorrect: true, level: 'A1', category: 'Artikel' },
  { germanSentence: 'Der Mond ist hell.', isCorrect: true, level: 'A1', category: 'Artikel' },
  { germanSentence: 'Das Tisch ist braun.', isCorrect: false, correctVersion: 'Der Tisch ist braun.', level: 'A1', category: 'Artikel' },
  { germanSentence: 'Die Stuhl ist neu.', isCorrect: false, correctVersion: 'Der Stuhl ist neu.', level: 'A1', category: 'Artikel' },
  { germanSentence: 'Der Buch ist interessant.', isCorrect: false, correctVersion: 'Das Buch ist interessant.', level: 'A1', category: 'Artikel' },
  { germanSentence: 'Das Blume ist schön.', isCorrect: false, correctVersion: 'Die Blume ist schön.', level: 'A1', category: 'Artikel' },
  { germanSentence: 'Der Auto ist schnell.', isCorrect: false, correctVersion: 'Das Auto ist schnell.', level: 'A1', category: 'Artikel' },

  // === BASIC VERBS / TEMEL FİİLLER ===
  { germanSentence: 'Ich gehe in die Schule.', isCorrect: true, level: 'A1', category: 'Verben' },
  { germanSentence: 'Er trinkt Kaffee.', isCorrect: true, level: 'A1', category: 'Verben' },
  { germanSentence: 'Wir essen zusammen.', isCorrect: true, level: 'A1', category: 'Verben' },
  { germanSentence: 'Sie liest ein Buch.', isCorrect: true, level: 'A1', category: 'Verben' },
  { germanSentence: 'Ich habe Hunger.', isCorrect: true, level: 'A1', category: 'Verben' },
  { germanSentence: 'Er gehst zur Arbeit.', isCorrect: false, correctVersion: 'Er geht zur Arbeit.', level: 'A1', category: 'Verben' },
  { germanSentence: 'Ich trinken Wasser.', isCorrect: false, correctVersion: 'Ich trinke Wasser.', level: 'A1', category: 'Verben' },
  { germanSentence: 'Du esst einen Apfel.', isCorrect: false, correctVersion: 'Du isst einen Apfel.', level: 'A1', category: 'Verben' },
  { germanSentence: 'Sie schreibt einen Brief.', isCorrect: true, level: 'A2', category: 'Verben' },
  { germanSentence: 'Wir spielen Fußball im Park.', isCorrect: true, level: 'A1', category: 'Verben' },

  // === NUMBERS / SAYILAR ===
  { germanSentence: 'Ich bin zwanzig Jahre alt.', isCorrect: true, level: 'A1', category: 'Zahlen' },
  { germanSentence: 'Es gibt drei Äpfel auf dem Tisch.', isCorrect: true, level: 'A1', category: 'Zahlen' },
  { germanSentence: 'Wir sind fünf Personen.', isCorrect: true, level: 'A1', category: 'Zahlen' },
  { germanSentence: 'Ich habe zwei Geschwister.', isCorrect: true, level: 'A1', category: 'Zahlen' },
  { germanSentence: 'Das kostet zehn Euro.', isCorrect: true, level: 'A1', category: 'Zahlen' },

  // === COLORS / RENKLER ===
  { germanSentence: 'Der Himmel ist blau.', isCorrect: true, level: 'A1', category: 'Farben' },
  { germanSentence: 'Die Tomate ist rot.', isCorrect: true, level: 'A1', category: 'Farben' },
  { germanSentence: 'Das Gras ist grün.', isCorrect: true, level: 'A1', category: 'Farben' },
  { germanSentence: 'Mein Auto ist schwarz.', isCorrect: true, level: 'A1', category: 'Farben' },
  { germanSentence: 'Die Banane ist gelb.', isCorrect: true, level: 'A1', category: 'Farben' },
  { germanSentence: 'Der Schnee ist weiß.', isCorrect: true, level: 'A1', category: 'Farben' },

  // === FAMILY / AİLE ===
  { germanSentence: 'Meine Mutter kocht gern.', isCorrect: true, level: 'A1', category: 'Familie' },
  { germanSentence: 'Mein Vater arbeitet im Büro.', isCorrect: true, level: 'A1', category: 'Familie' },
  { germanSentence: 'Ich habe eine Schwester und einen Bruder.', isCorrect: true, level: 'A1', category: 'Familie' },
  { germanSentence: 'Meine Großmutter ist 70 Jahre alt.', isCorrect: true, level: 'A1', category: 'Familie' },
  { germanSentence: 'Mein Bruder geht in die Universität.', isCorrect: true, level: 'A2', category: 'Familie' },
  { germanSentence: 'Meine Vater ist Arzt.', isCorrect: false, correctVersion: 'Mein Vater ist Arzt.', level: 'A1', category: 'Familie' },
  { germanSentence: 'Mein Schwester ist jünger als ich.', isCorrect: false, correctVersion: 'Meine Schwester ist jünger als ich.', level: 'A1', category: 'Familie' },

  // === FOOD / YEMEK ===
  { germanSentence: 'Ich esse gern Pizza.', isCorrect: true, level: 'A1', category: 'Essen' },
  { germanSentence: 'Zum Frühstück trinke ich Tee.', isCorrect: true, level: 'A1', category: 'Essen' },
  { germanSentence: 'Das Brot ist frisch.', isCorrect: true, level: 'A1', category: 'Essen' },
  { germanSentence: 'Ich möchte einen Kaffee, bitte.', isCorrect: true, level: 'A1', category: 'Essen' },
  { germanSentence: 'Die Suppe schmeckt gut.', isCorrect: true, level: 'A1', category: 'Essen' },
  { germanSentence: 'Ich esse gern Obst und Gemüse.', isCorrect: true, level: 'A2', category: 'Essen' },
  { germanSentence: 'Ich möchte ein Glas Wasser.', isCorrect: true, level: 'A1', category: 'Essen' },

  // === DAILY ROUTINES / GÜNLÜK RUTINLER ===
  { germanSentence: 'Ich stehe um 7 Uhr auf.', isCorrect: true, level: 'A1', category: 'Alltag' },
  { germanSentence: 'Um 8 Uhr frühstücke ich.', isCorrect: true, level: 'A1', category: 'Alltag' },
  { germanSentence: 'Ich gehe um 9 Uhr zur Arbeit.', isCorrect: true, level: 'A1', category: 'Alltag' },
  { germanSentence: 'Abends sehe ich fern.', isCorrect: true, level: 'A1', category: 'Alltag' },
  { germanSentence: 'Ich gehe um 23 Uhr ins Bett.', isCorrect: true, level: 'A1', category: 'Alltag' },
  { germanSentence: 'Am Wochenende schlafe ich lange.', isCorrect: true, level: 'A2', category: 'Alltag' },
  { germanSentence: 'Ich dusche mich jeden Morgen.', isCorrect: true, level: 'A2', category: 'Alltag' },
  { germanSentence: 'Ich stehe um 7 Uhr ein.', isCorrect: false, correctVersion: 'Ich stehe um 7 Uhr auf.', level: 'A1', category: 'Alltag' },

  // === WEATHER / HAVA DURUMU ===
  { germanSentence: 'Heute ist es sonnig.', isCorrect: true, level: 'A1', category: 'Wetter' },
  { germanSentence: 'Es regnet seit gestern.', isCorrect: true, level: 'A2', category: 'Wetter' },
  { germanSentence: 'Im Winter schneit es oft.', isCorrect: true, level: 'A2', category: 'Wetter' },
  { germanSentence: 'Es ist kalt draußen.', isCorrect: true, level: 'A1', category: 'Wetter' },

  // === A2 LEVEL - MORE COMPLEX ===
  { germanSentence: 'Ich bin gestern ins Kino gegangen.', isCorrect: true, level: 'A2', category: 'Perfekt' },
  { germanSentence: 'Wir haben gestern Fußball gespielt.', isCorrect: true, level: 'A2', category: 'Perfekt' },
  { germanSentence: 'Ich habe gestern ins Kino gegangen.', isCorrect: false, correctVersion: 'Ich bin gestern ins Kino gegangen.', level: 'A2', category: 'Perfekt' },
  { germanSentence: 'Er ist nach Berlin gefahren.', isCorrect: true, level: 'A2', category: 'Perfekt' },
  { germanSentence: 'Sie hat einen Kuchen gebacken.', isCorrect: true, level: 'A2', category: 'Perfekt' },
  { germanSentence: 'Ich bin um 6 Uhr aufgestanden.', isCorrect: true, level: 'A2', category: 'Perfekt' },
  { germanSentence: 'Ich habe um 6 Uhr aufgestanden.', isCorrect: false, correctVersion: 'Ich bin um 6 Uhr aufgestanden.', level: 'A2', category: 'Perfekt' },

  // === MODAL VERBS / MODAL FİİLLER ===
  { germanSentence: 'Ich kann Deutsch sprechen.', isCorrect: true, level: 'A2', category: 'Modalverben' },
  { germanSentence: 'Du musst deine Hausaufgaben machen.', isCorrect: true, level: 'A2', category: 'Modalverben' },
  { germanSentence: 'Wir wollen ins Kino gehen.', isCorrect: true, level: 'A2', category: 'Modalverben' },
  { germanSentence: 'Er kann gut schwimmen.', isCorrect: true, level: 'A1', category: 'Modalverben' },
  { germanSentence: 'Ich muss zum Arzt gehe.', isCorrect: false, correctVersion: 'Ich muss zum Arzt gehen.', level: 'A2', category: 'Modalverben' },

  // === PREPOSITIONS / EDATLAR ===
  { germanSentence: 'Das Buch liegt auf dem Tisch.', isCorrect: true, level: 'A2', category: 'Präpositionen' },
  { germanSentence: 'Die Katze sitzt unter dem Stuhl.', isCorrect: true, level: 'A2', category: 'Präpositionen' },
  { germanSentence: 'Ich gehe in den Supermarkt.', isCorrect: true, level: 'A2', category: 'Präpositionen' },
  { germanSentence: 'Das Bild hängt an der Wand.', isCorrect: true, level: 'A2', category: 'Präpositionen' },
  { germanSentence: 'Ich gehe in dem Supermarkt.', isCorrect: false, correctVersion: 'Ich gehe in den Supermarkt.', level: 'A2', category: 'Präpositionen' },
];

export default germanContent;
