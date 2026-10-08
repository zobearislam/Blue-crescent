# Blue Crescent 🌙

Lessons > subjects > chapters, with Duolingo-style quizzes. Baby blue and baby red checkerboard everywhere.

## Adding folders in the repo

Just create them. No other file needs editing:

```
lessons/
└── history/                 ← subject folder
    ├── subject.json         ← optional: {"name": "History", "icon": "📜"}
    ├── 01-egypt/            ← chapter folder
    │   └── quiz.json
    └── 02-rome/
        └── quiz.json
```

- Folder names become the display names ("ancient-rome" → "Ancient rome"). A leading number sets the order and is hidden ("01-egypt" → "Egypt").
- `subject.json` is optional and sets a nicer name and emoji.
- A new folder appears on the site within a couple of minutes of pushing (GitHub Pages rebuild plus a short cache).
- `lessons/lessons.json` is optional now. Use it only to override names or icons.
- Git does not keep empty folders, so a chapter folder needs at least its `quiz.json`.

The site finds folders through GitHub's public API, so it works when hosted on `<user>.github.io`.

You can also add subjects, chapters and quizzes from the site itself (the "+" buttons). Those are saved on that device only.

## quiz.json

```json
{
  "title": "Optional title",
  "info": ["Optional intro paragraph.", "Another one. Delete this field to skip the intro."],
  "questions": [
    { "q": "Pick one", "options": ["A", "B", "C"], "answer": 1, "explain": "Optional" },
    { "q": "Type it", "type": "text", "answer": ["accepted", "also accepted"] }
  ]
}
```

`answer` for multiple choice is the position of the right option, starting at 0.
Three hearts per run. Wrong answers come back at the end.

Open the site through GitHub Pages (or any web server). Opening `index.html` straight from disk blocks loading the JSON files.
