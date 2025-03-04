import { integer, pgTable, varchar, serial } from "drizzle-orm/pg-core";

export const positionSchema = pgTable('employee_positions', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    parent_id: integer('parent_id'),
  });