const router = require('express').Router();

router.get('/', async (req, res, next) => {
    try {
        return res.json({ data: 'home' });
    } catch (e) {
        return next(e);
    }
});

module.exports = router;
