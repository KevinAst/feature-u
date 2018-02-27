import verify   from './verify';
import isString from 'lodash.isstring';

/*--------------------------------------------------------------------------------
  feature-u's logging utility:
   - can be enabled/disabled at run-time
   - all logging probes are prefixed with: ***feature-u***
   - a simple layer on top of console.log()
   - for internal use only
     ... selected functions are exposed to the client through the
         UNDOCUMENTED launchApp.diag mechanism (for diagnostic purposes)

  API:
    + logf(msg [,obj]): void       ... conditionally log probe when feature-u logging is enabled
    + logf.force(msg [,obj]): void ... unconditionally log probe
    + logf.isEnabled(): true/false ... is feature-u logging enabled or disabled
    + logf.enabled(): void         ... enable feature-u logging
    + logf.disable(): void         ... disable feature-u logging
    + logf.elm2html(elm): htmlStr  ... convert react elm into nicely formatted html markup

    > FOR PLUGIN PROJECTS:
      - support their own unique prefix by emitting a new higher-order logf function
      - STILL undocumented (at this point)
    + logf.newLogger(prefix): logf ... support plugin project logging with their own prefix (a HOF logger)
  --------------------------------------------------------------------------------*/

const msgPrefix = '***feature-u*** ';
let   _enabled  = false;

// API: logf(msg [,obj]): void ... conditionally log probe when feature-u logging is enabled
export default function logf(msg, obj) {
  if (logf.isEnabled()) {
    logf.force(msg, obj);
  }
}

// API: logf.force(msg [,obj]): void ... unconditionally log probe
logf.force = function(msg, obj) {
  msg = msgPrefix + msg;
  if (obj) {
    console.log(msg, obj);
  }
  else {
    console.log(msg);
  }
};

// API: logf.isEnabled(): true/false ... is feature-u logging enabled or disabled
logf.isEnabled = function() {
  return _enabled;
};

// API: logf.enabled(): void ... enable feature-u logging
logf.enable = function() {
  _enabled = true;
};

// API: logf.disable(): void ... disable feature-u logging
logf.disable = function() {
  _enabled = false;
};



let elm2htmlOneTimeWarning = `WARNING: By default any react element content is OMITTED.

This can be overridden by doing the following (before launchApp() is invoked):

- To see the (rather verbose) raw object content, do this:
    launchApp.diag.logf.elm2html = (elm) => elm;

- To see nicely formatted html markup, do this:
    import ReactDOMServer from 'react-dom/server';
    ...
    launchApp.diag.logf.elm2html = (elm) => ReactDOMServer.renderToStaticMarkup(elm);

`;

// API: logf.elm2html(elm): htmlStr ... convert react elm into nicely formatted html markup
//      the default logf.elm2html() implementation OMITs the elm content
//      BECAUSE:
//        1: we don't want to have a dependency on react-dom (for nicely formatted html markup)
//        2: the raw object content is verbose and un-interpretable
//      HOWEVER:
//        3: it can be overridden by the client (see one-time log entry above)
logf.elm2html = function(elm) {

  // emit one-time warning
  if (elm2htmlOneTimeWarning) {
    logf(elm2htmlOneTimeWarning);
    elm2htmlOneTimeWarning = null;
  }

  // return indication of omission
  return 'OMITTED';
};


// API: logf.newLogger(prefix): logf ... support plugin project logging with their own prefix (a HOF logger)
logf.newLogger = function(prefix) {

  const check = verify.prefix('logf.newLogger() parameter violation: ');
  check(prefix,           'prefix is required');
  check(isString(prefix), 'prefix must be a string');

  const newLogger = function(msg, obj) {
    // re-implement to hook into our .force() ... where the prefixing occurs
    if (logf.isEnabled()) {
      newLogger.force(msg, obj);
    }
  };

  // this is where the magic happens (i.e. the additional prefixing)
  newLogger.force = function(msg, obj) {
    return logf.force(prefix+msg, obj);
  };

  // apply all same logf.properties (for consistant API)
  // ... referencing original logf master
  // >>> NOTE: this means there is ONE enablement and elm2html().
  //           KIS:  Keep it Simple
  //           EX:   by enabling logf, all plugin logging is enabled too
  //           ALSO: by enabling plugin logging, ALL logging is enabled (logf, and other plugins)
  newLogger.isEnabled = logf.isEnabled;
  newLogger.enable    = logf.enable;
  newLogger.disable   = logf.disable;
  newLogger.elm2html  = (elm) => logf.elm2html; // always dereference original logf to pick up any function overrides
//newLogger.newLogger = logf.newLogger; // NOT: we draw the line somewhere (in this simple implementation)
  
  // thats all folks
  return newLogger;
};
