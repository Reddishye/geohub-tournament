import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { Meta } from '@components/Meta';

const TournamentResults = () => {
  const router = useRouter();
  const { code } = router.query;
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;

    // Fetch tournament results
    // TODO: Create API endpoint for results
    // For now, showing placeholder
    setTimeout(() => {
      setResults({
        tournamentName: 'Tournament Name',
        finalScore: 12450,
        rank: 3,
        totalParticipants: 10,
        rounds: [
          { round: 1, score: 2500, distance: 123 },
          { round: 2, score: 3200, distance: 45 },
          { round: 3, score: 1800, distance: 456 },
          { round: 4, score: 2950, distance: 89 },
          { round: 5, score: 2000, distance: 234 },
        ],
      });
      setLoading(false);
    }, 1000);
  }, [code]);

  if (loading) {
    return (
      <Container>
        <Meta title="Loading Results..." />
        <div>Loading results...</div>
      </Container>
    );
  }

  return (
    <Container>
      <Meta title={`${results?.tournamentName} - Results`} />
      <Content>
        <Header>
          <Trophy>🏆</Trophy>
          <Title>Tournament Complete!</Title>
          <TournamentName>{results?.tournamentName}</TournamentName>
        </Header>

        <RankCard>
          <RankLabel>Your Position</RankLabel>
          <Rank>
            #{results?.rank} <span>of {results?.totalParticipants}</span>
          </Rank>
          <FinalScore>
            Final Score: {results?.finalScore.toLocaleString()}
          </FinalScore>
        </RankCard>

        <StatsSection>
          <StatsTitle>Your Performance</StatsTitle>
          <RoundsTable>
            <thead>
              <tr>
                <th>Round</th>
                <th>Score</th>
                <th>Distance (km)</th>
              </tr>
            </thead>
            <tbody>
              {results?.rounds.map((round: any, idx: number) => (
                <tr key={idx}>
                  <td>{round.round}</td>
                  <td>{round.score.toLocaleString()}</td>
                  <td>{round.distance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </RoundsTable>

          <Statistics>
            <Stat>
              <StatLabel>Best Round</StatLabel>
              <StatValue>
                {Math.max(...results?.rounds.map((r: any) => r.score)).toLocaleString()}
              </StatValue>
            </Stat>
            <Stat>
              <StatLabel>Avg Distance</StatLabel>
              <StatValue>
                {Math.round(
                  results?.rounds.reduce((sum: number, r: any) => sum + r.distance, 0) /
                    results?.rounds.length
                ).toLocaleString()} km
              </StatValue>
            </Stat>
          </Statistics>
        </StatsSection>

        <ExitButton onClick={() => router.push('/tournament/join')}>
          Exit Tournament
        </ExitButton>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Content = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 3rem;
  max-width: 800px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Trophy = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin: 0;
`;

const TournamentName = styled.h2`
  font-size: 1.5rem;
  color: #667eea;
  margin: 0.5rem 0 0 0;
  font-weight: 600;
`;

const RankCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  margin-bottom: 2rem;
`;

const RankLabel = styled.div`
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
`;

const Rank = styled.div`
  font-size: 3rem;
  font-weight: 900;
  margin-bottom: 1rem;

  span {
    font-size: 1.5rem;
    font-weight: 600;
  }
`;

const FinalScore = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
`;

const StatsSection = styled.div`
  margin-bottom: 2rem;
`;

const StatsTitle = styled.h3`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
`;

const RoundsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;

  th,
  td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
  }

  th {
    background: #f5f5f5;
    font-weight: 600;
    color: #333;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const Statistics = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const Stat = styled.div`
  background: #f5f5f5;
  padding: 1.5rem;
  border-radius: 0.5rem;
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: #667eea;
`;

const ExitButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }
`;

export default TournamentResults;
