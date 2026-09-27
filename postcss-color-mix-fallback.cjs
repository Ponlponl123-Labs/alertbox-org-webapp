module.exports = () => ({
  postcssPlugin: "postcss-color-mix-fallback",
  Once(root) {
    root.walkAtRules("supports", (atRule) => {
      if (!atRule.params.includes("color-mix")) return;

      atRule.walkDecls((decl) => {
        const match = decl.value.match(
          /color-mix\(\s*in\s+[\w-]+\s*,\s*(?:var\((--[\w-]+)\)\s+([0-9.]+)%|([0-9.]+)%\s+var\((--[\w-]+)\))\s*,\s*transparent\s*\)/
        );
        if (!match) return;

        const varName = match[1] || match[4];
        const pct = match[2] || match[3];
        const alpha = (parseFloat(pct) / 100).toString();
        const fallback = `rgba(var(${varName}-rgb), ${alpha})`;

        const isMatch = (val) =>
          val === `var(${varName})` ||
          new RegExp(`^var\\(\\s*${varName}\\s*\\)$`).test(val.trim());

        const replaceDecl = (container) => {
          container.walkDecls(decl.prop, (n) => {
            if (isMatch(n.value)) n.value = fallback;
          });
        };

        if (decl.parent === atRule && atRule.parent) {
          atRule.parent.each((node) => {
            if (node.type === "decl" && node.prop === decl.prop && isMatch(node.value)) {
              node.value = fallback;
            }
          });
        }

        if (decl.parent?.type === "rule") {
          const sel = decl.parent.selector;
          let prev = atRule.prev();
          while (prev) {
            if (prev.type === "rule" && prev.selector === sel) replaceDecl(prev);
            if (prev.type === "atrule") {
              prev.walkRules((r) => {
                if (r.selector === sel) replaceDecl(r);
              });
            }
            prev = prev.prev();
          }
        }
      });
    });
  },
});
module.exports.postcss = true;
