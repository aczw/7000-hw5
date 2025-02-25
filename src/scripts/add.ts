import { assets, history, keywords } from "@/db/schema";
import { db } from "@/db/turso";

const assetName = Bun.argv[2] as string;
const author = Bun.argv[3] as string;
const keywordsList = Bun.argv[4] as string;
const version = Bun.argv[5] as string;
const note = Bun.argv[6] as string;
const image = Bun.argv[7] as string;
const file = Bun.argv[8] as string;

const thumbnail = Bun.file(image);
const usda = Bun.file(file);

await db
  .insert(assets)
  // @ts-ignore see https://github.com/drizzle-team/drizzle-orm/issues/3797
  .values({ name: assetName, image: await thumbnail.arrayBuffer(), file: await usda.text() });

const now = new Date(Date.now());
const timestamp = now.toISOString();

await db.insert(history).values({ assetName, author, version, timestamp, note });

keywordsList.split(",").forEach(async (keyword) => {
  await db.insert(keywords).values({ assetName, keyword });
});

console.log(`Successfully added "${assetName}" to database!`);
