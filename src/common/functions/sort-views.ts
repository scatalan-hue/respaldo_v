export function sortViews(views: { name: string; dependsOn?: string[] }[]) {
  const sorted: string[] = [];
  const watched = new Set<string>();
  const stack = new Set<string>();

  function visit(view: { name: string; dependsOn?: string[] }) {
    if (watched.has(view.name)) return;
    if (stack.has(view.name)) {
      throw new Error(`Ciclo detectado en las dependencias con la vista: ${view.name}`);
    }

    stack.add(view.name);

    const depends = view.dependsOn || [];

    for (const dep of depends) {
      const dependency = views.find((v) => v.name === dep);
      if (dependency) visit(dependency);
    }

    stack.delete(view.name);
    watched.add(view.name);
    sorted.push(view.name);
  }

  for (const view of views) {
    visit(view);
  }

  return sorted;
}
