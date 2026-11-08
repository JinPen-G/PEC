# UIARC source snapshot

The fixed `kuratlielia/arc-library` commit is retained in `free-source/`, including its MIT license. It contains the free component and block source, not the original production website TSX.

`observed-assets/` and `button-page.html` retain files served by the public component page. These are reference evidence, with hashes and acquisition URLs. Website JavaScript is not executed in Preview. The website's license is not inferred from the free library's MIT license.

Preview's site adapter reuses the observed layout declarations in a scoped stylesheet and recreates the React wiring for Preview's project catalog, permissions and PRD content. `source-manifest.json` records the exact baseline and adapted stylesheet hash. Internal business data, credentials and the RIMO source folder are not part of this snapshot.
