# PlaceBook

PlaceBook is a full-stack property marketplace built with the MERN stack. Users can sign up, sign in, manage their profile, and create, update, search, and delete property listings for rent or sale.

## Features

- Email/password authentication with JWT stored in an httpOnly cookie
- Protected routes for profile and listing management
- Property listings with images, amenities, pricing, and rent/sale types
- Search and filtering by term, type, offer, parking, furnished, and price/date sorting
- Image uploads powered by [UploadThing](https://uploadthing.com) (profile avatar and listing images)
- Responsive UI built with Tailwind CSS

## Tech Stack

**Client:** React 18, Vite, React Router, Redux Toolkit, redux-persist, Tailwind CSS, Swiper, UploadThing React SDK

**Server:** Node.js, Express, MongoDB/Mongoose, JWT, bcryptjs, UploadThing Express adapter

## Project Structure

```
Property-Marketplace/
├─ client/   React + Vite single-page app
└─ server/   Express REST API
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database (local or Atlas)
- UploadThing account and app token

### 1. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Configure environment variables

Create `server/.env`:

```env
PORT=6500
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your-secret-key
UPLOADTHING_TOKEN=your-uploadthing-token
```

The client does not require any environment variables in development. UploadThing requests are sent to `/api/uploadthing` and proxied to the Express server by Vite.

### 3. Run the app

```bash
cd server
npm start

cd ../client
npm run dev
```

The client runs on Vite's default port (`5173`) and proxies `/api` requests to the server on port `6500`.

## API Overview

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | No | Register a user |
| POST | `/api/auth/signin` | No | Sign in and set the auth cookie |
| GET | `/api/auth/signOut` | No | Clear the auth cookie |
| POST | `/api/users/update/:id` | Yes | Update the current user |
| DELETE | `/api/users/delete/:id` | Yes | Delete the current user |
| GET | `/api/users/:id` | Yes | Get a user |
| GET | `/api/users/listings/:id` | Yes | Get the current user's listings |
| POST | `/api/listing/create` | Yes | Create a listing |
| POST | `/api/listing/update/:id` | Yes | Update an owned listing |
| DELETE | `/api/listing/delete/:id` | Yes | Delete an owned listing |
| GET | `/api/listing/get/:id` | No | Get a single listing |
| GET | `/api/listing/get` | No | Search and filter listings |
| POST/GET | `/api/uploadthing` | Yes* | UploadThing upload endpoint |

\* The UploadThing route itself is public because it also receives signed callbacks from UploadThing. Uploads are authorized per file route using the `access_token` cookie.

## File Uploads

Two UploadThing file routes are defined in `server/uploadthing.js`:

- `avatarUploader` - one image, up to 2 MB
- `listingImageUploader` - up to six images, each up to 2 MB

Uploaded URLs are stored in MongoDB (`avatar` on users, `imageUrls` on listings), so the database does not depend on any specific storage provider.

## Notes

- The app uses a JWT cookie, so the client and API should be served from the same origin in production (or configured with CORS credentials and secure cookie settings).
- The server must have a valid `UPLOADTHING_TOKEN` to start handling uploads.
- Listings and avatars uploaded with the previous Firebase integration are not migrated automatically.
