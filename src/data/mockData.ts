import type { Customer, Beer, Batch, TapLine, BreweryEvent, Reservation, MenuItem, InventoryItem, StaffMember, WholesaleAccount, MugClubMember, EmailCampaign, DailySales, ComplianceItem, Performer, DetailedRecipe, Keg, MonthlyFinancial } from '../types';

export const customers: Customer[] = [
  { id: '1', firstName: 'Jake', lastName: 'Morrison', email: 'jake@email.com', phone: '(830) 555-0101', firstVisit: '2026-01-15', lastVisit: '2026-03-02', totalVisits: 24, totalSpent: 1842.50, avgTicket: 76.77, favoriteBeers: ['Hill Country Haze', 'Bulverde Blonde'], dietaryRestrictions: [], tags: ['regular', 'vip'], loyaltyPoints: 2450, loyaltyTier: 'Gold', mugClubMember: true, mugClubTier: 'Premium', notes: 'Loves IPAs, brings family every Saturday', source: 'word-of-mouth', familyMembers: [{ name: 'Sarah', relation: 'wife' }, { name: 'Max', relation: 'son', age: 7 }] },
  { id: '2', firstName: 'Maria', lastName: 'Gonzalez', email: 'maria.g@email.com', phone: '(830) 555-0102', firstVisit: '2026-02-01', lastVisit: '2026-03-03', totalVisits: 16, totalSpent: 987.25, avgTicket: 61.70, favoriteBeers: ['Texas Sunset Wheat', 'Prickly Pear Sour'], dietaryRestrictions: ['gluten-free options'], tags: ['regular'], loyaltyPoints: 1200, loyaltyTier: 'Silver', mugClubMember: true, mugClubTier: 'Standard', notes: 'Prefers patio seating', source: 'instagram' },
  { id: '3', firstName: 'Tom', lastName: 'Henderson', email: 'tom.h@email.com', phone: '(210) 555-0201', firstVisit: '2026-01-20', lastVisit: '2026-03-01', totalVisits: 12, totalSpent: 654.00, avgTicket: 54.50, favoriteBeers: ['Lone Star Lager', 'Smoked Porter'], dietaryRestrictions: ['nut allergy'], tags: ['regular', 'trivia-regular'], loyaltyPoints: 850, loyaltyTier: 'Silver', mugClubMember: false, notes: 'Trivia team captain - "Hop To It"', source: 'google' },
  { id: '4', firstName: 'Ashley', lastName: 'Chen', email: 'ashley.chen@email.com', phone: '(830) 555-0103', firstVisit: '2026-02-14', lastVisit: '2026-02-28', totalVisits: 6, totalSpent: 342.00, avgTicket: 57.00, favoriteBeers: ['Bluebonnet Blonde', 'Craft Root Beer'], dietaryRestrictions: ['vegetarian'], tags: ['new'], loyaltyPoints: 420, loyaltyTier: 'Bronze', mugClubMember: false, notes: 'Interested in mug club', source: 'yelp' },
  { id: '5', firstName: 'Bobby', lastName: 'Whitfield', email: 'bobby.w@email.com', phone: '(830) 555-0104', firstVisit: '2025-12-20', lastVisit: '2026-03-04', totalVisits: 38, totalSpent: 3240.00, avgTicket: 85.26, favoriteBeers: ['Barrel-Aged Stout', 'Hill Country Haze'], dietaryRestrictions: [], tags: ['vip', 'founding-member', 'regular'], loyaltyPoints: 4200, loyaltyTier: 'Platinum', mugClubMember: true, mugClubTier: 'Founding', notes: 'Founding mug club member #001. Local business owner. Hosts monthly networking events.', source: 'pre-opening' },
  { id: '6', firstName: 'Diane', lastName: 'Foster', email: 'diane.f@email.com', phone: '(830) 555-0105', firstVisit: '2026-01-10', lastVisit: '2026-02-20', totalVisits: 8, totalSpent: 412.50, avgTicket: 51.56, favoriteBeers: ['Texas Sunset Wheat', 'Lavender Lemonade'], dietaryRestrictions: ['dairy-free'], tags: ['family'], loyaltyPoints: 520, loyaltyTier: 'Bronze', mugClubMember: false, notes: 'Comes with 3 kids, loves the play area', source: 'facebook', familyMembers: [{ name: 'Lily', relation: 'daughter', age: 5 }, { name: 'Jack', relation: 'son', age: 8 }, { name: 'Emma', relation: 'daughter', age: 3 }] },
  { id: '7', firstName: 'Carlos', lastName: 'Rivera', email: 'carlos.r@email.com', phone: '(210) 555-0301', firstVisit: '2026-02-10', lastVisit: '2026-03-03', totalVisits: 10, totalSpent: 789.00, avgTicket: 78.90, favoriteBeers: ['Mesquite Smoked Porter', 'Jalapeño Cream Ale'], dietaryRestrictions: [], tags: ['regular', 'homebrewer'], loyaltyPoints: 980, loyaltyTier: 'Silver', mugClubMember: true, mugClubTier: 'Standard', notes: 'Homebrewer - wants to do a collab brew', source: 'untappd' },
  { id: '8', firstName: 'Linda', lastName: 'Thompson', email: 'linda.t@email.com', phone: '(830) 555-0106', firstVisit: '2026-01-05', lastVisit: '2026-02-15', totalVisits: 4, totalSpent: 156.00, avgTicket: 39.00, favoriteBeers: ['Craft Ginger Beer', 'Kombucha on Tap'], dietaryRestrictions: ['sober'], tags: ['na-drinker'], loyaltyPoints: 200, loyaltyTier: 'Bronze', mugClubMember: false, notes: 'Loves NA options, great ambassador for non-drinkers', source: 'friend-referral' },
];

export const beers: Beer[] = [
  { id: '1', name: 'Hill Country Haze', style: 'New England IPA', abv: 6.8, ibu: 55, srm: 5, description: 'A juicy, hazy IPA bursting with tropical fruit and citrus. Brewed with Citra, Mosaic, and Galaxy hops.', tastingNotes: 'Mango, grapefruit, soft pillowy mouthfeel', foodPairings: ['Smoked Wings', 'Fish Tacos', 'Jalapeño Poppers'], status: 'on-tap', tapNumber: 1, kegLevel: 72, rating: 4.6, totalPours: 1842, category: 'flagship' },
  { id: '2', name: 'Bulverde Blonde', style: 'American Blonde Ale', abv: 4.8, ibu: 18, srm: 4, description: 'Light, crisp, and refreshing. The perfect Texas summer beer.', tastingNotes: 'Light honey, subtle citrus, clean finish', foodPairings: ['Caesar Salad', 'Grilled Chicken', 'Fish & Chips'], status: 'on-tap', tapNumber: 2, kegLevel: 45, rating: 4.2, totalPours: 2150, category: 'flagship' },
  { id: '3', name: 'Texas Sunset Wheat', style: 'American Wheat Ale', abv: 5.0, ibu: 15, srm: 6, description: 'Smooth wheat ale with a hint of orange peel and coriander. Like a Hill Country sunset in a glass.', tastingNotes: 'Orange zest, biscuit, light spice', foodPairings: ['Salads', 'Seafood', 'Fruit Desserts'], status: 'on-tap', tapNumber: 3, kegLevel: 88, rating: 4.3, totalPours: 1560, category: 'flagship' },
  { id: '4', name: 'Lone Star Lager', style: 'Mexican-Style Lager', abv: 4.5, ibu: 12, srm: 3, description: 'Crisp, clean lager with a touch of lime. Best served ice cold on the patio.', tastingNotes: 'Crisp, lime, corn sweetness, super clean', foodPairings: ['Tacos', 'Nachos', 'Ceviche'], status: 'on-tap', tapNumber: 4, kegLevel: 60, rating: 4.4, totalPours: 2800, category: 'flagship' },
  { id: '5', name: 'Prickly Pear Sour', style: 'Berliner Weisse with Fruit', abv: 4.2, ibu: 5, srm: 8, description: 'Tart and fruity with beautiful pink color from Texas prickly pear cactus fruit.', tastingNotes: 'Tart berry, watermelon candy, light funk', foodPairings: ['Goat Cheese Salad', 'Ceviche', 'Fruit Tarts'], status: 'on-tap', tapNumber: 5, kegLevel: 35, rating: 4.5, totalPours: 1200, category: 'seasonal' },
  { id: '6', name: 'Mesquite Smoked Porter', style: 'Smoked Porter', abv: 5.8, ibu: 32, srm: 35, description: 'Rich and smoky, made with Texas mesquite-smoked malt. A campfire in a glass.', tastingNotes: 'Campfire smoke, chocolate, coffee, molasses', foodPairings: ['BBQ Brisket', 'Smoked Ribs', 'Dark Chocolate'], status: 'on-tap', tapNumber: 6, kegLevel: 55, rating: 4.7, totalPours: 980, category: 'flagship' },
  { id: '7', name: 'Jalapeño Cream Ale', style: 'Cream Ale with Peppers', abv: 5.2, ibu: 20, srm: 4, description: 'Smooth cream ale with a gentle jalapeño kick. Heat builds slowly — dangerously drinkable.', tastingNotes: 'Smooth cream, gentle pepper heat, clean finish', foodPairings: ['Nachos', 'Quesadillas', 'Grilled Corn'], status: 'on-tap', tapNumber: 7, kegLevel: 80, rating: 4.4, totalPours: 1100, category: 'flagship' },
  { id: '8', name: 'Barrel-Aged Imperial Stout', style: 'Barrel-Aged Imperial Stout', abv: 11.5, ibu: 65, srm: 42, description: 'Aged 12 months in Garrison Brothers bourbon barrels. Rich, complex, and dangerously smooth.', tastingNotes: 'Bourbon, dark chocolate, vanilla, oak, dried fruit', foodPairings: ['Chocolate Cake', 'Blue Cheese', 'Crème Brûlée'], status: 'on-tap', tapNumber: 8, kegLevel: 92, rating: 4.9, totalPours: 450, category: 'limited' },
  { id: '9', name: 'Bluebonnet Blonde', style: 'Blonde Ale with Honey', abv: 4.6, ibu: 14, srm: 4, description: 'Brewed with local wildflower honey. Light and floral, like a Texas spring meadow.', tastingNotes: 'Wildflower honey, light floral, dry finish', foodPairings: ['Garden Salad', 'Grilled Fish', 'Fruit Plate'], status: 'on-tap', tapNumber: 9, kegLevel: 68, rating: 4.1, totalPours: 890, category: 'seasonal' },
  { id: '10', name: 'Citra Smash IPA', style: 'Single Hop IPA', abv: 7.0, ibu: 70, srm: 6, description: 'Single malt, single hop — all Citra, all the time. Bursting with tropical aroma.', tastingNotes: 'Passion fruit, lychee, tangerine peel', foodPairings: ['Spicy Wings', 'Thai Food', 'Burger'], status: 'on-tap', tapNumber: 10, kegLevel: 40, rating: 4.5, totalPours: 760, category: 'seasonal' },
  { id: '11', name: 'Craft Root Beer', style: 'Root Beer (NA)', abv: 0, ibu: 0, srm: 20, description: 'House-made craft root beer with real vanilla, sassafras, and Texas honey.', tastingNotes: 'Creamy vanilla, sassafras, wintergreen, honey', foodPairings: ['Burgers', 'Hot Dogs', 'Ice Cream Float'], status: 'on-tap', tapNumber: 11, kegLevel: 70, rating: 4.8, totalPours: 1400, category: 'flagship', isNonAlcoholic: true },
  { id: '12', name: 'Ginger Beer', style: 'Ginger Beer (NA)', abv: 0, ibu: 0, srm: 6, description: 'Fiery ginger beer made fresh with real ginger root, lime, and a touch of habanero.', tastingNotes: 'Spicy ginger, lime, subtle heat, refreshing', foodPairings: ['Asian Food', 'Tacos', 'Moscow Mule (virgin)'], status: 'on-tap', tapNumber: 12, kegLevel: 85, rating: 4.6, totalPours: 920, category: 'flagship', isNonAlcoholic: true },
  { id: '13', name: 'Hill Country Kombucha', style: 'Kombucha (NA)', abv: 0.5, ibu: 0, srm: 8, description: 'Locally fermented kombucha with seasonal Texas fruits. Probiotic and refreshing.', tastingNotes: 'Tart, fruity, effervescent, slight vinegar tang', foodPairings: ['Salads', 'Sushi', 'Light Apps'], status: 'on-tap', tapNumber: 13, kegLevel: 50, rating: 4.3, totalPours: 650, category: 'flagship', isNonAlcoholic: true },
  { id: '14', name: 'Spring Saison', style: 'Belgian Saison', abv: 6.5, ibu: 28, srm: 5, description: 'Farmhouse ale with wild Texas yeast, lemon peel, and black pepper.', tastingNotes: 'Pepper, lemon, funky yeast, dry finish', foodPairings: ['Mussels', 'Grilled Vegetables', 'Goat Cheese'], status: 'fermenting', rating: 0, totalPours: 0, category: 'seasonal' },
  { id: '15', name: 'Pecan Brown Ale', style: 'English Brown Ale', abv: 5.4, ibu: 22, srm: 22, description: 'Toasted Texas pecans lend a nutty sweetness to this English-style brown ale.', tastingNotes: 'Toasted pecan, caramel, toffee, light chocolate', foodPairings: ['BBQ', 'Pecan Pie', 'Smoked Sausage'], status: 'conditioning', rating: 0, totalPours: 0, category: 'seasonal' },
];

