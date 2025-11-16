/**
 * Goal:
 *   Use Vis.js hierarchical layout to arrange a tree structure cleanly,
 *   while ensuring that some nodes (like "D") do not distort the automatic
 *   placement of other children.
 *
 * Why:
 *   - By default, Vis.js distributes *all* children of a parent evenly.
 *   - Example: A → B, C, D → B and C get pushed sideways because A has 3 children.
 *   - Simply fixing D’s position is not enough; the layout still counts it.
 *
 * How:
 *   - Use the `level` property to lock certain nodes to a given hierarchy layer.
 *   - For “extra” nodes, place them at a deeper `level` (e.g. 2) so they no longer
 *     influence sibling spacing at level 1.
 *   - Combine this with `physics: false` and `fixed: {x: true, y: true}`
 *     to keep them pinned in place.
 *
 * Example:
 *   In this case, A has three children (B, C, D), but D should not affect
 *   how B and C are arranged:
 *
 *   Level 0:      A
 *                / \
 *               /   \
 *   Level 1:   B     C
 *
 *   Level 2:         D   (ignored in layout, but still connected)
 */

const nodes = new vis.DataSet([
  { id: "A", label: "A" },   // root, level 0 (auto)
  { id: "B", label: "B" },   // child, level 1 (auto)
  { id: "C", label: "C" },   // child, level 1 (auto)
  // D is visually connected, but not part of sibling distribution
  { id: "D", label: "D", level: 2, physics: false, fixed: { x: true, y: true } }
]);

const edges = new vis.DataSet([
  { from: "A", to: "B" },
  { from: "A", to: "C" },
  { from: "A", to: "D" }
]);

const data = { nodes, edges };
const options = {
  layout: {
    hierarchical: {
      enabled: true,
      direction: "UD",
      sortMethod: "directed"
    }
  },
  physics: { enabled: false }
};

const network = new vis.Network(document.getElementById("mynetwork"), data, options);
