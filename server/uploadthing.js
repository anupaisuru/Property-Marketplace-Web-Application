import jwt from "jsonwebtoken";
import { createUploadthing } from "uploadthing/express";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// Runs before an upload is allowed. Relies on the access_token cookie
// that is set by the auth controller, so cookie-parser must be mounted
// before the UploadThing route handler.
const requireUser = (req) => {
  const token = req.cookies?.access_token;

  if (!token) {
    throw new UploadThingError("You must be signed in to upload files");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch {
    throw new UploadThingError("Your session has expired, please sign in again");
  }
};

const auth = ({ req }) => ({ userId: requireUser(req) });

export const uploadRouter = {
  avatarUploader: f({
    image: { maxFileSize: "2MB", maxFileCount: 1, minFileCount: 1 },
  })
    .middleware(auth)
    .onUploadComplete(({ metadata }) => ({ uploadedBy: metadata.userId })),

  listingImageUploader: f({
    image: { maxFileSize: "2MB", maxFileCount: 6, minFileCount: 1 },
  })
    .middleware(auth)
    .onUploadComplete(({ metadata }) => ({ uploadedBy: metadata.userId })),
};
