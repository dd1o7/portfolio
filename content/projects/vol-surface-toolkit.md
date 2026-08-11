---
title: Implied volatility surface toolkit
summary: Fits and interpolates arbitrage-free volatility surfaces from listed option chains.
date: 2026-06-14
tags: [finance, derivatives, Python]
status: shipped
featured: true
stack: [Python, pandas, SciPy]
links:
  repo: https://github.com/dd1o7
---

Market option chains are quoted in prices; almost everything downstream wants
implied volatility as a smooth surface in strike and maturity. Getting from one
to the other is less trivial than it sounds, mostly because the naive fit is
easy to make *arbitrageable*.

## Approach

Prices are inverted to implied vols against Black–Scholes, which satisfies

$$
\frac{\partial V}{\partial t}
+ \frac{1}{2}\sigma^2 S^2 \frac{\partial^2 V}{\partial S^2}
+ rS\frac{\partial V}{\partial S} - rV = 0
$$

The surface is then fitted in total variance $w(k, T) = \sigma^2(k, T)\,T$ rather
than in $\sigma$ directly, because the no-arbitrage conditions are much cleaner
in that coordinate: calendar arbitrage is ruled out by requiring
$\partial_T w \geq 0$, and butterfly arbitrage by a condition on the curvature in
log-moneyness $k$.

## Result

Fits a liquid single-name chain in well under a second, and the output passes
both arbitrage checks across the surface rather than only at the quoted points.
