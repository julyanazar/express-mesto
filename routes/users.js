const router = require('express').Router();

const {
  getUsers, getProfile, updateUser, updateAvatar, getCurrentUser,
} = require('../controllers/users');
const {
  validationUserID,
  validationUpdateAvatar,
  validationUpdateUser,
} = require('../middlewares/validate');

router.get('/users', getUsers);
router.get('/users/me', validationUserID, getCurrentUser);
router.get('/users/:_id/', getProfile);
// router.get('/users/:id', getProfile);
// router.post('/users', createUser);

router.patch('/users/me', validationUpdateUser, updateUser);
router.patch('/users/me/avatar', validationUpdateAvatar, updateAvatar);

module.exports = router;
