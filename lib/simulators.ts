export const simulatorRoutes = {
  bptree: "/simulators/bptree",
} as const;

export type SimulatorId = keyof typeof simulatorRoutes;

export function getSimulatorRoute(simulatorId: SimulatorId): string {
  return simulatorRoutes[simulatorId];
}

export type SimulatorIndexItem = {
  id: SimulatorId;
  label: string;
  route: string;
};

export function getSimulatorIndexItems(): SimulatorIndexItem[] {
  // Keep this list explicit so labels are stable even as route structure evolves.
  return [
    {
      id: "bptree",
      label: "B+Tree (Insertion & Search)",
      route: getSimulatorRoute("bptree"),
    },
  ];
}
