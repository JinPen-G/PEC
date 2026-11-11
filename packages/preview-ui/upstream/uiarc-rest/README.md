# Rest player UI source

The owner supplied the local `uiarc-pro-archive` Media Player and Now Playing reconstructions for Preview's break experience. They are independent React reconstructions of UIARC's public previews and documentation, not acquired official Pro TSX. The retained `provenance.json` files record the original public CSS references and license boundary.

The twelve implementation files match the frozen 2026-11-11 `snapshot-v3` also consumed by Rental OS. `source-manifest.json` records their byte hashes. Only the two components and their shared motion primitive are copied; demo images, music, dependencies and build artifacts are excluded. Both source directories remain read-only.

References: [Media Player](https://uiarc.dev/components/blocks/media-player), [Now Playing](https://uiarc.dev/components/now-playing), [UIARC license](https://uiarc.dev/license). Original third-party rights are retained; Preview does not grant a new license to these materials. These files serve the application UI and are not registered as downloadable Preview components or Registry items.

The host supplies actual audio state, the break deadline, file selection, full-screen placement and cleanup. The build-time motion adapter connects the original preference hook to Preview's existing reduced-motion preference without changing these files.
