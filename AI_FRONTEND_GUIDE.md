2. Understand the backend contract

Before making UI, you need to know what you're connecting to.

Conceptually, your API looks like this:

Area	What FE needs
Auth	login, logout, refresh session, current user
Dashboard	product/category/slider counts
Categories	list/create/edit/delete
Products	list/create/edit/delete/enable-disable
Product images	upload/list/edit/delete/enable-disable
Sliders	list/create/edit/delete/enable-disable
Admins	list/create/edit/delete

Some GET endpoints are public, while admin mutations require authentication.

This distinction should control your routing:

Public site
├── Menu/products
├── Categories
└── Active sliders

Admin
├── Login
└── Protected area
    ├── Dashboard
    ├── Categories
    ├── Products
    ├── Sliders
    └── Admins
3. Understand authentication before doing anything else

This one is particularly important.

The backend reads:

request.cookies.get("access_token")

So this project uses cookies, not "put JWT in localStorage".

Your FE API requests will eventually need something like:

fetch(url, {
  credentials: 'include',
})

And your app should check authentication using:

GET /auth/me

Conceptually:

App starts
   ↓
GET /auth/me
   ↓
200 → logged in
401 → try /auth/refresh if appropriate
   ↓
success → continue
failure → /login

Do not build an auth system where React stores these JWTs in localStorage.

4. There are backend blockers I would raise NOW

This is probably the most valuable thing from inspecting the repo.

🚨 Blocker 1 — token generation appears broken -> Done

In:

Tomoor-CafeAPI/app/core/security.py

there is:

expire = datetime.utcnow + expires_delta

It should presumably call the function:

datetime.utcnow()

As currently written, login/token creation is likely to error.

Tell the backend developer before you spend time debugging "why login from React doesn't work."

🚨 Blocker 2 — how do we create the first admin?

POST /admins/ requires an already authenticated admin.

But database initialization only creates tables. I don't see creation of an initial admin.

So:

Need admin to create admin
       ↑
But no admin exists initially

There needs to be a bootstrap mechanism, seed admin, migration, CLI command, or some other agreed process.

Again: backend/team decision, not something FE should work around.

🚨 Blocker 3 — image upload currently points to another project

I found paths like:

../../../../WorkProjects/TurmusayyaSweet/...

inside the Tomoor Cafe backend.

That's a major red flag for this project.

Product and slider uploads currently reference a completely different project directory.

Also, I don't see the FastAPI app exposing those uploaded files as static files.

So before you implement:

Upload image
→ display preview
→ save product
→ later display product image

just fix the path

🚨 Blocker 4 — production auth settings aren't ready yet

Currently CORS only allows:

http://localhost:5173

Cookies also use development-oriented settings such as:

secure=False

That's normal during early development, but because this is a real customer project, the team needs a production plan for:

frontend domain
API domain
HTTPS
CORS
cookie domain
Secure
SameSite

before launch.

🚨 Blocker 5 — admin data/API responses need security review

The backend has no explicit response models right now, and the Admin ORM model contains:

hashed_password

Admin endpoints should be checked carefully to guarantee that password hashes are never returned to the browser.

Also, login currently returns access/refresh tokens in JSON in addition to setting HttpOnly cookies.

If the goal is HttpOnly-cookie authentication, I'd ask the backend developer whether tokens should be returned in the JSON body at all.

These aren't things I'd "fix from FE." Raise them with the team.

5. Then design your FE architecture

Only after the API questions above are agreed.

I would aim toward roughly:

src/
├── app/
│   ├── router.tsx
│   └── App.tsx
│
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── categories/
│   ├── products/
│   ├── sliders/
│   └── admins/
│
├── shared/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── types/
│   └── utils/
│
├── layouts/
│   ├── AdminLayout.tsx
│   └── PublicLayout.tsx
│
└── styles/

Don't create 50 abstractions on day one.

Start simple and extract patterns after you actually see repetition.

6. Your first FE code should be infrastructure, not pretty pages

I would build in this order:

1 → Environment config

Something like:

VITE_API_URL

Never scatter:

"http://localhost:8000"

through components.

2 → API client

One location handling:

base URL
credentials
JSON
HTTP errors
401 handling
refresh

3 → TypeScript API types

For example conceptually:

type Category = {
  id: number
  name_ar: string
  name_en: string
  created_at: string
}

