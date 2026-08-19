# AGENTS.md

Ionic Angular standalone app (Angular 20, Ionic 8, Capacitor 8). No NgModules — all components are standalone.

## Commands

| Task | Command |
|------|---------|
| Dev server | `npm start` |
| Build (prod) | `npm run build` |
| Lint | `npm run lint` |
| Unit tests | `npm test` |
| Sync + copy to native | `npx cap sync` |

The Ionic CLI wraps the Angular CLI. Either works:

```sh
ionic serve                     # same as npm start
ionic generate page <name>      # standalone page
ionic generate component <name> # standalone component
```

No CI workflows, no Prettier. Run `lint` before committing.

## Architecture

```
src/
  main.ts              # Bootstrap (standalone AppComponent)
  app/
    app.component.*    # Root shell
    app.routes.ts      # Top-level routes (lazy-loaded)
    home/              # Pages (lazy loaded)
  environments/        # environment.ts / environment.prod.ts
  theme/               # Ionic CSS variables
  global.scss          # Global styles
  assets/              # Static assets copied to www/
```

- Build output goes to `www/` (Capacitor webDir).
- Routes are lazy-loaded via `loadComponent`.

## Conventions

- **Ionic imports**: Use `@ionic/angular/standalone` (e.g. `IonApp`, `IonRouterOutlet`), not `@ionic/angular`.
- **Component suffixes**: Must end in `Page` or `Component` (enforced by ESLint).
- **Selectors**: `app-` prefix, kebab-case (e.g. `app-home`). Directives use `app` camelCase.
- **Styles**: SCSS. Global styles in `src/global.scss` and `src/theme/variables.scss`.
- **Environments**: `src/environments/environment.ts` (dev) and `environment.prod.ts` (prod, swapped via `fileReplacements` in `angular.json`).
- Strict TypeScript: `strict`, `noImplicitReturns`, `noFallthroughCasesInSwitch` all enabled.
- Angular strict templates enabled.

## Gotchas

- `npm test` opens a real Chrome browser — will fail in headless-only environments.
- Component style budget: 4 KB max per component style (production build error).
