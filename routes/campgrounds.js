var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

// INDEX Route - Show all campgrounds
router.get("/", function(req, res) {
   // Get all campgrounds from DB
   Campground.find({}, function(err, allCampgrounds) {
      if (err) {
         req.flash("error", "Campgrounds not found.");
      } else {
         res.render("campgrounds/index", { campgrounds: allCampgrounds });
      }
   });
});

// CREATE Route - Add new campgrounds to DB
router.post("/", middleware.isLoggedIn, function(req, res) {
   var name = req.body.name;
   var price = req.body.price;
   var image = req.body.image;
   var desc = req.body.description;
   var author = {
      id: req.user.id,
      username: req.user.username
   }
   var newCampground = { name: name, price: price, image: image, description: desc, author: author };
   // Create new campground and save to DB
   Campground.create(newCampground, function(err, newlyCreated) {
      if (err) {
         req.flash("error", "Campground not created.");
         res.render("back");
      }
      else {
         res.redirect("/campgrounds");
      }
   });
});

// NEW Route - Show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
   res.render("campgrounds/new");
});

// SHOW Route - Shows more info about one campground
router.get("/:id", function(req, res) {
   Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
      if (err || !foundCampground) {
         req.flash("error", "Campground not found.");
         res.redirect("back");
      }
      else {
         res.render("campgrounds/show", { campground: foundCampground });
      }
   });
});

// EDIT Route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
   Campground.findById(req.params.id, function(err, foundCampground) {
      if (err || !foundCampground) {
         req.flash("error", "Campground not found.");
         res.redirect("back");
      } else {
         res.render("campgrounds/edit", {campground: foundCampground});
      }
   });
});

// UPDATE Route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res) {
   Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
      if (err) {
         req.flash("error", "Campground not found.");
         res.redirect("/campgrounds");
      } else {
         res.redirect("/campgrounds/" + req.params.id);
      }
   });
});

// DESTROY Route
router.delete("/:id", middleware.checkCampgroundOwnership , function(req, res) {
   Campground.findByIdAndRemove(req.params.id, function(err) {
      if (err) {
         req.flash("error", "Campground not found.");
         res.redirect("/campgrounds");
      } else {
         res.redirect("/campgrounds");
      }
   });
});

module.exports = router;