export const tapLines: TapLine[] = beers.filter(b => b.tapNumber).map(b => ({
  tapNumber: b.tapNumber!,
  beerId: b.id,
  beerName: b.name,
  style: b.style,
  abv: b.abv,
  ibu: b.ibu,
  kegLevel: b.kegLevel || 50,
  kegSize: '1/2' as const,
  tappedDate: '2026-02-28',
  status: 'active' as const,
  pourSizes: b.isNonAlcoholic ? [
    { name: 'Small', oz: 12, price: 4 },
    { name: 'Large', oz: 20, price: 6 },
  ] : [
    { name: 'Taster', oz: 4, price: 3 },
    { name: 'Half', oz: 10, price: 5 },
    { name: 'Pint', oz: 16, price: 7 },
    { name: 'Mug Club', oz: 20, price: 7 },
  ],
  totalPours: Math.floor(Math.random() * 50) + 10,
  revenueToday: Math.floor(Math.random() * 400) + 100,
}));

export const batches: Batch[] = [
  { id: '1', batchNumber: 'BBW-2026-001', beerId: '1', beerName: 'Hill Country Haze', style: 'NEIPA', recipeId: 'r1', status: 'ready', brewDate: '2026-02-15', targetOG: 1.065, actualOG: 1.067, targetFG: 1.012, actualFG: 1.013, abv: 6.8, tankId: 'FV-1', volume: 7, notes: 'Perfect haze. Dry hopped with extra Mosaic.', gravityReadings: [{ date: '2026-02-15', gravity: 1.067, temp: 66 }, { date: '2026-02-17', gravity: 1.045, temp: 67 }, { date: '2026-02-20', gravity: 1.018, temp: 68 }, { date: '2026-02-23', gravity: 1.013, temp: 68 }], temperatureLog: [], qualityScore: 95 },
  { id: '2', batchNumber: 'BBW-2026-014', beerId: '14', beerName: 'Spring Saison', style: 'Belgian Saison', status: 'fermenting', brewDate: '2026-02-28', targetOG: 1.058, actualOG: 1.060, targetFG: 1.004, tankId: 'FV-3', volume: 7, notes: 'Wild yeast pitching went well. Bubbling vigorously.', gravityReadings: [{ date: '2026-02-28', gravity: 1.060, temp: 72 }, { date: '2026-03-02', gravity: 1.032, temp: 76 }], temperatureLog: [], qualityScore: undefined },
  { id: '3', batchNumber: 'BBW-2026-015', beerId: '15', beerName: 'Pecan Brown Ale', style: 'Brown Ale', status: 'conditioning', brewDate: '2026-02-20', targetOG: 1.052, actualOG: 1.053, targetFG: 1.012, actualFG: 1.013, abv: 5.4, tankId: 'BT-1', volume: 7, notes: 'Added toasted pecans during secondary. Beautiful color.', gravityReadings: [{ date: '2026-02-20', gravity: 1.053, temp: 64 }, { date: '2026-02-25', gravity: 1.013, temp: 65 }], temperatureLog: [], qualityScore: 88 },
  { id: '4', batchNumber: 'BBW-2026-016', beerId: '4', beerName: 'Lone Star Lager', style: 'Mexican Lager', recipeId: 'r2', status: 'carbonating', brewDate: '2026-02-18', targetOG: 1.048, actualOG: 1.047, targetFG: 1.008, actualFG: 1.007, abv: 4.5, tankId: 'BT-2', volume: 14, notes: 'Double batch for spring demand. Lagering at 34°F.', gravityReadings: [], temperatureLog: [], qualityScore: 92 },
];

export const performers: Performer[] = [
  { id: '1', name: 'Coyote Creek Band', genre: 'Country/Americana', contactEmail: 'booking@coyotecreek.com', contactPhone: '(210) 555-0401', fee: 800, rating: 4.8, pastPerformances: 6, bio: 'Hill Country favorites playing classic and modern country with a Texas twist.', socialLinks: [{ platform: 'Instagram', url: '#' }] },
  { id: '2', name: 'Tres Amigos', genre: 'Tejano/Latin', contactEmail: 'tresamigos@email.com', contactPhone: '(830) 555-0402', fee: 600, rating: 4.6, pastPerformances: 4, bio: 'High-energy Tejano and Latin music. Gets everyone dancing.', socialLinks: [] },
  { id: '3', name: 'Blue Highway', genre: 'Blues/Rock', contactEmail: 'blue.highway@email.com', contactPhone: '(512) 555-0403', fee: 1000, rating: 4.9, pastPerformances: 3, bio: 'Austin-based blues rock band. Featuring a killer harmonica player.', socialLinks: [{ platform: 'Spotify', url: '#' }] },
  { id: '4', name: 'Sarah & the Songbirds', genre: 'Folk/Acoustic', contactEmail: 'sarah.songbirds@email.com', contactPhone: '(830) 555-0404', fee: 500, rating: 4.5, pastPerformances: 8, bio: 'Mellow acoustic folk. Perfect for Sunday afternoons.', socialLinks: [] },
  { id: '5', name: 'DJ Tex', genre: 'DJ/Electronic', contactEmail: 'djtex@email.com', contactPhone: '(210) 555-0405', fee: 400, rating: 4.3, pastPerformances: 5, bio: 'Local DJ mixing country, pop, and electronic beats. Great for themed nights.', socialLinks: [] },
];

export const events: BreweryEvent[] = [
  { id: '1', title: 'Friday Night Live: Coyote Creek Band', type: 'live-music', date: '2026-03-07', startTime: '19:00', endTime: '22:00', description: 'Kick off the weekend with the Hill Country\'s favorite country band!', performer: performers[0], capacity: 200, ticketsSold: 145, ticketPrice: 0, isTicketed: false, isFamilyFriendly: true, location: 'beer-garden', status: 'upcoming', revenue: 0, specialBeer: 'Barrel-Aged Imperial Stout' },
  { id: '2', title: 'Trivia Tuesday: Beer Edition', type: 'trivia', date: '2026-03-04', startTime: '19:00', endTime: '21:00', description: 'Test your beer knowledge! Teams of up to 6. Winner gets a $50 gift card.', capacity: 120, ticketsSold: 0, ticketPrice: 0, isTicketed: false, isFamilyFriendly: true, location: 'taproom', status: 'upcoming', revenue: 0 },
  { id: '3', title: 'Spring Saison Release Party', type: 'beer-release', date: '2026-03-15', startTime: '14:00', endTime: '20:00', description: 'First pour of our Belgian-style Spring Saison! Live music, food specials, brewery tours.', performer: performers[3], capacity: 250, ticketsSold: 82, ticketPrice: 15, isTicketed: true, isFamilyFriendly: true, location: 'outdoor', status: 'upcoming', revenue: 1230, specialBeer: 'Spring Saison' },
  { id: '4', title: 'Kids\' Craft & Brew Saturday', type: 'family', date: '2026-03-08', startTime: '11:00', endTime: '15:00', description: 'Arts and crafts for kids while parents enjoy fresh brews! Face painting, balloon animals, and more.', capacity: 150, ticketsSold: 0, ticketPrice: 0, isTicketed: false, isFamilyFriendly: true, location: 'beer-garden', status: 'upcoming', revenue: 0 },
  { id: '5', title: 'Brewer\'s Dinner: 5-Course Pairing', type: 'pairing-dinner', date: '2026-03-22', startTime: '18:00', endTime: '21:00', description: 'Exclusive 5-course dinner paired with our finest brews. Limited to 40 guests.', capacity: 40, ticketsSold: 34, ticketPrice: 85, isTicketed: true, isFamilyFriendly: false, location: 'event-hall', status: 'upcoming', revenue: 2890 },
  { id: '6', title: 'Tejano Night: Tres Amigos', type: 'live-music', date: '2026-03-14', startTime: '20:00', endTime: '23:00', description: 'Dance the night away with Tres Amigos! Special taco bar menu.', performer: performers[1], capacity: 200, ticketsSold: 0, ticketPrice: 0, isTicketed: false, isFamilyFriendly: true, location: 'patio', status: 'upcoming', revenue: 0 },
  { id: '7', title: 'Blue Highway Blues Night', type: 'live-music', date: '2026-02-28', startTime: '20:00', endTime: '23:00', description: 'Austin\'s premier blues band live on our stage.', performer: performers[2], capacity: 200, ticketsSold: 180, ticketPrice: 10, isTicketed: true, isFamilyFriendly: true, location: 'beer-garden', status: 'completed', revenue: 4200 },
  { id: '8', title: 'Private Event: Henderson Wedding Reception', type: 'private', date: '2026-03-29', startTime: '17:00', endTime: '23:00', description: 'Wedding reception for 120 guests. Open bar, plated dinner, live band.', capacity: 120, ticketsSold: 120, ticketPrice: 150, isTicketed: true, isFamilyFriendly: true, location: 'event-hall', status: 'upcoming', revenue: 18000 },
];

export const reservations: Reservation[] = [
  { id: '1', customerName: 'Jake Morrison', customerPhone: '(830) 555-0101', customerEmail: 'jake@email.com', date: '2026-03-04', time: '18:00', partySize: 4, tableId: 'T-12', section: 'taproom', status: 'confirmed', notes: 'Birthday celebration', specialRequests: ['Birthday dessert'], isHighChairNeeded: false },
  { id: '2', customerName: 'Diane Foster', customerPhone: '(830) 555-0105', customerEmail: 'diane.f@email.com', date: '2026-03-04', time: '17:30', partySize: 5, tableId: 'P-3', section: 'patio', status: 'confirmed', notes: '3 kids, need play area access', specialRequests: ['High chairs x2', 'Near play area'], isHighChairNeeded: true },
  { id: '3', customerName: 'Smith Party', customerPhone: '(830) 555-0201', customerEmail: 'smith@email.com', date: '2026-03-04', time: '19:00', partySize: 12, section: 'beer-garden', status: 'confirmed', notes: 'Office celebration', specialRequests: ['Combined tables'], isHighChairNeeded: false },
  { id: '4', customerName: 'Carlos Rivera', customerPhone: '(210) 555-0301', customerEmail: 'carlos.r@email.com', date: '2026-03-04', time: '18:30', partySize: 2, tableId: 'T-5', section: 'taproom', status: 'seated', notes: '', specialRequests: [], isHighChairNeeded: false },
  { id: '5', customerName: 'Walk-in Party', customerPhone: '', customerEmail: '', date: '2026-03-04', time: '17:45', partySize: 3, section: 'patio', status: 'waitlist', notes: '', specialRequests: [], isHighChairNeeded: false },
];

