import { readdirSync } from "node:fs";
import { resolve } from "node:path";

import { assets, history, keywords } from "@/db/schema";
import { db } from "@/db/turso";

const assetsPath = resolve("./assets");
const assetNames = readdirSync(assetsPath, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

assetNames.forEach(async (assetName) => {
  const assetFolder = resolve(assetsPath, assetName);
  const thumbnail = Bun.file(`${assetFolder}/thumbnail.png`);
  const usda = Bun.file(`${assetFolder}/${assetName}.usda`);

  await db
    .insert(assets)
    // @ts-ignore see https://github.com/drizzle-team/drizzle-orm/issues/3797
    .values({ name: assetName, image: await thumbnail.arrayBuffer(), file: await usda.text() })
    .onConflictDoNothing();

  const metadata = await Bun.file(`${assetFolder}/metadata.json`).json();
  const historyValues = metadata.commitHistory.map((commit: any) => {
    const { author, version, timestamp, note } = commit;
    return {
      assetName,
      author,
      version,
      timestamp: timestamp + ":00",
      note,
    };
  });

  await db.insert(history).values(historyValues).onConflictDoNothing();

  const keywordsValues = metadata.keywords.map((keyword: string) => {
    return {
      assetName,
      keyword,
    };
  });

  await db.insert(keywords).values(keywordsValues).onConflictDoNothing();
});
