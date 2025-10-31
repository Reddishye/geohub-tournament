import { ObjectId } from 'mongodb';
import Round from '@backend/models/round';
import Tournament from '@backend/models/tournament';

// Map pool coordinates - simplified version
const MAP_POOL_LOCATIONS: Record<string, () => { lat: number; lng: number }> = {
  anywhere: () => ({
    lat: (Math.random() * 180) - 90,
    lng: (Math.random() * 360) - 180,
  }),
  famous: () => {
    // Famous places (simplified - would need actual database)
    const famous = [
      { lat: 48.8584, lng: 2.2945 }, // Eiffel Tower
      { lat: 40.7580, lng: -73.9855 }, // Times Square
      { lat: 51.5007, lng: -0.1246 }, // Big Ben
      { lat: 35.6595, lng: 139.7004 }, // Tokyo Tower
      { lat: -33.8568, lng: 151.2153 }, // Sydney Opera House
    ];
    return famous[Math.floor(Math.random() * famous.length)];
  },
  urban: () => {
    // Major cities
    const cities = [
      { lat: 40.7128, lng: -74.0060 }, // New York
      { lat: 51.5074, lng: -0.1278 }, // London
      { lat: 35.6762, lng: 139.6503 }, // Tokyo
      { lat: 48.8566, lng: 2.3522 }, // Paris
    ];
    return cities[Math.floor(Math.random() * cities.length)];
  },
  rural: () => ({
    lat: (Math.random() * 180) - 90,
    lng: (Math.random() * 360) - 180,
  }),
  europe: () => ({
    lat: 35 + Math.random() * 35,
    lng: -10 + Math.random() * 50,
  }),
  asia: () => ({
    lat: 10 + Math.random() * 45,
    lng: 60 + Math.random() * 80,
  }),
  americas: () => ({
    lat: -55 + Math.random() * 110,
    lng: -170 + Math.random() * 100,
  }),
  africa: () => ({
    lat: -35 + Math.random() * 70,
    lng: -20 + Math.random() * 60,
  }),
  oceania: () => ({
    lat: -45 + Math.random() * 50,
    lng: 110 + Math.random() * 70,
  }),
};

export async function generateTournamentRounds(tournamentId: ObjectId): Promise<void> {
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new Error('Tournament not found');
  }

  const { numberOfRounds, mapPool, fairnessMode } = tournament;
  const locationGenerator = MAP_POOL_LOCATIONS[mapPool] || MAP_POOL_LOCATIONS.anywhere;

  // Check if rounds already exist
  const existingRounds = await Round.countDocuments({ gameId: tournamentId });
  if (existingRounds > 0) {
    console.log('Rounds already exist for this tournament');
    return;
  }

  // Generate base locations
  let baseLocations: Array<{ lat: number; lng: number }> = [];
  
  switch (fairnessMode) {
    case 'synchronized':
      // All participants get same locations in same order
      for (let i = 0; i < numberOfRounds; i++) {
        baseLocations.push(locationGenerator());
      }
      break;

    case 'sync_random':
      // All participants get same locations but shuffled differently per participant
      // For now, generate same base set - shuffling happens on client
      for (let i = 0; i < numberOfRounds; i++) {
        baseLocations.push(locationGenerator());
      }
      break;

    case 'total_random':
      // Each participant gets completely different locations
      // Generate one base set (actual randomization per participant happens on request)
      for (let i = 0; i < numberOfRounds; i++) {
        baseLocations.push(locationGenerator());
      }
      break;

    default:
      throw new Error(`Unknown fairness mode: ${fairnessMode}`);
  }

  // Save rounds to database
  const rounds = baseLocations.map((loc, index) => ({
    gameId: tournamentId,
    roundNumber: index + 1,
    latitude: loc.lat,
    longitude: loc.lng,
  }));

  await Round.insertMany(rounds);
  console.log(`Generated ${rounds.length} rounds for tournament ${tournamentId}`);
}

export async function getTournamentRounds(
  tournamentId: ObjectId,
  participantId?: ObjectId
): Promise<Array<{ roundNumber: number; latitude: number; longitude: number }>> {
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new Error('Tournament not found');
  }

  const rounds = await Round.find({ gameId: tournamentId }).sort({ roundNumber: 1 });

  if (tournament.fairnessMode === 'sync_random' && participantId) {
    // Shuffle based on participant ID for consistent but different order
    const shuffled = [...rounds];
    const seed = participantId.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(((seed + i) * 9301 + 49297) % 233280 / 233280 * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.map((round, index) => ({
      roundNumber: index + 1,
      latitude: round.latitude,
      longitude: round.longitude,
    }));
  }

  if (tournament.fairnessMode === 'total_random' && participantId) {
    // Generate completely new locations for this participant
    const locationGenerator = MAP_POOL_LOCATIONS[tournament.mapPool] || MAP_POOL_LOCATIONS.anywhere;
    return Array.from({ length: tournament.numberOfRounds }, (_, index) => ({
      roundNumber: index + 1,
      ...locationGenerator(),
    }));
  }

  // synchronized mode - return as is
  return rounds.map(round => ({
    roundNumber: round.roundNumber,
    latitude: round.latitude,
    longitude: round.longitude,
  }));
}
