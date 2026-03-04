import type { Customer, Beer, Batch, TapLine, BreweryEvent, Reservation, MenuItem, InventoryItem, StaffMember, WholesaleAccount, MugClubMember, EmailCampaign, DailySales, ComplianceItem, Performer } from '../types';

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
  { id: '1', batchNumber: 'BBW-2026-001', beerId: '1', beerName: 'Hill Country Haze', style: 'NEIPA', status: 'ready', brewDate: '2026-02-15', targetOG: 1.065, actualOG: 1.067, targetFG: 1.012, actualFG: 1.013, abv: 6.8, tankId: 'FV-1', volume: 7, notes: 'Perfect haze. Dry hopped with extra Mosaic.', gravityReadings: [{ date: '2026-02-15', gravity: 1.067, temp: 66 }, { date: '2026-02-17', gravity: 1.045, temp: 67 }, { date: '2026-02-20', gravity: 1.018, temp: 68 }, { date: '2026-02-23', gravity: 1.013, temp: 68 }], temperatureLog: [], qualityScore: 95 },
  { id: '2', batchNumber: 'BBW-2026-014', beerId: '14', beerName: 'Spring Saison', style: 'Belgian Saison', status: 'fermenting', brewDate: '2026-02-28', targetOG: 1.058, actualOG: 1.060, targetFG: 1.004, tankId: 'FV-3', volume: 7, notes: 'Wild yeast pitching went well. Bubbling vigorously.', gravityReadings: [{ date: '2026-02-28', gravity: 1.060, temp: 72 }, { date: '2026-03-02', gravity: 1.032, temp: 76 }], temperatureLog: [], qualityScore: undefined },
  { id: '3', batchNumber: 'BBW-2026-015', beerId: '15', beerName: 'Pecan Brown Ale', style: 'Brown Ale', status: 'conditioning', brewDate: '2026-02-20', targetOG: 1.052, actualOG: 1.053, targetFG: 1.012, actualFG: 1.013, abv: 5.4, tankId: 'BT-1', volume: 7, notes: 'Added toasted pecans during secondary. Beautiful color.', gravityReadings: [{ date: '2026-02-20', gravity: 1.053, temp: 64 }, { date: '2026-02-25', gravity: 1.013, temp: 65 }], temperatureLog: [], qualityScore: 88 },
  { id: '4', batchNumber: 'BBW-2026-016', beerId: '4', beerName: 'Lone Star Lager', style: 'Mexican Lager', status: 'carbonating', brewDate: '2026-02-18', targetOG: 1.048, actualOG: 1.047, targetFG: 1.008, actualFG: 1.007, abv: 4.5, tankId: 'BT-2', volume: 14, notes: 'Double batch for spring demand. Lagering at 34°F.', gravityReadings: [], temperatureLog: [], qualityScore: 92 },
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
