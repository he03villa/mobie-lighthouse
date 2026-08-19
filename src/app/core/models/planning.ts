export interface PlanningBoard {
  id: string;
  name: string;
  description?: string | null;
  columns_count?: number;
  tasks_count?: number;
  columns?: PlanningColumn[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PlanningColumn {
  id: string;
  board_id?: string;
  name: string;
  position: number;
  tasks_count?: number;
  tasks?: PlanningTask[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PlanningTask {
  id: string;
  column_id: string;
  title: string;
  description?: string | null;
  start_date?: string | null;
  due_date?: string | null;
  position: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PlanningBoardRequest {
  name: string;
  description?: string | null;
}

export interface PlanningColumnRequest {
  name: string;
  position?: number;
}

export interface PlanningTaskRequest {
  title: string;
  description?: string | null;
  start_date?: string | null;
  due_date?: string | null;
}

export interface PlanningMoveRequest {
  column_id?: string | null;
  position?: number;
}
