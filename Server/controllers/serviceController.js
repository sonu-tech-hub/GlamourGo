const serviceService = require('../services/serviceService');
const Shop = require('../models/Shop');
const Service = require('../models/Service');

exports.createService = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const shopId = req.params.shopId;
    const serviceData = req.body;

    const service = await serviceService.createService(serviceData, shopId, ownerId);

    res.status(201).json({ message: 'Service created successfully', service });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

exports.getShopServices = async (req, res) => {
  try {
    const shopId = req.params.shopId;
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
    const updatedData = req.body;

    const service = await serviceService.updateService(serviceId, updatedData, ownerId);

    res.json({ message: 'Service updated successfully', service });
  } catch (error) {
    console.error('Error updating service:', error);
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
    res.status(500).json({ message: error.message || 'Server error' });
  }
};


// 

exports.getVendorServices = async (req, res) => {
  try {
    const vendorId = req.user.id; // Assumes you're using authentication middleware

    // 1. Find the vendor's shop
    const shop = await Shop.findOne({ owner: vendorId });

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found for this vendor' });
    }

    // 2. Find all services for that shop
    const services = await Service.find({ shop: shop._id });

    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
