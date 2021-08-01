const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const {
  ERR_DEFAULT,
} = require('../errors/errors');
const Auth = require('../errors/Auth');
const BadRequest = require('../errors/BadRequest');
const NotFound = require('../errors/NotFound');
const Conflict = require('../errors/Conflict');

const getUsers = (req, res) => User.find({})
  .then((users) => res.status(200).send(users))
  .catch((err) => res.status(ERR_DEFAULT).send(err));

const getProfile = (req, res, next) => User.findById(req.params.id)
  .orFail()
  .catch(() => {
    throw new NotFound('Пользователь с таким id не найден');
  })
  .then((user) => res.send({ data: user }))
  .catch((err) => {
    if (err.name === 'CastError') {
      throw new BadRequest('Переданы некорректные данные');
    } else {
      res.status(ERR_DEFAULT).send({ message: 'Произошла ошибка' });
    }
  })
  .catch(next);

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .catch((err) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        throw new Conflict('Пользователь с таким email уже существует');
      }
    })
    .then((user) => res.send({ data: user }))
    .catch(next)
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequest('Ошибка валидации');
      } else if (err.name === 'CastError') {
        throw new BadRequest('Переданы некорректные данные при создании пользователя');
      } else {
        res.status(ERR_DEFAULT).send({ message: 'Произошла ошибка' });
      }
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { name, about } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .orFail()
    .catch(() => {
      throw new NotFound('Пользователь с таким id не найден');
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequest('Переданы некорректные данные при обновлении профиля');
      } else {
        res.status(ERR_DEFAULT).send({ message: 'Произошла ошибка' });
      }
    })
    .catch(next);
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .orFail()
    .catch(() => {
      throw new NotFound('Пользователь с таким id не найден');
    })
    .then((avatarData) => res.send({ data: avatarData }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequest('Переданы некорректные данные при обновлении аватара');
      } else {
        res.status(ERR_DEFAULT).send({ message: 'Произошла ошибка' });
      }
    })
    .catch(next);
};

const login = (req, res, next) => {
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
        .send({ message: 'Авторизация прошла успешно!' });
    })
    .catch(() => {
      throw new Auth('Ошибка авторизации');
    })
    .catch(next);
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail()
    .catch(() => {
      throw new NotFound('Пользователь с таким id не найден');
    })
    .then((currentUser) => res.send({ currentUser }))
    .catch(() => {
      res.status(ERR_DEFAULT).send({ message: 'Произошла ошибка' });
    })
    .catch(next);
};

module.exports = {
  getUsers, getProfile, createUser, updateUser, updateAvatar, login, getCurrentUser,
};
