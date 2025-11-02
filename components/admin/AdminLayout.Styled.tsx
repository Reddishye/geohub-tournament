import styled from 'styled-components'

export const AdminLayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: var(--background);
`

export const Sidebar = styled.aside`
  width: 250px;
  background-color: var(--color-panel);
  border-right: 1px solid var(--border-color);
  padding: 1.5rem 0;
  position: fixed;
  height: 100vh;
  overflow-y: auto;

  .logo {
    padding: 0 1.5rem;
    margin-bottom: 2rem;
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--color-text);
  }

  .nav-section {
    margin-bottom: 1rem;
  }

  .section-title {
    padding: 0 1.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--color-text-secondary);
    letter-spacing: 0.05em;
  }
`

export const NavItem = styled.a<{ active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: ${props => props.active ? 'var(--blue-500)' : 'var(--color-text)'};
  background-color: ${props => props.active ? 'var(--blue-100)' : 'transparent'};
  border-left: 3px solid ${props => props.active ? 'var(--blue-500)' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  font-weight: ${props => props.active ? '600' : '400'};

  &:hover {
    background-color: ${props => props.active ? 'var(--blue-100)' : 'var(--hover-overlay)'};
  }

  .icon {
    margin-right: 0.75rem;
    font-size: 1.25rem;
  }
`

export const MainContent = styled.main`
  flex: 1;
  margin-left: 250px;
  padding: 2rem;
`

export const Header = styled.header`
  background-color: var(--color-panel);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: -2rem -2rem 2rem -2rem;

  h1 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;

    .user-name {
      color: var(--color-text);
      font-weight: 500;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }
  }
`

export const LogoutButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: var(--red-500);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--red-600);
  }
`
