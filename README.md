# Nondomium UI Prototype

## Overview

Nondomium UI is an experimental user interface that reimagines how we interact with digital spaces. Instead of the traditional page-based metaphor, it introduces a landscape metaphor that creates a boundaryless, continuous experience where information is organized in layers of relevance rather than discrete pages.

## Core Concepts

### Landscape Metaphor

The landscape metaphor replaces the traditional page-based navigation with a continuous, depth-based view that allows users to:
- Move freely through information spaces
- See relationships between entities naturally
- Experience smooth transitions between different levels of detail
- Navigate without the constraints of page boundaries

### Layered Architecture

The interface is organized into three main layers, creating a sense of depth through parallax effects:

1. **Primary Focus (Layer 1)**
   - Most relevant and immediate content
   - Full-size icons (55px)
   - Sharp, clear visuals
   - Maximum opacity and visibility

2. **Extended Context (Layer 2)**
   - Secondary content with moderate relevance
   - 75% of base size
   - Slight blur effect
   - Reduced opacity

3. **Background Context (Layer 3)**
   - Contextual and related content
   - 60% of base size
   - Increased blur
   - Further reduced opacity

### Proximity-Based Organization

Content placement is determined by a proximity algorithm that considers:
- Relevance to current context
- User's role and permissions
- Interaction history
- Temporal urgency
- Geographic relationships

This creates a natural organization where:
- Most relevant items appear in the Primary Focus
- Related items populate the Extended Context
- Contextual information sits in the Background

## Navigation

### Spatial Navigation

1. **Horizontal Movement**
   - Pan left/right using mouse drag or arrow keys
   - Explore entities within the same layer
   - Parallax effect creates depth perception

2. **Vertical Movement (Depth)**
   - Use Up/Down arrow keys to move between layers
   - ArrowUp brings forward the next layer
   - ArrowDown returns to previous layers
   - Maintains three visible layers at all times

### Interactive Elements

- Click entities to view detailed information
- Hover for quick previews
- State indicators show entity status
- Visual feedback for interaction possibilities

## Perspectives

The interface adapts to different viewing perspectives based on user roles and interests:

### Role Perspective
- Emphasizes resources and commitments relevant to the user's role
- Adjusts proximity calculations to prioritize role-related content
- Customizes the view based on role permissions and responsibilities

### Resource Perspective
- Centers the view around resources and their relationships
- Highlights resource states and availability
- Shows related commitments and responsible agents

### Agent Perspective
- Focuses on people and their interactions
- Emphasizes social connections and collaborations
- Displays agent-related activities and responsibilities

### Geographic Perspective
- Organizes content based on physical location
- Prioritizes proximity in physical space
- Useful for location-based decision making

## Technical Implementation

Built with:
- Svelte 5 with Runes for reactive state management
- TypeScript for type safety
- Tailwind CSS for styling
- CSS transforms and transitions for smooth animations

Key features:
- Reactive state management for smooth updates
- GPU-accelerated animations for performance
- Accessibility-first design with keyboard navigation
- Responsive design for different screen sizes

## Visual Hierarchy

The interface uses several visual cues to indicate depth and relevance:

1. **Size Gradation**
   - Primary Focus: 55px icons
   - Extended Context: 41px icons (75%)
   - Background Context: 33px icons (60%)

2. **Blur Effects**
   - Primary Focus: No blur
   - Extended Context: Light blur
   - Background Context: Increased blur

3. **Opacity Levels**
   - Decreases with depth to create visual hierarchy
   - Helps focus attention on relevant content

4. **State Indicators**
   - Peripheral indicators show entity status
   - Color coding for different states
   - Size adjusts with layer depth

## Purpose

This UI prototype demonstrates an alternative to traditional web interfaces by:
- Breaking free from the constraints of page-based design
- Creating a more natural and fluid interaction model
- Adapting to user context and needs
- Providing a more intuitive way to navigate complex information spaces

The landscape metaphor enables users to maintain context while navigating, understand relationships between entities more naturally, and interact with information in a more intuitive way than traditional page-based interfaces allow.