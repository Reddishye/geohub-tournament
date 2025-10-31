import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled, { keyframes } from 'styled-components';
import { Meta } from '@components/Meta';
import { useTournamentSocket } from '@hooks/useTournamentSocket';

const TournamentLobby = () => {
  const router = useRouter();
  const { code } = router.query;
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const socket = useTournamentSocket(code as string);

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
        setLoading(false);
      })
      .catch(() => {
        router.push('/tournament/join');
      });
  }, [code, router]);

  useEffect(() => {
    if (!socket) return;

    // Listen for tournament start
    socket.on('tournament:started', () => {
      // Show 3-second countdown
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            router.push(`/tournament/${code}/play`);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    });

    // Emit ready signal
    socket.emit('participant:ready');

    return () => {
      socket.off('tournament:started');
    };
  }, [socket, code, router]);

  if (loading) {
    return (
      <Container>
        <Meta title="Loading Tournament..." />
        <LoadingSpinner />
      </Container>
    );
  }

  if (countdown !== null) {
    return (
      <Container>
        <Meta title="Get Ready!" />
        <CountdownOverlay>
          <CountdownNumber>{countdown}</CountdownNumber>
          <CountdownText>Get Ready!</CountdownText>
        </CountdownOverlay>
      </Container>
    );
  }

  return (
    <Container>
      <Meta title={`${tournament?.tournamentName} - Lobby`} />
      <Content>
        <TournamentIcon>🏆</TournamentIcon>
        <TournamentName>{tournament?.tournamentName}</TournamentName>
        <StatusMessage>
          <Spinner />
          Waiting for gamemaster to start the tournament...
        </StatusMessage>
        <InfoText>
          Your code: <CodeBadge>{code}</CodeBadge>
        </InfoText>
        <InfoText>
          Please keep this window open and wait for the tournament to begin.
        </InfoText>
      </Content>
    </Container>
  );
};

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const Content = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
`;

const TournamentIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const TournamentName = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 2rem;
`;

const StatusMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 1.2rem;
  color: #667eea;
  margin-bottom: 2rem;
  font-weight: 600;
`;

const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid #e0e0e0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingSpinner = styled(Spinner)`
  width: 48px;
  height: 48px;
  border-width: 4px;
`;

const InfoText = styled.p`
  color: #666;
  font-size: 1rem;
  margin: 0.5rem 0;
`;

const CodeBadge = styled.span`
  background: #f0f0f0;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-weight: 700;
  color: #667eea;
  letter-spacing: 0.1rem;
`;

const CountdownOverlay = styled.div`
  text-align: center;
  color: white;
`;

const CountdownNumber = styled.div`
  font-size: 10rem;
  font-weight: 900;
  line-height: 1;
  animation: ${pulse} 1s ease-in-out;
`;

const CountdownText = styled.div`
  font-size: 3rem;
  font-weight: 600;
  margin-top: 2rem;
`;

export default TournamentLobby;
