const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// --- Helper Functions ---
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `hash_${Math.abs(hash)}`;
};


// --- Data for Procedural Generation ---
const portfolioNames = [
  { name: 'Midwest Commercial Properties LLC', owner: 'Tom Nowakowski', city: 'Detroit', state: 'MI' },
  { name: 'Great Lakes Retail Holdings', owner: 'Chuck Smith', city: 'Chicago', state: 'IL' },
  { name: 'Sunbelt Logistics & Industrial', owner: 'Maria Garcia', city: 'Atlanta', state: 'GA' },
  { name: 'West Coast Tech Partners', owner: 'David Chen', city: 'San Jose', state: 'CA' },
  { name: 'Keystone Medical REIT', owner: 'Dr. Emily White', city: 'Philadelphia', state: 'PA' }
];

const propertyData = {
  Office: { names: ['Metro Tower', 'Innovation Hub', 'City Center Plaza', 'Corporate Commons', 'The Apex Building'], sqft: [25000, 80000], units: [10, 50] },
  Retail: { names: ['Riverwalk Shops', 'The Crossroads', 'Heritage Square', 'Parkside Pavilion', 'Market Street Center'], sqft: [15000, 50000], units: [5, 30] },
  Industrial: { names: ['Keystone Logistics', 'Titan Warehouse', 'Gateway Distribution', 'Northpoint Industrial', 'Railhead Complex'], sqft: [50000, 200000], units: [1, 10] },
  Healthcare: { names: ['Wellness Medical Campus', 'Orchard Health Center', 'City General Clinic', 'Lakeview Surgical', 'Preserve Medical'], sqft: [20000, 60000], units: [8, 40] }
};

const tenantData = {
  Office: ['Innovate Inc.', 'Global Synergy', 'Quantum Analytics', 'Apex Financial', 'BrightPath'],
  Retail: ['Urban Trends', 'Fresh Market', 'The Daily Grind', 'Artisan Corner', 'Style & Co.'],
  Industrial: ['LogiCore', 'SupplyChain Solutions', 'ProHaul', 'Prime Distribution', 'BulkGoods Inc.'],
  Healthcare: ['City General Dentistry', 'OrthoCare Specialists', 'Family Wellness Clinic', 'VisionFirst']
};

const citiesByState = {
  MI: ['Southfield', 'Troy', 'Ann Arbor', 'Grand Rapids'],
  IL: ['Naperville', 'Rosemont', 'Schaumburg', 'Oak Brook'],
  GA: ['Marietta', 'Alpharetta', 'Sandy Springs', 'Decatur'],
  CA: ['Santa Clara', 'Sunnyvale', 'Cupertino', 'Palo Alto'],
  PA: ['King of Prussia', 'Bala Cynwyd', 'Wayne', 'Exton']
};

