import React from 'react';
import styles from './styles.module.css';

const briefingPanels = [
  {
    badge: 'Baseline Economics',
    title: 'Baseline & Idle Cost Exposure',
    text: 'Quantifies annual maintenance burdens, stormwater fees, and energy losses created by unused roof decks versus productive installations.',
    accent: '#3a8a96'
  },
  {
    badge: 'Financial Outlook',
    title: 'Revenue Scenarios & System Spend',
    text: 'Side-by-side look at conservative, base, and stretch yield models with associated CapEx and OpEx for modular Fruitful beds.',
    accent: '#2e6f8a'
  },
  {
    badge: 'Market Demand',
    title: 'Crop Palette & Buyer Demand',
    text: 'Seasonal crop rotations tuned to Louisville buyers, plus incentive pathways for early anchor tenants and corporate ESG teams.',
    accent: '#2f5f73'
  },
  {
    badge: 'Proof Points',
    title: 'Proof Points from Pilot Install',
    text: 'Three-year performance from a 4,800 sq ft pilot including energy offsets, stormwater credits, and retention outcomes.',
    accent: '#3d7391'
  },
  {
    badge: 'Roadmap',
    title: 'Six-Month Delivery Roadmap',
    text: 'Phased approach from diagnostic scans to phased expansion with measurable check-ins every 30 days.',
    accent: '#205972'
  },
  {
    badge: 'Partnership',
    title: 'Engage the Agrinet Commercial Desk',
    text: 'Direct line to the Agrinet x NTARI partnership team for feasibility walks, financial packaging, and tenant alignment.',
    accent: '#17445a'
  }
];

export function RooftopBriefing() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        <span>Visual Briefing</span>
        Explore the full six-panel rooftop business case
      </h2>
      <div className={styles.briefingGrid}>
        {briefingPanels.map((panel) => (
          <div
            className={styles.briefingCard}
            key={panel.title}
            style={{ '--accent': panel.accent }}
          >
            <span className={styles.briefingBadge}>{panel.badge}</span>
            <h3 className={styles.briefingTitle}>{panel.title}</h3>
            <p className={styles.briefingText}>{panel.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
