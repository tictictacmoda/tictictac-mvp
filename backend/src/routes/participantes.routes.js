const express = require('express')
const router = express.Router()
const controller = require('../controllers/participantes.controller')
const { verificarToken } = require('../controllers/auth.controller')

router.get('/', verificarToken, controller.listar)
router.post('/', verificarToken, controller.criar)
router.put('/:id', verificarToken, controller.atualizar)
router.delete('/:id', verificarToken, controller.deletar)

module.exports = router
