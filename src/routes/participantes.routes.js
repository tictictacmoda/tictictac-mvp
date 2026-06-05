const express = require('express')
const multer = require('multer')
const path = require('path')
const router = express.Router()
const controller = require('../controllers/participantes.controller')
const { verificarToken } = require('../controllers/auth.controller')

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

router.get('/', verificarToken, controller.listar)
router.post('/', verificarToken, upload.single('foto'), controller.criar)
router.put('/:id', verificarToken, upload.single('foto'), controller.atualizar)
router.delete('/:id', verificarToken, controller.deletar)

module.exports = router
