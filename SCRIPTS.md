# NPM Scripts

The following npm scripts are available for this project.

```
DEVELOPMENT
===========

start ... convenience alias to 'dev' (that launches continous dev process)

dev ...... launch development process (continuous integration)
           NOTE: Currently this is an alias to test:all:watch
                 Other options to consider: 
                  - npm run test:lib:watch
                  - npm-run-all --parallel build:watch test:lib:watch
                    ... advantage of continuous build is that auto-linting is performed


BUILDING
========

build ................... bundle library for publication (same as 'build:plat:bundle')
build:watch  ............ ditto (continuously)

build:plat:{platform} ... bundle library for specified Target Platform (see below)
build:plat:bundle
build:plat:bundle.min
build:plat:lib
build:plat:es
build:plat:all
build:clean ............. clean all machine-generated build directories

prepublish .............. cleanly build/test all machine generated resources,
                          a pre-publication utility:
                            - verify code quality (lint)
                            - show outdated installed packages
                            - clean (delete) ALL machine generated resources
                            - build all bundled libraries (for publication)
                            - test (against our master src)
                            - generate the code coverage report



TESTING
=======

test ......... run ALL unit tests on master src
test:watch ... ditto (continuously)


CODE QUALITY
============

check ... convenience script to:
           - verify code quality (lint)
           - show outdated installed packages
           - run tests (against our master src)
           - generate the code coverage report

lint .... verify code quality, linting BOTH production and test code.
          NOTE: Real-time linting is ALSO applied on production code
                through our WebPack bundler (via 'build:watch')!

cov ........... evaluate code coverage in executing our test suite (gen report in coverage/)
cov:publish ... publish code coverage results to codacy.com (for visiblity)
cov:clean ..... clean the machine-generated coverage/ directory

pkgReview ... show outdated installed packages



DOCUMENTATION
=============

docs ... build docs - integrating Dev Guide (GitBook: docs/*) with API (JSDoc comments: src/*.js)

docs:api ....... generate docs/api.md from embedded JSDoc comments in src/*.js (run as needed)

docs:prepare ... install gitbook/plugins/dependencies (run once and whenever a plugin is added)
docs:build ..... alias to docs script (minus docs:prepare)
docs:serve ..... build/serve docs (http://localhost:4000/), continuously watching for changes

docs:publish ......... publish docs to gh-pages branch (from _docs/)
                       NOTE: make sure to copy _book/ to _docs/cur/

docs:jsdoc2md:help ... show jsdoc2md command-line help (convenience)
docs:gitbook:help .... show GitBook command-line help (convenience)

docs:clean ... clean the machine-generated docs (_book/ and _docs/cur/)




MISC
====

clean ... cleans ALL machine-generated directories (build, and coverage)
```


## Target Platform

Some npm scripts target a platform (i.e. the JS module ecosystem),
using 'plat' nomenclature (i.e. platform).

Specifically:

 - `build:plat:{platform}`

Supported platforms are:

```
Env Variable
MODULE_PLATFORM  What                 Bindings  Found In               NOTES                   
===============  ===================  ========  =====================  ========================
src              master ES6 source    ES        src/*.js               DEFAULT                 
bundle           bundled ES5          CommonJS  dist/{project}.js                              
bundle.min       bundled/minified ES5 CommonJS  dist/{project}.min.js                          
lib              ES5 source           CommonJS  lib/*.js                                       
es               ES5 source           ES        es/*.js                                        
all              all of the above                                      Used in npm scripts ONLY
```
