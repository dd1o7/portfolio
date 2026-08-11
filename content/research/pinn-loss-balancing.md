---
title: Why PINN loss balancing is the whole problem
summary: Notes on gradient pathologies in composite physics losses, and what actually helps.
date: 2026-08-02
tags: [PINNs, optimisation, notes]
featured: true
links:
  code: https://github.com/dd1o7
---

Most introductions to physics-informed networks present the loss as though the
weighting were an implementation detail:

$$
\mathcal{L}(\theta) = \lambda_r \mathcal{L}_r(\theta)
+ \lambda_b \mathcal{L}_b(\theta)
+ \lambda_0 \mathcal{L}_0(\theta)
$$

where $\mathcal{L}_r$ is the PDE residual, $\mathcal{L}_b$ the boundary term and
$\mathcal{L}_0$ the initial condition. In practice the choice of
$\lambda_r, \lambda_b, \lambda_0$ decides whether the thing trains at all.

## The failure mode

The residual term typically produces gradients one to three orders of magnitude
larger than the boundary term. With $\lambda_i = 1$, the optimiser is effectively
solving an unconstrained problem: it finds a smooth field satisfying the PDE in
the interior and ignores the boundary entirely. The result looks plausible,
converges nicely, and is wrong.

What makes this hard to notice is that the total loss curve looks healthy
throughout. You have to watch the terms separately.

## What helps

Ranked by how much benefit I have actually observed:

1. **Per-term gradient normalisation.** Rescale each $\lambda_i$ so the terms
   contribute comparable gradient norms, updated every few hundred steps. Cheap,
   and it fixes the majority of cases.

   ```python
   def rebalance(losses, params, alpha=0.9):
       """Rescale loss weights so every term contributes a similar gradient."""
       norms = {}
       for name, loss in losses.items():
           g = torch.autograd.grad(loss, params, retain_graph=True)
           norms[name] = torch.cat([x.flatten() for x in g]).norm()

       target = sum(norms.values()) / len(norms)
       return {name: alpha + (1 - alpha) * (target / n) for name, n in norms.items()}
   ```

2. **Hard-constrained boundary conditions.** Rather than penalising boundary
   error, reparametrise so it cannot occur — write
   $u_\theta = g(x) + \ell(x)\,\mathcal{N}_\theta(x)$ where $\ell$ vanishes on the
   boundary. Removes $\mathcal{L}_b$ from the loss completely. Best fix when the
   geometry permits it.
3. **Curriculum on the residual weight.** Start with $\lambda_r$ small and raise
   it, so the network fits data and boundary first. Helps on stiff problems.

Adaptive schemes that learn $\lambda$ jointly are appealing but in my experience
add a second, equally delicate tuning problem.

## Open question

Whether any of this survives at scale. Nearly all published comparisons are on
2D benchmarks where the network is heavily overparameterised relative to the
solution. I do not know that the ranking above holds in 3D, and I would like to.
