const router = require('express').Router();
const {
  getUsers, getProfile, updateUser, updateAvatar, getCurrentUser,
} = require('../controllers/users');

router.get('/users', getUsers);
router.get('/users/me', getCurrentUser);
router.get('/users/:_id/', getProfile);
// router.get('/users/:id', getProfile);
// router.post('/users', createUser);

router.patch('/users/me', updateUser);
router.patch('/users/me/avatar', updateAvatar);

module.exports = router;
