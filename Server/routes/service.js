// routes/service.js
const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController.js');
const { auth, shopOwner } = require('../middlewares/authMiddleware.js');

router.post('/:shopId', auth, shopOwner, serviceController.createService);
router.get('/:shopId',auth,shopOwner, serviceController.getShopServices);
router.put('/:serviceId', auth, shopOwner, serviceController.updateService);
router.delete('/:serviceId', auth, shopOwner, serviceController.deleteService);

module.exports = router;
