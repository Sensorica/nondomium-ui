# Nondominium UI Design Vision

## Core Design Philosophy

- **Perspective-centric design**: Interface adapts to agent's role and context
- **Landscape as fundamental pattern**: Natural spatial metaphor for resource organization
- **Parallax 3D depth**: Isometric perspective with 3-4 layers creating intuitive navigation
- **Horizontal navigation**: Primary movement left-right, panning the landscape
- **Symbolic representation**: Resources/entities as round icons with peripheral state indicators


## Landscape
The landscape is the main metaphore, this is where data is aggregated on the screen. 
The landscape is essentially a perspectival view of objects, which are arrenged in 4 rows, one behind the other. The first row of objects represents the Meso layer, the row of relevant objects that are directly in the focus of the user, the objects that the user has a greater probability of interacting with. The rows further away, objects appear smaller (further) and their color is dimmer or lighter, to give the illusion of distance. These further away rows, 3 in all, contain objects that are less and less relevent for the Agent. The main idea of this Landscape metaphore (to replace the page metaphore normally used in design of websites) is to provide the user an immediate view and reach of relevent objects and at the same time an overview of the larger context or of the Macro level. 
The landscape also provides the user the illusion of open space, of unbounded space, of a horizon, instead of closing the users view within a box, a page, a finite 2D canvas.
The possible navigation on the landscape is 
- **panning**, which is moving from left to right and vice versa, exposing objects on all rows that are not directly on the screen in focus.     
- **depth moving**, which is essencially jumping layers, making the second layer the primary layer (bringing it in focus) and replacing the previous first layer, thus making the 3rd layer the 2nd layer, the 4th layer the 3rd layer and creating a new 4th layer with new elements. 

So there is a filtering mechanism that places obects on these consecutive layers on the landscape, bassed on their relevency, how close they are to the main focus of the user.


## Three-Layer Depth System

### 🔬 **Micro Layer** (z-index: 300)

- **Purpose**: Detailed resource view (modal/overlay)
- **Trigger**: Click/tap on resource entity
- **Opacity**: 1.0, no blur
- **Content**: Full resource details, actions, history
- **Navigation**: Close to return to meso, or jump to related entities

### 🎯 **Meso Layer** (z-index: 200) - _DEFAULT_
This is the first layer or row of objects / entities
- **Purpose**: Contextual workspace, agent's primary focus
- **Scope**: Local context relevant to agent's interest, role/location
- **Opacity**: 0.9-1.0, no blur
- **Content**: 10-20 most relevant resources/entities, with 4-5 on screen and the rest accessible by horizontal navigation, panning
- **Interaction**: Full interactive capabilities

### 🌍 **Macro Layer** (z-index: 100)
Thi is layer 2, 3 and 4, in the background, behind the first layers or the meso layer. 
- **Purpose**: Global landscape, broader system context
- **Scope**: All entities less directly related to agent
- **Opacity**: 0.4-0.7, 2-4px blur
- **Content**: Overview of entire resource network
- **Interaction**: Hover preview, click to refocus meso layer


## Perspective Types

### 👷 **Role Perspective**

Agent sees resources relevant to their role/capabilities

```yaml
maintainer_role:
  focus_filter: needs_maintenance = true
  priority_order: urgency_level
  color_scheme: earth_tones
  layout: spatial_proximity
```

### 📦 **Resource Perspective**

Focus on specific resource types or categories

```yaml
resource_view:
  focus_filter: resource_type = selected
  group_by: category | location | status
  color_scheme: resource_type_colors
  layout: cluster_hierarchy
```

### 👥 **Agent Perspective**

Social/collaborative view of other agents

```yaml
social_view:
  focus_filter: collaboration_potential
  relationship_mapping: trust_network
  color_scheme: relationship_strength
  layout: network_graph
```

### 📍 **Geographic Perspective**

Location-based resource organization

```yaml
geographic_view:
  focus_filter: spatial_proximity
  center_point: agent_location
  radius: role_responsibility_area
  layout: concentric_circles
```

## Visual Design System

### Entity Representation

```css
.resource-entity {
  shape: circle | rounded-square | hexagon;
  size: calc(proximity_score * base_size);
  background: resource_type_color;
  border: 2px solid state_color;

  /* Peripheral indicators */
  .state-badges: action_indicators[];
  .glow-effect: urgency_level;
  .pulse-animation: activity_state;
}
```

### State Indicators

