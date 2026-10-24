---
title: Monte Carlo methods in physics
summary: Three small simulations — a random walk, radioactive decay, and a toy particle-physics bump hunt — each checked against the analytical result it is supposed to reproduce.
date: 2026-10-23
tags: [scientific computing, Monte Carlo, statistics]
status: shipped
draft: false
stack: [Python, NumPy, Matplotlib]
links:
  repo: https://github.com/dd1o7/monte-carlo-physics
---

Three independent simulations, written to understand how random sampling
converges on an answer and how to put an honest error bar on it.

Each one has a known result to check against. That constraint is the point: a
Monte Carlo simulation will always produce a number, and without something to
compare it to there is no way to tell a correct implementation from a confident
wrong one.

## Random walk

Measuring the diffusion law — that mean squared displacement grows linearly with
step count. The fitted slope came out at **1.002 ± 0.011** against a theoretical
1.

The error bar is the interesting part. The obvious approach, fitting all the
points and taking the standard error, is wrong here: successive points on the
same walk are not independent, because the displacement at step 100 contains the
displacement at step 99. Treating correlated points as independent understates
the uncertainty. Instead the error comes from ten independent groups of walks,
which gives a spread that means something.

## Radioactive decay

Simulating a decaying population and recovering its half-life: **68.91 steps**
against a true 68.97.

The useful experiment was varying the starting population. The spread in the
recovered half-life falls from 11.1% to 3.7% to 1.0% for 100, 1,000 and 10,000
initial nuclei — a factor of about ten in sample size for a factor of about
three in precision, which is the $1/\sqrt{N}$ scaling that governs how expensive
every Monte Carlo result is.

## Bump hunt

A toy version of the problem of finding a particle: a Gaussian signal at
125 GeV sitting on a falling background, fitted to recover the peak position.

| Signal events | Fitted mass (GeV) |
| --- | --- |
| 500 | 124.85 ± 0.22 |
| 200 | 125.33 ± 0.53 |
| 50 | not recoverable |

The last row is the one that taught me something. With 50 signal events the peak
is still there in the data, and the fit still returns a number — it is simply
indistinguishable from a fluctuation in the background. Knowing where that
threshold sits for your own analysis is most of the discipline.
