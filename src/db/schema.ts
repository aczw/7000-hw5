import * as t from "drizzle-orm/sqlite-core";

const assets = t.sqliteTable("assets", {
  name: t.text().primaryKey(),
  image: t.blob({ mode: "buffer" }).notNull(),
  file: t.text().notNull(),
});

const history = t.sqliteTable("history", {
  id: t.int().primaryKey(),
  assetName: t.text().references(() => assets.name),
  author: t.text().notNull(),
  version: t.text().notNull(),
  timestamp: t.text().notNull(),
  note: t.text().notNull(),
});

const keywords = t.sqliteTable("keywords", {
  id: t.int().primaryKey(),
  assetName: t.text().references(() => assets.name),
  keyword: t.text().notNull(),
});

export { assets, history, keywords };
