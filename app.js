const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');

const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const NotFound = require('./errors/NotFound');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const { validationSignIn, validationSignUp } = require('./middlewares/validate');

// Слушаем 3000 порт
const { PORT = 3000 } = process.env;

const app = express();

app.use(helmet());

// Подлключаемся к БД mestodb
mongoose.connect('mongodb://localhost:27017/mestodbnew', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(express.json());

app.use(cookieParser());

// // Мидлвар: временное решение для авторизаци
// app.use((req, res, next) => {
//   req.user = {
//     _id: '6106db480d96512b6435100b',
//   };

//   next();
// });

app.post('/signin', validationSignIn, login);
app.post('/signup', validationSignUp, createUser);

app.use('/', auth, usersRouter);
app.use('/', auth, cardsRouter);
app.use('*', () => {
  throw new NotFound('Запрашиваемый ресурс не найден');
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
});

app.use(errors());

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
