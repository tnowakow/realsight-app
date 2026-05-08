const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─── Helpers ───────────────────────────────────────────────────────────────
const pick   = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rndInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const hashId = (str) => { let h = 0; for (const c of str) { h = (h << 5) - h + c.charCodeAt(0); h |= 0; } return `h${Math.abs(h)}`; };

// Return the first day of the month N months ago (0 = current month)
const monthStart = (monthsAgo) => {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() - monthsAgo);
  return d;
};

/**
 * Generate 6 monthly payment records for a tenant based on their reliability profile.
 *
 * Profiles:
 *   'excellent'  — always paid on time, full amount
 *   'good'       — mostly paid, very occasional 1-5 day delay
 *   'declining'  — started good 6 months ago, getting progressively worse
 *   'chronic'    — consistently partial/late every month
 *   'delinquent' — 2-3 months paid then stopped
 *   'defaulted'  — stopped paying 4+ months ago, now defaulted
 *
 * NOTE: days_past_due is calculated dynamically at query time based on current date.
 * The stored value represents the payment behavior pattern, not absolute staleness.
 */
const buildPaymentHistory = (tenantId, propertyId, monthlyRent, profile) => {
  const records = [];

  for (let monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
    const time = monthStart(monthsAgo);
    let amount_paid, payment_status, days_past_due;

    switch (profile) {
      case 'excellent':
        amount_paid    = monthlyRent;
        payment_status = 'paid';
        days_past_due  = 0; // Always on time
        break;

      case 'good':
        amount_paid    = monthlyRent;
        payment_status = 'paid';
        days_past_due  = Math.random() < 0.15 ? rndInt(1, 5) : 0; // Occasional minor delay
        break;

      case 'declining': {
        // Month 5 (oldest) = good, month 0 (current) = delinquent
        const severity = (5 - monthsAgo) / 5; // 0.0 → 1.0
        if (severity < 0.4) {
          amount_paid = monthlyRent; payment_status = 'paid'; days_past_due = 0;
        } else if (severity < 0.7) {
          days_past_due  = rndInt(5, 20);
          amount_paid    = Math.round(monthlyRent * 0.85);
          payment_status = 'partial';
        } else {
          days_past_due  = rndInt(25, 50);
          amount_paid    = Math.round(monthlyRent * 0.3);
          payment_status = 'delinquent';
        }
        break;
      }

      case 'chronic':
        // Chronic late payers - always 10-35 days behind, partial payments
        days_past_due  = rndInt(10, 35);
        amount_paid    = Math.round(monthlyRent * (0.4 + Math.random() * 0.4)); // 40-80%
        payment_status = days_past_due > 20 ? 'delinquent' : 'partial';
        break;

      case 'delinquent':
        // Paid months 5-3, stopped months 2-0 - current month accumulates days past due dynamically
        if (monthsAgo >= 3) {
          amount_paid = monthlyRent; payment_status = 'paid'; days_past_due = 0;
        } else {
          // For recent months, store a base delay that will be calculated dynamically at query time
          const baseDelay = rndInt(30, 60);
          days_past_due  = baseDelay + (2 - monthsAgo) * 15; // Increases as we get closer to current month
          amount_paid    = 0;
          payment_status = 'delinquent';
        }
        break;

      case 'defaulted':
        // Paid months 5-4, then stopped and defaulted - current state is severely delinquent
        if (monthsAgo >= 4) {
          amount_paid = monthlyRent; payment_status = 'paid'; days_past_due = 0;
        } else {
          const baseDelay = rndInt(60, 90);
          days_past_due  = baseDelay + (3 - monthsAgo) * 20; // Increases toward current month
          amount_paid    = monthsAgo === 3 ? Math.round(monthlyRent * 0.25) : 0;
          payment_status = 'defaulted';
        }
        break;

      default:
        amount_paid = monthlyRent; payment_status = 'paid'; days_past_due = 0;
    }

    records.push({ time, property_id: propertyId, tenant_id: tenantId, amount_due: monthlyRent, amount_paid, payment_status, days_past_due });
  }

  return records;
};

