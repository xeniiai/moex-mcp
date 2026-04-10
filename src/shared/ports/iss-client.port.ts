export type IssResponse = Record<string, Record<string, unknown>[]>;

export interface IssClientPort {
  get(path: string, params?: Record<string, string | number>): Promise<IssResponse>;
}
