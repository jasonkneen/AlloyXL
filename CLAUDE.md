# CLAUDE.md - AI Assistant Guide for AlloyXL

## Project Overview

**AlloyXL** is a JavaScript library that enhances the [Appcelerator Titanium](https://github.com/appcelerator/titanium_mobile) [Alloy MVC framework](https://github.com/appcelerator/alloy). It overrides `Alloy.createController` to provide automatic controller lifecycle management, cleanup, and global access.

- **Author**: Jason Kneen
- **License**: Apache 2.0
- **npm package**: `alloyxl`
- **Current version**: 1.0.4

## Repository Structure

```
AlloyXL/
├── alloyXL.js       # Main source file (single-file library)
├── package.json     # npm package configuration
├── readme.md        # User documentation
├── publish.sh       # npm publish script
├── dist/            # Distribution zip files (versioned CommonJS bundles)
├── .gitignore       # Git ignore rules
└── .npmignore       # npm publish ignore rules
```

## Core Functionality

The library provides these key features by overriding `Alloy.createController`:

1. **Automatic Cleanup**: Controllers are automatically cleaned up when their window closes
2. **Global Controller Access**: Controllers accessible via `Alloy.Controllers.controllerName`
3. **Lifecycle Events**: `open`, `close`, and `postlayout` events on Window views
4. **Once Event Handler**: `controller.once(eventName, callback)` for one-time events
5. **Global App Events**: `Alloy.App` event bus using Backbone.Events
6. **Double-tap Prevention**: Touch timeout to prevent accidental double taps

## Key Code Patterns

### Configuration Options
```javascript
require("alloyXL").options({
    debug: false,       // Disable debug messages (default: true in ENV_DEV)
    touchTimeout: 250   // Touch disable duration in ms (default: 750)
});
```

### Global Variables
- `Alloy.Controllers` - Object storing references to created controllers
- `Alloy.App` - Global event bus (Backbone.Events clone)
- `debug` - Boolean flag for debug logging (default: true)
- `touchTimeout` - Milliseconds to disable touch after tap (default: 750)

### Controller Cleanup Flow
1. Window `close` event fires
2. `cleanUpController()` nullifies controller in `Alloy.Controllers`
3. Recursively cleans nested `__views`
4. Calls `controller.off()` and `controller.destroy()`

## Development Workflow

### Making Changes
1. Edit `alloyXL.js` directly (single-file library)
2. Test in a Titanium Alloy project by placing in `lib/` folder
3. Update version in `package.json`
4. Run `./publish.sh` to publish to npm

### Publishing
```bash
# Update version in package.json first
npm publish
# or
./publish.sh
```

### Distribution Files
The `dist/` folder contains versioned CommonJS zip bundles for manual installation. These are created for each release.

## Code Conventions

### Debug Logging
- Debug messages prefixed with `::AlloyXL::`
- Only output when `ENV_DEV && debug` is true
- Log controller open, close, cleanup, and postlayout events

### Naming
- Controller names derived from path (last segment): `path/to/controller` -> `controller`
- Can be overridden by setting `id` on the top-level view

### Event Handling
- Uses Backbone.Events pattern for controller events
- Native Titanium `addEventListener`/`removeEventListener` for view events
- Event listeners self-remove to prevent memory leaks

## Important Implementation Details

### Webpack Compatibility
The library stores the original `Alloy.createController` and calls it internally rather than using `require("alloy/controllers/...")` directly.

### Controller Conflicts
If multiple controllers have the same name, a warning is logged. Use unique `id` attributes on top-level views to avoid conflicts.

### View Type Detection
- Checks for `view.open` function to detect Windows/NavigationWindows
- Falls back to just `postlayout` events for regular Views

## Testing

No automated test suite exists. Test manually by:
1. Installing in a Titanium Alloy project's `lib/` folder
2. Adding `require("alloyXL")` to `alloy.js`
3. Creating controllers and verifying lifecycle events fire correctly

## Dependencies

- **Runtime**: Requires Titanium Alloy framework (provides `Alloy`, `Backbone`, `_` globals)
- **Development**: None (no build process or dev dependencies)

## Common Tasks for AI Assistants

### Adding a New Option
1. Add default value at module scope (lines 6-7)
2. Update `exports.options` function to accept new option
3. Use the option in `Alloy.createController`
4. Document in readme.md

### Modifying Cleanup Behavior
The `cleanUpController` function (lines 16-31) handles all cleanup. Modify carefully as it recursively processes nested views.

### Adding New Events
Follow the pattern at lines 68-100: add event listener, trigger controller event, remove listener, log if debug enabled.