// ─── Static data tables ───────────────────────────────────────────────────
const PORTFOLIOS = [
  { name: 'Midwest Commercial Properties LLC', owner: 'Tom Nowakowski',  city: 'Detroit',      state: 'MI', tier: 'Enterprise' },
  { name: 'Great Lakes Retail Holdings',        owner: 'Chuck Smith',     city: 'Chicago',      state: 'IL', tier: 'Enterprise' },
  { name: 'Sunbelt Logistics & Industrial',     owner: 'Maria Garcia',    city: 'Atlanta',      state: 'GA', tier: 'Professional' },
  { name: 'West Coast Tech Partners',           owner: 'David Chen',      city: 'San Jose',     state: 'CA', tier: 'Enterprise' },
  { name: 'Keystone Medical REIT',              owner: 'Dr. Emily White', city: 'Philadelphia', state: 'PA', tier: 'Professional' },
];

const PROPERTY_TYPES = {
  Office:     { names: ['Metro Tower', 'Innovation Hub', 'City Center Plaza', 'Corporate Commons', 'The Apex Building', 'Lakefront Office Park', 'Pinnacle Suites'],      sqft: [25000, 80000],   units: [10, 50] },
  Retail:     { names: ['Riverwalk Shops', 'The Crossroads', 'Heritage Square', 'Parkside Pavilion', 'Market Street Center', 'Shoppes at the Boulevard', 'Corner Market'], sqft: [15000, 50000],   units: [5,  30] },
  Industrial: { names: ['Keystone Logistics', 'Titan Warehouse', 'Gateway Distribution', 'Northpoint Industrial', 'Railhead Complex', 'Iron Gate Facility'],               sqft: [50000, 200000],  units: [2,  12] },
  Healthcare: { names: ['Wellness Medical Campus', 'Orchard Health Center', 'City General Clinic', 'Lakeview Surgical', 'Preserve Medical', 'Physicians Plaza'],           sqft: [20000, 60000],   units: [8,  40] },
};

const TENANT_NAMES = {
  Office:     ['Innovate Inc.', 'Global Synergy', 'Quantum Analytics', 'Apex Financial', 'BrightPath Solutions', 'Meridian Consulting', 'Summit Strategy', 'CoreTech', 'NexGen Partners', 'BlueSky Ventures'],
  Retail:     ['Urban Trends', 'Fresh Market', 'The Daily Grind', 'Artisan Corner', 'Style & Co.', 'Roast & Brew', 'Bloom Florist', 'Silver Thread Boutique', 'Peak Performance Sports', 'Corner Pharmacy'],
  Industrial: ['LogiCore', 'SupplyChain Solutions', 'ProHaul', 'Prime Distribution', 'BulkGoods Inc.', 'FastFreight Co.', 'Precision Parts Mfg.'],
  Healthcare: ['City General Dentistry', 'OrthoCare Specialists', 'Family Wellness Clinic', 'VisionFirst Optometry', 'Apex Physical Therapy', 'Northside Pediatrics'],
};

const CITIES = {
  MI: ['Detroit', 'Southfield', 'Troy', 'Ann Arbor', 'Grand Rapids', 'Lansing'],
  IL: ['Chicago', 'Naperville', 'Rosemont', 'Schaumburg', 'Oak Brook', 'Evanston'],
  GA: ['Atlanta', 'Marietta', 'Alpharetta', 'Sandy Springs', 'Decatur', 'Smyrna'],
  CA: ['San Jose', 'Santa Clara', 'Sunnyvale', 'Cupertino', 'Palo Alto', 'Fremont'],
  PA: ['Philadelphia', 'King of Prussia', 'Bala Cynwyd', 'Wayne', 'Exton', 'Malvern'],
};

// Payment profile weights by portfolio (makes each portfolio feel different)
const PROFILE_WEIGHTS = {
  'Midwest Commercial Properties LLC': { excellent: 3, good: 4, declining: 2, chronic: 2, delinquent: 1, defaulted: 1 },
  'Great Lakes Retail Holdings':        { excellent: 2, good: 3, declining: 3, chronic: 3, delinquent: 2, defaulted: 1 },  // retail is rougher
  'Sunbelt Logistics & Industrial':     { excellent: 4, good: 5, declining: 1, chronic: 1, delinquent: 1, defaulted: 0 },  // industrial tenants are reliable
  'West Coast Tech Partners':           { excellent: 5, good: 4, declining: 2, chronic: 1, delinquent: 1, defaulted: 1 },  // mostly strong but some volatility
  'Keystone Medical REIT':              { excellent: 6, good: 4, declining: 1, chronic: 1, delinquent: 0, defaulted: 0 },  // medical = very stable
};

