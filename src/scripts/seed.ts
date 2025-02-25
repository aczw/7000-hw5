import { readdirSync } from "node:fs";
import { resolve } from "node:path";

import { assets, history, keywords } from "@/db/schema";
import { db } from "@/db/turso";

/**
 * This file was used to automatically insert our class' assets into the database without me
 * having to do it manually. To use it, download a copy of the Week 4 assets, rename the folder
 * to just "assets", and place it in the root directory i.e. "7000-hw5." Then run the script
 * (and obviously set the right env vars to access the Turso database).
 */

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
