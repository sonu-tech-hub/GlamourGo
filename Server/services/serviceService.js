// server/services/serviceService.js
const Service = require('../models/Service');
const Shop = require('../models/Shop');
const mongoose = require('mongoose');

// Create a new service
exports.createService = async (serviceData, shopId, ownerId) => {
  // Validate shop ownership
  const shop = await Shop.findById(shopId);
  
  if (!shop) {
    throw new Error('Shop not found');
  }
  
  if (shop.owner.toString() !== ownerId) {
    throw new Error('Unauthorized: You are not the owner of this shop');
  }
  
  // Create new service
  const service = new Service({
    ...serviceData,
    shop: shopId
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
  
  return service;
};

// Get all services for a shop
exports.getShopServices = async (shopId) => {
  const services = await Service.find({ shop: shopId }).sort({ category: 1, name: 1 });
  
  // Group services by category
  const servicesByCategory = {};
  services.forEach(service => {
    if (!servicesByCategory[service.category]) {
      servicesByCategory[service.category] = [];
    }
    servicesByCategory[service.category].push(service);
  });
  
  return { services, servicesByCategory };
};

// Get service by ID
exports.getServiceById = async (serviceId) => {
  return await Service.findById(serviceId);
};

// Update a service
exports.updateService = async (serviceId, updatedData, ownerId) => {
  const service = await Service.findById(serviceId);
  
  if (!service) {
    throw new Error('Service not found');
  }
  
  // Verify shop ownership
  const shop = await Shop.findById(service.shop);
  
  if (!shop || shop.owner.toString() !== ownerId) {
    throw new Error('Unauthorized: You are not the owner of this shop');
  }
  
  // Update service fields
  Object.keys(updatedData).forEach(field => {
    service[field] = updatedData[field];
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
  
  return service;
};

// Delete a service
exports.deleteService = async (serviceId, ownerId) => {
  const service = await Service.findById(serviceId);
  
  if (!service) {
    throw new Error('Service not found');
  }
  
  // Verify shop ownership
  const shop = await Shop.findById(service.shop);
  
  if (!shop || shop.owner.toString() !== ownerId) {
    throw new Error('Unauthorized: You are not the owner of this shop');
  }
  
  // Check if service has any upcoming appointments
  const Appointment = mongoose.model('Appointment');
  const upcomingAppointments = await Appointment.find({
    'service.id': serviceId,
    date: { $gte: new Date() },
    status: { $in: ['pending', 'confirmed'] }
  });
  
  if (upcomingAppointments.length > 0) {
    throw new Error('Cannot delete service with upcoming appointments');
  }
  
  // Remove service from shop's services list
  shop.services = shop.services.filter(s => s._id.toString() !== serviceId);
  await shop.save();
  
  // Delete the service
  await Service.findByIdAndDelete(serviceId);
  
  return { success: true };
};