# Distribution

This utility is primarily distributed as an [npm
package](https://www.npmjs.com/package/feature-u) (*simply `npm
install` and use it in your [Node.js](https://nodejs.org/en/)
development environment*).

As with any npm package, individual aspects of the install can be
obtained through unpkg.com:
[https://unpkg.com/feature-u/](https://unpkg.com/feature-u/)

The following executable bindings are available (**it's your
choice**):

```
                 Module
Directory  What  Bindings Notes
=========  ====  ======== ======================================
src/       ES6   ES       the master source
dist/      ES5   CommonJS a UMD bundle: feature-u[.min].js
lib/       ES5   CommonJS transpiled from src/
es/        ES5   ES       transpiled from src/
```

## Documentation

This documentation was produced by integrating two technologies:
[GitBook](https://github.com/GitbookIO/gitbook) *(for the Guide)*, and
[JSDoc](http://usejsdoc.org/) *(for the API)*, **documented here**:
[Integrating GitBook with JSDoc to Document Your Open Source
Project](https://medium.com/@kevinast/integrate-gitbook-jsdoc-974be8df6fb3).

**feature-u** maintains version-specific documentation for all of it's
releases _(see: [Revision History](history.md))_ ... ex: https://feature-u.js.org/0.1.0/.
This allows you to match the correct documentation to the specific
version you are using.
For your convenience the base https://feature-u.js.org/ will always
reference the most current release.
