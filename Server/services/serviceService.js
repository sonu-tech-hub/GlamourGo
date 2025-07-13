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

  // It's generally better to only store essential IDs or summary info in embedded arrays.
  // Pushing the full service object (even if select fields) creates data duplication.
  // Consider if `shop.services` should just store `service._id` and `service.name`
  // or be removed entirely if you always query services by `shop` field.
  // For now, keeping it as is, but noting it as a potential optimization/design choice.
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

  const shop = await Shop.findById(service.shop); // This line correctly finds the shop using service.shop
  if (!shop || shop.owner.toString() !== ownerId) throw new Error('Unauthorized');

  // Ensure updatedData does not overwrite immutable fields like 'shop' if it's unintentionally sent.
  // MongoDB will generally ignore it if it's not modifiable by schema or not present in $set.
  // However, explicitly preventing it can be safer:
  delete updatedData.shop; // Ensure 'shop' field from frontend is not directly used for update if it came in.

  Object.keys(updatedData).forEach(field => {
    service[field] = updatedData[field];
  });
  await service.save();

  // Update the embedded service copy in the shop document as well.
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

  // Remove from the embedded array in shop
  shop.services = shop.services.filter(s => s._id.toString() !== serviceId);
  await shop.save();

  // Delete the service document itself
  await Service.findByIdAndDelete(serviceId);

  return { success: true };
};

module.exports = {
  createService,
  getShopServices,
  updateService,
  deleteService,
};