var express = require('express');
var router = express.Router();
var fs = require('fs');

// post image data
router.post('/upload_file', function (req, res, next) {
  var fstream;
  if (req.busboy) {
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      fstream = fs.createWriteStream(__dirname + '/../../public/my_files/' + filename);
      file.pipe(fstream);
      fstream.on('close', function () {
        // console.log('file ' + filename + ' uploaded');
        var MongoClient = require('mongodb').MongoClient;
        var url = "mongodb://localhost:27017/";
        MongoClient.connect(url, function (err, db) {
          if (err) throw err;
          var dbo = db.db("machine");
          var myobj = [
            { image_name: filename }
          ];
          dbo.collection("imges").insertMany(myobj, function (err, res) {
            if (err) throw err;
            // console.log("Number of documents inserted: " + res.insertedCount);
            db.close();
          });
        });
      });
    });
    req.busboy.on('finish', function () {
      console.log('finish, files uploaded ');
      res.json({ success: true });
    });
    req.pipe(req.busboy);
  }
});

// get data all from db
router.get('/getData', function (request, response) {
  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://localhost:27017/";

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("machine");
    dbo.collection("imges").find({}).toArray(function (err, result) {
      if (err) throw err;
      // console.log("Working", result);
      response.json({ success: true, results: result });
      db.close();
    });
  });
});
module.exports = router;