export const menuItems: MenuItem[] = [
  // Appetizers
  { id: '1', name: 'Smoked Wings (8pc)', description: 'Mesquite-smoked wings with your choice of Hill Country Hot, Honey Mustard, or Jalapeño Ranch', category: 'appetizer', price: 14.99, cost: 4.20, isAvailable: true, allergens: [], dietaryTags: ['gluten-free'], isKidsFriendly: true, popularity: 95 },
  { id: '2', name: 'Brew Cheese & Pretzel Board', description: 'House-made beer cheese (Hill Country Haze IPA), giant soft pretzels, whole grain mustard', category: 'appetizer', price: 13.99, cost: 3.80, isAvailable: true, allergens: ['gluten', 'dairy'], dietaryTags: ['vegetarian'], isKidsFriendly: true, popularity: 88 },
  { id: '3', name: 'Jalapeño Poppers', description: 'Fresh jalapeños stuffed with cream cheese, wrapped in bacon, beer-battered and fried', category: 'appetizer', price: 11.99, cost: 3.10, isAvailable: true, allergens: ['dairy', 'gluten'], dietaryTags: [], isKidsFriendly: false, popularity: 82 },
  { id: '4', name: 'Loaded Nachos', description: 'Tortilla chips, queso, jalapeños, black beans, pico, sour cream, guac. Add brisket $4', category: 'appetizer', price: 12.99, cost: 3.50, isAvailable: true, allergens: ['dairy'], dietaryTags: ['gluten-free', 'vegetarian'], isKidsFriendly: true, popularity: 90 },
  // Entrees
  { id: '5', name: 'Brewhouse Burger', description: '1/2 lb Angus patty, beer cheese, bacon, pickled onions, brioche bun. Served with fries.', category: 'entree', price: 16.99, cost: 5.20, isAvailable: true, allergens: ['gluten', 'dairy'], dietaryTags: [], isKidsFriendly: false, popularity: 97 },
  { id: '6', name: 'Smoked Brisket Plate', description: '12hr mesquite-smoked brisket, coleslaw, pickles, white bread, BBQ sauce', category: 'entree', price: 19.99, cost: 6.80, isAvailable: true, allergens: ['gluten'], dietaryTags: ['gluten-free-available'], isKidsFriendly: true, popularity: 94 },
  { id: '7', name: 'Fish Tacos', description: 'Beer-battered cod, cabbage slaw, chipotle crema, flour tortillas', category: 'entree', price: 15.99, cost: 4.90, isAvailable: true, allergens: ['gluten', 'fish', 'dairy'], dietaryTags: [], isKidsFriendly: true, popularity: 85 },
  { id: '8', name: 'BBQ Pulled Pork Sandwich', description: 'Slow-smoked pork shoulder, tangy slaw, pickles, brioche bun. Served with fries.', category: 'entree', price: 14.99, cost: 4.40, isAvailable: true, allergens: ['gluten'], dietaryTags: [], isKidsFriendly: true, popularity: 88 },
  { id: '9', name: 'Grilled Veggie Bowl', description: 'Seasonal grilled vegetables, quinoa, black beans, avocado, chimichurri', category: 'entree', price: 13.99, cost: 3.60, isAvailable: true, allergens: [], dietaryTags: ['vegan', 'gluten-free'], isKidsFriendly: true, popularity: 72 },
  // Sides
  { id: '10', name: 'Loaded Fries', description: 'Beer cheese, bacon, jalapeños, ranch', category: 'side', price: 8.99, cost: 2.20, isAvailable: true, allergens: ['dairy', 'gluten'], dietaryTags: [], isKidsFriendly: true, popularity: 86 },
  { id: '11', name: 'Coleslaw', description: 'Creamy buttermilk coleslaw', category: 'side', price: 4.99, cost: 0.80, isAvailable: true, allergens: ['dairy'], dietaryTags: ['gluten-free', 'vegetarian'], isKidsFriendly: true, popularity: 65 },
  // Desserts
  { id: '12', name: 'Stout Brownie Sundae', description: 'Warm brownie made with our Smoked Porter, vanilla ice cream, chocolate sauce, pecans', category: 'dessert', price: 10.99, cost: 2.80, isAvailable: true, allergens: ['gluten', 'dairy', 'nuts'], dietaryTags: [], isKidsFriendly: true, popularity: 91 },
  // Kids Menu
  { id: '13', name: 'Kids Chicken Tenders', description: 'Hand-breaded chicken tenders with fries and choice of dipping sauce', category: 'kids', price: 8.99, cost: 2.10, isAvailable: true, allergens: ['gluten'], dietaryTags: [], isKidsFriendly: true, popularity: 88 },
  { id: '14', name: 'Kids Grilled Cheese', description: 'Classic grilled cheese on Texas toast with fries', category: 'kids', price: 7.99, cost: 1.60, isAvailable: true, allergens: ['gluten', 'dairy'], dietaryTags: ['vegetarian'], isKidsFriendly: true, popularity: 82 },
  { id: '15', name: 'Kids Mac & Cheese', description: 'Creamy mac and cheese made with our house beer cheese blend', category: 'kids', price: 7.99, cost: 1.50, isAvailable: true, allergens: ['gluten', 'dairy'], dietaryTags: ['vegetarian'], isKidsFriendly: true, popularity: 90 },
  // NA Beverages
  { id: '16', name: 'Lavender Lemonade', description: 'Fresh-squeezed lemonade with house-made lavender syrup', category: 'beverage-na', price: 5.99, cost: 1.00, isAvailable: true, allergens: [], dietaryTags: ['vegan', 'gluten-free'], isKidsFriendly: true, popularity: 78 },
  { id: '17', name: 'Watermelon Agua Fresca', description: 'Fresh watermelon blended with lime and mint', category: 'beverage-na', price: 5.99, cost: 1.10, isAvailable: true, allergens: [], dietaryTags: ['vegan', 'gluten-free'], isKidsFriendly: true, popularity: 75 },
  { id: '18', name: 'Iced Coffee', description: 'Cold brew from a local Bulverde roaster', category: 'beverage-na', price: 4.99, cost: 0.90, isAvailable: true, allergens: [], dietaryTags: ['vegan', 'gluten-free'], isKidsFriendly: false, popularity: 70 },
];

export const inventoryItems: InventoryItem[] = [
  { id: '1', name: '2-Row Pale Malt', category: 'grain', currentStock: 1200, unit: 'lbs', parLevel: 1000, reorderPoint: 500, costPerUnit: 0.65, supplier: 'Briess', lastOrdered: '2026-02-20', location: 'Grain Room' },
  { id: '2', name: 'Crystal 60 Malt', category: 'grain', currentStock: 180, unit: 'lbs', parLevel: 200, reorderPoint: 100, costPerUnit: 0.85, supplier: 'Briess', lastOrdered: '2026-02-20', location: 'Grain Room' },
  { id: '3', name: 'Citra Hops (Pellet)', category: 'hops', currentStock: 22, unit: 'lbs', parLevel: 30, reorderPoint: 15, costPerUnit: 18.50, supplier: 'Yakima Chief', lastOrdered: '2026-02-15', location: 'Cold Storage', expirationDate: '2027-02-15' },
  { id: '4', name: 'Mosaic Hops (Pellet)', category: 'hops', currentStock: 18, unit: 'lbs', parLevel: 25, reorderPoint: 12, costPerUnit: 19.00, supplier: 'Yakima Chief', lastOrdered: '2026-02-15', location: 'Cold Storage', expirationDate: '2027-02-15' },
  { id: '5', name: 'US-05 Yeast', category: 'yeast', currentStock: 24, unit: 'packets', parLevel: 20, reorderPoint: 10, costPerUnit: 4.50, supplier: 'Fermentis', lastOrdered: '2026-02-10', location: 'Yeast Fridge', expirationDate: '2026-08-10' },
  { id: '6', name: '16oz Crowler Cans', category: 'packaging', currentStock: 2400, unit: 'units', parLevel: 3000, reorderPoint: 1500, costPerUnit: 0.35, supplier: 'Ball Corp', lastOrdered: '2026-02-25', location: 'Packaging Area' },
  { id: '7', name: 'PBW Cleaner', category: 'chemical', currentStock: 15, unit: 'lbs', parLevel: 20, reorderPoint: 8, costPerUnit: 3.20, supplier: 'Five Star', lastOrdered: '2026-02-01', location: 'Cellar' },
  { id: '8', name: 'Beef Brisket (Packer)', category: 'food', currentStock: 45, unit: 'lbs', parLevel: 60, reorderPoint: 30, costPerUnit: 4.50, supplier: 'US Foods', lastOrdered: '2026-03-01', location: 'Walk-in Cooler', expirationDate: '2026-03-15' },
  { id: '9', name: 'Angus Burger Patties', category: 'food', currentStock: 200, unit: 'units', parLevel: 250, reorderPoint: 100, costPerUnit: 1.80, supplier: 'Sysco', lastOrdered: '2026-03-01', location: 'Walk-in Freezer' },
  { id: '10', name: 'BBW Logo T-Shirts', category: 'merchandise', currentStock: 85, unit: 'units', parLevel: 100, reorderPoint: 30, costPerUnit: 8.50, supplier: 'Custom Ink', lastOrdered: '2026-02-01', location: 'Merchandise Display' },
  { id: '11', name: 'Branded Pint Glasses', category: 'merchandise', currentStock: 144, unit: 'units', parLevel: 200, reorderPoint: 50, costPerUnit: 3.25, supplier: 'GlassWorks', lastOrdered: '2026-01-15', location: 'Merchandise Display' },
];

export const staff: StaffMember[] = [
  { id: '1', firstName: 'Mike', lastName: 'Bradley', role: 'brewer', email: 'mike@bbw.com', phone: '(830) 555-1001', hireDate: '2025-11-01', hourlyRate: 28, status: 'active', tabcCertified: true, tabcExpiry: '2028-11-01', foodHandlerCertified: true, foodHandlerExpiry: '2028-11-01', hoursThisWeek: 42, salesThisWeek: 0, schedule: [{ day: 'Mon', startTime: '06:00', endTime: '14:00', role: 'brewer' }, { day: 'Tue', startTime: '06:00', endTime: '14:00', role: 'brewer' }, { day: 'Wed', startTime: '06:00', endTime: '14:00', role: 'brewer' }, { day: 'Thu', startTime: '06:00', endTime: '14:00', role: 'brewer' }, { day: 'Fri', startTime: '06:00', endTime: '14:00', role: 'brewer' }] },
  { id: '2', firstName: 'Jessica', lastName: 'Tran', role: 'bartender', email: 'jessica@bbw.com', phone: '(830) 555-1002', hireDate: '2025-12-15', hourlyRate: 15, status: 'active', tabcCertified: true, tabcExpiry: '2028-12-15', foodHandlerCertified: true, foodHandlerExpiry: '2028-12-15', hoursThisWeek: 32, salesThisWeek: 4250, schedule: [{ day: 'Wed', startTime: '16:00', endTime: '00:00', role: 'bartender' }, { day: 'Thu', startTime: '16:00', endTime: '00:00', role: 'bartender' }, { day: 'Fri', startTime: '16:00', endTime: '00:00', role: 'bartender' }, { day: 'Sat', startTime: '14:00', endTime: '00:00', role: 'bartender' }] },
  { id: '3', firstName: 'Tony', lastName: 'Perez', role: 'cook', email: 'tony@bbw.com', phone: '(830) 555-1003', hireDate: '2025-12-01', hourlyRate: 20, status: 'active', tabcCertified: false, foodHandlerCertified: true, foodHandlerExpiry: '2028-12-01', hoursThisWeek: 40, salesThisWeek: 0, schedule: [{ day: 'Tue', startTime: '10:00', endTime: '18:00', role: 'cook' }, { day: 'Wed', startTime: '10:00', endTime: '18:00', role: 'cook' }, { day: 'Thu', startTime: '10:00', endTime: '18:00', role: 'cook' }, { day: 'Fri', startTime: '10:00', endTime: '22:00', role: 'cook' }, { day: 'Sat', startTime: '10:00', endTime: '22:00', role: 'cook' }] },
  { id: '4', firstName: 'Amy', lastName: 'Nguyen', role: 'server', email: 'amy@bbw.com', phone: '(830) 555-1004', hireDate: '2026-01-10', hourlyRate: 8, status: 'active', tabcCertified: true, tabcExpiry: '2029-01-10', foodHandlerCertified: true, foodHandlerExpiry: '2029-01-10', hoursThisWeek: 28, salesThisWeek: 3100, schedule: [{ day: 'Thu', startTime: '16:00', endTime: '22:00', role: 'server' }, { day: 'Fri', startTime: '16:00', endTime: '23:00', role: 'server' }, { day: 'Sat', startTime: '11:00', endTime: '23:00', role: 'server' }, { day: 'Sun', startTime: '11:00', endTime: '20:00', role: 'server' }] },
  { id: '5', firstName: 'Derek', lastName: 'Wilson', role: 'manager', email: 'derek@bbw.com', phone: '(830) 555-1005', hireDate: '2025-10-15', hourlyRate: 32, status: 'active', tabcCertified: true, tabcExpiry: '2028-10-15', foodHandlerCertified: true, foodHandlerExpiry: '2028-10-15', hoursThisWeek: 45, salesThisWeek: 0, schedule: [{ day: 'Mon', startTime: '10:00', endTime: '18:00', role: 'manager' }, { day: 'Tue', startTime: '10:00', endTime: '18:00', role: 'manager' }, { day: 'Wed', startTime: '10:00', endTime: '18:00', role: 'manager' }, { day: 'Fri', startTime: '14:00', endTime: '23:00', role: 'manager' }, { day: 'Sat', startTime: '14:00', endTime: '23:00', role: 'manager' }] },
  { id: '6', firstName: 'Rachel', lastName: 'Kim', role: 'bartender', email: 'rachel@bbw.com', phone: '(830) 555-1006', hireDate: '2026-01-20', hourlyRate: 15, status: 'active', tabcCertified: true, tabcExpiry: '2029-01-20', foodHandlerCertified: true, foodHandlerExpiry: '2029-01-20', hoursThisWeek: 24, salesThisWeek: 2800, schedule: [{ day: 'Mon', startTime: '16:00', endTime: '00:00', role: 'bartender' }, { day: 'Tue', startTime: '16:00', endTime: '00:00', role: 'bartender' }, { day: 'Sun', startTime: '11:00', endTime: '20:00', role: 'bartender' }] },
];

export const wholesaleAccounts: WholesaleAccount[] = [
  { id: '1', businessName: 'The Rusty Tap', contactName: 'Dave Martinez', email: 'dave@rustytap.com', phone: '(210) 555-2001', address: '1234 Broadway, San Antonio, TX', type: 'bar', status: 'active', totalOrders: 18, totalRevenue: 5400, lastOrder: '2026-02-28', kegsOut: 3, creditLimit: 2000, paymentTerms: 'Net 30', notes: 'Great account, always pays on time', tapsCarrying: ['Hill Country Haze', 'Lone Star Lager'] },
  { id: '2', businessName: 'Gruene General Store', contactName: 'Betty Hall', email: 'betty@gruenegeneral.com', phone: '(830) 555-2002', address: '1601 Hunter Rd, New Braunfels, TX', type: 'bottle-shop', status: 'active', totalOrders: 12, totalRevenue: 3600, lastOrder: '2026-03-01', kegsOut: 0, creditLimit: 1500, paymentTerms: 'Net 15', notes: 'Takes crowlers and 6-packs', tapsCarrying: [] },
  { id: '3', businessName: 'Canyon Lake BBQ', contactName: 'Rick Stone', email: 'rick@canyonlakebbq.com', phone: '(830) 555-2003', address: '789 Canyon Lake Dr, Canyon Lake, TX', type: 'restaurant', status: 'active', totalOrders: 8, totalRevenue: 2800, lastOrder: '2026-02-25', kegsOut: 2, creditLimit: 1500, paymentTerms: 'Net 30', notes: 'BBQ joint, loves our Smoked Porter', tapsCarrying: ['Mesquite Smoked Porter', 'Bulverde Blonde'] },
  { id: '4', businessName: 'H-E-B Bulverde', contactName: 'Store Manager', email: 'bulverde@heb.com', phone: '(830) 555-2004', address: '101 Bulverde Crossing, Bulverde, TX', type: 'grocery', status: 'prospect', totalOrders: 0, totalRevenue: 0, kegsOut: 0, creditLimit: 5000, paymentTerms: 'Net 30', notes: 'In discussion for shelf space', tapsCarrying: [] },
];

export const mugClubMembers: MugClubMember[] = [
  { id: '1', customerId: '5', customerName: 'Bobby Whitfield', tier: 'Founding', memberSince: '2025-12-20', renewalDate: '2026-12-20', mugNumber: 1, mugLocation: 'Shelf A-1', totalSaved: 486.00, visitsAsMemeber: 38, referrals: 5, status: 'active', benefits: ['20oz at pint price', '15% off merchandise', 'Member-only releases', 'Annual appreciation night', 'Founding member plaque'] },
  { id: '2', customerId: '1', customerName: 'Jake Morrison', tier: 'Premium', memberSince: '2026-01-15', renewalDate: '2027-01-15', mugNumber: 8, mugLocation: 'Shelf A-8', totalSaved: 224.50, visitsAsMemeber: 24, referrals: 2, status: 'active', benefits: ['20oz at pint price', '10% off merchandise', 'Member-only releases'] },
  { id: '3', customerId: '2', customerName: 'Maria Gonzalez', tier: 'Standard', memberSince: '2026-02-01', renewalDate: '2027-02-01', mugNumber: 15, mugLocation: 'Shelf B-3', totalSaved: 112.25, visitsAsMemeber: 16, referrals: 1, status: 'active', benefits: ['20oz at pint price', 'Birthday free pint'] },
  { id: '4', customerId: '7', customerName: 'Carlos Rivera', tier: 'Standard', memberSince: '2026-02-10', renewalDate: '2027-02-10', mugNumber: 22, mugLocation: 'Shelf B-10', totalSaved: 98.00, visitsAsMemeber: 10, referrals: 0, status: 'active', benefits: ['20oz at pint price', 'Birthday free pint'] },
];

export const emailCampaigns: EmailCampaign[] = [
  { id: '1', name: 'March New Releases', subject: '🍺 3 New Beers on Tap This Month!', status: 'sent', segment: 'all-subscribers', sentDate: '2026-03-01', recipients: 845, opened: 412, clicked: 156, unsubscribed: 3, type: 'new-release' },
  { id: '2', name: 'Spring Saison Release Invite', subject: 'You\'re Invited: Spring Saison Release Party 🌸', status: 'scheduled', segment: 'mug-club-members', scheduledDate: '2026-03-10', recipients: 52, opened: 0, clicked: 0, unsubscribed: 0, type: 'event' },
  { id: '3', name: 'Win-Back: 30-Day Lapsed', subject: 'We Miss You! Here\'s a Free Pint 🍻', status: 'sent', segment: 'lapsed-30-days', sentDate: '2026-02-25', recipients: 124, opened: 68, clicked: 32, unsubscribed: 2, type: 'promotion' },
  { id: '4', name: 'March Birthday Cheers', subject: '🎂 Happy Birthday! Your Free Pint Awaits', status: 'sent', segment: 'march-birthdays', sentDate: '2026-03-01', recipients: 28, opened: 22, clicked: 18, unsubscribed: 0, type: 'birthday' },
  { id: '5', name: 'Weekly Newsletter #12', subject: 'This Week at Bulverde Brew Works', status: 'draft', segment: 'all-subscribers', recipients: 845, opened: 0, clicked: 0, unsubscribed: 0, type: 'newsletter' },
];

export const dailySales: DailySales[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 1, 3 + i);
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
  const baseBeer = isWeekend ? 3200 : 1800;
  const baseFood = isWeekend ? 2400 : 1200;
  const beerRevenue = baseBeer + Math.floor(Math.random() * 800);
  const foodRevenue = baseFood + Math.floor(Math.random() * 600);
  const naRevenue = Math.floor((beerRevenue + foodRevenue) * 0.12);
  const merchandiseRevenue = Math.floor(Math.random() * 300) + 50;
  const eventRevenue = isWeekend ? Math.floor(Math.random() * 1500) : 0;
  const total = beerRevenue + foodRevenue + naRevenue + merchandiseRevenue + eventRevenue;
  const customers = Math.floor(total / 55);
  return {
    date: date.toISOString().split('T')[0],
    beerRevenue, foodRevenue, naRevenue, merchandiseRevenue, eventRevenue,
    totalRevenue: total,
    customerCount: customers,
    avgTicket: Math.round((total / customers) * 100) / 100,
  };
});

export const complianceItems: ComplianceItem[] = [
  { id: '1', type: 'tabc', name: 'TABC Monthly Sales Report', status: 'due-soon', dueDate: '2026-03-15', lastCompleted: '2026-02-14', notes: 'Monthly brewpub sales report to TABC' },
  { id: '2', type: 'ttb', name: 'TTB Brewer\'s Report of Operations', status: 'compliant', dueDate: '2026-04-15', lastCompleted: '2026-01-14', notes: 'Quarterly federal report' },
  { id: '3', type: 'health', name: 'Health Department Inspection', status: 'compliant', dueDate: '2026-06-01', lastCompleted: '2025-12-15', notes: 'Semi-annual Comal County health inspection' },
  { id: '4', type: 'music-license', name: 'ASCAP License Renewal', status: 'compliant', dueDate: '2027-01-01', lastCompleted: '2026-01-01', notes: 'Annual music performance license' },
  { id: '5', type: 'music-license', name: 'BMI License Renewal', status: 'compliant', dueDate: '2027-01-01', lastCompleted: '2026-01-01', notes: 'Annual music performance license' },
  { id: '6', type: 'tabc', name: 'TABC Server Certification — Amy Nguyen', status: 'compliant', dueDate: '2029-01-10', notes: 'All servers must maintain active TABC certification' },
  { id: '7', type: 'health', name: 'Food Handler Cert — Tony Perez', status: 'compliant', dueDate: '2028-12-01', notes: 'Texas Food Handler certification' },
  { id: '8', type: 'business', name: 'City of Bulverde Business License', status: 'compliant', dueDate: '2027-01-01', lastCompleted: '2026-01-01', notes: 'Annual business license renewal' },
  { id: '9', type: 'tabc', name: 'Alcohol Sales % Check (must be under 60%)', status: 'compliant', dueDate: '2026-03-31', notes: 'Current: 52% beer / 48% food+NA — COMPLIANT' },
];

function makeBrewDaySteps(recipe: { mashTemp: number; mashTime: number; batchSize: number; boilTime: number; yeastName: string; pitchTemp: number; fermTemp: number; fermDays: number; strikeVol: number; strikeTemp: number; spargeVol: number; grainWeight: number }): DetailedRecipe['brewDaySteps'] {
  return [
    { id: 's1', order: 1, name: 'Strike Water', description: `Heat strike water to ${recipe.strikeTemp}°F`, targetValue: `${recipe.strikeVol} gal @ ${recipe.strikeTemp}°F`, notes: '', completed: false },
    { id: 's2', order: 2, name: 'Mash In', description: `Dough in ${recipe.grainWeight} lbs of grain. Target mash temp ${recipe.mashTemp}°F for ${recipe.mashTime} min`, targetValue: `${recipe.mashTemp}°F / ${recipe.mashTime} min`, notes: '', completed: false },
    { id: 's3', order: 3, name: 'Vorlauf', description: 'Recirculate wort until clear, ~10-15 minutes', targetValue: 'Clear runnings', notes: '', completed: false },
    { id: 's4', order: 4, name: 'Lauter & Sparge', description: `Sparge with ${recipe.spargeVol} gal at 168°F`, targetValue: `${recipe.spargeVol} gal @ 168°F`, notes: '', completed: false },
    { id: 's5', order: 5, name: 'Pre-Boil Check', description: 'Measure pre-boil gravity and volume', targetValue: `~${recipe.batchSize + 1.5} bbl`, notes: '', completed: false },
    { id: 's6', order: 6, name: 'Boil', description: `${recipe.boilTime} minute boil. Add hops per schedule`, targetValue: `${recipe.boilTime} min`, notes: '', completed: false },
    { id: 's7', order: 7, name: 'Whirlpool / Hop Stand', description: 'Whirlpool for 15 min, add any whirlpool hops', targetValue: '180°F / 15 min', notes: '', completed: false },
    { id: 's8', order: 8, name: 'Chill', description: `Chill wort to ${recipe.pitchTemp}°F via HX`, targetValue: `${recipe.pitchTemp}°F`, notes: '', completed: false },
    { id: 's9', order: 9, name: 'Pitch Yeast', description: `Pitch ${recipe.yeastName}`, targetValue: `${recipe.pitchTemp}°F`, notes: '', completed: false },
    { id: 's10', order: 10, name: 'Fermentation', description: `Ferment at ${recipe.fermTemp}°F for ~${recipe.fermDays} days`, targetValue: `${recipe.fermTemp}°F / ${recipe.fermDays} days`, notes: '', completed: false },
  ];
}

export const detailedRecipes: DetailedRecipe[] = [
  // 1. Hill Country Haze — NEIPA
  {
    id: 'r1', beerId: '1', name: 'Hill Country Haze', style: 'New England IPA', category: 'flagship', version: 3, batchSize: 7,
    targetOG: 1.065, targetFG: 1.012, targetABV: 6.8, targetIBU: 55, targetSRM: 5, boilTime: 60, mashTemp: 152, mashTime: 60,
    grainBill: [
      { name: 'Pilsner Malt', type: 'base', amount: 130, unit: 'lbs', percentage: 60, color: 1.5, ppg: 37, costPerLb: 1.20 },
      { name: 'Flaked Oats', type: 'adjunct', amount: 44, unit: 'lbs', percentage: 20, color: 1, ppg: 33, costPerLb: 1.40 },
      { name: 'White Wheat Malt', type: 'base', amount: 33, unit: 'lbs', percentage: 15, color: 2.5, ppg: 36, costPerLb: 1.30 },
      { name: 'Carapils (Dextrine)', type: 'specialty', amount: 11, unit: 'lbs', percentage: 5, color: 1.5, ppg: 33, costPerLb: 1.50 },
    ],
    hopSchedule: [
      { name: 'Citra', amount: 4, unit: 'oz', alphaAcid: 12.0, time: 60, type: 'bittering', ibuContribution: 28, costPerOz: 1.16 },
      { name: 'Mosaic', amount: 6, unit: 'oz', alphaAcid: 11.5, time: 10, type: 'flavor', ibuContribution: 12, costPerOz: 1.19 },
      { name: 'Galaxy', amount: 6, unit: 'oz', alphaAcid: 14.0, time: 5, type: 'aroma', ibuContribution: 8, costPerOz: 1.25 },
      { name: 'Citra', amount: 8, unit: 'oz', alphaAcid: 12.0, time: 0, type: 'aroma', ibuContribution: 4, costPerOz: 1.16 },
      { name: 'Mosaic', amount: 10, unit: 'oz', alphaAcid: 11.5, time: -1, type: 'dry-hop', ibuContribution: 3, costPerOz: 1.19 },
      { name: 'Galaxy', amount: 8, unit: 'oz', alphaAcid: 14.0, time: -1, type: 'dry-hop', ibuContribution: 0, costPerOz: 1.25 },
    ],
    yeast: { name: 'London Fog Ale', lab: 'White Labs', strain: 'WLP066', attenuationMin: 73, attenuationMax: 77, flocculation: 'medium-high', tempMin: 64, tempMax: 72, pitchRate: 0.75, starterNeeded: true, costPerPack: 10.50, packsNeeded: 3 },
    waterProfile: { calcium: 75, magnesium: 5, sodium: 15, sulfate: 50, chloride: 150, bicarbonate: 30 },
    waterAdjustments: [
      { mineral: 'Calcium Chloride', amount: 14, unit: 'g', purpose: 'Boost Cl:SO4 for soft mouthfeel' },
      { mineral: 'Gypsum', amount: 5, unit: 'g', purpose: 'Light sulfate for hop expression' },
      { mineral: 'Lactic Acid (88%)', amount: 8, unit: 'ml', purpose: 'Mash pH to 5.3' },
    ],
    brewDaySteps: makeBrewDaySteps({ mashTemp: 152, mashTime: 60, batchSize: 7, boilTime: 60, yeastName: 'WLP066 London Fog', pitchTemp: 66, fermTemp: 67, fermDays: 10, strikeVol: 58, strikeTemp: 162, spargeVol: 36, grainWeight: 218 }),
    totalCost: 355.41, costPerBarrel: 50.77, costPerPint: 0.20,
    lastBrewed: '2026-02-15', totalBatches: 8,
    brewHistory: [
      { batchNumber: 'BBW-2026-001', date: '2026-02-15', actualOG: 1.067, actualFG: 1.013, qcScore: 95, status: 'ready' },
      { batchNumber: 'BBW-2025-042', date: '2025-12-10', actualOG: 1.064, actualFG: 1.012, qcScore: 92, status: 'packaged' },
      { batchNumber: 'BBW-2025-035', date: '2025-11-01', actualOG: 1.066, actualFG: 1.014, qcScore: 88, status: 'packaged' },
      { batchNumber: 'BBW-2025-028', date: '2025-09-15', actualOG: 1.063, actualFG: 1.011, qcScore: 91, status: 'packaged' },
      { batchNumber: 'BBW-2025-018', date: '2025-07-20', actualOG: 1.065, actualFG: 1.013, qcScore: 93, status: 'packaged' },
    ],
    notes: 'Flagship NEIPA. Chloride-forward water for pillowy mouthfeel. Dry hop during active fermentation for biotransformation.',
    createdDate: '2025-06-01',
  },

  // 2. Lone Star Lager — Mexican Lager
  {
    id: 'r2', beerId: '4', name: 'Lone Star Lager', style: 'Mexican-Style Lager', category: 'flagship', version: 4, batchSize: 7,
    targetOG: 1.048, targetFG: 1.008, targetABV: 4.5, targetIBU: 12, targetSRM: 3, boilTime: 60, mashTemp: 148, mashTime: 60,
    grainBill: [
      { name: 'Pilsner Malt', type: 'base', amount: 120, unit: 'lbs', percentage: 72, color: 1.5, ppg: 37, costPerLb: 1.20 },
      { name: 'Flaked Corn', type: 'adjunct', amount: 35, unit: 'lbs', percentage: 21, color: 0.5, ppg: 39, costPerLb: 1.10 },
      { name: 'Acidulated Malt', type: 'specialty', amount: 5, unit: 'lbs', percentage: 3, color: 1.8, ppg: 27, costPerLb: 2.20 },
      { name: 'Rice Hulls', type: 'adjunct', amount: 7, unit: 'lbs', percentage: 4, color: 0, ppg: 0, costPerLb: 0.95 },
    ],
    hopSchedule: [
      { name: 'Hallertau Mittelfrüh', amount: 3, unit: 'oz', alphaAcid: 4.0, time: 60, type: 'bittering', ibuContribution: 8, costPerOz: 0.94 },
      { name: 'Hallertau Mittelfrüh', amount: 2, unit: 'oz', alphaAcid: 4.0, time: 15, type: 'flavor', ibuContribution: 3, costPerOz: 0.94 },
      { name: 'Hallertau Mittelfrüh', amount: 1, unit: 'oz', alphaAcid: 4.0, time: 1, type: 'aroma', ibuContribution: 1, costPerOz: 0.94 },
    ],
    yeast: { name: 'Mexican Lager', lab: 'White Labs', strain: 'WLP940', attenuationMin: 73, attenuationMax: 80, flocculation: 'medium', tempMin: 50, tempMax: 55, pitchRate: 1.5, starterNeeded: true, costPerPack: 10.50, packsNeeded: 4 },
    waterProfile: { calcium: 50, magnesium: 5, sodium: 10, sulfate: 25, chloride: 40, bicarbonate: 25 },
    waterAdjustments: [
      { mineral: 'Calcium Chloride', amount: 6, unit: 'g', purpose: 'Light mineral addition for balance' },
      { mineral: 'Lactic Acid (88%)', amount: 5, unit: 'ml', purpose: 'Mash pH to 5.2' },
    ],
    brewDaySteps: makeBrewDaySteps({ mashTemp: 148, mashTime: 60, batchSize: 7, boilTime: 60, yeastName: 'WLP940 Mexican Lager', pitchTemp: 50, fermTemp: 52, fermDays: 21, strikeVol: 52, strikeTemp: 158, spargeVol: 38, grainWeight: 167 }),
    totalCost: 248.50, costPerBarrel: 35.50, costPerPint: 0.14,
    lastBrewed: '2026-02-18', totalBatches: 12,
    brewHistory: [
      { batchNumber: 'BBW-2026-016', date: '2026-02-18', actualOG: 1.047, actualFG: 1.007, qcScore: 92, status: 'carbonating' },
      { batchNumber: 'BBW-2026-005', date: '2026-01-20', actualOG: 1.049, actualFG: 1.008, qcScore: 94, status: 'packaged' },
      { batchNumber: 'BBW-2025-048', date: '2025-12-28', actualOG: 1.048, actualFG: 1.009, qcScore: 90, status: 'packaged' },
      { batchNumber: 'BBW-2025-040', date: '2025-11-15', actualOG: 1.047, actualFG: 1.008, qcScore: 93, status: 'packaged' },
      { batchNumber: 'BBW-2025-032', date: '2025-10-01', actualOG: 1.048, actualFG: 1.007, qcScore: 91, status: 'packaged' },
    ],
    notes: 'Best seller. 3-week lager at 34°F after primary. Crystal clear. Add lime at serving suggestion.',
    createdDate: '2025-05-15',
  },

  // 3. Mesquite Smoked Porter
  {
    id: 'r3', beerId: '6', name: 'Mesquite Smoked Porter', style: 'Smoked Porter', category: 'flagship', version: 2, batchSize: 7,
    targetOG: 1.058, targetFG: 1.014, targetABV: 5.8, targetIBU: 32, targetSRM: 35, boilTime: 60, mashTemp: 154, mashTime: 60,
    grainBill: [
      { name: 'Pale Ale Malt', type: 'base', amount: 100, unit: 'lbs', percentage: 52, color: 3.5, ppg: 37, costPerLb: 1.25 },
      { name: 'Mesquite Smoked Malt', type: 'specialty', amount: 40, unit: 'lbs', percentage: 21, color: 3, ppg: 34, costPerLb: 2.50 },
      { name: 'Chocolate Malt', type: 'specialty', amount: 20, unit: 'lbs', percentage: 10, color: 350, ppg: 28, costPerLb: 1.80 },
      { name: 'Crystal 80', type: 'specialty', amount: 18, unit: 'lbs', percentage: 9, color: 80, ppg: 33, costPerLb: 1.65 },
      { name: 'Black Patent Malt', type: 'specialty', amount: 8, unit: 'lbs', percentage: 4, color: 500, ppg: 25, costPerLb: 1.90 },
      { name: 'Flaked Barley', type: 'adjunct', amount: 7, unit: 'lbs', percentage: 4, color: 1.5, ppg: 32, costPerLb: 1.30 },
    ],
    hopSchedule: [
      { name: 'Willamette', amount: 4, unit: 'oz', alphaAcid: 5.5, time: 60, type: 'bittering', ibuContribution: 22, costPerOz: 0.75 },
      { name: 'Fuggle', amount: 3, unit: 'oz', alphaAcid: 4.5, time: 15, type: 'flavor', ibuContribution: 7, costPerOz: 0.81 },
      { name: 'Fuggle', amount: 2, unit: 'oz', alphaAcid: 4.5, time: 5, type: 'aroma', ibuContribution: 3, costPerOz: 0.81 },
    ],
    yeast: { name: 'English Ale', lab: 'White Labs', strain: 'WLP002', attenuationMin: 63, attenuationMax: 70, flocculation: 'high', tempMin: 65, tempMax: 68, pitchRate: 0.75, starterNeeded: true, costPerPack: 10.50, packsNeeded: 2 },
    waterProfile: { calcium: 100, magnesium: 10, sodium: 20, sulfate: 80, chloride: 75, bicarbonate: 150 },
    waterAdjustments: [
      { mineral: 'Calcium Carbonate', amount: 10, unit: 'g', purpose: 'Buffer mash pH for dark malts' },
      { mineral: 'Gypsum', amount: 8, unit: 'g', purpose: 'Sulfate for dry finish' },
      { mineral: 'Calcium Chloride', amount: 6, unit: 'g', purpose: 'Balance minerality' },
    ],
    brewDaySteps: makeBrewDaySteps({ mashTemp: 154, mashTime: 60, batchSize: 7, boilTime: 60, yeastName: 'WLP002 English Ale', pitchTemp: 65, fermTemp: 66, fermDays: 12, strikeVol: 55, strikeTemp: 164, spargeVol: 35, grainWeight: 193 }),
    totalCost: 320.75, costPerBarrel: 45.82, costPerPint: 0.18,
    lastBrewed: '2026-01-25', totalBatches: 6,
    brewHistory: [
      { batchNumber: 'BBW-2026-008', date: '2026-01-25', actualOG: 1.059, actualFG: 1.015, qcScore: 94, status: 'packaged' },
      { batchNumber: 'BBW-2025-045', date: '2025-12-15', actualOG: 1.057, actualFG: 1.013, qcScore: 91, status: 'packaged' },
      { batchNumber: 'BBW-2025-036', date: '2025-11-05', actualOG: 1.058, actualFG: 1.014, qcScore: 93, status: 'packaged' },
    ],
    notes: 'Texas mesquite wood-smoked malt gives distinct campfire character. Pairs perfectly with our BBQ menu.',
    createdDate: '2025-07-10',
  },

  // 4. Prickly Pear Sour
  {
    id: 'r4', beerId: '5', name: 'Prickly Pear Sour', style: 'Berliner Weisse with Fruit', category: 'seasonal', version: 2, batchSize: 7,
    targetOG: 1.042, targetFG: 1.006, targetABV: 4.2, targetIBU: 5, targetSRM: 8, boilTime: 15, mashTemp: 148, mashTime: 60,
    grainBill: [
      { name: 'Pilsner Malt', type: 'base', amount: 85, unit: 'lbs', percentage: 55, color: 1.5, ppg: 37, costPerLb: 1.20 },
      { name: 'White Wheat Malt', type: 'base', amount: 62, unit: 'lbs', percentage: 40, color: 2.5, ppg: 36, costPerLb: 1.30 },
      { name: 'Acidulated Malt', type: 'specialty', amount: 8, unit: 'lbs', percentage: 5, color: 1.8, ppg: 27, costPerLb: 2.20 },
    ],
    hopSchedule: [
      { name: 'Aged Hops', amount: 2, unit: 'oz', alphaAcid: 1.5, time: 15, type: 'bittering', ibuContribution: 5, costPerOz: 0.50 },
    ],
    yeast: { name: 'Lactobacillus Blend', lab: 'White Labs', strain: 'WLP672', attenuationMin: 75, attenuationMax: 82, flocculation: 'low', tempMin: 95, tempMax: 115, pitchRate: 1.0, starterNeeded: false, costPerPack: 11.00, packsNeeded: 2 },
    waterProfile: { calcium: 40, magnesium: 5, sodium: 10, sulfate: 20, chloride: 35, bicarbonate: 10 },
    waterAdjustments: [
      { mineral: 'Lactic Acid (88%)', amount: 12, unit: 'ml', purpose: 'Pre-acidify mash to pH 4.5' },
      { mineral: 'Calcium Chloride', amount: 4, unit: 'g', purpose: 'Light mineral balance' },
    ],
    brewDaySteps: makeBrewDaySteps({ mashTemp: 148, mashTime: 60, batchSize: 7, boilTime: 15, yeastName: 'WLP672 Lacto + WLP001 post-kettle', pitchTemp: 100, fermTemp: 100, fermDays: 3, strikeVol: 48, strikeTemp: 158, spargeVol: 40, grainWeight: 155 }),
    totalCost: 265.30, costPerBarrel: 37.90, costPerPint: 0.15,
    lastBrewed: '2026-02-01', totalBatches: 4,
    brewHistory: [
      { batchNumber: 'BBW-2026-009', date: '2026-02-01', actualOG: 1.043, actualFG: 1.007, qcScore: 90, status: 'packaged' },
      { batchNumber: 'BBW-2025-044', date: '2025-12-12', actualOG: 1.041, actualFG: 1.005, qcScore: 88, status: 'packaged' },
    ],
    notes: 'Kettle sour process: pitch Lacto at 100°F, hold 48hr until pH 3.3, then boil 15 min. Add 40lbs prickly pear puree to secondary. WLP001 pitched post-kettle for clean co-fermentation.',
    createdDate: '2025-08-20',
  },

  // 5. Barrel-Aged Imperial Stout
  {
    id: 'r5', beerId: '8', name: 'Barrel-Aged Imperial Stout', style: 'Barrel-Aged Imperial Stout', category: 'limited', version: 1, batchSize: 7,
    targetOG: 1.105, targetFG: 1.028, targetABV: 11.5, targetIBU: 65, targetSRM: 42, boilTime: 90, mashTemp: 156, mashTime: 75,
    grainBill: [
      { name: 'Maris Otter', type: 'base', amount: 140, unit: 'lbs', percentage: 55, color: 3, ppg: 38, costPerLb: 1.60 },
      { name: 'Roasted Barley', type: 'specialty', amount: 28, unit: 'lbs', percentage: 11, color: 500, ppg: 25, costPerLb: 1.85 },
      { name: 'Chocolate Malt', type: 'specialty', amount: 25, unit: 'lbs', percentage: 10, color: 350, ppg: 28, costPerLb: 1.80 },
      { name: 'Crystal 120', type: 'specialty', amount: 23, unit: 'lbs', percentage: 9, color: 120, ppg: 33, costPerLb: 1.70 },
      { name: 'Flaked Oats', type: 'adjunct', amount: 20, unit: 'lbs', percentage: 8, color: 1, ppg: 33, costPerLb: 1.40 },
      { name: 'Munich Malt', type: 'base', amount: 13, unit: 'lbs', percentage: 5, color: 9, ppg: 35, costPerLb: 1.45 },
      { name: 'Black Barley', type: 'specialty', amount: 5, unit: 'lbs', percentage: 2, color: 500, ppg: 25, costPerLb: 1.90 },
    ],
    hopSchedule: [
      { name: 'Magnum', amount: 6, unit: 'oz', alphaAcid: 14.0, time: 90, type: 'bittering', ibuContribution: 52, costPerOz: 0.88 },
      { name: 'East Kent Goldings', amount: 4, unit: 'oz', alphaAcid: 5.0, time: 20, type: 'flavor', ibuContribution: 10, costPerOz: 1.00 },
      { name: 'East Kent Goldings', amount: 2, unit: 'oz', alphaAcid: 5.0, time: 5, type: 'aroma', ibuContribution: 3, costPerOz: 1.00 },
    ],
    yeast: { name: 'English Ale', lab: 'White Labs', strain: 'WLP002', attenuationMin: 63, attenuationMax: 70, flocculation: 'high', tempMin: 65, tempMax: 68, pitchRate: 1.0, starterNeeded: true, costPerPack: 10.50, packsNeeded: 5 },
    waterProfile: { calcium: 120, magnesium: 15, sodium: 25, sulfate: 100, chloride: 80, bicarbonate: 200 },
    waterAdjustments: [
      { mineral: 'Calcium Carbonate', amount: 18, unit: 'g', purpose: 'Buffer pH for massive dark grain bill' },
      { mineral: 'Gypsum', amount: 12, unit: 'g', purpose: 'Sulfate for dry, roasty finish' },
      { mineral: 'Calcium Chloride', amount: 8, unit: 'g', purpose: 'Minerality and mouthfeel' },
    ],
    brewDaySteps: makeBrewDaySteps({ mashTemp: 156, mashTime: 75, batchSize: 7, boilTime: 90, yeastName: 'WLP002 English Ale (massive pitch)', pitchTemp: 64, fermTemp: 66, fermDays: 21, strikeVol: 60, strikeTemp: 168, spargeVol: 32, grainWeight: 254 }),
    totalCost: 498.60, costPerBarrel: 71.23, costPerPint: 0.29,
    lastBrewed: '2025-12-01', totalBatches: 2,
    brewHistory: [
      { batchNumber: 'BBW-2025-047', date: '2025-12-01', actualOG: 1.107, actualFG: 1.030, qcScore: 97, status: 'packaged' },
      { batchNumber: 'BBW-2025-030', date: '2025-09-20', actualOG: 1.103, actualFG: 1.026, qcScore: 95, status: 'packaged' },
    ],
    notes: '12 months in Garrison Brothers bourbon barrels. Rack to barrel after 3 weeks primary. Check monthly. Blend 2 barrels at packaging.',
    createdDate: '2025-06-15',
  },

  // 6. Jalapeño Cream Ale
  {
    id: 'r6', beerId: '7', name: 'Jalapeño Cream Ale', style: 'Cream Ale with Peppers', category: 'flagship', version: 3, batchSize: 7,
    targetOG: 1.050, targetFG: 1.010, targetABV: 5.2, targetIBU: 20, targetSRM: 4, boilTime: 60, mashTemp: 150, mashTime: 60,
    grainBill: [
      { name: '2-Row Pale Malt', type: 'base', amount: 110, unit: 'lbs', percentage: 68, color: 2, ppg: 37, costPerLb: 1.20 },
      { name: 'Flaked Corn', type: 'adjunct', amount: 30, unit: 'lbs', percentage: 19, color: 0.5, ppg: 39, costPerLb: 1.10 },
      { name: 'Rice Hulls', type: 'adjunct', amount: 8, unit: 'lbs', percentage: 5, color: 0, ppg: 0, costPerLb: 0.95 },
      { name: 'Honey Malt', type: 'specialty', amount: 7, unit: 'lbs', percentage: 4, color: 25, ppg: 34, costPerLb: 1.70 },
      { name: 'Carapils (Dextrine)', type: 'specialty', amount: 6, unit: 'lbs', percentage: 4, color: 1.5, ppg: 33, costPerLb: 1.50 },
    ],
    hopSchedule: [
      { name: 'Cascade', amount: 3, unit: 'oz', alphaAcid: 5.5, time: 60, type: 'bittering', ibuContribution: 14, costPerOz: 0.69 },
      { name: 'Cascade', amount: 2, unit: 'oz', alphaAcid: 5.5, time: 15, type: 'flavor', ibuContribution: 4, costPerOz: 0.69 },
      { name: 'Cascade', amount: 1, unit: 'oz', alphaAcid: 5.5, time: 1, type: 'aroma', ibuContribution: 2, costPerOz: 0.69 },
    ],
    yeast: { name: 'Cream Ale Blend', lab: 'White Labs', strain: 'WLP080', attenuationMin: 75, attenuationMax: 80, flocculation: 'medium', tempMin: 65, tempMax: 70, pitchRate: 0.75, starterNeeded: true, costPerPack: 10.50, packsNeeded: 2 },
    waterProfile: { calcium: 55, magnesium: 5, sodium: 10, sulfate: 30, chloride: 50, bicarbonate: 25 },
    waterAdjustments: [
      { mineral: 'Calcium Chloride', amount: 7, unit: 'g', purpose: 'Soft water for clean cream ale base' },
      { mineral: 'Lactic Acid (88%)', amount: 4, unit: 'ml', purpose: 'Mash pH to 5.3' },
    ],
    brewDaySteps: makeBrewDaySteps({ mashTemp: 150, mashTime: 60, batchSize: 7, boilTime: 60, yeastName: 'WLP080 Cream Ale Blend', pitchTemp: 65, fermTemp: 66, fermDays: 10, strikeVol: 50, strikeTemp: 160, spargeVol: 38, grainWeight: 161 }),
    totalCost: 232.15, costPerBarrel: 33.16, costPerPint: 0.13,
    lastBrewed: '2026-02-08', totalBatches: 9,
    brewHistory: [
      { batchNumber: 'BBW-2026-011', date: '2026-02-08', actualOG: 1.051, actualFG: 1.010, qcScore: 93, status: 'packaged' },
      { batchNumber: 'BBW-2026-003', date: '2026-01-12', actualOG: 1.050, actualFG: 1.011, qcScore: 91, status: 'packaged' },
      { batchNumber: 'BBW-2025-046', date: '2025-12-18', actualOG: 1.049, actualFG: 1.009, qcScore: 94, status: 'packaged' },
      { batchNumber: 'BBW-2025-038', date: '2025-11-10', actualOG: 1.050, actualFG: 1.010, qcScore: 90, status: 'packaged' },
      { batchNumber: 'BBW-2025-025', date: '2025-08-28', actualOG: 1.051, actualFG: 1.011, qcScore: 92, status: 'packaged' },
    ],
    notes: 'Add 2 lbs sliced jalapeños (seeds removed) to secondary for 3 days. Taste daily — pull peppers when heat is "sneaky warm" not "fire". The corn keeps it smooth.',
    createdDate: '2025-05-01',
  },
];

