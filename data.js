// ===== Subjects Data =====
const subjects = [
  {
    id: "math",
    title: "Mathematics",
    icon: "📐",
    description: "From basic arithmetic to algebra, geometry and problem-solving strategies.",
    tag: "Core",
    lessons: [
      { id: "m1", title: "Numbers & Place Value", duration: "12 min" },
      { id: "m2", title: "Fractions & Decimals", duration: "15 min" },
      { id: "m3", title: "Basic Algebra", duration: "18 min" },
      { id: "m4", title: "Geometry Essentials", duration: "14 min" }
    ]
  },
  {
    id: "science",
    title: "Science",
    icon: "🔬",
    description: "Biology, chemistry, physics and earth science made clear and exciting.",
    tag: "Core",
    lessons: [
      { id: "s1", title: "The Scientific Method", duration: "10 min" },
      { id: "s2", title: "Cells & Living Things", duration: "16 min" },
      { id: "s3", title: "Forces & Motion", duration: "14 min" },
      { id: "s4", title: "Earth & Space", duration: "15 min" }
    ]
  },
  {
    id: "history",
    title: "History",
    icon: "🏛️",
    description: "Explore ancient civilizations, world events and the stories that shaped us.",
    tag: "Humanities",
    lessons: [
      { id: "h1", title: "Ancient Civilizations", duration: "18 min" },
      { id: "h2", title: "The Middle Ages", duration: "14 min" },
      { id: "h3", title: "Age of Exploration", duration: "12 min" },
      { id: "h4", title: "Modern World History", duration: "16 min" }
    ]
  },
  {
    id: "languages",
    title: "Languages",
    icon: "🗣️",
    description: "Build vocabulary, grammar and communication skills in multiple languages.",
    tag: "Skills",
    lessons: [
      { id: "l1", title: "English Essentials", duration: "15 min" },
      { id: "l2", title: "Basic Spanish", duration: "14 min" },
      { id: "l3", title: "French for Beginners", duration: "13 min" },
      { id: "l4", title: "Writing Clearly", duration: "12 min" }
    ]
  },
  {
    id: "tech",
    title: "Technology",
    icon: "💻",
    description: "Coding basics, digital literacy, AI concepts and how the internet works.",
    tag: "STEM",
    lessons: [
      { id: "t1", title: "How Computers Work", duration: "12 min" },
      { id: "t2", title: "Introduction to Coding", duration: "20 min" },
      { id: "t3", title: "Internet & Safety", duration: "11 min" },
      { id: "t4", title: "What is Artificial Intelligence?", duration: "15 min" }
    ]
  },
  {
    id: "arts",
    title: "Arts & Creativity",
    icon: "🎨",
    description: "Drawing, music fundamentals, design thinking and creative expression.",
    tag: "Creative",
    lessons: [
      { id: "a1", title: "Elements of Art", duration: "13 min" },
      { id: "a2", title: "Music Basics", duration: "14 min" },
      { id: "a3", title: "Design Thinking", duration: "12 min" },
      { id: "a4", title: "Creative Writing", duration: "15 min" }
    ]
  }
];

