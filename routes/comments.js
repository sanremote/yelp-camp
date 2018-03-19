var express = require("express");
var router = express.Router({ mergeParams: true });
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// NEW Route - Show form to create new comment
router.get("/new", middleware.isLoggedIn, function(req, res) {
   Campground.findById(req.params.id, function(err, campground) {
      if (err) {
         req.flash("error", "Campground not found.");
         res.render("back");
      } else {
         res.render("comments/new", { campground: campground });
      }
   });
});

// CREATE Route - Add new comment to DB
router.post("/", middleware.isLoggedIn, function(req, res) {
   Campground.findById(req.params.id, function(err, campground) {
      if (err) {
         req.flash("error", "Campground not found.");
         res.redirect("/campgrounds");
      } else {
         Comment.create(req.body.comment, function(err, comment) {
            if (err) {
               req.flash("error", "Campground not created.");
               res.render("back");
            } else {
               // add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               // save comment
               comment.save();
               campground.comments.push(comment);
               campground.save();
               req.flash("success", "Comment successfully added.");
               res.redirect("/campgrounds/" + campground._id);
            }
         });
      }
   });
});

// EDIT Route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
   Campground.findById(req.params.id, function(err, foundCampground) {
      if (err || !foundCampground) {
         req.flash("error", "Campground not found.");
         return res.redirect("back");
      }
      Comment.findById(req.params.comment_id, function(err, foundComment) {
         if (err || !foundComment) {
            req.flash("error", "Comment not found.");
            res.redirect("back");
         } else {
            res.render("comments/edit", { campground_id: req.params.id, comment: foundComment });
         }
      });
   });
});

// UPDATE Route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
      if (err || !updatedComment) {
         req.flash("error", "Comment not updated.");
         res.redirect("back");
      } else {
         res.redirect("/campgrounds/" + req.params.id);
      }
   });
});


// DESTROY Route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
   Comment.findByIdAndRemove(req.params.comment_id, function(err) {
      if (err) {
         req.flash("error", "Comment not deleted.");
         res.redirect("back");
      } else {
         req.flash("success", "Comment deleted.");
         res.redirect("/campgrounds/" + req.params.id);
      }
   });
});

module.exports = router;
