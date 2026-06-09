// routes/books.js
const r = require('express').Router();
const c = require('../controllers/bookController');
const { bookRules, bookUpdateRules, validate } = require('../validations');
const { protect, optionalAuth } = require('../middleware/auth');

r.get('/stats',      protect,                            c.getStats);
r.get('/featured',   optionalAuth,                       c.getFeatured);
r.get('/categories', optionalAuth,                       c.getCategories);
r.get('/',           optionalAuth,                       c.getAll);
r.get('/:id',        optionalAuth,                       c.getOne);
r.post('/',          protect, bookRules, validate,       c.create);
r.put('/:id',        protect, bookUpdateRules, validate, c.update);
r.delete('/:id',     protect,                            c.delete);
r.patch('/:id/featured', protect,                        c.toggleFeatured);
module.exports = r;
