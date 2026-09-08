import type { Env } from "../index";

export class Database {
  constructor(private readonly env: Env) {}

  get db() {
    return this.env.DB;
  }

  async query<T = unknown>(
    sql: string,
    ...params: unknown[]
  ): Promise<T[]> {
    const result = await this.db
      .prepare(sql)
      .bind(...params)
      .all<T>();

    return result.results ?? [];
  }

  async first<T = unknown>(
    sql: string,
    ...params: unknown[]
  ): Promise<T | null> {
    return await this.db
      .prepare(sql)
      .bind(...params)
      .first<T>();
  }

  async run(
    sql: string,
    ...params: unknown[]
  ): Promise<D1Result> {
    return await this.db
      .prepare(sql)
      .bind(...params)
      .run();
  }

  async batch(
    statements: D1PreparedStatement[]
  ): Promise<D1Result[]> {
    return await this.db.batch(statements);
  }

  prepare(
    sql: string,
    ...params: unknown[]
  ): D1PreparedStatement {
    return this.db
      .prepare(sql)
      .bind(...params);
  }
}

/**
 * Создаёт экземпляр DB-слоя.
 */
export function createDatabase(env: Env): Database {
  return new Database(env);
}

/**
 * Проверка подключения D1.
 */
export async function checkDatabase(
  env: Env
): Promise<boolean> {
  try {
    const result = await env.DB
      .prepare("SELECT 1 AS ok")
      .first<{ ok: number }>();

    return result?.ok === 1;
  } catch {
    return false;
  }
}
