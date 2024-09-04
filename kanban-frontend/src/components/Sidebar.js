import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const SidebarWrapper = styled.div`
  background-color: #1f1f2f;
  padding: 20px;
  height: 100vh;
  width: 250px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  transition: width 0.3s ease-in-out;

  &:hover {
    width: 280px;
  }
`;

const Logo = styled.div`
  color: #ffffff;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
`;

const NavItem = styled(Nav.Link)`
  color: #b0b0c3;
  font-size: 18px;
  margin-bottom: 15px;
  padding: 10px 15px;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #2a2a3d;
    color: #ffffff;
    padding-left: 25px;
  }

  &.active {
    background-color: #007bff;
    color: #ffffff;
  }
`;

const Footer = styled.div`
  color: #b0b0c3;
  font-size: 14px;
  text-align: center;
  margin-top: 20px;
`;

const Sidebar = () => {
  return (
    <SidebarWrapper>
      <Logo>Your Logo</Logo>
      <Nav className="flex-column">
        <NavItem as={Link} to="/dashboard" className="text-white">Dashboard</NavItem>
        <NavItem as={Link} to="/kanban" className="text-white">Kanban</NavItem>
      </Nav>
      <Footer>© 2024 Your Company</Footer>
    </SidebarWrapper>
  );
};

export default Sidebar;
