'use client';

import styled from 'styled-components';

// SidebarWrapper component
export const SidebarWrapper = styled.div`
  background-color: var(--background); // Update as needed
  transition: transform 0.2s ease;
  height: 100%;
  position: fixed;
  transform: translateX(-100%);
  width: 16rem;
  flex-shrink: 0;
  z-index: 202;
  overflow-y: auto;
  border-right: 1px solid var(--border); // Update as needed
  flex-direction: column;
  padding-top: var(--space-10); // Convert design tokens
  padding-bottom: var(--space-10);
  padding-leftL var(--space-6)
  display: flex;

  @media (min-width: 768px) {
    margin-left: 0;
    transform: translateX(0);
    display: flex;
    position: static;
    height: 100vh
    }

  ${(props: any) =>
    props.collapsed && `
    display: inherit;
    margin-left: 0;
    transform: translateX(0);
    
    `
  }
`;

// Header component
export const Header = styled.div`
  display: flex;
  gap: var(--space-10);
  margin-top: var(--space-13);
  padding-inline: var(--space-5);
  
`;

// Body component
export const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-10);
  margin-top: var(--space-13);
  padding-inline: var(--space-5);
`;

// Overlay component
export const Overlay = styled.div`
background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 201;
  transition: opacity 0.2s ease;
  opacity: 0.8;

  @media (min-width: 768px) {
    display: none;
    z-index: auto;
    opacity: 1
  }
`;

// Footer component
export const Footer = styled.div`
 display: flex;
 align-items:center;
 justify-content:center;
 gap: var(--space-10);
 padding-top: var(--space-13);
 padding-bottom: var(--space-8);
 padding-inline: var(--space-8);

 @media (min-width: 768px) {
   padding-top: 0;
   padding-bottom: 0;
 }
`;

export const Sidebar = {
  Wrapper: SidebarWrapper,
  Header,
  Body,
  Overlay,
  Footer,
};
