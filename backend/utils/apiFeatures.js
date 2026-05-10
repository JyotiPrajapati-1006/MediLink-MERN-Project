// utils/apiFeatures.js

class APIFeatures {
  constructor(query, queryString) {
    this.query = query; // Mongoose query (e.g., Product.find())
    this.queryString = queryString; // req.query object from Express
  }

  // Method for filtering results
  filter() {
    // 1A) Basic filtering by removing special keywords
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering for gte, gt, lte, lt
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this; // Enables method chaining
  }

  // Method for sorting results
  sort() {
    if (this.queryString.sort) {
      // Mongoose expects space-separated fields for sorting
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      // Default sort if none provided
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  // Method for limiting fields (projection)
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      // Exclude the default __v field from Mongoose
      this.query = this.query.select("-__v");
    }

    return this;
  }

  // Method for pagination
  paginate() {
    // Convert to number, default to page 1
    const page = this.queryString.page * 1 || 1;
    // Convert to number, default to 100 results per page
    const limit = this.queryString.limit * 1 || 100;
    // Calculate documents to skip
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

export default APIFeatures;
