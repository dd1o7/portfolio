---
title: PINN solver for incompressible flow
summary: A physics-informed network that recovers velocity and pressure fields from sparse observations, without a mesh.
date: 2026-07-28
tags: [PINNs, fluid dynamics, PyTorch]
status: active
featured: true
stack: [PyTorch, JAX, NumPy]
links:
  repo: https://github.com/dd1o7
---

Classical CFD needs a mesh, and building one for awkward geometry is most of the
work. This project takes the other route: train a network $u_\theta$ whose
*residual* against the governing equations is the loss, so the physics is
enforced during training rather than imposed by the grid.

## The residual

For incompressible Navier–Stokes, the momentum residual is

$$
r_\theta(x, t) = \partial_t u_\theta + (u_\theta \cdot \nabla) u_\theta
+ \frac{1}{\rho}\nabla p_\theta - \nu \nabla^2 u_\theta
$$

with the continuity condition $\nabla \cdot u_\theta = 0$ enforced as a second
residual term. Both are computed by automatic differentiation, so there is no
discretisation error — only approximation error in the network itself.

## What is interesting here

The honest difficulty is not the physics, it is the optimisation. The composite
loss has terms whose gradients differ by orders of magnitude, and naive weighting
means the boundary condition term is effectively ignored. Notes on how I handle
that are in the research section.

## Status

Working on 2D benchmark problems (lid-driven cavity, cylinder wake). 3D is the
obvious next step and the obvious place where training cost stops being free.
