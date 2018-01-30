# Feature Enablement

Each feature has a `Feature.enabled` boolean property that determines
whether it is enabled or not (see
{{book.guide.detail_builtInAspects}}).  

This indicator is typically based on a dynamic expression, allowing
packaged code to be dynamically enabled/disabled at run-time.  This is
useful in a number of different situations.  For example:

- some features may require a license upgrade

- other features may only be used for diagnostic purposes, and are
  disabled by default

If need be you can use the {{book.api.App}} object to determine if a
feature is present or not (see:
{{book.guide.detail_doesFeatureExist}}).
