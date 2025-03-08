const { response } = require("express");
const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const maptoken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: maptoken });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.searchListings = async (req, res) => {
    const { country } = req.query;
    if (!country) {
        req.flash("error", "Please specify a country.");
        return res.redirect("/listings");
    }

    const searchResults = await Listing.find({ country: country });
    if (searchResults.length === 0) {
        req.flash("error", "Country does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/index.ejs", { allListings: searchResults });
};

module.exports.renderNewForm = async (req, res) => {
    res.render("listings/new.ejs");
};
let populateGeometry=  async (req, res) => {
    const allListings = await Listing.find({});
    for (let listing of allListings) {
        if (listing.location) {
            let response = await geocodingClient.forwardGeocode({
                query: listing.location,
                limit: 1
            }).send();
            listing.geometry = response.body.features[0].geometry;
            await listing.save();
        }
    }
   
};
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    await populateGeometry(listing);
    if (!listing) {
        req.flash("error", "Listing Not Exists!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send();
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = response.body.features[0].geometry;
    await newListing.save();
    req.flash("success", "Successfully created Listing!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing Not Exists!");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("upload", "upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
 

    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    await populateGeometry(listing);
    await listing.save();
    req.flash("success", "Successfully Updated Listing!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted");
    res.redirect("/listings");
};
