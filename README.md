# Development Workflow

    npm run serve

This starts a server at `localhost:8000`. Watchify will compile `main.coffee` in the site directory into `build.js` which has all its dependencies resolved and is ready to run in the browser. Jade will watch and pick up changes to .jade files.

After you've pushed up the changes run

    bin/publish

to publish the contents of the `site/` directory to GitHub pages.
