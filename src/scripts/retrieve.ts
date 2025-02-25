import { join, resolve } from "node:path";

import { assets, history, keywords } from "@/db/schema";
import { db } from "@/db/turso";
import { eq } from "drizzle-orm";

const dir = resolve("./");
const assetName = Bun.argv[2] as string;

const assetResult = await db.select().from(assets).where(eq(assets.name, assetName));
const keywordsResult = await db.select().from(keywords).where(eq(keywords.assetName, assetName));
const historyResult = await db
  .select()
  .from(history)
  .where(eq(history.assetName, assetName))
  .orderBy(history.timestamp);

const asset = assetResult[0]!;

console.log("RETRIEVAL SUCCESS, ASSET DETAILS");
console.log(` - Asset name: ${asset.name}`);
console.log(` - Keywords: ${keywordsResult.map((key) => key.keyword).join(", ")}`);
console.log(` - Number of commits: ${historyResult.length}`);
console.log(` - Original author: ${historyResult[0]!.author}`);
console.log(` - Current version: ${historyResult[historyResult.length - 1]!.version}`);

const thumbnailBlob = new Blob([asset.image], { type: "image/png" });
await Bun.write("thumbnail.png", thumbnailBlob);

console.log("Thumbnail retrieved, written to", join(dir, "thumbnail.png"));

const usdaBlob = new Blob([asset.file], { type: "text/plain" });
await Bun.write(`${assetName}.usda`, usdaBlob);

console.log(".usda file retrieved, written to", join(dir, `${assetName}.usda`));