const pickProfile = (portfolioName) => {
  const weights = PROFILE_WEIGHTS[portfolioName] ?? { excellent: 3, good: 3, declining: 2, chronic: 1, delinquent: 1, defaulted: 0 };
  const pool = [];
  for (const [profile, weight] of Object.entries(weights)) {
    for (let i = 0; i < weight; i++) pool.push(profile);
  }
  return pick(pool);
};

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding RealSight with 6 months of payment history...\n');

  await prisma.payment.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.property.deleteMany();
  await prisma.metric.deleteMany();
  await prisma.portfolio.deleteMany();
  console.log('🧹 Cleared existing data\n');

  for (const pd of PORTFOLIOS) {
    const portfolio = await prisma.portfolio.create({
      data: { name: pd.name, portfolio_hash: hashId(pd.name), owner_name: pd.owner, headquarters_city: pd.city, headquarters_state: pd.state, subscription_tier: pd.tier }
    });
    console.log(`🏢 ${portfolio.name}`);

    const numProperties = rndInt(12, 15);
    const usedPropertyNames = new Set();
    let portfolioPayments = [];
    let portfolioTenantCount = 0;
    let portfolioUnitCount = 0;

    for (let pi = 0; pi < numProperties; pi++) {
      const propType = pick(Object.keys(PROPERTY_TYPES));
      const typeData = PROPERTY_TYPES[propType];
      
      // Unique property name per portfolio
      let propName;
      do { propName = `${pick(typeData.names)} — ${pick(CITIES[pd.state])}`; } while (usedPropertyNames.has(propName));
      usedPropertyNames.add(propName);

      const totalSqft = rndInt(typeData.sqft[0], typeData.sqft[1]);
      const unitCount = rndInt(typeData.units[0], typeData.units[1]);

      const property = await prisma.property.create({
        data: { portfolio_id: portfolio.id, name: propName, city: pick(CITIES[pd.state]), state: pd.state, zip_code: `${rndInt(10000, 99999)}`, property_type: propType, total_square_feet: totalSqft, unit_count: unitCount }
      });

      portfolioUnitCount += unitCount;

      // 80-95% occupancy — occupied units get tenants
      const occupiedUnits = Math.floor(unitCount * (0.80 + Math.random() * 0.15));
      const usedTenantNames = new Set();

      for (let ti = 0; ti < occupiedUnits; ti++) {
        let tenantName;
        const namePool = TENANT_NAMES[propType];
        do { tenantName = `${pick(namePool)} #${rndInt(1, 99)}`; } while (usedTenantNames.has(tenantName));
        usedTenantNames.add(tenantName);

        const creditRating = pick(['A+', 'A', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C']);
        const monthlyRent  = rndInt(8, 45) * 1000; // $8k–$45k
        const profile      = pickProfile(pd.name);

        const tenant = await prisma.tenant.create({
          data: {
            property_id: property.id,
            business_name: tenantName,
            tenant_hash: hashId(`${property.id}-${tenantName}`),
            business_type: propType,
            contact_email: `billing@${tenantName.toLowerCase().replace(/[^a-z]/g, '')}.com`,
            credit_rating: creditRating,
          }
        });

        await prisma.lease.create({
          data: {
            tenant_id: tenant.id,
            property_id: property.id,
            lease_start_date: new Date(Date.now() - rndInt(365, 1825) * 86400000), // 1-5 years ago
            lease_end_date:   new Date(Date.now() + rndInt(180, 2555) * 86400000), // 6mo - 7yr from now
            monthly_rent: monthlyRent,
          }
        });

        // 6 months of payment history
        const history = buildPaymentHistory(tenant.id, property.id, monthlyRent, profile);
        for (const record of history) {
          await prisma.payment.create({ data: record });
        }

        portfolioPayments.push(...history);
        portfolioTenantCount++;
      }
    }

    // ── Calculate aggregate portfolio metrics from actual seeded data ──────
    // Use only the most recent month's payments for current-state metrics
    const currentMonthPayments = portfolioPayments.filter(p => {
      const cutoff = monthStart(1); // start of last month
      return p.time >= cutoff;
    });

    const totalDue    = currentMonthPayments.reduce((s, p) => s + p.amount_due, 0);
    const totalPaid   = currentMonthPayments.reduce((s, p) => s + p.amount_paid, 0);
    const latePmts    = currentMonthPayments.filter(p => p.days_past_due > 0);
    const problemPmts = currentMonthPayments.filter(p => ['partial', 'delinquent', 'defaulted'].includes(p.payment_status));

    const collectionRate  = totalDue > 0 ? (totalPaid / totalDue) * 100 : 100;
    const occupancyRate   = portfolioUnitCount > 0 ? (portfolioTenantCount / portfolioUnitCount) * 100 : 0;
    const avgDaysPastDue  = latePmts.length > 0 ? latePmts.reduce((s, p) => s + p.days_past_due, 0) / latePmts.length : 0;
    const outstandingDebt = Math.max(0, totalDue - totalPaid);
    const noiMargin       = 65; // estimated — 65% NOI margin typical for well-run commercial

    const metricsToSeed = [
      { metric_name: 'rent_collection_rate',   metric_value: parseFloat(collectionRate.toFixed(2)),  unit: '%' },
      { metric_name: 'occupancy_rate',         metric_value: parseFloat(occupancyRate.toFixed(2)),   unit: '%' },
      { metric_name: 'outstanding_debt',       metric_value: parseFloat(outstandingDebt.toFixed(2)), unit: '$' },
      { metric_name: 'avg_days_past_due',      metric_value: parseFloat(avgDaysPastDue.toFixed(2)),  unit: 'days' },
      { metric_name: 'monthly_revenue',        metric_value: parseFloat(totalPaid.toFixed(2)),        unit: '$' },
      { metric_name: 'problem_tenants_count',  metric_value: problemPmts.length,                     unit: 'count' },
      { metric_name: 'active_alerts',          metric_value: problemPmts.length,                     unit: 'count' },
      { metric_name: 'noi_margin',             metric_value: noiMargin,                               unit: '%' },
      { metric_name: 'total_units',            metric_value: portfolioUnitCount,                      unit: 'count' },
      { metric_name: 'occupied_units',         metric_value: portfolioTenantCount,                    unit: 'count' },
    ];

    // Seed per-month metrics for trend charts (6 months)
    for (let monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
      const monthPayments = portfolioPayments.filter(p => {
        const mStart = monthStart(monthsAgo + 1);
        const mEnd   = monthStart(monthsAgo);
        return p.time >= mStart && p.time < mEnd;
      });
      if (!monthPayments.length) continue;

      const mDue    = monthPayments.reduce((s, p) => s + p.amount_due, 0);
      const mPaid   = monthPayments.reduce((s, p) => s + p.amount_paid, 0);
      const mRate   = mDue > 0 ? (mPaid / mDue) * 100 : 100;
      const mDate   = monthStart(monthsAgo);

      await prisma.metric.create({
        data: { portfolio_id: portfolio.id, metric_date: mDate, metric_name: 'monthly_collection_rate', metric_value: parseFloat(mRate.toFixed(2)), unit: '%' }
      });
      await prisma.metric.create({
        data: { portfolio_id: portfolio.id, metric_date: mDate, metric_name: 'monthly_revenue', metric_value: parseFloat(mPaid.toFixed(2)), unit: '$' }
      });
      await prisma.metric.create({
        data: { portfolio_id: portfolio.id, metric_date: mDate, metric_name: 'monthly_outstanding', metric_value: parseFloat(Math.max(0, mDue - mPaid).toFixed(2)), unit: '$' }
      });
    }

    // Seed current-state summary metrics
    for (const m of metricsToSeed) {
      await prisma.metric.create({
        data: { portfolio_id: portfolio.id, metric_date: monthStart(0), metric_name: m.metric_name, metric_value: m.metric_value, unit: m.unit }
      });
    }

    console.log(`   🏠 ${numProperties} properties  👥 ${portfolioTenantCount} tenants  📊 ${portfolioPayments.length} payment records`);
  }

  // ─── Seed Acquisition Targets ──────────────────────────────────────────
  console.log('\n🎯 Seeding acquisition targets...');
  
  // Clear existing acquisition data first to prevent duplicates
  await prisma.acquisitionScore.deleteMany();
  await prisma.acquisitionTarget.deleteMany();

  const properties = await prisma.property.findMany();

  const targetsData = [
    { name: "Sunset Plaza", property: pick(properties.filter(p => p.property_type === 'Retail')), deal_type: "Value-Add", narrative: "Aging but well-located retail strip with rents ~20% below market rate.", purchase_price: 4500000, sqft: 25000, occupancy: 0.75, noi: 270000, market_cap: 0.065, proforma_noi: 425000, renovation_budget: 750000, score: 88 },
    { name: "Metro Business Tower", property: pick(properties.filter(p => p.property_type === 'Office')), deal_type: "Distressed", narrative: "Primary tenant went bankrupt, triggering co-tenancy clauses and high vacancy.", purchase_price: 8000000, sqft: 120000, occupancy: 0.35, noi: 300000, market_cap: 0.080, proforma_noi: 1200000, renovation_budget: 1500000, score: 92 },
    { name: "Apex Logistics Center", property: pick(properties.filter(p => p.property_type === 'Industrial')), deal_type: "Stabilized", narrative: "Fully-leased warehouse with a national credit tenant on a long-term NNN lease.", purchase_price: 12000000, sqft: 150000, occupancy: 1.00, noi: 780000, market_cap: 0.065, proforma_noi: 810000, renovation_budget: 0, score: 76 },
    // NOTE: For demo simplicity, we'll assign the multifamily and mixed-use to other property types for now
    { name: "The Residences at Oakwood", property: pick(properties.filter(p => p.property_type === 'Office')), deal_type: "Growth Market", narrative: "Well-maintained complex in a rapidly growing tech hub with high rent growth potential.", purchase_price: 25000000, sqft: 140000, occupancy: 0.98, noi: 1250000, market_cap: 0.050, proforma_noi: 1325000, renovation_budget: 100000, score: 81 },
    { name: "The Foundry Lofts", property: pick(properties.filter(p => p.property_type === 'Retail')), deal_type: "Repositioning", narrative: "Historic building with stable retail but vacant office space approved for residential conversion.", purchase_price: 6000000, sqft: 80000, occupancy: 0.25, noi: 150000, market_cap: 0.070, proforma_noi: 1300000, renovation_budget: 10000000, score: 95 }
  ];

  for (const targetData of targetsData) {
    if (!targetData.property) {
      console.warn(`   ⚠️ Could not find a suitable property for target "${targetData.name}", skipping.`);
      continue;
    }

    const target = await prisma.acquisitionTarget.create({
      data: {
        property_id: targetData.property.id,
        deal_type: targetData.deal_type,
        narrative: targetData.narrative,
        purchase_price: targetData.purchase_price,
        square_footage: targetData.sqft,
        current_occupancy: targetData.occupancy,
        current_noi: targetData.noi,
        market_cap_rate: targetData.market_cap,
        proforma_noi: targetData.proforma_noi,
        renovation_budget: targetData.renovation_budget
      }
    });

    // Create a score record for the target
    await prisma.acquisitionScore.create({
      data: {
        target_id: target.id,
        financials: (targetData.score - rndInt(5, 10)) * 0.4,
        value_add: (targetData.score + rndInt(3, 8)) * 0.3,
        market_location: (targetData.score + rndInt(2, 6)) * 0.2,
        property_characteristics: (targetData.score - rndInt(4, 8)) * 0.1,
        composite_score: targetData.score
      }
    });
    
    console.log(`   🎯 Created acquisition target: ${targetData.name}`);
  }

  console.log('\n🎉 Seeding complete — 6 months of payment history ready for trend charts');
}

main()
  .catch(e => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
