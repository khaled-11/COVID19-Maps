const mongoose = require('mongoose');
const geocoder = require('../utils/geocoder');


const StoreSchema = new mongoose.Schema({
  storeId: {
    type: String,
    required: [true, 'Please add a place ID'],
    unique: true,
    trim: true,
    maxlength: [10, 'Store ID must be less than 10 chars']
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedAddress: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: [true, 'Please add a description.']
  }
});


// Geocode & create location
StoreSchema.pre('save', async function(next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress
  };

  // Do not save address
  this.address = undefined;
  next();
});

module.exports = mongoose.model('Store', StoreSchema);


const customerObject = magnoose.model('storeId', storeId);

customerObject.findOneAndUpdate({storeId: "test"}

, {$set: {description: "Highway"}}

, function (err, doc) {

    if (err) {

        console.log("update document error");

    } else {

        console.log("update document success");

        console.log(doc);

    }



module.exports = mongoose.model('Store', StoreSchema);