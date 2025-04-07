// routes/shop.js
const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const { auth, shopOwner } = require('../middlewares/auth');

router.post('/', auth, shopController.createShop);
router.get('/', shopController.getAllShops);
router.get('/featured', shopController.getFeaturedShops);
router.get('/nearby', shopController.getNearbyShops);
router.get('/search', shopController.searchShops);
router.get('/:shopId', shopController.getShopById);
router.put('/:shopId', auth, shopOwner, shopController.updateShop);
router.delete('/:shopId', auth, shopOwner, shopController.deleteShop);

module.exports = router;
