# Conversation AI - Crowdsource WebApp

This is an angulat 7 project that provides a crowdsourcing UI for various tasks.
The code expects an api-server to be running.

## Development

Startup the api-server (on port 8080), and then run `ng serve` in this
directory. This will live watch the codebase. Requests to `/client_jobs/*` get
forwarded by the `proxy.cong.json` configuration of Webpack's development
server, to `localhost:8080`. By default the angular app's static content is
served by webpack on http://localhost:4200

## Deployment

1. Build the project's static code:

  ```bash
  ng build
  ```

1. Copy the code from the local `dist` directory to the `api-server`'s subdirectory
`static/`:

  ```bash
  cp -r dist/* ../api-server/static/
  ```

  The api-server will serve html from that location.

1. Set the service name in the `app.yaml` file

1. Login and set the gcloud project:

  ```bash
  gcloud auth login
  gcloud config set project <project_name>
  ```

1. Run gcloud deploy command:

  ```bash
  gcloud app deploy
  ```
