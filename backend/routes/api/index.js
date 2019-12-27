var router = require('express').Router();

router.use('/report', require('./report'));
router.use('/teacher', require('./teacher'));
router.use('/term', require('./term'));
router.use('/draw', require('./draw'));
router.use('/comment', require('./comment'));
router.use('/erd', require('./erdconstructor'));
router.use('/account', require('./account'));
router.use('/settings', require('./settings'));

router.use(function(err, req, res, next){
  if(err.name === 'ValidationError'){
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function(errors, key){
        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    });
  }

  return next(err);
});

module.exports = router;