import { useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { Meta } from '@components/Meta';

const TournamentJoinPage = () => {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 8) {
      setCode(value);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 8) {
      setError('Tournament code must be 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tournament/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid tournament code');
        setLoading(false);
        return;
      }

      // Redirect to tournament lobby
      router.push(`/tournament/${code}/lobby`);
    } catch (err) {
      setError('Failed to validate code. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Container>
      <Meta title="Join Tournament - GeoHub" />
      <Content>
        <Logo>
          <h1>🌍 GeoHub</h1>
          <h2>Tournament</h2>
        </Logo>

        <Form onSubmit={handleSubmit}>
          <Label>Enter Tournament Code</Label>
          <CodeInput
            type="text"
            value={code}
            onChange={handleCodeChange}
            placeholder="XXXXXXXX"
            maxLength={8}
            disabled={loading}
            autoFocus
          />
          
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <JoinButton type="submit" disabled={loading || code.length !== 8}>
            {loading ? 'Validating...' : 'Join Tournament'}
          </JoinButton>
        </Form>

        <BackLink href="/" onClick={(e) => { e.preventDefault(); router.push('/'); }}>
          ← Back to Home
        </BackLink>
      </Content>
    </Container>
  );
};

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
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2.5rem;
    margin: 0;
    color: #667eea;
  }

  h2 {
    font-size: 1.5rem;
    margin: 0.5rem 0 0 0;
    color: #764ba2;
    font-weight: 600;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Label = styled.label`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  text-align: center;
`;

const CodeInput = styled.input`
  font-size: 2rem;
  padding: 1rem;
  text-align: center;
  border: 3px solid #e0e0e0;
  border-radius: 0.5rem;
  font-weight: 700;
  letter-spacing: 0.3rem;
  text-transform: uppercase;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #ccc;
    letter-spacing: 0.2rem;
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 0.5rem;
  text-align: center;
  font-size: 0.9rem;
`;

const JoinButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const BackLink = styled.a`
  display: block;
  text-align: center;
  margin-top: 2rem;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

export default TournamentJoinPage;
