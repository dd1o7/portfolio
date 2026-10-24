---
title: txt2perseus
summary: A dependency-free Python converter that turns plain-text multiple-choice questions into Perseus JSON, with validation that refuses to emit a broken file and a report on answer-key bias.
date: 2026-10-22
tags: [tools, assessment design, education]
status: shipped
draft: false
stack: [Python]
links:
  repo: https://github.com/dd1o7/txt2perseus
---

Perseus is the open-source exercise format Khan Academy content is authored in.
Writing questions in it by hand is miserable — it is JSON, deeply nested, and
every question carries a widget placeholder, a choices array, per-option
rationales and a hints array.

Writing the questions as plain text is not miserable. So this converts one to
the other.

## What it does

Each question is written as a header, two to six options, and a rationale under
each option beginning with *Correct* or *Incorrect*. The converter emits a
Perseus radio-widget item per question, and switches the item to multi-select on
its own if more than one option is marked correct.

```
python3 txt2perseus.py samples/example.txt   # one file
python3 txt2perseus.py some_folder/          # every .txt in a folder
python3 txt2perseus.py some_folder/ --split  # one JSON file per question
```

It accepts several header, option-label and rationale-bracket styles, because
question banks written by different people over several months are not
consistent and asking everyone to go back and re-format them was never going to
happen. LaTeX written as `$...$`, `$$...$$`, `\(...\)` or `\[...\]` is all
normalised to one form. Bracket scanning respects maths mode, so a brace inside
an equation doesn't end a rationale early.

Pure standard library. No dependencies, which means it runs on any machine with
Python 3 and will still run in two years.

## Refusing to write

If any question in a file fails validation, the file is not written at all —
and every error is reported together rather than one per run. The exit code is 1
when anything failed, so it drops into a script without special handling.

The alternative, writing the valid questions and warning about the rest, sounds
friendlier and is worse. A partially converted file looks finished. You find out
it isn't at import time, or later, from someone else.

## The report I added after the fact

It also prints a quality report on the answer key: how the correct answers are
distributed across positions, and ==whether the longest option is correct more
often than chance==.

Both are test-wiseness cues — patterns that let a student score above their
actual understanding by reading the question rather than knowing the physics.
Writers produce them without noticing, because the correct option is the one you
explain carefully and the distractors are the ones you write quickly. It is
invisible in any single question and obvious across a hundred, which makes it
exactly the kind of thing a converter that sees the whole file should be
checking.
