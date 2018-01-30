// protect anchor ids with special characters (via escapeAnchor)
// ... a limitation of GitBook
// ... thanks @zandaqo: https://github.com/jsdoc2md/jsdoc-to-markdown/issues/125
exports.escapeAnchor = function(anchor) {
  return typeof anchor === 'string'
           ? anchor.replace('+', '__').replace('.', '_')
           : anchor;
};