// ===== Quiz Data =====
const quizzes = {
  math: {
    title: "Math Basics",
    questions: [
      {
        q: "What is 15 + 27?",
        options: ["42", "41", "43", "40"],
        answer: 0
      },
      {
        q: "Which fraction is equivalent to 1/2?",
        options: ["2/5", "3/6", "4/9", "1/3"],
        answer: 1
      },
      {
        q: "What is the perimeter of a square with side 5?",
        options: ["10", "15", "20", "25"],
        answer: 2
      },
      {
        q: "Solve: 3x = 12. What is x?",
        options: ["2", "3", "4", "6"],
        answer: 2
      }
    ]
  },
  science: {
    title: "Science Fundamentals",
    questions: [
      {
        q: "What is the chemical symbol for water?",
        options: ["O2", "H2O", "CO2", "NaCl"],
        answer: 1
      },
      {
        q: "Which planet is known as the Red Planet?",
        options: ["Venus", "Jupiter", "Mars", "Saturn"],
        answer: 2
      },
      {
        q: "What force keeps us on the ground?",
        options: ["Magnetism", "Friction", "Gravity", "Electricity"],
        answer: 2
      },
      {
        q: "What is the basic unit of life?",
        options: ["Atom", "Cell", "Molecule", "Tissue"],
        answer: 1
      }
    ]
  },
  history: {
    title: "World History",
    questions: [
      {
        q: "Which ancient civilization built the pyramids of Giza?",
        options: ["Romans", "Greeks", "Egyptians", "Mayans"],
        answer: 2
      },
      {
        q: "In which year did World War II end?",
        options: ["1943", "1945", "1947", "1950"],
        answer: 1
      },
      {
        q: "Who was the first person to walk on the Moon?",
        options: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "John Glenn"],
        answer: 2
      },
      {
        q: "The Renaissance began in which country?",
        options: ["France", "England", "Italy", "Spain"],
        answer: 2
      }
    ]
  },
  tech: {
    title: "Technology & Coding",
    questions: [
      {
        q: "What does HTML stand for?",
        options: [
          "Hyper Text Markup Language",
          "High Tech Modern Language",
          "Home Tool Markup Language",
          "Hyperlinks and Text Markup Language"
        ],
        answer: 0
      },
      {
        q: "Which of these is a programming language?",
        options: ["HTTP", "Python", "USB", "Wi-Fi"],
        answer: 1
      },
      {
        q: "What does CPU stand for?",
        options: [
          "Central Processing Unit",
          "Computer Personal Unit",
          "Central Program Utility",
          "Control Processing Unit"
        ],
        answer: 0
      },
      {
        q: "What is the main purpose of a firewall?",
        options: [
          "Speed up the internet",
          "Protect against unauthorized access",
          "Store passwords",
          "Create websites"
        ],
        answer: 1
      }
    ]
  }
};

