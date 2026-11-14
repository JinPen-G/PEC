import { fileURLToPath } from "node:url";
/** Dependency boundary only: preserve every upstream export and original animation;
 * let original components read the same browser setting as the workspace. */
export function motionPreferenceAdapter() {
    const id = "\0rental-motion-preference";
    const restId = "\0preview-rest-motion-preference";
    const restMotion = fileURLToPath(new URL("../packages/preview-ui/upstream/rest-widgets/primitives/motion.ts", import.meta.url)).replaceAll("\\", "/");
    const upstream = fileURLToPath(import.meta.resolve("motion/react")).replaceAll("\\", "/");
    const hook = fileURLToPath(new URL("../apps/web/src/features/motion/use-motion-preference.ts", import.meta.url)).replaceAll("\\", "/");
    return {
        name: "rental-motion-preference", enforce: "pre",
        resolveId(source, importer) {
            if (source === "../primitives/motion" && importer?.replaceAll("\\", "/").includes("/upstream/rest-widgets/")) return restId;
            if (source === "motion/react") return id;
        },
        load(source) {
            if (source === restId) return `export { motionTokens, springFromDuration, useHydrated } from ${JSON.stringify(restMotion)}; export { usePrefersReducedMotion as useReducedMotion } from ${JSON.stringify(hook)};`;
            if (source !== id)
                return;
            return `export * from ${JSON.stringify(upstream)}; export { usePrefersReducedMotion as useReducedMotion } from ${JSON.stringify(hook)};`;
        },
    };
}
/** Adapt reduced-motion CSS at build time without editing reserved UI primitives files.
 * This also lets explicit Full motion override the OS, while System follows it.
 * All current source queries are standalone; preserve unrelated media rules. */
export function motionPreferenceStyles() {
    return {
        postcssPlugin: "rental-motion-preference-styles",
        AtRule: {
            media(rule) {
                const match = /^\(prefers-reduced-motion:\s*(reduce|no-preference)\)$/.exec(rule.params.trim());
                if (!match)
                    return;
                const root = `html[data-reduced-motion="${match[1] === "reduce"}"]`;
                rule.walkRules((child) => {
                    if (child.parent?.type === "atrule" && /keyframes$/i.test(child.parent.name))
                        return;
                    child.selectors = child.selectors.map(selector => selector.startsWith("::") ? root + selector
                        : selector.startsWith(":root") ? selector.replace(":root", root)
                            : selector.startsWith("html") && /^(?:html)(?=[\s.:#[>+~]|$)/.test(selector) ? selector.replace(/^html/, root)
                                : `:where(${root}) ${selector}`);
                });
                rule.replaceWith(...(rule.nodes ?? []));
            },
        },
    };
}
