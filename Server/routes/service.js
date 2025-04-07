// routes/service.js
const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { auth, shopOwner } = require('../middlewares/auth');

router.post('/:shopId', auth, shopOwner, serviceController.createService);
router.get('/:shopId', serviceController.getShopServices);
router.put('/:serviceId', auth, shopOwner, serviceController.updateService);
router.delete('/:serviceId', auth, shopOwner, serviceController.deleteService);

module.exports = router;
