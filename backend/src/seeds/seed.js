const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting RealSight seed...');

  // Clean up existing data (RealSight tables)
  await prisma.payment.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.property.deleteMany();
  await prisma.metric.deleteMany();
  await prisma.portfolio.deleteMany();

  // Create Portfolio
  const portfolio = await prisma.portfolio.create({
    data: {
      name: 'Midwest Commercial Properties LLC',
      portfolio_hash: 'a6b4c8d2e0f1g3h5i7j9k1l3m5n7o9p1q3r5s7t9u1v3w5x7y9z1a3b5c7d9e1f3',
      owner_name: 'Tom Nowakowski',
      headquarters_city: 'Detroit',
      headquarters_state: 'MI',
      subscription_tier: 'Enterprise'
    }
  });
  console.log('✅ Created portfolio:', portfolio.name);

  // Create Properties (4 properties for demo)
  const properties = [];
  
  const prop1 = await prisma.property.create({
    data: {
      portfolio_id: portfolio.id,
      name: 'Detroit Tech Center',
      city: 'Detroit',
      state: 'MI',
      zip_code: '48201',
      property_type: 'Office',
      total_square_feet: 45000,
      unit_count: 12
    }
  });
  properties.push(prop1);

  const prop2 = await prisma.property.create({
    data: {
      portfolio_id: portfolio.id,
      name: 'Riverfront Retail Plaza',
      city: 'Detroit',
      state: 'MI',
      zip_code: '48226',
      property_type: 'Retail',
      total_square_feet: 32000,
      unit_count: 8
    }
  });
  properties.push(prop2);

  const prop3 = await prisma.property.create({
    data: {
      portfolio_id: portfolio.id,
      name: 'Ann Arbor Medical Office',
      city: 'Ann Arbor',
      state: 'MI',
      zip_code: '48104',
      property_type: 'Office',
      total_square_feet: 28000,
      unit_count: 7
    }
  });
  properties.push(prop3);

  const prop4 = await prisma.property.create({
    data: {
      portfolio_id: portfolio.id,
      name: 'Grand Rapids Warehouse',
      city: 'Grand Rapids',
      state: 'MI',
      zip_code: '49503',
      property_type: 'Industrial',
      total_square_feet: 65000,
      unit_count: 5
    }
  });
  properties.push(prop4);

  console.log('✅ Created', properties.length, 'properties');

  // Create Tenants with Leases and Payments
  const tenants = [];

  // Detroit Tech Center - Good Tenant
  const tenant1 = await prisma.tenant.create({
    data: {
      property_id: prop1.id,
      business_name: 'TechStart Solutions',
      tenant_hash: 'techstart-001',
      business_type: 'Technology',
      contact_email: 'admin@techstart.com',
      credit_rating: 'A'
    }
  });
  await prisma.lease.create({
    data: {
      tenant_id: tenant1.id,
      property_id: prop1.id,
      lease_start_date: new Date('2024-01-01'),
      lease_end_date: new Date('2029-12-31'),
      monthly_rent: 8500
    }
  });
  await prisma.payment.create({
    data: {
      time: new Date('2026-05-07'),
      property_id: prop1.id,
      tenant_id: tenant1.id,
      amount_due: 8500,
      amount_paid: 8500,
      payment_status: 'paid',
      days_past_due: 0
    }
  });
  tenants.push(tenant1);

  // Detroit Tech Center - Problem Tenant (Late Payments)
  const tenant2 = await prisma.tenant.create({
    data: {
      property_id: prop1.id,
      business_name: 'DataFlow Analytics',
      tenant_hash: 'dataflow-002',
      business_type: 'Technology',
      contact_email: 'billing@dataflow.io',
      credit_rating: 'B+'
    }
  });
  await prisma.lease.create({
    data: {
      tenant_id: tenant2.id,
      property_id: prop1.id,
      lease_start_date: new Date('2023-06-01'),
      lease_end_date: new Date('2028-05-31'),
      monthly_rent: 12000
    }
  });
  await prisma.payment.create({
    data: {
      time: new Date('2026-05-07'),
      property_id: prop1.id,
      tenant_id: tenant2.id,
      amount_due: 12000,
      amount_paid: 6000,
      payment_status: 'partial',
      days_past_due: 28
    }
  });
  tenants.push(tenant2);

  // Detroit Tech Center - Problem Tenant (Delinquent)
  const tenant3 = await prisma.tenant.create({
    data: {
      property_id: prop1.id,
      business_name: 'Metro Financial Group',
      tenant_hash: 'metrofin-004',
      business_type: 'Financial Services',
      contact_email: 'leasing@metrofin.com',
      credit_rating: 'A+'
    }
  });
  await prisma.lease.create({
    data: {
      tenant_id: tenant3.id,
      property_id: prop1.id,
      lease_start_date: new Date('2022-09-01'),
      lease_end_date: new Date('2032-08-31'),
      monthly_rent: 15000
    }
  });
  await prisma.payment.create({
    data: {
      time: new Date('2026-05-07'),
      property_id: prop1.id,
      tenant_id: tenant3.id,
      amount_due: 15000,
      amount_paid: 0,
      payment_status: 'delinquent',
      days_past_due: 42
    }
  });
  tenants.push(tenant3);

  // Riverfront Retail Plaza - Good Tenant
  const tenant4 = await prisma.tenant.create({
    data: {
      property_id: prop2.id,
      business_name: 'Gourmet Market Fresh',
      tenant_hash: 'gourmet-006',
      business_type: 'Retail - Grocery',
      contact_email: 'corporate@gourmetmarket.com',
      credit_rating: 'A'
    }
  });
  await prisma.lease.create({
    data: {
      tenant_id: tenant4.id,
      property_id: prop2.id,
      lease_start_date: new Date('2023-01-01'),
      lease_end_date: new Date('2033-12-31'),
      monthly_rent: 18000
    }
  });
  await prisma.payment.create({
    data: {
      time: new Date('2026-05-07'),
      property_id: prop2.id,
      tenant_id: tenant4.id,
      amount_due: 18000,
      amount_paid: 18000,
      payment_status: 'paid',
      days_past_due: 0
    }
  });
  tenants.push(tenant4);

  // Riverfront Retail Plaza - Problem Tenant (Defaulted)
  const tenant5 = await prisma.tenant.create({
    data: {
      property_id: prop2.id,
      business_name: 'Style & Co Boutique',
      tenant_hash: 'styleco-007',
      business_type: 'Retail - Fashion',
      contact_email: 'owner@styleandco.com',
      credit_rating: 'C+'
    }
  });
  await prisma.lease.create({
    data: {
      tenant_id: tenant5.id,
      property_id: prop2.id,
      lease_start_date: new Date('2025-01-01'),
      lease_end_date: new Date('2030-12-31'),
      monthly_rent: 4200
    }
  });
  await prisma.payment.create({
    data: {
      time: new Date('2026-05-07'),
      property_id: prop2.id,
      tenant_id: tenant5.id,
      amount_due: 4200,
      amount_paid: 1000,
      payment_status: 'defaulted',
      days_past_due: 67
    }
  });
  tenants.push(tenant5);

  // Ann Arbor Medical Office - Good Tenants
  const tenant6 = await prisma.tenant.create({
    data: {
      property_id: prop3.id,
      business_name: 'Ann Arbor Dental Associates',
      tenant_hash: 'aadental-008',
      business_type: 'Healthcare - Dental',
      contact_email: 'admin@aadental.com',
      credit_rating: 'A'
    }
  });
  await prisma.lease.create({
    data: {
      tenant_id: tenant6.id,
      property_id: prop3.id,
      lease_start_date: new Date('2021-04-01'),
      lease_end_date: new Date('2031-03-31'),
      monthly_rent: 11000
    }
  });
  await prisma.payment.create({
    data: {
      time: new Date('2026-05-07'),
      property_id: prop3.id,
      tenant_id: tenant6.id,
      amount_due: 11000,
      amount_paid: 11000,
      payment_status: 'paid',
      days_past_due: 0
    }
  });
  tenants.push(tenant6);

  // Grand Rapids Warehouse - Good Tenant
  const tenant7 = await prisma.tenant.create({
    data: {
      property_id: prop4.id,
      business_name: 'Midwest Distribution Co',
      tenant_hash: 'midwestdist-010',
      business_type: 'Logistics',
      contact_email: 'leasing@midwestdist.com',
      credit_rating: 'A-'
    }
  });
  await prisma.lease.create({
    data: {
      tenant_id: tenant7.id,
      property_id: prop4.id,
      lease_start_date: new Date('2023-03-01'),
      lease_end_date: new Date('2033-02-28'),
      monthly_rent: 28000
    }
  });
  await prisma.payment.create({
    data: {
      time: new Date('2026-05-07'),
      property_id: prop4.id,
      tenant_id: tenant7.id,
      amount_due: 28000,
      amount_paid: 28000,
      payment_status: 'paid',
      days_past_due: 0
    }
  });
  tenants.push(tenant7);

  console.log('✅ Created', tenants.length, 'tenants with leases and payments');

  // Create Metrics for Portfolio Dashboard
  const metrics = [
    { metric_name: 'rent_collection_rate', metric_value: 92.3, unit: '%' },
    { metric_name: 'occupancy_rate', metric_value: 87.5, unit: '%' },
    { metric_name: 'outstanding_debt', metric_value: 19200, unit: '$' },
    { metric_name: 'avg_days_past_due', metric_value: 34, unit: 'days' },
    { metric_name: 'monthly_revenue', metric_value: 86700, unit: '$' },
    { metric_name: 'problem_tenants_count', metric_value: 3, unit: 'count' },
    { metric_name: 'active_alerts', metric_value: 4, unit: 'count' },
    { metric_name: 'noi_margin', metric_value: 6.8, unit: '%' }
  ];

  for (const m of metrics) {
    await prisma.metric.create({
      data: {
        portfolio_id: portfolio.id,
        metric_date: new Date('2026-05-07'),
        metric_name: m.metric_name,
        metric_value: m.metric_value,
        unit: m.unit
      }
    });
  }

  console.log('✅ Created', metrics.length, 'portfolio metrics');
  console.log('🎉 RealSight seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
