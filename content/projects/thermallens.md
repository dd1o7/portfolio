---
title: ThermalLens
summary: An inverse physics-informed neural network that recovers a material's thermal diffusivity from sparse, noisy temperature measurements, benchmarked against classical parameter fitting.
date: 2026-10-24
tags: [machine learning, PINNs, inverse problems]
status: shipped
featured: true
draft: false
stack: [PyTorch, NumPy, SciPy]
links:
  repo: https://github.com/dd1o7/ThermalLens
---

Given a handful of noisy thermometer readings from inside a cooling slab, can a
neural network work out what the slab is made of?

That is an inverse problem. The forward problem — knowing the material and
predicting how it cools — is routine. Running it backwards is harder, because
the answer is sensitive to noise and is not always unique.

## The setup

A 1-D slab held at the reference temperature at both ends, governed by the heat
equation with an unknown diffusivity $\alpha$:

$$\frac{\partial \theta}{\partial t} = \alpha \frac{\partial^2 \theta}{\partial x^2}$$

A small `tanh` network learns the temperature field. The diffusivity is a
trainable parameter in the same optimisation, so the network weights and the
physical constant move together. What makes it physics-informed is the loss: as
well as fitting the measurements, the network is penalised for violating the
heat equation at four thousand points where there is no data at all.

The initial profile was chosen to have a closed-form solution, which means
every claim can be checked against ground truth rather than against a plot that
looks plausible.

## What came out

Fifty observations, 5% noise, three seeds:

| Method | Diffusivity error | Field error |
| --- | --- | --- |
| PINN | 1.39 ± 0.54 % | 0.53 % |
| Nonlinear least squares | 1.16 ± 0.94 % | 0.35 % |
| Same network, physics removed | not possible | 60 ± 22 % |

The PINN matched the classical fit rather than beating it. That is the honest
reading, and it is the one in the repository.

The least-squares baseline is deliberately the stronger method here: it is
handed the exact modal form of the solution and has one scalar left to fit,
while the PINN is told only the differential equation and has to find the shape
of the field as well as the constant. Matching it is the result.

## The part I didn't plan

Across all nine runs, the two methods' errors have the same sign every time,
with a correlation of ==0.975==. When the noise draw makes the slab look like it
is cooling slightly too slowly, both methods report a diffusivity that is too
low, by nearly the same amount.

So the error belongs to the data, not to either method. The PINN has reached the
information limit of the measurements — there is nothing left for a better
optimiser or a larger network to find. That is a much stronger statement than
the error bar on its own.

A second number says something similar from the other direction. The data loss
settled at $3.86 \times 10^{-3}$ against a noise variance of
$4.22 \times 10^{-3}$: the network fitted the signal and stopped at the noise
instead of chewing through it, which is what overfitting fifty measurements
would have looked like.

## What it doesn't show

> [!note]
> The data was generated with the same equation the network was then given. In
> inverse-problem work this is called an *inverse crime*, and it is the main
> caveat here.

It demonstrates that the method is implemented correctly on a problem small
enough to verify completely. It does not demonstrate that a PINN recovers
diffusivity from real measurements, where contact resistance, unmodelled heat
loss and a temperature-dependent diffusivity are all waiting.

Two more things worth stating plainly. The sensor-count study doesn't resolve
its own trend — with three seeds the variation between noise realisations is
larger than the effect of going from 50 sensors to 100, and the classical
baseline shows the same pattern, which rules out the network as the cause.
And the classical fit solves this in about two milliseconds against the PINN's
six minutes. Any case for the method rests on problems where no closed form
exists, not on this one.

The code was written with AI assistance; the experimental design and the
reading of the results are mine. The repository says so too.
