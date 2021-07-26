const express = require('express');
const mongoose = require('mongoose');
const usersRouter = require('./routes/users');

// Слушаем 3000 порт
const { PORT = 3000 } = process.env;

const app = express();

// Подлключаемся к БД mestodb
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use(express.json());

// Мидлвар: временное решение для авторизаци
app.use((req, res, next) => {
  req.user = {
    _id: '60febe584150fa3508e8f33d',
  };

  next();
});

app.use('/', usersRouter);

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
