export type ModelLocation = 'local' | 'cloud';
export type ModelType = 'chat' | 'embedding';

export interface ModelInfo {
  name: string;
  size: number | null;
  parameter_size: string | null;
  family: string | null;
  modified_at: string | null;
  model_type: ModelType;
}

export interface ModelSelection {
  model_name: string;
  model_location: ModelLocation;
}
