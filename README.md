# Blue Crescent 🌙

Lessons > subjects > chapters > subchapters, with Duolingo-style quizzes. A big subject can also hold sub-subjects at the end of its list. Baby blue and baby red checkerboard everywhere.

## Adding folders in the repo

Just create them. No other file needs editing:

```
lessons/
└── science/                 ← subject folder
    ├── subject.json         ← optional: {"name": "Science", "icon": "🔬"}
    ├── animals/             ← chapter folder
    │   ├── quiz.json
    │   └── groups/          ← subchapter folder
    │       └── quiz.json
    └── zz-astrology-and-astronomy/   ← sub-subject (listed after chapters)
        ├── subsubject.json
        ├── 01-the-sun/
        │   └── quiz.json
        └── 02-the-moon/
            └── quiz.json
```

- Folder names become the display names ("ancient-rome" → "Ancient rome"). A leading number sets the order and is hidden ("01-egypt" → "Egypt"). A leading `zz-` is also hidden and sorts to the end ("zz-sky" → "Sky").
- A chapter can hold its own `quiz.json`, subchapter folders, or both. Subchapters are folders inside the chapter, each with a `quiz.json`.
- If a chapter has subchapters, the site lists them and also shows the chapter quiz when `quiz.json` is there.
- A **sub-subject** divides a big subject. Put `subsubject.json` in a folder directly under the subject. Child folders are chapters (each with a `quiz.json`), not subchapters. Sub-subjects show after that subject's own chapters.
- `subsubject.json` can set `name`, `icon`, `blurb`, and chapter labels: `{"name":"Astrology and astronomy","icon":"🌌","blurb":"Easy quizzes first.","chapters":[{"id":"01-the-sun","name":"The Sun","level":"Easy"}]}`.
- In `lessons.json`, set `"hasQuiz": false` on a chapter that only contains subchapters.
- `subject.json` is optional and sets a nicer name and emoji.
- A new folder appears on the site within a couple of minutes of pushing (GitHub Pages rebuild plus a short cache).
- `lessons/lessons.json` is optional now. Use it only to override names or icons.
- Git does not keep empty folders, so every chapter or subchapter needs a `quiz.json` inside it.

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