// ===== Lesson Content =====
const lessonContent = {
  m1: "Every digit has a value based on its position. In 3,482 the 3 is in the thousands place (3,000), the 4 is in the hundreds (400), the 8 is in the tens (80) and the 2 is in the ones (2). Add them up: 3,000 + 400 + 80 + 2. Moving a digit one place to the left makes it ten times larger.",
  m2: "A fraction shows part of a whole: 3/4 means 3 out of 4 equal parts. A decimal shows the same idea using place value: 3/4 = 0.75. To convert a fraction, divide the top number by the bottom number. Fractions that look different can be equal: 1/2, 2/4 and 3/6 all equal 0.5.",
  m3: "Algebra uses letters for unknown numbers. To solve 3x = 12, do the same thing to both sides: divide both by 3 to get x = 4. To solve x + 5 = 12, subtract 5 from both sides to get x = 7. Check your answer by putting it back into the equation.",
  m4: "Geometry studies shapes. Perimeter is the distance around a shape: a square with sides of 5 has a perimeter of 4 × 5 = 20. Area is the space inside: a rectangle's area is length × width. The angles inside any triangle always add up to 180 degrees.",
  s1: "Scientists answer questions with a repeatable process. Ask a question, research it, form a hypothesis (a testable guess), run an experiment, record the results, and draw a conclusion. A fair test changes only one thing at a time. If the results do not support your hypothesis, that is still useful: it tells you what to try next.",
  s2: "The cell is the basic unit of life, and every living thing is made of one or more cells. Animal and plant cells both have a nucleus that holds genetic information and a membrane around the outside. Plant cells also have a rigid cell wall and chloroplasts, which capture sunlight for photosynthesis.",
  s3: "A force is a push or a pull. Gravity pulls objects toward Earth, and friction slows things that slide against each other. Newton's first law says an object keeps doing what it is doing, staying still or moving steadily, unless a force acts on it. A bigger force on the same object causes a bigger change in its motion.",
  s4: "Earth is the third planet from the Sun. It spins once a day, giving us day and night, and orbits the Sun once a year. Its axis is tilted, which causes the seasons. The Moon orbits Earth roughly once a month, and its pull on the oceans causes tides.",
  h1: "Early civilizations grew near rivers where farming was easy. Egypt flourished along the Nile, Mesopotamia between the Tigris and Euphrates, and the Indus Valley civilization along the Indus River. They developed cities, writing, laws and trade. Ancient Greece and Rome later shaped ideas about government, law and architecture.",
  h2: "The Middle Ages in Europe lasted roughly from the 400s to the 1400s CE. Most people were farmers living under local lords in a system called feudalism. Castles, monasteries and walled towns were centers of power and learning. The Black Death in the 1300s killed a large share of Europe's population and changed society.",
  h3: "From the 1400s, European sailors searched for new trade routes by sea. Better ships, maps and navigation tools made long voyages possible. In 1492 Christopher Columbus reached the Americas, and in 1498 Vasco da Gama sailed to India. These voyages connected continents and spread goods and ideas, but they also led to colonization and great suffering for many peoples.",
  h4: "The 1900s were shaped by two world wars: World War I (1914–1918) and World War II (1939–1945). Afterward, the United Nations was founded to help countries work together. Technology advanced quickly, and air travel, computers and the internet changed how people live. In 1969, Neil Armstrong became the first person to walk on the Moon.",
  l1: "A sentence needs a subject (who or what) and a verb (the action): 'Birds sing.' Nouns name things, verbs show actions, and adjectives describe nouns. Match your verb to your subject: 'she walks', 'they walk'. Read your writing aloud to catch mistakes your eyes miss.",
  l2: "Start with these words: hola (hello), buenos días (good morning), por favor (please), gracias (thank you), adiós (goodbye). Spanish words are pronounced the way they are spelled, which makes reading aloud easier. Every noun is masculine or feminine: el libro (the book), la casa (the house).",
  l3: "Try these first words: bonjour (hello), s'il vous plaît (please), merci (thank you), au revoir (goodbye). Like Spanish, French nouns are masculine or feminine: le livre (the book), la maison (the house). Many letters at the end of a French word are silent, so listen to how words sound, not only how they look.",
  l4: "Clear writing starts with one main idea per paragraph. Use short sentences and everyday words. Prefer the active voice: 'The team finished the project' is clearer than 'The project was finished by the team.' Cut words that add nothing, then read it again as if you were the reader.",
  t1: "A computer takes input (keyboard, mouse, touch), processes it, and gives output (screen, sound). The CPU is the processor that carries out instructions. Memory (RAM) holds the data in use right now, and storage keeps your files when the power is off. Underneath, everything is stored as 1s and 0s, called binary.",
  t2: "Code is a set of instructions a computer follows. Variables store values, conditions (if) make choices, and loops repeat actions. For example: if the score is above 50, show 'Pass'. Otherwise, show 'Try again'. Python and JavaScript are popular first languages. Start small and practice a little every day.",
  t3: "The internet is a worldwide network of connected computers, and websites reach your device through it. To stay safe, use a long, unique password for each account, turn on two-factor authentication, and be careful with links in unexpected messages. Phishing tries to trick you into entering your details on a fake site.",
  t4: "Artificial intelligence is software that performs tasks that normally need human thinking, such as recognizing speech or writing text. Many modern systems use machine learning, where a program finds patterns in large amounts of example data instead of following hand-written rules. AI can be wrong, so check important facts and protect your private information.",
  a1: "Artists build images from seven elements: line, shape, form, color, value, texture and space. Value means how light or dark something is. Warm colors like red and orange feel energetic, while cool colors like blue and green feel calm. Try drawing one object using only lines, then again using only shading.",
  a2: "Music is built from rhythm, melody and harmony. Rhythm is the pattern of beats. A melody is a sequence of notes you can hum. Harmony is notes played together. A scale is a set of notes in order, such as the C major scale: C, D, E, F, G, A, B. Clap a steady beat, then add a melody on top.",
  a3: "Design thinking solves problems by starting with people. The steps are: empathize with the people you are designing for, define the problem, come up with many ideas, build a quick prototype, and test it. Expect to repeat steps. Early, rough versions teach you the most.",
  a4: "Stories need a character who wants something and an obstacle in the way. Show details through the senses instead of just telling: not 'it was cold' but 'her breath hung in the air.' Write a messy first draft without stopping, then revise. Reading widely is the best way to improve your own writing."
};
