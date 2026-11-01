import { generateReactHelpers } from "@uploadthing/react";

// UploadThing requests go to the same origin (/api/uploadthing) and are
// proxied to the Express server by Vite in development, so the auth cookie
// is sent along automatically.
export const { useUploadThing } = generateReactHelpers();
