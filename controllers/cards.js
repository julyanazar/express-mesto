const Card = require('../models/card');
const { ERR_DEFAULT } = require('../errors/errors');
const BadRequest = require('../errors/BadRequest');
const NotFound = require('../errors/NotFound');

const getCards = (req, res) => Card.find({})
  .then((cards) => res.status(200).send(cards))
  .catch((err) => res.status(ERR_DEFAULT).send(err));

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequest('Переданы некорректные данные при создании карточки');
      } else {
        res.status(ERR_DEFAULT).send({ message: 'Произошла ошибка' });
      }
    })
    .catch(next);
};

const deleteCard = (req, res, next) => {
  Card.findOneAndRemove({ owner: req.user._id, _id: req.params.cardId })
    .orFail()
    .catch(() => {
      throw new NotFound('Карточка с таким id не найдена');
    })
    .then(() => {
      res.status(200).send({ message: 'Карточка удалена' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequest('Переданы некорректные данные при удалении карточки');
      } else {
        res.status(ERR_DEFAULT).send({ message: 'Произошла ошибка' });
      }
    })
    .catch(next);
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .orFail()
    .catch(() => {
      throw new NotFound('Карточка с таким id не найдена');
    })
    .then((likes) => res.send({ data: likes }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequest('Переданы некорректные данные для постановки лайка');
      } else {
        res.status(ERR_DEFAULT).send({ message: 'Произошла ошибка' });
      }
    })
    .catch(next);
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail()
    .catch(() => {
      throw new NotFound('Карточка с таким id не найдена');
    })
    .then((likes) => res.send({ data: likes }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequest('Переданы некорректные данные для снятия лайка');
      } else {
        res.status(ERR_DEFAULT).send({ message: 'Произошла ошибка' });
      }
    })
    .catch(next);
};

module.exports = {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
};