- 🟢 **Available/Healthy**: Ready for use, optimal condition
- 🟡 **Needs Attention**: Maintenance required, low priority
- 🔴 **Critical/Blocked**: Urgent action needed, system risk
- 🔵 **In Use/Reserved**: Currently engaged, not available
- ⚪ **Dormant/Archive**: Inactive, background status
- 🟣 **Pending**: Awaiting approval/assignment

### Concentric Layout Pattern

- **Center**: Agent's current focus/role context
- **Inner Ring**: High-relevance resources (meso layer)
- **Outer Ring**: Background context (macro layer, blurred)
- **Smooth Transitions**: Elastic zoom and pan between layers

## Proximity Calculation Algorithm

```javascript
function calculateProximity(entity, agent_context) {
  const weights = {
    role_relevance: 0.4, // Match to agent's role/skills
    geographic_distance: 0.2, // Physical/logical proximity
    interaction_frequency: 0.2, // Historical engagement
    temporal_urgency: 0.1, // Time-sensitive needs
    governance_access: 0.1, // Permission/capability level
  };

  const proximity_score =
    weights.role_relevance * entity.roleMatch(agent_context.role) +
    weights.geographic_distance *
      (1 - entity.distance(agent_context.location)) +
    weights.interaction_frequency *
      entity.interactionHistory(agent_context.id) +
    weights.temporal_urgency * entity.urgencyScore() +
    weights.governance_access * entity.accessLevel(agent_context.capabilities);

  return Math.min(1.0, Math.max(0.0, proximity_score));
}

// Layer assignment
function assignLayer(proximity_score) {
  if (proximity_score >= 0.7) return "micro_candidate";
  if (proximity_score >= 0.4) return "meso";
  return "macro";
}
```

## Dynamic View Composition

### Filter System

```javascript
const meso_composition = {
  keywords: ["maintenance", "urgent", "mechanical"],
  tags: ["infrastructure", "public"],
  date_range: "last_30_days",
  proximity_threshold: 0.6,
  max_entities: 20,
  sort_by: "urgency_desc",
};
```

### Adaptive Personalization

- **Learning**: System learns from agent's interaction patterns
- **Preferences**: Custom color themes, entity sizes, layout density
- **Context Switching**: Quick perspective toggles based on current task

## Navigation Patterns

### Primary Navigation (Horizontal)

- **Left/Right Scrolling**: Move through perspective layers
- **Parallax Effect**: Different scroll speeds per layer (macro slower than meso)
- **Momentum Scrolling**: Natural deceleration with bounce effects
- **Breadcrumb Trail**: Visual path showing navigation history

### Secondary Navigation (Vertical)

- **Zoom In**: Meso → Micro (entity details)
- **Zoom Out**: Meso → Macro (broader landscape)
- **Elastic Transitions**: Smooth scaling with momentum physics
- **Quick Return**: One-click return to default meso view

### Interaction Gestures

- **Click/Tap**: Open micro view or refocus meso
- **Double-Click**: Quick action (depends on entity type)
- **Long Press**: Context menu with available actions
- **Pinch/Zoom**: Layer transition control
- **Swipe**: Navigate between related entities

## Use Case Examples



### 🔧 **Repair Agent Example**

**Role**: Resource maintenance
**Meso View**: Resource requiring repair or maintenance within their geographical vicinity and acording to the skills of the Agent 

- Priority filter: scheduled maintenance
- Status indicators: Operational, needs attention, critical failure
- Timeline view: Maintenance schedules and deadlines



## Responsive Design Considerations

### Mobile Adaptation

- **Single Layer Focus**: Simplified view with layer swipe transitions
- **Larger Touch Targets**: Minimum 44px touch areas for entities
- **Simplified Indicators**: Essential state information only
- **Gesture Navigation**: Swipe for layers, tap for details

### Desktop Enhancement

- **Full Parallax Experience**: All three layers simultaneously visible
- **Keyboard Shortcuts**: Layer navigation, entity selection, quick actions
- **Multi-Selection**: Batch operations on multiple entities
- **Rich Hover States**: Detailed tooltips and preview information

### Accessibility Features

- **High Contrast Mode**: Enhanced visual differentiation
- **Screen Reader Support**: Semantic markup and ARIA labels
- **Keyboard Navigation**: Full functionality without mouse
- **Motion Preferences**: Respect user's motion sensitivity settings

## Technical Implementation Notes

- **Rendering**: Canvas-based or WebGL for smooth 3D transitions
- **Data Binding**: Real-time updates from Holochain DHT
- **Performance**: Virtualized rendering for large entity sets
- **Caching**: Intelligent prefetching based on proximity scores
- **State Management**: Maintain layer states and user preferences

"/home/soushi888/Téléchargements/PXL_20250828_013350143.jpg"
