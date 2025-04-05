
if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require("express");
const wrapAsync = require("../utils/WrapAsync.js");
const router = express.Router();

const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner,validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const{storage}=require('../cloudConfig.js');
const multer  = require('multer');
const upload = multer({ storage });
router.get("/searchResults",wrapAsync(listingController.searchListings));


router.route("/")
.get(wrapAsync(listingController.index))
.post( isLoggedIn,upload.single("listing[image]"),validateListing, wrapAsync(listingController.createListing));
// New Route
router.get("/new", isLoggedIn,listingController.renderNewForm);

router.route("/:id")
.get( wrapAsync(listingController.showListing))
.put( isLoggedIn,isOwner,upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
.delete( wrapAsync(listingController.destroyListing));


// Edit Route
router.get("/:id/edit", isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));


module.exports = router;
