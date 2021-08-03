const NotFound = require('../errors/NotFound');

const notFoundPage = (req, res, next) => {
  next(new NotFound('Запрашиваемый ресурс не найден'));
};

module.exports = { notFoundPage };
