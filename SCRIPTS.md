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
                            - build/test all bundled libraries (for publication)
                            - build documentation
                            - generate the code coverage report



TESTING
=======

test ................... run ALL unit tests on master src (same as 'test:all' or 'test:plat:src')

                         Following runs SELECTED tests ON master src
                         ===========================================
test:lib ............... run unit tests that are part of our published library  TODO: NOT yet in feature-u
test:lib:watch ......... ditto (continuously)                                   TODO: NOT yet in feature-u
test:samples ........... run unit tests from our sample code (in the Dev Guide) TODO: NOT yet in feature-u
test:samples:watch ..... ditto (continuously)                                   TODO: NOT yet in feature-u
test:all ............... run ALL our unit tests
test:all:watch ......... ditto (continuously)

                         Following runs ALL tests ON specified Target Platform
                         =====================================================
test:plat:{platform} ... see discussion below
test:plat:src
test:plat:bundle
test:plat:bundle.min
test:plat:lib
test:plat:es
test:plat:all


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

docs:publish ......... publish docs, tagged with 'vn.n.n-docs' (n.n.n from package.json)
                       NOTE: If re-publishing an existing release (i.e. the 'vn.n.n-docs'
                             tag pre-exists), you must FIRST manually delete the tag:
                             - from github
                             - purge node_modules/gh-pages/.cache (to remove cached tag info)
docs:publish:patch ... same as publish, except NO tag
                       NOTE: Use this sparingly, as it is not traceable to a specific release!

docs:jsdoc2md:help ... show jsdoc2md command-line help (convenience)
docs:gitbook:help .... show GitBook command-line help (convenience)

docs:clean ... clean the machine-generated docs (_book/)




MISC
====

clean ... cleans ALL machine-generated directories (build, docs, and coverage)
```



## Testing Dynamics

Our unit tests have the ability to dynamically target each of our
published platforms, through the `test:plat:{platform}` script (see the
[Target Platform](#target-platform) discussion below).

- During development, our tests typically target the master src
  directly, and continuously (through the `test:lib:watch` script).
  
- However, before any bundle is published, it is a good practice to run
  our test suite against each of the published bundles (through the
  `test:plat:all` script).

Testing dynamics is accomplished by our unit tests importing
[ModuleUnderTest](tooling/ModuleUnderTest.js), which in turn
dynamically exports the desired test module, as controlled by the
MODULE_PLATFORM environment variable.

**There is one slight QUIRK in this process** ... that is: *ALL
supported platforms MUST exist before you can test one of them*.  The
reason for this is that
[ModuleUnderTest.js](tooling/ModuleUnderTest.js) must import all
the platforms and then decide which one to export *(this is due to the
static nature of ES6 imports)*.

**As it turns out, this is not a big deal**, it's just a bit of
un-expected behavior.  During development, our tests typically
continuously target the master src (which doesn't require any
re-building).  So the `build:plat:all` script **does NOT have to be run
continuously ... just once, after a clean** (to prime the pump).




## Target Platform

Some npm scripts target a platform (i.e. the JS module ecosystem),
using 'plat' nomenclature (i.e. platform).

Specifically:

 - `build:plat:{platform}`
 - `test:plat:{platform}`

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

The 'plat' nomenclature helps disambiguate the difference between (for example):
 - `test:all:     ` identifies WHICH tests to run (i.e. all tests)
 - `test:plat:all:` identifies WHICH platform to run tests on (i.e. all platforms)
