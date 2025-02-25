import { actions } from "astro:actions";
import { useRef, useState } from "react";

type AssetList = Awaited<ReturnType<typeof actions.getAsset.orThrow>>;

const AssetLibrary = () => {
  const [assets, setAssets] = useState<AssetList>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function searchForAsset() {
    const searchTerm = inputRef.current!.value;
    const data = await actions.getAsset.orThrow({ assetName: searchTerm });
    setAssets(data);
  }

  return (
    <>
      <div style={{ display: "flex", gap: "10px" }}>
        <input ref={inputRef} type="text" placeholder="Search via asset name" />
        <button onClick={searchForAsset}>Search!</button>
      </div>

      {assets.length > 0 ? (
        <div>
          <p>Number of results: {assets.length}</p>
          <section>
            {assets.map(
              ({ name, keywords, numCommits, ogAuthor, currVersion, thumbnailSrc, usdaFile }) => (
                <div key={name} className="asset-result">
                  <div className="left">
                    <p>Asset name: {name}</p>
                    <p>Keywords: {keywords}</p>
                    <p>Number of commits: {numCommits}</p>
                    <p>Original author: {ogAuthor}</p>
                    <p>Current version: {currVersion}</p>

                    <img
                      src={thumbnailSrc}
                      alt={`Thumbnail of ${name}`}
                      width="200px"
                      height="200px"
                    />
                  </div>

                  <div className="right">
                    .usda file contents
                    <pre>{usdaFile}</pre>
                  </div>
                </div>
              ),
            )}
          </section>
        </div>
      ) : (
        <p>
          Search for an asset and matching results will show up here (note: pressing Enter doesn't
          work, you have to manually click the button)
        </p>
      )}
    </>
  );
};

export { AssetLibrary };
