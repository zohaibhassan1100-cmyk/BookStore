// controllers/bookController.js
const Book = require('../models/Book');
const { ok, fail } = require('../utils/response');

exports.getAll = async (req, res, next) => {
  try {
    const { search='', page=1, limit=10, sortBy='created_at', sortOrder='DESC', category='', status='' } = req.query;
    const result = await Book.getAll({ search, page:parseInt(page), limit:Math.min(parseInt(limit),100), sortBy, sortOrder, category, status });
    return ok(res, { data: result });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return fail(res, 'Book not found', 404);
    return ok(res, { data: { book } });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    if (await Book.findByISBN(req.body.isbn))
      return fail(res, 'ISBN already exists', 409);
    const book = await Book.create(req.body, req.user?.id);
    return ok(res, { data: { book } }, 'Book created successfully', 201);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const existing = await Book.findById(req.params.id);
    if (!existing) return fail(res, 'Book not found', 404);

    if (req.body.isbn && req.body.isbn !== existing.isbn)
      if (await Book.findByISBN(req.body.isbn, req.params.id))
        return fail(res, 'ISBN already used by another book', 409);

    const book = await Book.update(req.params.id, { ...existing, ...req.body });
    return ok(res, { data: { book } }, 'Book updated successfully');
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const existing = await Book.findById(req.params.id);
    if (!existing) return fail(res, 'Book not found', 404);
    await Book.delete(req.params.id);
    return ok(res, {}, 'Book deleted successfully');
  } catch (err) { next(err); }
};

exports.getStats = async (req, res, next) => {
  try {
    const stats = await Book.getStats();
    return ok(res, { data: { stats } });
  } catch (err) { next(err); }
};

exports.getFeatured = async (req, res, next) => {
  try {
    const books = await Book.getFeatured();
    return ok(res, { data: { books } });
  } catch (err) { next(err); }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Book.getAllCategories();
    return ok(res, { data: { categories } });
  } catch (err) { next(err); }
};

exports.toggleFeatured = async (req, res, next) => {
  try {
    const book = await Book.toggleFeatured(req.params.id);
    return ok(res, { data: { book } }, 'Featured status updated');
  } catch (err) { next(err); }
};
