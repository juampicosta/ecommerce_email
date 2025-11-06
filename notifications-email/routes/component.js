import { Router } from 'express'
import {
  create,
  deleteById,
  getAll,
  getById,
} from '../controllers/component.js'
import uploadHtml from '../middlewares/uploadHtml.js'

const router = Router()

router.post('/', uploadHtml.single('file'), create)
router.get('/', getAll)
router.get('/:id', getById)
router.delete('/:id', deleteById)

export default router
