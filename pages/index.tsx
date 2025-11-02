import type { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { GamemodeCard } from '@components/GamemodeCard'
import { MapPreviewCard } from '@components/MapPreviewCard'
import { Meta } from '@components/Meta'
import { Pill } from '@components/system'
import StyledHomePage from '@styles/HomePage.Styled'
import geoTips from '@utils/constants/geotips.json'
import officialMaps from '@utils/constants/officialMaps.json'
import { COUNTRY_STREAK_DETAILS, DAILY_CHALLENGE_DETAILS } from '@utils/constants/random'
import styled from 'styled-components'

const Home: NextPage = () => {
  const day = new Date().getDate()
  const geoTip = geoTips[day - 1] ?? geoTips[0]

  return (
    <StyledHomePage>
      <Meta title="GeoHub - The free geography guessing game" />
      
      {/* Tournament Join Banner */}
      <TournamentBanner>
        <Link href="/tournament/join" passHref>
          <TournamentLink>
            <TournamentIcon>🏆</TournamentIcon>
            <TournamentText>
              <TournamentTitle>Join a Tournament</TournamentTitle>
              <TournamentSubtitle>Enter your access code to compete</TournamentSubtitle>
            </TournamentText>
            <TournamentArrow>→</TournamentArrow>
          </TournamentLink>
        </Link>
      </TournamentBanner>

      <div className="hero-section">
        <Image
          src="/images/backgrounds/hero.jpg"
          alt="Homes on a street in Japan"
          layout="fill"
          objectFit="cover"
          priority
        />
        <div className="hero-content">
          <h2 className="banner-title">Today&apos;s Tip</h2>
          <div className="tip-wrapper">
            <span className="tip">{geoTip.tip}</span>
          </div>
          <div className="pills-wrapper">
            {geoTip.tags.map((label, idx) => (
              <Pill key={idx} label={label} />
            ))}
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="map-preview-section">
          {officialMaps.map((map, idx) => (
            <MapPreviewCard key={idx} map={map} showDescription />
          ))}
        </div>

        <div className="other-gamemodes">
          <GamemodeCard
            title={COUNTRY_STREAK_DETAILS.name}
            titleColor="var(--blue-500)"
            description={COUNTRY_STREAK_DETAILS.description}
            buttonText="Play Streaks"
            href="/streaks"
          />

          <GamemodeCard
            title={DAILY_CHALLENGE_DETAILS.name}
            titleColor="var(--green-500)"
            description={DAILY_CHALLENGE_DETAILS.description}
            buttonText="Play Challenge"
            href="/daily-challenge"
          />
        </div>
      </div>
    </StyledHomePage>
  )
}

const TournamentBanner = styled.div`
  margin: 2rem 0;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 2rem;
`

const TournamentLink = styled.a`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.5rem 2rem;
  border-radius: 1rem;
  color: white;
  text-decoration: none;
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(102, 126, 234, 0.4);
  }
`

const TournamentIcon = styled.div`
  font-size: 3rem;
`

const TournamentText = styled.div`
  flex: 1;
`

const TournamentTitle = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
`

const TournamentSubtitle = styled.div`
  font-size: 1rem;
  opacity: 0.9;
`

const TournamentArrow = styled.div`
  font-size: 2rem;
  font-weight: 700;
`

export default Home
