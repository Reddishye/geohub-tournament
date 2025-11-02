import styled, { keyframes } from 'styled-components';

interface PauseOverlayProps {
  reason?: string;
}

const PauseOverlay = ({ reason }: PauseOverlayProps) => {
  return (
    <Overlay>
      <Content>
        <PauseIcon>⏸️</PauseIcon>
        <Title>Heads up! A gamemaster paused your adventure.</Title>
        <Message>
          {reason || 'Please wait while the gamemaster resolves an issue.'}
        </Message>
        <LoadingDots>
          <Dot delay={0} />
          <Dot delay={0.2} />
          <Dot delay={0.4} />
        </LoadingDots>
      </Content>
    </Overlay>
  );
};

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.3s ease-in;
  cursor: not-allowed;
`;

const Content = styled.div`
  text-align: center;
  color: white;
  max-width: 500px;
  padding: 2rem;
`;

const PauseIcon = styled.div`
  font-size: 6rem;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
  font-weight: 700;
`;

const Message = styled.p`
  font-size: 1.2rem;
  color: #ccc;
  margin-bottom: 2rem;
`;

const LoadingDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
`;

const Dot = styled.div<{ delay: number }>`
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  animation: ${bounce} 1.4s infinite ease-in-out;
  animation-delay: ${props => props.delay}s;
`;

export default PauseOverlay;
