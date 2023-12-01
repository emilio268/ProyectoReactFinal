const express = require('express');
const TaskController = require('../controllers/TaskController');
const LoginController = require('../controllers/LoginController');

const router = express.Router();

router.get('/login', LoginController.index);
router.get('/register', LoginController.register);
router.post('/auth', LoginController.auth);
router.get('/logout', LoginController.logout);
router.get('/home', TaskController.index);
router.get('/dashTiend', TaskController.indexTien);
router.get('/dashClie', TaskController.indexClie);
router.get('/create', TaskController.create);
router.post('/create', TaskController.store);
router.get('/createUsu', TaskController.createUsu);
router.post('/createUsu', TaskController.storeUsu);
router.post('/createTien', TaskController.storeTien);
router.post('/dashclie/delete', TaskController.destroy);
router.get('/login/productos', TaskController.indexProductos);
router.get('/dashclie/edit/:id', TaskController.edit);
router.post('/dashclie/edit/:id', TaskController.update);
router.post('/tasksTien/delete', TaskController.destroy);
router.get('/tasksTien/edit/:id', TaskController.edit);
router.post('/tasksTien/edit/:id', TaskController.update);

module.exports = router;
