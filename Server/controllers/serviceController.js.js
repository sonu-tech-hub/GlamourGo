// controllers/serviceController.js
const Service = require('../models/Service');
const Shop = require('../models/Shop');

// Create a new service
exports.createService = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      duration,
      price,
      discountedPrice,
      isDiscounted,
      image,
      tags
    } = req.body;
    
    const shopId = req.params.shopId;
    const ownerId = req.user.id; // From auth middleware
    
    // Verify shop ownership
    const shop = await Shop.findById(shopId);
    if (!shop || shop.owner.toString() !== ownerId) {
      return res.status(403).json({ message: 'You are not authorized to manage services for this shop' });
    }
    
    // Create new service
    const service = new Service({
      shop: shopId,
      name,
      description,
      category,
      duration,
      price,
      discountedPrice: discountedPrice || price,
      isDiscounted: isDiscounted || false,
      image,
      tags: tags || []
    });
    
    await service.save();
    
    // Add service to shop's services list
    shop.services.push({
      _id: service._id,
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price
    });
    
    await shop.save();
    
    res.status(201).json({
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all services for a shop
exports.getShopServices = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { category } = req.query;
    
    let query = { shop: shopId };
    
    if (category) {
      query.category = category;
    }
    
    const services = await Service.find(query).sort({ category: 1, name: 1 });
    
    // Group services by category
    const servicesByCategory = {};
    services.forEach(service => {
      if (!servicesByCategory[service.category]) {
        servicesByCategory[service.category] = [];
      }
      servicesByCategory[service.category].push(service);
    });
    
    res.json({
      services,
      servicesByCategory
    });
  } catch (error) {
    console.error('Error fetching shop services:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a service
exports.updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const ownerId = req.user.id; // From auth middleware
    
    // Find the service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Verify shop ownership
    const shop = await Shop.findById(service.shop);
    if (!shop || shop.owner.toString() !== ownerId) {
      return res.status(403).json({ message: 'You are not authorized to update this service' });
    }
    
    // Update service fields
    const fields = [
      'name', 'description', 'category', 'duration', 
      'price', 'discountedPrice', 'isDiscounted', 'image', 
      'isActive', 'tags'
    ];
    
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        service[field] = req.body[field];
      }
    });
    
    await service.save();
    
    // Update service in shop's services list
    const serviceIndex = shop.services.findIndex(s => s._id.toString() === serviceId);
    if (serviceIndex !== -1) {
      shop.services[serviceIndex] = {
        _id: service._id,
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price
      };
      await shop.save();
    }
    
    res.json({
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a service
exports.deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const ownerId = req.user.id; // From auth middleware
    
    // Find the service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Verify shop ownership
    const shop = await Shop.findById(service.shop);
    if (!shop || shop.owner.toString() !== ownerId) {
      return res.status(403).json({ message: 'You are not authorized to delete this service' });
    }
    
    // Check if service has any upcoming appointments
    const upcomingAppointments = await Appointment.find({
      'service.id': serviceId,
      date: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] }
    });
    
    if (upcomingAppointments.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete service with upcoming appointments',
        appointmentsCount: upcomingAppointments.length
      });
    }
    
    // Remove service from shop's services list
    shop.services = shop.services.filter(s => s._id.toString() !== serviceId);
    await shop.save();
    
    // Delete the service
    await Service.findByIdAndDelete(serviceId);
    
    res.json({
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Server error' });
  }
};