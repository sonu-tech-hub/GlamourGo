// server/controllers/serviceController.js
const serviceService = require('../services/serviceService');
const Shop = require('../models/Shop'); // Not directly used in the controller, but fine to keep for reference
const Service = require('../models/Service'); // Not directly used in the controller, but fine to keep for reference

exports.createService = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const shopId = req.params.shopId; // Assumes shopId is in URL for creation
    const serviceData = req.body;

    const service = await serviceService.createService(serviceData, shopId, ownerId);

    res.status(201).json({ message: 'Service created successfully', service });
  } catch (error) {
    console.error('Error creating service:', error);
    // Be more specific with status codes based on error type if possible
    res.status(error.message.includes('Shop not found') || error.message.includes('Unauthorized') ? 404 : 500).json({ message: error.message || 'Server error' });
  }
};

exports.getShopServices = async (req, res) => {
  try {
    const shopId = req.params.shopId; // Matches frontend serviceApi.js: /services/shop/:shopId
    const category = req.query.category;

    const result = await serviceService.getShopServices(shopId, category);

    res.json(result);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateService = async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const ownerId = req.user.id;
    const updatedData = req.body; // updatedData will now contain `shop` if sent from frontend

    const service = await serviceService.updateService(serviceId, updatedData, ownerId);

    res.json({ message: 'Service updated successfully', service });
  } catch (error) {
    console.error('Error updating service:', error);
    // More specific error handling based on serviceService errors
    if (error.message.includes('Service not found')) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const ownerId = req.user.id;

    await serviceService.deleteService(serviceId, ownerId);

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    if (error.message.includes('Service not found')) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ message: error.message });
    }
    if (error.message.includes('Cannot delete service with upcoming appointments')) {
      return res.status(409).json({ message: error.message }); // 409 Conflict
    }
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

exports.getVendorServices = async (req, res) => {
  try {
    const vendorId = req.user.id; // Assumes you're using authentication middleware

    // 1. Find the vendor's shop
    const shop = await Shop.findOne({ owner: vendorId });

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found for this vendor' });
    }

    // 2. Find all services for that shop
    // This is effectively `getShopServices` with a dynamically found shopId.
    // Consider reusing `serviceService.getShopServices` here.
    const { services } = await serviceService.getShopServices(shop._id);


    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};