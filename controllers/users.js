const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const {
  ERR_BAD_REQUEST, ERR_DEFAULT, ERR_NOT_FOUND, ERR_AUTH,
} = require('../errors/errors');

const getUsers = (req, res) => User.find({})
  .then((users) => res.status(200).send(users))
  .catch((err) => res.status(ERR_DEFAULT).send(err));

const getProfile = (req, res) => User.findById(req.params.id)
  .orFail(() => res.status(ERR_NOT_FOUND).send({ message: 'Пользователь с таким id не найден' }))
  .then((user) => {
    res.status(200).send(user);
  })
  .catch((err) => {
    if (err.name === 'CastError') {
      res.status(ERR_BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
    } else {
      res.status(ERR_DEFAULT).send({ message: 'Произошла ошибка' });
    }
  });

const createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    })
      .then((user) => res.send({ data: user }))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          res.status(ERR_BAD_REQUEST).send({ message: 'Ошибка валидации' });
        } else if (err.name === 'CastError') {
          res.status(ERR_BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя' });
        } else {
          res.status(ERR_DEFAULT).send({ message: 'Произошла ошибка' });
        }
      }));
};

const updateUser = (req, res) => {
  const { name, about } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .orFail(() => res.status(ERR_NOT_FOUND).send({ message: 'Пользователь с таким id не найден' }))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERR_BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении профиля' });
      } else {
        res.status(ERR_DEFAULT).send({ message: 'Произошла ошибка' });
      }
    });
};

const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .orFail(() => res.status(ERR_NOT_FOUND).send({ message: 'Пользователь с таким id не найден' }))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERR_BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении аватара' });
      } else {
        res.status(ERR_DEFAULT).send({ message: 'Произошла ошибка' });
      }
    });
};

const login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        'secret-key',
        { expiresIn: '7d' },
      );

      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
      })
        .send({ message: 'Вы авторизовались!' });
    })
    .catch(() => res.status(ERR_AUTH).send({ message: 'Ошибка авторизации' }));
};

module.exports = {
  getUsers, getProfile, createUser, updateUser, updateAvatar, login,
};