async function main() {
  console.log('🌱 Starting large-scale RealSight seed...');

  // Clean up existing data
  await prisma.payment.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.property.deleteMany();
  await prisma.metric.deleteMany();
  await prisma.portfolio.deleteMany();
  console.log('🧹 Database cleaned.');

  for (const p of portfolioNames) {
    const portfolio = await prisma.portfolio.create({
      data: {
        name: p.name,
        portfolio_hash: hashString(p.name),
        owner_name: p.owner,
        headquarters_city: p.city,
        headquarters_state: p.state,
        subscription_tier: 'Enterprise'
      }
    });

    console.log(`\n🏢 Created portfolio: ${portfolio.name}`);

    let allProperties = [];
    let allTenants = [];
    let allPayments = [];

    const numProperties = getRandomInt(12, 15);
    for (let i = 0; i < numProperties; i++) {
      const propertyType = getRandomElement(Object.keys(propertyData));
      const propTypeData = propertyData[propertyType];
      
      const property = await prisma.property.create({
        data: {
          portfolio_id: portfolio.id,
          name: `${getRandomElement(propTypeData.names)} - ${getRandomElement(citiesByState[p.state])}`,
          city: getRandomElement(citiesByState[p.state]),
          state: p.state,
          zip_code: `${getRandomInt(10000, 99999)}`,
          property_type: propertyType,
          total_square_feet: getRandomInt(propTypeData.sqft[0], propTypeData.sqft[1]),
          unit_count: getRandomInt(propTypeData.units[0], propTypeData.units[1])
        }
      });
      allProperties.push(property);

      // Create tenants for this property
      const occupancyRate = Math.random() * (0.95 - 0.8) + 0.8; // 80-95% occupancy
      const numTenants = Math.floor(property.unit_count * occupancyRate);

      for (let j = 0; j < numTenants; j++) {
        const tenantName = `${getRandomElement(tenantData[propertyType])} #${j + 1}`;
        const tenant = await prisma.tenant.create({
          data: {
            property_id: property.id,
            business_name: tenantName,
            tenant_hash: hashString(`${property.id}-${tenantName}`),
            business_type: propertyType,
            contact_email: `contact@${tenantName.toLowerCase().replace(/\s+/g, '')}.com`,
            credit_rating: getRandomElement(['A+', 'A', 'A-', 'B+', 'B', 'C+'])
          }
        });

        const lease = await prisma.lease.create({
          data: {
            tenant_id: tenant.id,
            property_id: property.id,
            lease_start_date: getRandomDate(new Date('2020-01-01'), new Date('2025-01-01')),
            lease_end_date: getRandomDate(new Date('2028-01-01'), new Date('2035-01-01')),
            monthly_rent: getRandomInt(15, 40) * 1000 // $15k - $40k rent
          }
        });

        // Create a payment record for the current month
        const paymentRoll = Math.random();
        let payment_status, amount_paid, days_past_due;

        if (paymentRoll > 0.7) { // 70% paid
          payment_status = 'paid';
          amount_paid = lease.monthly_rent;
          days_past_due = 0;
        } else if (paymentRoll > 0.4) { // 30% partial
          payment_status = 'partial';
          amount_paid = lease.monthly_rent * (Math.random() * (0.8 - 0.2) + 0.2); // 20-80% paid
          days_past_due = getRandomInt(5, 25);
        } else if (paymentRoll > 0.2) { // 20% delinquent
          payment_status = 'delinquent';
          amount_paid = 0;
          days_past_due = getRandomInt(31, 60);
        } else { // 10% defaulted
          payment_status = 'defaulted';
          amount_paid = lease.monthly_rent * (Math.random() * 0.1); // <10% paid
          days_past_due = getRandomInt(61, 120);
        }
        
        const payment = await prisma.payment.create({
          data: {
            time: new Date(),
            property_id: property.id,
            tenant_id: tenant.id,
            amount_due: lease.monthly_rent,
            amount_paid: Math.round(amount_paid),
            payment_status,
            days_past_due
          }
        });
        allPayments.push({ ...payment, lease });
        allTenants.push(tenant);
      }
    }
    console.log(`  -> 🏠 Created ${allProperties.length} properties`);
    console.log(`  -> 👥 Created ${allTenants.length} tenants`);

    // --- Calculate and Create Portfolio Metrics ---
    const totalRentDue = allPayments.reduce((sum, p) => sum + p.amount_due, 0);
    const totalRentPaid = allPayments.reduce((sum, p) => sum + p.amount_paid, 0);
    const problemTenants = allPayments.filter(p => ['partial', 'delinquent', 'defaulted'].includes(p.payment_status));
    const totalUnits = allProperties.reduce((sum, p) => sum + p.unit_count, 0);

    const metrics = [
      { metric_name: 'rent_collection_rate', metric_value: totalRentDue > 0 ? (totalRentPaid / totalRentDue) * 100 : 100, unit: '%' },
      { metric_name: 'occupancy_rate', metric_value: totalUnits > 0 ? (allTenants.length / totalUnits) * 100 : 100, unit: '%' },
      { metric_name: 'outstanding_debt', metric_value: totalRentDue - totalRentPaid, unit: '$' },
      { metric_name: 'avg_days_past_due', metric_value: problemTenants.length > 0 ? problemTenants.reduce((sum, p) => sum + p.days_past_due, 0) / problemTenants.length : 0, unit: 'days' },
      { metric_name: 'monthly_revenue', metric_value: totalRentPaid, unit: '$' },
      { metric_name: 'problem_tenants_count', metric_value: problemTenants.length, unit: 'count' },
      { metric_name: 'active_alerts', metric_value: problemTenants.length, unit: 'count' },
      { metric_name: 'noi_margin', metric_value: getRandomInt(25, 65), unit: '%' }
    ];

    for (const m of metrics) {
      await prisma.metric.create({
        data: {
          portfolio_id: portfolio.id,
          metric_date: new Date(),
          metric_name: m.metric_name,
          metric_value: parseFloat(m.metric_value.toFixed(2)),
          unit: m.unit
        }
      });
    }
    console.log(`  -> 📈 Created ${metrics.length} calculated portfolio metrics`);
  }
  
  console.log('\n🎉 RealSight large-scale seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });