const multer = require('multer');
const config = require('./config/config.js');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, global.gConfig.images.path)
    },
    filename: function (req, file, cb) {
        cb(null, req.body.index + "_" + Date.now() + ".png")
    }
});

const upload = multer({
  limits: {
    fileSize: global.gConfig.images.max_file_size,
  },
  storage: storage
});

module.exports = upload