---
title: AI from first principles
summary: A self-directed curriculum working from mathematical foundations toward physics-informed machine learning, implemented from scratch.
date: 2026-07-05
tags: [machine learning, PINNs, learning in public]
status: active
featured: true
links:
  repo: https://github.com/dd1o7/ai-engineering-from-scratch
---

A structured attempt to learn machine learning in the order the subject actually
depends on, rather than the order that gets to results fastest.

## The idea

Most routes into ML start at the framework and work downward, which means the
mathematics arrives late and as justification rather than as foundation. This
goes the other way: linear algebra and calculus first, then ML fundamentals,
then implementations written from scratch, with physics-informed methods as the
destination.

The reason for the ordering is specific. Physics-informed networks compute
losses from the residual of a differential equation, which means automatic
differentiation, the structure of the PDE, and the optimiser's behaviour are all
load-bearing at once. Reaching for that with a shaky grasp of any one of them
produces code that runs and results you can't interpret.

## Structure

The repository is organised by phase, each with notes, implementations and
experiments kept separate — so the understanding and the code that came out of
it stay distinguishable.

## Where it actually is

**Early.** The structure is in place and phase one — linear algebra — is where
the work currently is. I'm publishing it as I go rather than after the fact,
which means most of it is unfinished at any given moment.

That's deliberate, but it does mean this is a record of learning rather than a
finished artifact. Treat it accordingly.