But get the actual response from Swagger/API before finalizing these.

4 → Router

Public routes and protected admin routes.

5 → Authentication state

Check /auth/me.

6 → Admin layout

Sidebar/header/content area.

7. First vertical slice: Login → Dashboard

This should be your first real feature.

Don't build all screens simultaneously.

Build:

/login
   ↓
POST /auth/login
   ↓
cookie created
   ↓
GET /auth/me
   ↓
redirect /admin
   ↓
GET /dashboard/stats
   ↓
show real dashboard data

Why start here?

Because it validates almost everything fundamental:

React
routing
API base URL
CORS
cookies
authentication
protected routes
error handling
backend connection
production architecture assumptions

If that works cleanly, the rest becomes significantly easier.

8. Then Categories

Categories are a good first CRUD feature because they're simple:

name_ar
name_en

Build:

Categories list
Create category
Edit category
Delete category
Loading state
Empty state
API error state
Validation
Delete confirmation
Success feedback

This becomes your CRUD pattern.

9. Then Products

Products are more complicated:

category
Arabic name
English name
Arabic description
English description
price
main image
active/inactive
additional images

By this point you already have your CRUD pattern from Categories.

But don't finish image behavior until the backend image-storage issue is resolved.

10. Then Sliders

Same principles:

Arabic title
English title
image
display order
active/inactive

Pay attention to the backend rule that display_order must be unique.

If the backend returns:

{
  "detail": "Display order already exists"
}

show something meaningful to the admin instead of:

Something went wrong.

11. Then Admin management

Do this after authentication is stable.

Admin fields are:

username
email
password

This page deserves extra security attention.

And again, make sure the backend never sends password hashes to FE.

12. Arabic/English needs to be designed early

Don't add RTL at the end.

Your data already explicitly supports:

name_ar
name_en

description_ar
description_en

title_ar
title_en

So you need to determine whether the application interface itself is bilingual or only café content.

If the UI is bilingual, think:

<html lang="ar" dir="rtl">

versus:

<html lang="en" dir="ltr">

and make your layout work naturally in both directions.

13. Every page needs more than the happy path

For a real customer, a page isn't complete when the table appears.

For every API-driven screen think:

Loading
Success
No data
Network error
401/session expired
403 if roles arrive later
404
Validation error
Backend validation error
Slow request
Double-click/submission
Delete confirmation
Successful mutation
Failed mutation
Mobile layout
Keyboard navigation
RTL

This is where production FE differs from a school/demo app.

14. Your definition of "done"

Before merging a feature, I would expect:

✓ actual backend integration
✓ no mocked production data
✓ loading state
✓ empty state
✓ error state
✓ form validation
✓ backend errors displayed correctly
✓ responsive
✓ Arabic/English checked
✓ RTL checked if required
✓ keyboard accessible
✓ destructive actions confirmed
✓ no console errors
✓ no secrets
✓ npm run lint passes
✓ npm run build passes
✓ tested against actual API
✓ reviewed diff
And this is how AI should help you

The important part:

don't use AI as "build the whole customer app, go."

Use it as a senior pair programmer/reviewer.

A safe workflow with me would be:

YOU + requirements/backend
          ↓
1. Understand one feature
          ↓
AI reads relevant files
          ↓
2. We define the exact API/data flow
          ↓
3. I explain implementation
          ↓
4. Implement a small piece
          ↓
5. Run lint/build/tests
          ↓
6. AI reviews the diff
          ↓
7. You manually verify behavior
          ↓
8. Commit
          ↓
Next feature
AI is very useful for

I can inspect this repo and help you:

understand unfamiliar backend code;
map API endpoints;
explain authentication;
design the React structure;
create TypeScript types;
build API functions;
implement components;
review forms;
handle edge cases;
spot security mistakes;
review your git diff;
debug browser/API errors;
write tests;
check accessibility;
refactor duplicate code;
explain code I generate so you actually understand it.

And you can stop me at any point and ask:

"Why are we doing this?"

I should be able to justify it.

AI should not decide

AI should not independently decide:

customer requirements;
business rules;
permissions;
branding;
what data may be exposed;
production infrastructure;
security policy;
deployment credentials;
whether an API behavior is "probably what backend meant."

For those, we verify with the customer/team/backend.
