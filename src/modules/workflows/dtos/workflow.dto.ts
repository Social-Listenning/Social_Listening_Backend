export class WorkflowDTO {
  name: string;
  tabId: string;
  data: WorkflowData;
}

export class WorkflowData {
  nodes: WorkflowBlock[];
  edges: WorkflowEdge[];
  variables: WorkflowVariable[];
}

export class WorkflowBlock {
  id: string;
  type: string;
  position: WorkflowPosition;
  data: object;
}

export class WorkflowEdge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

export class WorkflowVariable {
  label: string;
}

export class WorkflowPosition {
  x: number;
  y: number;
}

export class CreateWorkflowDTO {
  name: string;
  tabId: string;
  extendData?: string;
}

export class CreateWorkflowNodeDTO {
  id: string;
  flowId: string;
  type: string;
  position_X: number;
  position_Y: number;
  data: string;
}

export class CreateWorkflowEdgeDTO {
  id: string;
  flowId: string;
  sourceId: string;
  sourceName: string;
  targetId: string;
  targetName: string;
}

export class CreateWorkflowVariableDTO {
  flowId: string;
  variableName: string;
  variableValue?: string;
  variableDataType?: string;
}
