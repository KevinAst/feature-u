import logf      from '../logf';
import launchApp from '../../core/launchApp';

describe('logf() tests', () => {

  //***--------------------------------------------------------------------------------
  describe('VERIFY enablement', () => {

    test('enable logs', () => {
      logf.enable();
      expect(logf.isEnabled())
        .toBe(true);
    });

    test('disable logs', () => {
      logf.disable();
      expect(logf.isEnabled())
        .toBe(false);
    });

  });

  //***--------------------------------------------------------------------------------
  describe('VERIFY elm2html()', () => {

    test('test elm2html()', () => {
      expect(logf.elm2html('fake-elm'))
        .toMatch(/OMITTED/);
    });

  });

  //***--------------------------------------------------------------------------------
  describe('VERIFY newLogger()', () => {

    test('newLogger() required param', () => {
      expect(()=>logf.newLogger())
        .toThrow(/prefix is required/);
      // THROW: logf.newLogger() parameter violation: prefix is required
    });

    test('newLogger() non string prefix', () => {
      expect(()=>logf.newLogger(123))
        .toThrow(/prefix must be a string/);
      // THROW: logf.newLogger() parameter violation: prefix must be a string
    });

    test('newLogger() invocation', () => {
      const myLogger = logf.newLogger('~myLogger~ ');
      myLogger.enable(); // quick-and-dirty: activate this temporarly to visually see results
      myLogger('This is a test FROM: myLogger');
      logf('This is a test FROM: logf', 'THE END');
    });

  });

  describe('VERIFY simple launchApp.diag passthrough', () => {

    test('enable logs', () => {
      const original = launchApp.diag.logf.isEnabled();
      launchApp.diag.logf.enable();
      expect(launchApp.diag.logf.isEnabled())
        .toBe(true);
      // reset to original (just in case it impacts other tests)
      if (original)
        launchApp.diag.logf.enable();
      else
        launchApp.diag.logf.disable();
    });

  });


});
