export interface MermaidCode {
  id: number;
  name: string;
  code: string;
}
export interface DBAdapter {
  init(): Promise<void>;
  getAll(): Promise<MermaidCode[]>;
  add(data: MermaidCode): Promise<MermaidCode>;
  update(id: number, data: MermaidCode): Promise<MermaidCode>;
  delete(id: number): Promise<void>;
}