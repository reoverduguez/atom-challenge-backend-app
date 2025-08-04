# Atom Challenge Express App Solution

This is the backend API for the Atom Challenge application, built with Node.js, Express, and TypeScript.
It integrates with Firebase Admin SDK for authentication and uses a clean, modular architecture for scalability and maintainability.

## Features
- Firebase Auth integration (token verification middleware)
- Modular and clean folder structure
- Task and User CRUD logic via services and repositories
- Environment-based CORS and secure secrets loading
- Full support for unit testing using Jest and supertest

## Local Development
1. nstall dependencies
```bash
npm i
```

2. Create an .env file
```bash
PORT=3000
CORS_ORIGIN=https://local-frontend-url.com
GOOGLE_APPLICATION_CREDENTIALS_JSON=base64EncodedServiceAccount
```

3. Start development server
```bash
npm run dev
```

## Heroku Deployment
This app currently lives in https://atom-reoverduguez-express-app-3d84121e68b6.herokuapp.com. Any changes to the code are deployed using.

```bash
git push heroku main
```

Prior to deployment changes must be commited to git.

You can check production logs with:

```bash
heroku logs --tail --app [app-name]
```

## Testing
Run unit tests with

```bash
npm run test
```