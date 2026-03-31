# Staff authentication upgrade guide

This project is transitioning staff access away from a shared `STAFF_ACCESS_TOKEN` and toward real per-user JWT-based authentication.

This document explains the current model, the target model, and how to migrate existing deployments without removing backward compatibility too early.

## Why this change is happening

The current pilot implementation uses one shared secret for all staff access:

- staff users enter the same clinic-wide access code
- the app verifies that code against `STAFF_ACCESS_TOKEN`
- successful login stores an HTTP-only cookie for later staff requests

That approach was acceptable for an early pilot because it was simple and fast to stand up, but it has important limitations:

- there is no per-user identity
- actions cannot be reliably attributed to an individual staff member
- rotating access requires coordinating a shared secret across the team
- offboarding is all-or-nothing instead of revoking a single user
- the model does not scale to stronger authorization, auditing, or future RBAC

## New model: per-user JWT staff authentication

The replacement model introduces real staff users and JWT-backed login sessions.

At a high level, the upgraded flow is:

1. a staff user record exists in the `staff_users` data model
2. the user signs in with their own credentials
3. the backend issues a JWT-backed authenticated session
4. the frontend and protected staff APIs use that authenticated session instead of a shared token
5. staff actions can be attributed to the authenticated actor

This change enables:

- individual staff identities
- better auditability and actor attribution
- safer onboarding and offboarding
- future role-based access controls
- eventual removal of the legacy shared-token path

## Compatibility plan during rollout

Legacy shared-token auth is **not** being removed in this wave.

During rollout, authentication mode is controlled by:

```env
STAFF_AUTH_MODE=legacy|jwt
```

Behavior during the transition:

- `STAFF_AUTH_MODE=legacy` keeps the current shared `STAFF_ACCESS_TOKEN` flow
- `STAFF_AUTH_MODE=jwt` enables the new per-user JWT login flow
- `STAFF_ACCESS_TOKEN` support remains available for backward compatibility until the JWT flow is proven in real deployments

This lets existing pilot environments adopt the new model deliberately instead of forcing a same-day cutover.

## Migration steps for an existing deployment

When you are ready to move a deployment to per-user auth:

### 1. Deploy the application version that includes JWT staff auth

Roll out the version that contains:

- the `staff_users` model and related schema changes
- JWT-backed staff login
- frontend staff login updates
- actor attribution updates where applicable

### 2. Seed at least one staff user

Before switching auth modes, create at least one valid staff account in the target environment.

Use the project seeding/bootstrap flow introduced with the new auth work to create the initial staff user. Do not flip the environment to JWT mode until a staff account exists and you have confirmed the credentials.

### 3. Set `STAFF_AUTH_MODE=jwt`

Update the deployment environment:

```env
STAFF_AUTH_MODE=jwt
```

This tells the application to use the new per-user JWT path instead of the shared-token login path.

### 4. Configure JWT signing

Set a strong JWT signing secret in the deployment environment:

```env
JWT_SECRET=replace-with-a-long-random-secret
```

Use a long, high-entropy secret and store it the same way you store other production secrets.

### 5. Verify staff login end to end

After deployment, confirm that staff users can:

- reach the staff login page
- sign in with an individual staff account
- open the dashboard and intake queue
- review sessions and complete privileged staff actions
- see correct actor attribution where exposed by the application

### 6. Remove `STAFF_ACCESS_TOKEN` after JWT mode is confirmed

Once the deployment is running successfully with `STAFF_AUTH_MODE=jwt`, remove the legacy shared secret from the environment:

```env
# remove this after the JWT path is confirmed in the deployment
STAFF_ACCESS_TOKEN=
```

Do this only after the JWT flow has been validated in that environment.

## What changes for existing deployments

If an existing deployment does nothing, it can remain on:

```env
STAFF_AUTH_MODE=legacy
```

In that state:

- current shared-token login continues to work
- `STAFF_ACCESS_TOKEN` is still required
- no immediate operational change is forced

When an existing deployment opts into JWT mode:

- staff members log in as individual users instead of sharing one access code
- the deployment must have seeded staff users
- `JWT_SECRET` must be configured
- `STAFF_ACCESS_TOKEN` is no longer needed once the JWT path is verified

## Operational notes

- Do **not** remove legacy support yet; full removal is intentionally deferred to a later follow-up
- Treat `STAFF_AUTH_MODE=jwt` as the explicit cutover control during the transition period
- Plan a short validation window after switching modes so staff can confirm normal dashboard workflows still work
- Rotate and manage `JWT_SECRET` using the same secret-management practices as other sensitive application credentials

## Recommended rollout sequence

For most environments, the safest sequence is:

1. deploy the auth-upgrade build
2. run migrations
3. seed an initial staff user
4. set `JWT_SECRET`
5. set `STAFF_AUTH_MODE=jwt`
6. validate staff login and queue workflows
7. remove `STAFF_ACCESS_TOKEN`
8. keep monitoring before removing legacy code in a future release

## Follow-up work

This migration wave prepares the system for legacy token removal, but it does **not** complete that removal.

A later cleanup change can delete the old shared-token path once the team has confidence that:

- JWT login is stable
- seeded staff-user onboarding is documented and repeatable
- pilot deployments have successfully transitioned
- no environments still depend on `STAFF_AUTH_MODE=legacy`
