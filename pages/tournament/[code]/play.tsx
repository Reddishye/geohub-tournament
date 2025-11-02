import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { Meta } from '@components/Meta';
import { useTournamentSocket } from '@hooks/useTournamentSocket';
import PauseOverlay from '@components/tournament/PauseOverlay';

const TournamentPlay = () => {
  const router = useRouter();
  const { code } = router.query;
  const [tournament, setTournament] = useState<any>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseReason, setPauseReason] = useState<string>('');
  const socket = useTournamentSocket(code as string);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!code) return;

    // Validate code and get tournament info
    fetch('/api/tournament/validate-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessCode: code }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          router.push('/tournament/join');
          return;
        }
        setTournament(data);
      })
      .catch(() => {
        router.push('/tournament/join');
      });
  }, [code, router]);

  // Setup heartbeat
  useEffect(() => {
    if (!socket) return;

    // Send heartbeat every 10 seconds
    heartbeatIntervalRef.current = setInterval(() => {
      socket.emit('heartbeat');
    }, 10000);

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [socket]);

  // Setup WebSocket event listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for pause events
    socket.on('participant:paused', (data: { reason?: string }) => {
      setIsPaused(true);
      setPauseReason(data.reason || '');
    });

    socket.on('tournament:paused', (data: { reason?: string }) => {
      setIsPaused(true);
      setPauseReason(data.reason || 'Tournament paused by gamemaster');
    });

    // Listen for resume events
    socket.on('participant:resumed', () => {
      setIsPaused(false);
      setPauseReason('');
    });

    socket.on('tournament:resumed', () => {
      setIsPaused(false);
      setPauseReason('');
    });

    // Listen for tournament end
    socket.on('tournament:ended', (data: any) => {
      router.push(`/tournament/${code}/results`);
    });

    // Listen for guess results
    socket.on('guess:result', (data: { score: number; round: number }) => {
      setTotalScore((prev) => prev + data.score);
      setCurrentRound(data.round + 1);
    });

    return () => {
      socket.off('participant:paused');
      socket.off('tournament:paused');
      socket.off('participant:resumed');
      socket.off('tournament:resumed');
      socket.off('tournament:ended');
      socket.off('guess:result');
    };
  }, [socket, code, router]);

  // Handle guess submission
  const handleGuess = (lat: number, lng: number) => {
    if (!socket || isPaused) return;

    socket.emit('guess:submit', {
      roundNumber: currentRound,
      guessLatitude: lat,
      guessLongitude: lng,
      timeSeconds: 60, // TODO: Implement timer
    });
  };

  if (!tournament) {
    return (
      <Container>
        <Meta title="Loading..." />
        <div>Loading tournament...</div>
      </Container>
    );
  }

  return (
    <Container>
      <Meta title={`${tournament.tournamentName} - Playing`} />
      
      {/* Top Bar */}
      <TopBar>
        <RoundInfo>
          Round: {currentRound} / {tournament.numberOfRounds || 5}
        </RoundInfo>
        <ScoreInfo>
          Total Score: {totalScore.toLocaleString()}
        </ScoreInfo>
      </TopBar>

      {/* Game Content */}
      <GameContent>
        <PlaceholderMap>
          <p>🗺️ GeoHub Map Component Integration</p>
          <p>This would integrate with the existing GeoHub game component</p>
          <p>Current Round: {currentRound}</p>
          <SimulateButton 
            onClick={() => handleGuess(0, 0)}
            disabled={isPaused}
          >
            Simulate Guess (for testing)
          </SimulateButton>
        </PlaceholderMap>
      </GameContent>

      {/* Unbypassable Pause Overlay */}
      {isPaused && <PauseOverlay reason={pauseReason} />}
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.div`
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
`;

const RoundInfo = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
`;

const ScoreInfo = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #667eea;
`;

const GameContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const PlaceholderMap = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 4rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  p {
    margin: 1rem 0;
    font-size: 1.2rem;
    color: #666;
  }
`;

const SimulateButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 2rem;

  &:hover:not(:disabled) {
    background: #5568d3;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default TournamentPlay;
