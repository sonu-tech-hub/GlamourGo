// server/services/serviceService.js
const Service = require('../models/Service');
const Shop = require('../models/Shop');
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');



// Create a new service
const createService = async (serviceData, shopId, ownerId) => {
  const shop = await Shop.findById(shopId);
  if (!shop) throw new Error('Shop not found');
  if (shop.owner.toString() !== ownerId) throw new Error('Unauthorized: You are not the owner of this shop');

  const service = new Service({ ...serviceData, shop: shopId });
  await service.save();

  shop.services.push({
    _id: service._id,
    name: service.name,
    description: service.description,
    duration: service.duration,
    price: service.price,
  });

  await shop.save();

  return service;
};

// Get all services for a shop (with optional category)
const getShopServices = async (shopId, category) => {
  const query = { shop: shopId };
  if (category) query.category = category;

  const services = await Service.find(query).sort({ category: 1, name: 1 });

  const servicesByCategory = {};
  services.forEach(svc => {
    if (!servicesByCategory[svc.category]) servicesByCategory[svc.category] = [];
    servicesByCategory[svc.category].push(svc);
  });

  return { services, servicesByCategory };
};

// Update a service
const updateService = async (serviceId, updatedData, ownerId) => {
  const service = await Service.findById(serviceId);
  if (!service) throw new Error('Service not found');

  const shop = await Shop.findById(service.shop);
  if (!shop || shop.owner.toString() !== ownerId) throw new Error('Unauthorized');

  Object.keys(updatedData).forEach(field => {
    service[field] = updatedData[field];
  });
  await service.save();

  const idx = shop.services.findIndex(s => s._id.toString() === serviceId);
  if (idx !== -1) {
    shop.services[idx] = {
      _id: service._id,
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
    };
    await shop.save();
  }

  return service;
};

// Delete a service
const deleteService = async (serviceId, ownerId) => {
  const service = await Service.findById(serviceId);
  if (!service) throw new Error('Service not found');

  const shop = await Shop.findById(service.shop);
  if (!shop || shop.owner.toString() !== ownerId) throw new Error('Unauthorized');

  const upcomingAppointments = await Appointment.find({
    'service.id': serviceId,
    date: { $gte: new Date() },
    status: { $in: ['pending', 'confirmed'] },
  });

  if (upcomingAppointments.length > 0) {
    throw new Error('Cannot delete service with upcoming appointments');
  }

  shop.services = shop.services.filter(s => s._id.toString() !== serviceId);
  await shop.save();

  await Service.findByIdAndDelete(serviceId);

  return { success: true };
};

module.exports = {
  createService,
  getShopServices,
  updateService,
  deleteService,
};
