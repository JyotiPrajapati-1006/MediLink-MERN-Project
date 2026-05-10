// models/Review.js

import mongoose from "mongoose";


const reviewSchema = new mongoose.Schema(
  {
    reviewType: {
      type: String,
      required: true,
      enum: ["Review", "Complaint"],
    },
    user: {
      // The customer who wrote the review/complaint
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      // The order associated with the review/complaint
      type: mongoose.Schema.ObjectId,
      ref: "Order",
      // An order is only required if the type is 'Complaint'
      required: [
        function () {
          return this.reviewType === "Complaint";
        },
        "An order is required for complaints.",
      ],
    },
    // The subject of the review/complaint
    shop: {
      type: mongoose.Schema.ObjectId,
      ref: "Shop",
    },
    deliveryStaff: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      // A rating is only required if the type is 'Review'
      required: [
        function () {
          return this.reviewType === "Review";
        },
        "A rating (1-5) is required for reviews.",
      ],
    },
    comment: {
      type: String,
      required: [
        true,
        "Please provide a comment for your review or complaint.",
      ],
      trim: true,
    },
    // Fields specific to complaints
    complaintStatus: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", null],
      default: function () {
        return this.reviewType === "Complaint" ? "Open" : null;
      },
    },
    adminReply: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Pre-validation hook to ensure a review is for either a shop or delivery staff
reviewSchema.pre("validate", function (next) {
  if (!this.shop && !this.deliveryStaff) {
    next(
      new Error("Review must be associated with a shop or a delivery staff.")
    );
  } else {
    next();
  }
});

// Calculate average ratings after a review is saved
reviewSchema.statics.calculateAverageRatings = async function(shopId) {
    const stats = await this.aggregate([
        {
            $match: { shop: shopId, reviewType: 'Review' }
        },
        {
            $group: {
                _id: '$shop',
                numReviews: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await mongoose.model('Shop').findByIdAndUpdate(shopId, {
            rating: stats[0].avgRating,
            numReviews: stats[0].numReviews
        });
    } else {
        // If no reviews, reset to default
        await mongoose.model('Shop').findByIdAndUpdate(shopId, {
            rating: 0,
            numReviews: 0
        });
    }
};

reviewSchema.post('save', function() {
    this.constructor.calculateAverageRatings(this.shop);
});

reviewSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    this.constructor.calculateAverageRatings(this.shop);
    next();
});


const Review = mongoose.model("Review", reviewSchema);

export default Review;
