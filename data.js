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
