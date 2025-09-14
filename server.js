
// server.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { sequelize, Product, Customer, Order, Tenant } = require("./models"); // Make sure Tenant model exists
const cron = require("node-cron");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const ONBOARD_USER = process.env.ONBOARD_USER;
const ONBOARD_PASS = process.env.ONBOARD_PASS;

// BASIC AUTH MIDDLEWARE
const basicAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Missing Authorization header" });

  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
  const [username, password] = credentials.split(":");

  if (username === ONBOARD_USER && password === ONBOARD_PASS) return next();
  return res.status(401).json({ error: "Invalid credentials" });
};

// ONBOARD TENANT
app.post("/onboard", basicAuth, async (req, res) => {
  try {
    const { name, shop, accessToken } = req.body;
    const [tenant, created] = await Tenant.findOrCreate({
      where: { shop },
      defaults: { name, shop, accessToken, active: true },
    });

    res.json({ message: "Tenant onboarded!", tenant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// MULTI-TENANT SYNC ROUTES

// Sync Products
app.post("/sync/products", async (req, res) => {
  try {
    const tenants = await Tenant.findAll();
    let totalCount = 0;

    for (let tenant of tenants) {
      const response = await axios.get(
        `https://${tenant.shop}/admin/api/2024-07/products.json`,
        { headers: { "X-Shopify-Access-Token": tenant.accessToken } }
      );

      const products = response.data.products;
      for (let p of products) {
        await Product.upsert({
          shopifyId: p.id,
          title: p.title,
          vendor: p.vendor,
          price: p.variants[0]?.price || 0,
          tenantId: tenant.id,
        });
      }
      console.log(` Synced products for tenant: ${tenant.name}`);
      totalCount += products.length;
    }

    res.json({ message: "Products synced for all tenants", totalCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sync Customers
app.post("/sync/customers", async (req, res) => {
  try {
    const tenants = await Tenant.findAll();
    let totalCount = 0;

    for (let tenant of tenants) {
      const response = await axios.get(
        `https://${tenant.shop}/admin/api/2024-07/customers.json`,
        { headers: { "X-Shopify-Access-Token": tenant.accessToken } }
      );

      const customers = response.data.customers;
      for (let c of customers) {
        await Customer.upsert({
          shopifyId: c.id,
          first_name: c.first_name,
          last_name: c.last_name,
          email: c.email,
          tenantId: tenant.id,
        });
      }

      console.log(` Synced customers for tenant: ${tenant.name}`);
      totalCount += customers.length;
    }

    res.json({ message: "Customers synced for all tenants", totalCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sync Orders
// Sync Orders - updated
app.post("/sync/orders", async (req, res) => {
  try {
    const tenants = await Tenant.findAll();
    let totalCount = 0;

    for (let tenant of tenants) {
      if (!tenant.accessToken) {
        console.log(` No access token for tenant: ${tenant.name}`);
        continue;
      }

      // Fetch all orders, including open, closed, and cancelled
      const response = await axios.get(
        `https://${tenant.shop}/admin/api/2024-07/orders.json?status=any`,
        { headers: { "X-Shopify-Access-Token": tenant.accessToken } }
      );

      const orders = response.data.orders;
      for (let o of orders) {
        await Order.upsert({
          shopifyId: o.id,
          customer_id: o.customer?.id || null,
          total_price: o.total_price,
          created_at: o.created_at,
          tenantId: tenant.id,
        });
      }

      console.log(`Synced ${orders.length} orders for tenant: ${tenant.name}`);
      totalCount += orders.length;
    }

    res.json({ message: "Orders synced for all tenants", totalCount });
  } catch (err) {
    if (err.response && err.response.data) {
      // Show Shopify API error details
      return res.status(500).json({ error: err.response.data });
    }
    res.status(500).json({ error: err.message });
  }
});




// Fetch Products for a tenant
app.get("/products", async (req, res) => {
  try {
    const { tenantId } = req.query;
    if (!tenantId) return res.status(400).json({ error: "tenantId required" });

    const products = await Product.findAll({ where: { tenantId } });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch Customers for a tenant
app.get("/customers", async (req, res) => {
  try {
    const { tenantId } = req.query;
    if (!tenantId) return res.status(400).json({ error: "tenantId required" });

    const customers = await Customer.findAll({ where: { tenantId } });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch Orders for a tenant
app.get("/orders", async (req, res) => {
  try {
    const { tenantId } = req.query;
    if (!tenantId) return res.status(400).json({ error: "tenantId required" });

    const orders = await Order.findAll({ where: { tenantId } });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all tenants
app.get("/tenants", async (req, res) => {
  try {
    const tenants = await Tenant.findAll();
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// START SERVER
sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

const SYNC_CRON = process.env.SYNC_CRON || "0 */1 * * *"; // default every hour
cron.schedule(SYNC_CRON, async () => {
  console.log("Running scheduled sync for all tenants...");
  await axios.post(`http://localhost:${PORT}/sync/products`);
  await axios.post(`http://localhost:${PORT}/sync/customers`);
  await axios.post(`http://localhost:${PORT}/sync/orders`);
});
