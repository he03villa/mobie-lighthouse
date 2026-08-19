import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api';
import { ApiResponse } from '../models/api-response';
import {
  PlanningBoard,
  PlanningBoardRequest,
  PlanningColumn,
  PlanningColumnRequest,
  PlanningMoveRequest,
  PlanningTask,
  PlanningTaskRequest,
} from '../models/planning';
import { environment } from '../../../environments/environment';

const BASE = environment.api.planning.name;
const BOARDS = environment.api.planning.services.boards;
const COLUMNS = environment.api.planning.services.columns;
const TASKS = environment.api.planning.services.tasks;
const MOVE = environment.api.planning.services.move;

@Injectable({ providedIn: 'root' })
export class PlanningService {
  private api = inject(ApiService);

  listBoardsAsync(): Promise<PlanningBoard[]> {
    return firstValueFrom(this.api.get<ApiResponse<PlanningBoard[]>>(`/${BASE}/${BOARDS}`)).then(res => res.data);
  }

  getBoardAsync(id: string): Promise<PlanningBoard> {
    return firstValueFrom(this.api.get<ApiResponse<PlanningBoard>>(`/${BASE}/${BOARDS}/${id}`)).then(res => res.data);
  }

  createBoardAsync(data: PlanningBoardRequest): Promise<PlanningBoard> {
    return firstValueFrom(this.api.post<ApiResponse<PlanningBoard>>(`/${BASE}/${BOARDS}`, data)).then(res => res.data);
  }

  updateBoardAsync(id: string, data: PlanningBoardRequest): Promise<PlanningBoard> {
    return firstValueFrom(this.api.put<ApiResponse<PlanningBoard>>(`/${BASE}/${BOARDS}/${id}`, data)).then(res => res.data);
  }

  deleteBoardAsync(id: string): Promise<void> {
    return firstValueFrom(this.api.delete<ApiResponse<null>>(`/${BASE}/${BOARDS}/${id}`)).then(() => undefined);
  }

  addColumnAsync(boardId: string, data: PlanningColumnRequest): Promise<PlanningColumn> {
    return firstValueFrom(this.api.post<ApiResponse<PlanningColumn>>(`/${BASE}/${BOARDS}/${boardId}/${COLUMNS}`, data))
      .then(res => res.data);
  }

  updateColumnAsync(id: string, data: PlanningColumnRequest): Promise<PlanningColumn> {
    return firstValueFrom(this.api.patch<ApiResponse<PlanningColumn>>(`/${BASE}/${COLUMNS}/${id}`, data))
      .then(res => res.data);
  }

  deleteColumnAsync(id: string): Promise<void> {
    return firstValueFrom(this.api.delete<ApiResponse<null>>(`/${BASE}/${COLUMNS}/${id}`)).then(() => undefined);
  }

  addTaskAsync(columnId: string, data: PlanningTaskRequest): Promise<PlanningTask> {
    return firstValueFrom(this.api.post<ApiResponse<PlanningTask>>(`/${BASE}/${COLUMNS}/${columnId}/${TASKS}`, data))
      .then(res => res.data);
  }

  updateTaskAsync(id: string, data: PlanningTaskRequest): Promise<PlanningTask> {
    return firstValueFrom(this.api.patch<ApiResponse<PlanningTask>>(`/${BASE}/${TASKS}/${id}`, data)).then(res => res.data);
  }

  deleteTaskAsync(id: string): Promise<void> {
    return firstValueFrom(this.api.delete<ApiResponse<null>>(`/${BASE}/${TASKS}/${id}`)).then(() => undefined);
  }

  moveTaskAsync(id: string, data: PlanningMoveRequest): Promise<PlanningTask> {
    return firstValueFrom(this.api.patch<ApiResponse<PlanningTask>>(`/${BASE}/${TASKS}/${id}/${MOVE}`, data))
      .then(res => res.data);
  }
}