export const kegs: Keg[] = [
  // === CLEAN EMPTY (10) ===
  { id: 'k1', kegNumber: 'BBW-K-001', size: '1/2', gallons: 15.5, status: 'clean-empty', location: 'brewery-cold-room', fillCount: 38, lastCleaned: '2026-02-28', deposit: 50, depositStatus: 'not-applicable', purchaseDate: '2025-04-01', purchaseCost: 130, notes: 'Workhorse keg', history: [{ id: 'e1', date: '2026-02-28', type: 'cleaned', description: 'CIP cycle complete', performedBy: 'Mike Bradley' }, { id: 'e2', date: '2026-02-26', type: 'returned', description: 'Returned from The Rusty Tap', accountName: 'The Rusty Tap' }, { id: 'e3', date: '2026-02-10', type: 'deployed', description: 'Deployed with Lone Star Lager', accountName: 'The Rusty Tap', beerName: 'Lone Star Lager' }, { id: 'e4', date: '2026-02-09', type: 'filled', description: 'Filled with Lone Star Lager', beerName: 'Lone Star Lager', performedBy: 'Mike Bradley' }] },
  { id: 'k2', kegNumber: 'BBW-K-002', size: '1/2', gallons: 15.5, status: 'clean-empty', location: 'brewery-cold-room', fillCount: 32, lastCleaned: '2026-03-01', deposit: 50, depositStatus: 'not-applicable', purchaseDate: '2025-04-01', purchaseCost: 130, notes: '', history: [{ id: 'e5', date: '2026-03-01', type: 'cleaned', description: 'CIP cycle complete', performedBy: 'Mike Bradley' }, { id: 'e6', date: '2026-02-28', type: 'returned', description: 'Returned from Canyon Lake BBQ', accountName: 'Canyon Lake BBQ' }] },
  { id: 'k3', kegNumber: 'BBW-K-003', size: '1/2', gallons: 15.5, status: 'clean-empty', location: 'brewery-cold-room', fillCount: 25, lastCleaned: '2026-03-02', deposit: 50, depositStatus: 'not-applicable', purchaseDate: '2025-06-15', purchaseCost: 130, notes: '', history: [{ id: 'e7', date: '2026-03-02', type: 'cleaned', description: 'CIP cycle complete', performedBy: 'Mike Bradley' }] },
  { id: 'k4', kegNumber: 'BBW-K-004', size: '1/4', gallons: 7.75, status: 'clean-empty', location: 'brewery-cold-room', fillCount: 18, lastCleaned: '2026-02-27', deposit: 35, depositStatus: 'not-applicable', purchaseDate: '2025-06-15', purchaseCost: 100, notes: '', history: [{ id: 'e8', date: '2026-02-27', type: 'cleaned', description: 'CIP cycle complete', performedBy: 'Mike Bradley' }] },
  { id: 'k5', kegNumber: 'BBW-K-005', size: '1/4', gallons: 7.75, status: 'clean-empty', location: 'brewery-cold-room', fillCount: 15, lastCleaned: '2026-03-01', deposit: 35, depositStatus: 'not-applicable', purchaseDate: '2025-08-01', purchaseCost: 100, notes: '', history: [{ id: 'e9', date: '2026-03-01', type: 'cleaned', description: 'CIP cycle complete', performedBy: 'Mike Bradley' }] },
  { id: 'k6', kegNumber: 'BBW-K-006', size: '1/6', gallons: 5.17, status: 'clean-empty', location: 'brewery-cold-room', fillCount: 12, lastCleaned: '2026-02-25', deposit: 25, depositStatus: 'not-applicable', purchaseDate: '2025-08-01', purchaseCost: 85, notes: '', history: [{ id: 'e10', date: '2026-02-25', type: 'cleaned', description: 'CIP cycle complete', performedBy: 'Mike Bradley' }] },
  { id: 'k7', kegNumber: 'BBW-K-007', size: '1/6', gallons: 5.17, status: 'clean-empty', location: 'brewery-cold-room', fillCount: 10, lastCleaned: '2026-03-03', deposit: 25, depositStatus: 'not-applicable', purchaseDate: '2025-10-01', purchaseCost: 85, notes: '', history: [{ id: 'e11', date: '2026-03-03', type: 'cleaned', description: 'CIP cycle complete', performedBy: 'Mike Bradley' }] },
  { id: 'k8', kegNumber: 'BBW-K-008', size: '1/2', gallons: 15.5, status: 'clean-empty', location: 'brewery-cold-room', fillCount: 2, lastCleaned: '2026-03-02', deposit: 50, depositStatus: 'not-applicable', purchaseDate: '2026-01-15', purchaseCost: 130, notes: 'New keg', history: [{ id: 'e12', date: '2026-03-02', type: 'cleaned', description: 'Initial cleaning after purchase', performedBy: 'Mike Bradley' }] },
  { id: 'k9', kegNumber: 'BBW-K-009', size: '1/2', gallons: 15.5, status: 'clean-empty', location: 'brewery-cold-room', fillCount: 5, lastCleaned: '2026-03-01', deposit: 50, depositStatus: 'not-applicable', purchaseDate: '2025-12-01', purchaseCost: 130, notes: '', history: [{ id: 'e13', date: '2026-03-01', type: 'cleaned', description: 'CIP cycle complete', performedBy: 'Mike Bradley' }] },
  { id: 'k10', kegNumber: 'BBW-K-010', size: '1/4', gallons: 7.75, status: 'clean-empty', location: 'brewery-cold-room', fillCount: 8, lastCleaned: '2026-02-28', deposit: 35, depositStatus: 'not-applicable', purchaseDate: '2025-10-01', purchaseCost: 100, notes: '', history: [{ id: 'e14', date: '2026-02-28', type: 'cleaned', description: 'CIP cycle complete', performedBy: 'Mike Bradley' }] },

  // === FILLED IN COLD ROOM (8) ===
  { id: 'k11', kegNumber: 'BBW-K-011', size: '1/2', gallons: 15.5, status: 'filled', currentBeerId: '1', currentBeerName: 'Hill Country Haze', batchId: '1', location: 'brewery-cold-room', fillDate: '2026-03-02', fillCount: 28, lastCleaned: '2026-03-01', deposit: 50, depositStatus: 'not-applicable', purchaseDate: '2025-04-01', purchaseCost: 130, notes: '', history: [{ id: 'e15', date: '2026-03-02', type: 'filled', description: 'Filled with Hill Country Haze (BBW-2026-001)', beerName: 'Hill Country Haze', performedBy: 'Mike Bradley' }, { id: 'e16', date: '2026-03-01', type: 'cleaned', description: 'CIP cycle complete', performedBy: 'Mike Bradley' }] },
  { id: 'k12', kegNumber: 'BBW-K-012', size: '1/2', gallons: 15.5, status: 'filled', currentBeerId: '1', currentBeerName: 'Hill Country Haze', batchId: '1', location: 'brewery-cold-room', fillDate: '2026-03-02', fillCount: 22, lastCleaned: '2026-03-01', deposit: 50, depositStatus: 'not-applicable', purchaseDate: '2025-06-15', purchaseCost: 130, notes: '', history: [{ id: 'e17', date: '2026-03-02', type: 'filled', description: 'Filled with Hill Country Haze', beerName: 'Hill Country Haze', performedBy: 'Mike Bradley' }] },
  { id: 'k13', kegNumber: 'BBW-K-013', size: '1/2', gallons: 15.5, status: 'filled', currentBeerId: '4', currentBeerName: 'Lone Star Lager', batchId: '4', location: 'brewery-cold-room', fillDate: '2026-03-01', fillCount: 35, lastCleaned: '2026-02-28', deposit: 50, depositStatus: 'not-applicable', purchaseDate: '2025-04-01', purchaseCost: 130, notes: '', history: [{ id: 'e18', date: '2026-03-01', type: 'filled', description: 'Filled with Lone Star Lager', beerName: 'Lone Star Lager', performedBy: 'Mike Bradley' }] },
  { id: 'k14', kegNumber: 'BBW-K-014', size: '1/2', gallons: 15.5, status: 'filled', currentBeerId: '4', currentBeerName: 'Lone Star Lager', batchId: '4', location: 'brewery-cold-room', fillDate: '2026-03-01', fillCount: 30, lastCleaned: '2026-02-28', deposit: 50, depositStatus: 'not-applicable', purchaseDate: '2025-04-01', purchaseCost: 130, notes: '', history: [{ id: 'e19', date: '2026-03-01', type: 'filled', description: 'Filled with Lone Star Lager', beerName: 'Lone Star Lager', performedBy: 'Mike Bradley' }] },
  { id: 'k15', kegNumber: 'BBW-K-015', size: '1/4', gallons: 7.75, status: 'filled', currentBeerId: '6', currentBeerName: 'Mesquite Smoked Porter', location: 'brewery-cold-room', fillDate: '2026-02-28', fillCount: 14, lastCleaned: '2026-02-27', deposit: 35, depositStatus: 'not-applicable', purchaseDate: '2025-08-01', purchaseCost: 100, notes: '', history: [{ id: 'e20', date: '2026-02-28', type: 'filled', description: 'Filled with Mesquite Smoked Porter', beerName: 'Mesquite Smoked Porter', performedBy: 'Mike Bradley' }] },
  { id: 'k16', kegNumber: 'BBW-K-016', size: '1/4', gallons: 7.75, status: 'filled', currentBeerId: '7', currentBeerName: 'Jalapeño Cream Ale', location: 'brewery-cold-room', fillDate: '2026-03-02', fillCount: 20, lastCleaned: '2026-03-01', deposit: 35, depositStatus: 'not-applicable', purchaseDate: '2025-06-15', purchaseCost: 100, notes: '', history: [{ id: 'e21', date: '2026-03-02', type: 'filled', description: 'Filled with Jalapeño Cream Ale', beerName: 'Jalapeño Cream Ale', performedBy: 'Mike Bradley' }] },
  { id: 'k17', kegNumber: 'BBW-K-017', size: '1/6', gallons: 5.17, status: 'filled', currentBeerId: '5', currentBeerName: 'Prickly Pear Sour', location: 'brewery-cold-room', fillDate: '2026-03-03', fillCount: 9, lastCleaned: '2026-03-02', deposit: 25, depositStatus: 'not-applicable', purchaseDate: '2025-10-01', purchaseCost: 85, notes: '', history: [{ id: 'e22', date: '2026-03-03', type: 'filled', description: 'Filled with Prickly Pear Sour', beerName: 'Prickly Pear Sour', performedBy: 'Mike Bradley' }] },
  { id: 'k18', kegNumber: 'BBW-K-018', size: '1/6', gallons: 5.17, status: 'filled', currentBeerId: '2', currentBeerName: 'Bulverde Blonde', location: 'brewery-cold-room', fillDate: '2026-03-03', fillCount: 11, lastCleaned: '2026-03-02', deposit: 25, depositStatus: 'not-applicable', purchaseDate: '2025-10-01', purchaseCost: 85, notes: '', history: [{ id: 'e23', date: '2026-03-03', type: 'filled', description: 'Filled with Bulverde Blonde', beerName: 'Bulverde Blonde', performedBy: 'Mike Bradley' }] },

  // === ON TAP (4) ===
  { id: 'k19', kegNumber: 'BBW-K-019', size: '1/2', gallons: 15.5, status: 'on-tap', currentBeerId: '1', currentBeerName: 'Hill Country Haze', location: 'brewery-taproom', fillDate: '2026-02-25', fillCount: 42, lastCleaned: '2026-02-24', deposit: 50, depositStatus: 'not-applicable', purchaseDate: '2025-04-01', purchaseCost: 130, notes: 'Tap 1', history: [{ id: 'e24', date: '2026-02-25', type: 'tapped', description: 'Put on Tap 1', beerName: 'Hill Country Haze', performedBy: 'Jessica Tran' }, { id: 'e25', date: '2026-02-25', type: 'filled', description: 'Filled with Hill Country Haze', beerName: 'Hill Country Haze', performedBy: 'Mike Bradley' }] },
  { id: 'k20', kegNumber: 'BBW-K-020', size: '1/2', gallons: 15.5, status: 'on-tap', currentBeerId: '4', currentBeerName: 'Lone Star Lager', location: 'brewery-taproom', fillDate: '2026-02-26', fillCount: 45, lastCleaned: '2026-02-25', deposit: 50, depositStatus: 'not-applicable', purchaseDate: '2025-04-01', purchaseCost: 130, notes: 'Tap 4 — best seller', history: [{ id: 'e26', date: '2026-02-26', type: 'tapped', description: 'Put on Tap 4', beerName: 'Lone Star Lager', performedBy: 'Jessica Tran' }] },
  { id: 'k21', kegNumber: 'BBW-K-021', size: '1/2', gallons: 15.5, status: 'on-tap', currentBeerId: '6', currentBeerName: 'Mesquite Smoked Porter', location: 'brewery-taproom', fillDate: '2026-02-27', fillCount: 19, lastCleaned: '2026-02-26', deposit: 50, depositStatus: 'not-applicable', purchaseDate: '2025-06-15', purchaseCost: 130, notes: 'Tap 6', history: [{ id: 'e27', date: '2026-02-27', type: 'tapped', description: 'Put on Tap 6', beerName: 'Mesquite Smoked Porter', performedBy: 'Rachel Kim' }] },
  { id: 'k22', kegNumber: 'BBW-K-022', size: '1/4', gallons: 7.75, status: 'on-tap', currentBeerId: '8', currentBeerName: 'Barrel-Aged Imperial Stout', location: 'brewery-taproom', fillDate: '2026-02-20', fillCount: 6, lastCleaned: '2026-02-19', deposit: 35, depositStatus: 'not-applicable', purchaseDate: '2025-12-01', purchaseCost: 100, notes: 'Tap 8 — limited pour', history: [{ id: 'e28', date: '2026-02-20', type: 'tapped', description: 'Put on Tap 8 (limited release)', beerName: 'Barrel-Aged Imperial Stout', performedBy: 'Derek Wilson' }] },

  // === DEPLOYED (12) ===
  // The Rusty Tap — 3 kegs
  { id: 'k23', kegNumber: 'BBW-K-023', size: '1/2', gallons: 15.5, status: 'deployed', currentBeerId: '1', currentBeerName: 'Hill Country Haze', location: 'deployed', deployedTo: '1', deployedToName: 'The Rusty Tap', deployedDate: '2026-02-25', expectedReturnDate: '2026-03-11', fillDate: '2026-02-24', fillCount: 33, lastCleaned: '2026-02-23', deposit: 50, depositStatus: 'held', purchaseDate: '2025-04-01', purchaseCost: 130, notes: '', history: [{ id: 'e29', date: '2026-02-25', type: 'deployed', description: 'Delivered to The Rusty Tap', accountName: 'The Rusty Tap', beerName: 'Hill Country Haze', performedBy: 'Derek Wilson' }, { id: 'e30', date: '2026-02-24', type: 'filled', description: 'Filled with Hill Country Haze', beerName: 'Hill Country Haze', performedBy: 'Mike Bradley' }] },
  { id: 'k24', kegNumber: 'BBW-K-024', size: '1/2', gallons: 15.5, status: 'deployed', currentBeerId: '4', currentBeerName: 'Lone Star Lager', location: 'deployed', deployedTo: '1', deployedToName: 'The Rusty Tap', deployedDate: '2026-02-25', expectedReturnDate: '2026-03-11', fillDate: '2026-02-24', fillCount: 27, lastCleaned: '2026-02-23', deposit: 50, depositStatus: 'held', purchaseDate: '2025-06-15', purchaseCost: 130, notes: '', history: [{ id: 'e31', date: '2026-02-25', type: 'deployed', description: 'Delivered to The Rusty Tap', accountName: 'The Rusty Tap', beerName: 'Lone Star Lager', performedBy: 'Derek Wilson' }] },
  { id: 'k25', kegNumber: 'BBW-K-025', size: '1/4', gallons: 7.75, status: 'deployed', currentBeerId: '1', currentBeerName: 'Hill Country Haze', location: 'deployed', deployedTo: '1', deployedToName: 'The Rusty Tap', deployedDate: '2026-03-01', expectedReturnDate: '2026-03-15', fillDate: '2026-02-28', fillCount: 16, lastCleaned: '2026-02-27', deposit: 35, depositStatus: 'held', purchaseDate: '2025-08-01', purchaseCost: 100, notes: '', history: [{ id: 'e32', date: '2026-03-01', type: 'deployed', description: 'Delivered to The Rusty Tap', accountName: 'The Rusty Tap', beerName: 'Hill Country Haze', performedBy: 'Derek Wilson' }] },
  // Gruene General Store — 3 kegs (crowlers/sixtel)
  { id: 'k26', kegNumber: 'BBW-K-026', size: '1/6', gallons: 5.17, status: 'deployed', currentBeerId: '2', currentBeerName: 'Bulverde Blonde', location: 'deployed', deployedTo: '2', deployedToName: 'Gruene General Store', deployedDate: '2026-02-28', expectedReturnDate: '2026-03-14', fillDate: '2026-02-27', fillCount: 8, lastCleaned: '2026-02-26', deposit: 25, depositStatus: 'held', purchaseDate: '2025-10-01', purchaseCost: 85, notes: '', history: [{ id: 'e33', date: '2026-02-28', type: 'deployed', description: 'Delivered to Gruene General Store', accountName: 'Gruene General Store', beerName: 'Bulverde Blonde', performedBy: 'Derek Wilson' }] },
  { id: 'k27', kegNumber: 'BBW-K-027', size: '1/6', gallons: 5.17, status: 'deployed', currentBeerId: '5', currentBeerName: 'Prickly Pear Sour', location: 'deployed', deployedTo: '2', deployedToName: 'Gruene General Store', deployedDate: '2026-02-28', expectedReturnDate: '2026-03-14', fillDate: '2026-02-27', fillCount: 7, lastCleaned: '2026-02-26', deposit: 25, depositStatus: 'held', purchaseDate: '2025-10-01', purchaseCost: 85, notes: '', history: [{ id: 'e34', date: '2026-02-28', type: 'deployed', description: 'Delivered to Gruene General Store', accountName: 'Gruene General Store', beerName: 'Prickly Pear Sour', performedBy: 'Derek Wilson' }] },
  { id: 'k28', kegNumber: 'BBW-K-028', size: '1/6', gallons: 5.17, status: 'deployed', currentBeerId: '7', currentBeerName: 'Jalapeño Cream Ale', location: 'deployed', deployedTo: '2', deployedToName: 'Gruene General Store', deployedDate: '2026-03-02', expectedReturnDate: '2026-03-16', fillDate: '2026-03-01', fillCount: 6, lastCleaned: '2026-02-28', deposit: 25, depositStatus: 'held', purchaseDate: '2026-01-15', purchaseCost: 85, notes: '', history: [{ id: 'e35', date: '2026-03-02', type: 'deployed', description: 'Delivered to Gruene General Store', accountName: 'Gruene General Store', beerName: 'Jalapeño Cream Ale', performedBy: 'Derek Wilson' }] },
  // Canyon Lake BBQ — 2 kegs
  { id: 'k29', kegNumber: 'BBW-K-029', size: '1/2', gallons: 15.5, status: 'deployed', currentBeerId: '6', currentBeerName: 'Mesquite Smoked Porter', location: 'deployed', deployedTo: '3', deployedToName: 'Canyon Lake BBQ', deployedDate: '2026-02-22', expectedReturnDate: '2026-03-08', fillDate: '2026-02-21', fillCount: 24, lastCleaned: '2026-02-20', deposit: 50, depositStatus: 'held', purchaseDate: '2025-04-01', purchaseCost: 130, notes: '', history: [{ id: 'e36', date: '2026-02-22', type: 'deployed', description: 'Delivered to Canyon Lake BBQ', accountName: 'Canyon Lake BBQ', beerName: 'Mesquite Smoked Porter', performedBy: 'Derek Wilson' }, { id: 'e37', date: '2026-02-21', type: 'filled', description: 'Filled with Mesquite Smoked Porter', beerName: 'Mesquite Smoked Porter', performedBy: 'Mike Bradley' }, { id: 'e38', date: '2026-02-05', type: 'returned', description: 'Returned from Canyon Lake BBQ', accountName: 'Canyon Lake BBQ' }, { id: 'e39', date: '2026-01-20', type: 'deployed', description: 'Deployed with Lone Star Lager', accountName: 'Canyon Lake BBQ', beerName: 'Lone Star Lager' }] },
  { id: 'k30', kegNumber: 'BBW-K-030', size: '1/2', gallons: 15.5, status: 'deployed', currentBeerId: '2', currentBeerName: 'Bulverde Blonde', location: 'deployed', deployedTo: '3', deployedToName: 'Canyon Lake BBQ', deployedDate: '2026-02-22', expectedReturnDate: '2026-03-08', fillDate: '2026-02-21', fillCount: 31, lastCleaned: '2026-02-20', deposit: 50, depositStatus: 'held', purchaseDate: '2025-04-01', purchaseCost: 130, notes: '', history: [{ id: 'e40', date: '2026-02-22', type: 'deployed', description: 'Delivered to Canyon Lake BBQ', accountName: 'Canyon Lake BBQ', beerName: 'Bulverde Blonde', performedBy: 'Derek Wilson' }] },
  // More deployed
  { id: 'k31', kegNumber: 'BBW-K-031', size: '1/2', gallons: 15.5, status: 'deployed', currentBeerId: '3', currentBeerName: 'Texas Sunset Wheat', location: 'deployed', deployedTo: '1', deployedToName: 'The Rusty Tap', deployedDate: '2026-03-01', expectedReturnDate: '2026-03-15', fillDate: '2026-02-28', fillCount: 21, lastCleaned: '2026-02-27', deposit: 50, depositStatus: 'held', purchaseDate: '2025-06-15', purchaseCost: 130, notes: '', history: [{ id: 'e41', date: '2026-03-01', type: 'deployed', description: 'Delivered to The Rusty Tap', accountName: 'The Rusty Tap', beerName: 'Texas Sunset Wheat', performedBy: 'Derek Wilson' }] },
  { id: 'k32', kegNumber: 'BBW-K-032', size: '1/4', gallons: 7.75, status: 'deployed', currentBeerId: '4', currentBeerName: 'Lone Star Lager', location: 'deployed', deployedTo: '3', deployedToName: 'Canyon Lake BBQ', deployedDate: '2026-02-28', expectedReturnDate: '2026-03-14', fillDate: '2026-02-27', fillCount: 13, lastCleaned: '2026-02-26', deposit: 35, depositStatus: 'held', purchaseDate: '2025-08-01', purchaseCost: 100, notes: '', history: [{ id: 'e42', date: '2026-02-28', type: 'deployed', description: 'Delivered to Canyon Lake BBQ', accountName: 'Canyon Lake BBQ', beerName: 'Lone Star Lager', performedBy: 'Derek Wilson' }] },
  { id: 'k33', kegNumber: 'BBW-K-033', size: '1/2', gallons: 15.5, status: 'deployed', currentBeerId: '1', currentBeerName: 'Hill Country Haze', location: 'deployed', deployedTo: '2', deployedToName: 'Gruene General Store', deployedDate: '2026-03-02', expectedReturnDate: '2026-03-16', fillDate: '2026-03-01', fillCount: 17, lastCleaned: '2026-02-28', deposit: 50, depositStatus: 'held', purchaseDate: '2025-08-01', purchaseCost: 130, notes: '', history: [{ id: 'e43', date: '2026-03-02', type: 'deployed', description: 'Delivered to Gruene General Store', accountName: 'Gruene General Store', beerName: 'Hill Country Haze', performedBy: 'Derek Wilson' }] },
  { id: 'k34', kegNumber: 'BBW-K-034', size: '1/2', gallons: 15.5, status: 'deployed', currentBeerId: '7', currentBeerName: 'Jalapeño Cream Ale', location: 'deployed', deployedTo: '1', deployedToName: 'The Rusty Tap', deployedDate: '2026-02-20', expectedReturnDate: '2026-03-06', fillDate: '2026-02-19', fillCount: 29, lastCleaned: '2026-02-18', deposit: 50, depositStatus: 'held', purchaseDate: '2025-04-01', purchaseCost: 130, notes: 'Overdue for return', history: [{ id: 'e44', date: '2026-02-20', type: 'deployed', description: 'Delivered to The Rusty Tap', accountName: 'The Rusty Tap', beerName: 'Jalapeño Cream Ale', performedBy: 'Derek Wilson' }] },

  // === RETURNED DIRTY (3) ===
  { id: 'k35', kegNumber: 'BBW-K-035', size: '1/2', gallons: 15.5, status: 'returned-dirty', location: 'returned', fillCount: 36, lastCleaned: '2026-02-10', deposit: 50, depositStatus: 'returned', purchaseDate: '2025-04-01', purchaseCost: 130, notes: 'Returned from Gruene General, needs cleaning', history: [{ id: 'e45', date: '2026-03-03', type: 'returned', description: 'Returned from Gruene General Store', accountName: 'Gruene General Store' }, { id: 'e46', date: '2026-02-15', type: 'deployed', description: 'Deployed with Bulverde Blonde', accountName: 'Gruene General Store', beerName: 'Bulverde Blonde' }] },
  { id: 'k36', kegNumber: 'BBW-K-036', size: '1/4', gallons: 7.75, status: 'returned-dirty', location: 'returned', fillCount: 11, lastCleaned: '2026-02-08', deposit: 35, depositStatus: 'returned', purchaseDate: '2025-10-01', purchaseCost: 100, notes: 'Returned from Canyon Lake BBQ', history: [{ id: 'e47', date: '2026-03-04', type: 'returned', description: 'Returned from Canyon Lake BBQ', accountName: 'Canyon Lake BBQ' }] },
  { id: 'k37', kegNumber: 'BBW-K-037', size: '1/6', gallons: 5.17, status: 'returned-dirty', location: 'returned', fillCount: 4, lastCleaned: '2026-02-01', deposit: 25, depositStatus: 'returned', purchaseDate: '2026-01-15', purchaseCost: 85, notes: '', history: [{ id: 'e48', date: '2026-03-04', type: 'returned', description: 'Returned from The Rusty Tap', accountName: 'The Rusty Tap' }] },

  // === CLEANING (2) ===
  { id: 'k38', kegNumber: 'BBW-K-038', size: '1/2', gallons: 15.5, status: 'cleaning', location: 'maintenance-bay', fillCount: 40, lastCleaned: '2026-02-15', deposit: 50, depositStatus: 'not-applicable', purchaseDate: '2025-04-01', purchaseCost: 130, notes: 'In CIP cycle', history: [{ id: 'e49', date: '2026-03-04', type: 'cleaned', description: 'Started CIP cleaning cycle', performedBy: 'Mike Bradley' }, { id: 'e50', date: '2026-03-03', type: 'returned', description: 'Returned from taproom (kicked)', beerName: 'Bulverde Blonde' }] },
  { id: 'k39', kegNumber: 'BBW-K-039', size: '1/2', gallons: 15.5, status: 'cleaning', location: 'maintenance-bay', fillCount: 34, lastCleaned: '2026-02-20', deposit: 50, depositStatus: 'not-applicable', purchaseDate: '2025-04-01', purchaseCost: 130, notes: 'In CIP cycle', history: [{ id: 'e51', date: '2026-03-04', type: 'cleaned', description: 'Started CIP cleaning cycle', performedBy: 'Mike Bradley' }] },

  // === MISSING (1) ===
  { id: 'k40', kegNumber: 'BBW-K-040', size: '1/2', gallons: 15.5, status: 'missing', currentBeerName: 'Lone Star Lager', location: 'deployed', deployedTo: '1', deployedToName: 'The Rusty Tap', deployedDate: '2026-01-16', expectedReturnDate: '2026-01-30', fillDate: '2026-01-15', fillCount: 26, lastCleaned: '2026-01-14', deposit: 50, depositStatus: 'held', purchaseDate: '2025-06-15', purchaseCost: 130, notes: 'Deployed 47 days ago. Multiple return requests sent. Escalated to manager.', history: [{ id: 'e52', date: '2026-02-20', type: 'marked-missing', description: 'Marked as missing after 35 days with no return', performedBy: 'Derek Wilson' }, { id: 'e53', date: '2026-01-16', type: 'deployed', description: 'Delivered to The Rusty Tap', accountName: 'The Rusty Tap', beerName: 'Lone Star Lager', performedBy: 'Derek Wilson' }, { id: 'e54', date: '2026-01-15', type: 'filled', description: 'Filled with Lone Star Lager', beerName: 'Lone Star Lager', performedBy: 'Mike Bradley' }] },
];

