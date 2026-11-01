import Listing from "../models/listing.js";
import { errorHandler } from "../utils/error.js";

const MAX_IMAGES = 6;

const LISTING_FIELDS = [
  "name",
  "description",
  "address",
  "regularPrice",
  "discountPrice",
  "bathrooms",
  "bedrooms",
  "furnished",
  "parking",
  "type",
  "offer",
  "imageUrls",
];

// Only accept fields that belong to a listing. This prevents clients from
// overriding server-managed fields such as userRef, _id, or timestamps.
const pickListingFields = (body) =>
  Object.fromEntries(
    LISTING_FIELDS.filter((field) => field in body).map((field) => [
      field,
      body[field],
    ])
  );

const imageUrlsError = (imageUrls) => {
  if (!Array.isArray(imageUrls) || imageUrls.length < 1) {
    return "At least one image is required";
  }
  if (imageUrls.length > MAX_IMAGES) {
    return `A listing can have at most ${MAX_IMAGES} images`;
  }
  return null;
};

export const createListing = async (req, res, next) => {
  const listingData = pickListingFields(req.body);

  const imageError = imageUrlsError(listingData.imageUrls);
  if (imageError) return next(errorHandler(400, imageError));

  try {
    const listing = await Listing.create({
      ...listingData,
      userRef: req.user.id,
    });
    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(errorHandler(404, "Listing not found!"));
  }

  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, "You can only delete your own listings!"));
  }

  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json("Listing has been deleted!");
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return next(errorHandler(404, "Listing not found!"));
  }
  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, "You can only update your own listings!"));
  }

  try {
    const updates = pickListingFields(req.body);

    if (updates.imageUrls !== undefined) {
      const imageError = imageUrlsError(updates.imageUrls);
      if (imageError) return next(errorHandler(400, imageError));
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, "Listing not found!"));
    }
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;
    let offer = req.query.offer;

    if (offer === undefined || offer === "false") {
      offer = { $in: [false, true] };
    }

    let furnished = req.query.furnished;

    if (furnished === undefined || furnished === "false") {
      furnished = { $in: [false, true] };
    }

    let parking = req.query.parking;

    if (parking === undefined || parking === "false") {
      parking = { $in: [false, true] };
    }

    let type = req.query.type;

    if (type === undefined || type === "all") {
      type = { $in: ["sale", "rent"] };
    }

    const searchTerm = req.query.searchTerm || "";

    const sort = req.query.sort || "createdAt";

    const order = req.query.order || "desc";

    const listings = await Listing.find({
      name: { $regex: searchTerm, $options: "i" },
      offer,
      furnished,
      parking,
      type,
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};
