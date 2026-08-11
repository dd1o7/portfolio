/**
 * The ambient layer: two radial glows and the 44px grid.
 *
 * One fixed element, painted once, behind everything. Panes never carry their
 * own background image — that would repaint the gradient per pane. All the
 * paint work is in the `.ambient` rule in globals.css.
 */
export function AmbientBackground() {
  return <div aria-hidden="true" className="ambient" />;
}
