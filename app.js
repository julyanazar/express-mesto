const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');

const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const { login, createUser } = require('./controllers/users');

const auth = require('./middlewares/auth');
const { validationSignIn, validationSignUp } = require('./middlewares/validate');
const { handleError } = require('./middlewares/handleError');
const { notFoundPage } = require('./middlewares/notFoundPage');
const { requestLogger, errorLogger } = require('./middlewares/logger');

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

app.use(requestLogger); // подключаем логгер запросов

app.post('/signin', validationSignIn, login);
app.post('/signup', validationSignUp, createUser);

app.use('/', auth, usersRouter);
app.use('/', auth, cardsRouter);
app.get('*', notFoundPage);

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors());
app.use(handleError);

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