export const monthlyFinancials: MonthlyFinancial[] = [
  { month: '2025-10', monthLabel: 'Oct', beerRevenue: 42500, foodRevenue: 28200, naRevenue: 6800, merchandiseRevenue: 3200, eventRevenue: 4800, wholesaleRevenue: 2400, totalRevenue: 87900, cogs: 27680, laborCost: 28930, rent: 8500, utilities: 3200, marketing: 1800, insurance: 950, licenses: 400, supplies: 2100, misc: 1500, totalExpenses: 75060, netProfit: 12840, netMarginPct: 14.6 },
  { month: '2025-11', monthLabel: 'Nov', beerRevenue: 48200, foodRevenue: 31500, naRevenue: 7600, merchandiseRevenue: 4100, eventRevenue: 6200, wholesaleRevenue: 3800, totalRevenue: 101400, cogs: 30420, laborCost: 31430, rent: 8500, utilities: 3400, marketing: 2200, insurance: 950, licenses: 400, supplies: 2100, misc: 1600, totalExpenses: 81000, netProfit: 20400, netMarginPct: 20.1 },
  { month: '2025-12', monthLabel: 'Dec', beerRevenue: 52800, foodRevenue: 34800, naRevenue: 8400, merchandiseRevenue: 6800, eventRevenue: 8500, wholesaleRevenue: 4200, totalRevenue: 115500, cogs: 33500, laborCost: 34650, rent: 8500, utilities: 3600, marketing: 2800, insurance: 950, licenses: 400, supplies: 2300, misc: 1800, totalExpenses: 88500, netProfit: 27000, netMarginPct: 23.4 },
  { month: '2026-01', monthLabel: 'Jan', beerRevenue: 38600, foodRevenue: 25400, naRevenue: 6200, merchandiseRevenue: 2800, eventRevenue: 3200, wholesaleRevenue: 3400, totalRevenue: 79600, cogs: 24280, laborCost: 26070, rent: 8500, utilities: 3100, marketing: 1500, insurance: 950, licenses: 400, supplies: 1900, misc: 1400, totalExpenses: 68100, netProfit: 11500, netMarginPct: 14.4 },
  { month: '2026-02', monthLabel: 'Feb', beerRevenue: 44800, foodRevenue: 29600, naRevenue: 7200, merchandiseRevenue: 3400, eventRevenue: 5600, wholesaleRevenue: 4800, totalRevenue: 95400, cogs: 28620, laborCost: 29770, rent: 8500, utilities: 3200, marketing: 1800, insurance: 950, licenses: 400, supplies: 2000, misc: 1500, totalExpenses: 76740, netProfit: 18660, netMarginPct: 19.6 },
  { month: '2026-03', monthLabel: 'Mar', beerRevenue: 54200, foodRevenue: 36800, naRevenue: 8800, merchandiseRevenue: 4200, eventRevenue: 7800, wholesaleRevenue: 6200, totalRevenue: 118000, cogs: 34220, laborCost: 35400, rent: 8500, utilities: 3400, marketing: 2400, insurance: 950, licenses: 400, supplies: 2200, misc: 1600, totalExpenses: 89070, netProfit: 28930, netMarginPct: 24.5 },
];
