const express = require('express')
const router = express.Router()
const controller = require('../controllers/auth.controller')

router.post('/login', controller.login)
router.get('/admins', controller.verificarToken, controller.listarAdmins)
router.post('/admins', controller.verificarToken, controller.criarAdmin)
router.delete('/admins/:id', controller.verificarToken, controller.deletarAdmin)

module.exports = router
