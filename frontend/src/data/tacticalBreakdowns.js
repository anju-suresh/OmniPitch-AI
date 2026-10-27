/**
 * Curated Match Tactical Intelligence & Breakdown Knowledge Base
 * Covers all decisive match inflection events from Kickoff (00:00) to Full Time (94')
 * Synchronized with bar_ala_2026_01.json
 */

export const TACTICAL_MOMENTS_CATALOG = [
  {
    eventId: 'evt_001',
    minute: 1,
    type: 'kickoff',
    badge: '⏱️ KICKOFF',
    badgeColor: 'blue',
    player: 'Robert Lewandowski',
    team: 'FC Barcelona',
    teamId: 'barcelona',
    teamCrest: '🔵🔴',
    phase: 'possession',
    coordinates: { x: 50, y: 50 },
    endCoordinates: { x: 45, y: 52 },
    xg: 0.0,
    factDescription: 'Kick-off! FC Barcelona get matchday 23 underway in front of a buzzing Montjuïc crowd, establishing immediate 4-3-3 positional control.',
    tacticalConcept: 'Rest Defense Foundation & Positional Superiority',
    explanation: 'Hansi Flick establishes high rest-defense lines with Cubarsí and Araújo pushed to the halfway line, anchoring a 3-2 rest defense structure with Casadó holding central corridors.',
    keyMechanisms: [
      'High central rest defense anchoring on the halfway line',
      'Asymmetric full-back stagger: Balde high on flank, Koundé in inverted half-space',
      'Casadó acting as the central pendulum pivot'
    ],
    counterfactual: 'If Barcelona had committed both full-backs high simultaneously on kickoff, Alavés\' 4-4-2 front two would have enjoyed a 30-meter vertical transition channel into the wide channels.',
    chalkboardAnnotations: [
      { type: 'arrow', from: { x: 50, y: 50 }, to: { x: 45, y: 52 }, color: '#10B981', label: 'Initial circulation' },
      { type: 'zone', x: 40, y: 35, width: 20, height: 30, color: 'rgba(59, 130, 246, 0.2)', label: '3-2 Rest Defense Anchor' }
    ]
  },
  {
    eventId: 'evt_003',
    minute: 7,
    type: 'shot_saved',
    badge: '🧤 CLUTCH SAVE',
    badgeColor: 'cyan',
    player: 'Robert Lewandowski',
    secondaryPlayer: 'Antonio Sivera',
    team: 'FC Barcelona',
    teamId: 'barcelona',
    teamCrest: '🔵🔴',
    phase: 'attack',
    coordinates: { x: 89, y: 50 },
    endCoordinates: { x: 98, y: 50 },
    xg: 0.22,
    factDescription: 'First big chance! Dani Olmo delivers a pinpoint cross into the box; Lewandowski leaps high and heads firmly, but Sivera parries it away!',
    tacticalConcept: 'Diagonal Wing-Switch & Blind-Side Header Infiltration',
    explanation: 'Dani Olmo drifts into the inside-left half-space, dragging Sedlar forward and whipping a curled inswinger behind the Alavés center-backs to find Lewandowski\'s blind-side run.',
    keyMechanisms: [
      'Olmo half-space occupation pulling the right-sided center-back out of line',
      'Lewandowski blind-side peel off Abqar\'s shoulder',
      'Sivera rapid 1.5-meter forward step narrowing the heading cone'
    ],
    counterfactual: 'If Sivera had hesitated on his goal-line rather than advancing 1.5 meters to narrow the angle, the header trajectory had an 81% probability of finding the bottom-right corner.',
    chalkboardAnnotations: [
      { type: 'arrow', from: { x: 72, y: 75 }, to: { x: 89, y: 50 }, color: '#10B981', label: 'Inswinging Cross' },
      { type: 'arrow', from: { x: 89, y: 50 }, to: { x: 98, y: 50 }, color: '#F59E0B', label: 'Firm Header on Target' }
    ]
  },
  {
    eventId: 'evt_006',
    minute: 15,
    type: 'shot_off_target',
    badge: '⚡ COUNTER BREAK',
    badgeColor: 'yellow',
    player: 'Kike García',
    secondaryPlayer: 'Carlos Vicente',
    team: 'Deportivo Alavés',
    teamId: 'alaves',
    teamCrest: '🔵⚪',
    phase: 'counter_attack',
    coordinates: { x: 24, y: 38 },
    endCoordinates: { x: 6, y: 42 },
    xg: 0.08,
    factDescription: 'Alavés counter quickly down the right wing! Carlos Vicente crosses deep to Kike García, whose half-volley flashes wide of the near upright.',
    tacticalConcept: 'Direct Wing-to-Box Transition on Full-Back Space',
    explanation: 'Carlos Vicente exploits the space vacated behind Alejandro Balde\'s high attacking positioning, delivering early before Barcelona\'s central defenders can set their line.',
    keyMechanisms: [
      'Exploitation of Balde\'s high attacking starting position',
      'Carlos Vicente early delivery taking Cubarsí out of recovery reach',
      'Near-post diagonal cut by Kike García'
    ],
    counterfactual: 'If Araújo had stepped into the wide channel 0.8 seconds earlier to jockey Vicente, Kike García would have been isolated against two recovering center-backs.',
    chalkboardAnnotations: [
      { type: 'arrow', from: { x: 55, y: 18 }, to: { x: 24, y: 38 }, color: '#38BDF8', label: 'Wing Transition' },
      { type: 'arrow', from: { x: 24, y: 38 }, to: { x: 6, y: 42 }, color: '#EF4444', label: 'Crossed Half-Volley' }
    ]
  },
  {
    eventId: 'evt_010',
    minute: 27,
    type: 'goal',
    badge: '⚽ GOLAZO (1-0)',
    badgeColor: 'purple',
    player: 'Robert Lewandowski',
    secondaryPlayer: 'Lamine Yamal',
    team: 'FC Barcelona',
    teamId: 'barcelona',
    teamCrest: '🔵🔴',
    phase: 'attack',
    coordinates: { x: 92, y: 48 },
    endCoordinates: { x: 100, y: 48 },
    xg: 0.64,
    factDescription: 'GOAL! FC Barcelona 1, Deportivo Alavés 0! Lamine Yamal cuts inside and squares an unselfish ball across the six-yard box, where Robert Lewandowski sweeps it clinically into the bottom left corner!',
    tacticalConcept: 'Overload to Isolate & Box Cutback Infiltration',
    explanation: 'Barcelona systematically drag opposition mid-block lines to create vacant half-space corridors. Lamine Yamal commits two defenders before releasing an unselfish square pass across the 6-yard box for Lewandowski\'s clinical first-time finish.',
    keyMechanisms: [
      'Vertical punch through the first pressing line into Zone 14',
      'Decoy run by Pedri dragging Sedlar out of the central corridor',
      'First-touch square ball across the six-yard box for uncontested finish'
    ],
    counterfactual: 'If Manu Sánchez had committed to an aggressive sliding block rather than jockeying Yamal, the cutback lane would have been obstructed by an estimated 65%.',
    chalkboardAnnotations: [
      { type: 'arrow', from: { x: 72, y: 55 }, to: { x: 82, y: 75 }, color: '#10B981', label: 'Diagonal Penetration' },
      { type: 'arrow', from: { x: 82, y: 75 }, to: { x: 92, y: 48 }, color: '#00F0FF', label: 'Unselfish Cutback' },
      { type: 'zone', x: 78, y: 40, width: 20, height: 25, color: 'rgba(59, 130, 246, 0.25)', label: 'Overloaded Half-Space' }
    ]
  },
  {
    eventId: 'evt_013',
    minute: 38,
    type: 'yellow_card',
    badge: '🟨 TACTICAL FOUL',
    badgeColor: 'yellow',
    player: 'Aleksandar Sedlar',
    secondaryPlayer: 'Dani Olmo',
    team: 'Deportivo Alavés',
    teamId: 'alaves',
    teamCrest: '🔵⚪',
    phase: 'defense',
    coordinates: { x: 65, y: 52 },
    endCoordinates: { x: 65, y: 52 },
    xg: 0.0,
    factDescription: 'YELLOW CARD! Aleksandar Sedlar is booked after cynically tugging back Dani Olmo as Barcelona initiated a rapid 3-on-2 counter-attack.',
    tacticalConcept: 'Sacrificial Tactical Foul to Disrupt 3-on-2 Breakaway',
    explanation: 'Sedlar recognizes an impending 3-on-2 overload as Olmo turns in Zone 14. He deliberately commits a tactical foul to stop transition momentum and allow the Alavés defensive block to reset.',
    keyMechanisms: [
      'Identification of structural vulnerability in transition',
      'Immediate cynical foul stopping high-probability attacking sequence',
      'Acceptance of caution to preserve 1-0 deficit'
    ],
    counterfactual: 'If Sedlar had attempted to jockey without fouling, Olmo had open passing angles to both Yamal and Lewandowski with an estimated 0.45 expected threat.',
    chalkboardAnnotations: [
      { type: 'zone', x: 60, y: 45, width: 15, height: 20, color: 'rgba(239, 68, 68, 0.25)', label: 'Tactical Foul Zone' }
    ]
  },
  {
    eventId: 'evt_014',
    minute: 42,
    type: 'shot_saved',
    badge: '🪄 MIDFIELD MAGIC',
    badgeColor: 'blue',
    player: 'Pedri',
    secondaryPlayer: 'Antonio Sivera',
    team: 'FC Barcelona',
    teamId: 'barcelona',
    teamCrest: '🔵🔴',
    phase: 'attack',
    coordinates: { x: 85, y: 54 },
    endCoordinates: { x: 98, y: 52 },
    xg: 0.19,
    factDescription: 'Pedri glides through the midfield, exchanges a give-and-go with Lewandowski, and shoots low towards the far post, forcing another good diving stop from Sivera.',
    tacticalConcept: 'Central Third-Man Combination & Zone 14 Penetration',
    explanation: 'Pedri uses Lewandowski as a wall-pass anchor, pulling the central midfielder out of position and attacking the vacated corridor with quick deceleration and low strike.',
    keyMechanisms: [
      'Wall-pass give-and-go disorganizing Alavés central midfield',
      'Decisive first-time burst through Zone 14 gap',
      'Sivera low diving parry with strong wrist deflection'
    ],
    counterfactual: 'If Antonio Blanco had tracked Pedri\'s blind-side run instead of ball-watching, Pedri would have been forced to recycle wide to Balde.',
    chalkboardAnnotations: [
      { type: 'arrow', from: { x: 68, y: 50 }, to: { x: 85, y: 54 }, color: '#10B981', label: 'Third-Man Wall Pass' }
    ]
  },
  {
    eventId: 'evt_017',
    minute: 45,
    type: 'half_time',
    badge: '⏸️ HALF TIME',
    badgeColor: 'purple',
    player: 'Pau Cubarsí',
    team: 'FC Barcelona',
    teamId: 'barcelona',
    teamCrest: '🔵🔴',
    phase: 'neutral',
    coordinates: { x: 25, y: 50 },
    endCoordinates: { x: 25, y: 50 },
    xg: 0.0,
    factDescription: 'HALF TIME! FC Barcelona lead Deportivo Alavés 1-0 thanks to Robert Lewandowski\'s 27th-minute strike after dominant first-half control.',
    tacticalConcept: 'Positional Suffocation vs Low-Block Elasticity',
    explanation: 'Barcelona recorded 68% territorial tilt in the first half, pinning Alavés into their defensive third while limiting Basque counter-attacks through high Gegenpressing.',
    keyMechanisms: [
      'Sustained 68% territorial domination',
      'Immediate counter-press counteracting Alavés clearances',
      'Defensive compact lines preserved with zero big chances conceded'
    ],
    counterfactual: 'If Alavés had pressed Barcelona\'s build-up higher in the first half, the space behind their backline would have yielded an estimated 1.8x more big chances for Yamal.',
    chalkboardAnnotations: [
      { type: 'zone', x: 20, y: 20, width: 60, height: 60, color: 'rgba(139, 92, 246, 0.15)', label: '68% Territorial Tilt' }
    ]
  },
  {
    eventId: 'evt_020',
    minute: 52,
    type: 'goal',
    badge: '⚽ GLORIOSO GOAL (1-1)',
    badgeColor: 'blue',
    player: 'Kike García',
    secondaryPlayer: 'Jon Guridi',
    team: 'Deportivo Alavés',
    teamId: 'alaves',
    teamCrest: '🔵⚪',
    phase: 'attack',
    coordinates: { x: 18, y: 46 },
    endCoordinates: { x: 2, y: 46 },
    xg: 0.42,
    factDescription: 'GOAL! Deportivo Alavés equalize! FC Barcelona 1, Deportivo Alavés 1! Guridi robs the ball 30 yards out, slips it into the path of Kike García, who rifles a low strike inside the left post beyond Ter Stegen\'s reach!',
    tacticalConcept: 'Midfield Turnover Trap & Rapid Vertical Spearhead',
    explanation: 'Guridi aggressively presses Casadó in the middle third, dispossessing him and instantly threading a first-time vertical ball to Kike García, who finishes across Ter Stegen into the left side netting.',
    keyMechanisms: [
      'Aggressive blind-side tackle on Casadó receiving back to goal',
      'Instant forward pass exploiting unorganized central defense',
      'Low angled strike beating Ter Stegen\'s dive into the corner'
    ],
    counterfactual: 'If Casadó had opted for a safe backwards pass to Cubarsí rather than turning into Guridi\'s pressing radius, Alavés\' counter-attack would have had zero penetration.',
    chalkboardAnnotations: [
      { type: 'arrow', from: { x: 38, y: 50 }, to: { x: 18, y: 46 }, color: '#38BDF8', label: 'Interception & Through-Ball' },
      { type: 'arrow', from: { x: 18, y: 46 }, to: { x: 2, y: 46 }, color: '#EF4444', label: 'Rifled Low Strike' }
    ]
  },
  {
    eventId: 'evt_025',
    minute: 67,
    type: 'shot_woodwork',
    badge: '⚡ OFF THE POST',
    badgeColor: 'yellow',
    player: 'Raphinha',
    secondaryPlayer: 'Gavi',
    team: 'FC Barcelona',
    teamId: 'barcelona',
    teamCrest: '🔵🔴',
    phase: 'attack',
    coordinates: { x: 84, y: 35 },
    endCoordinates: { x: 99, y: 45 },
    xg: 0.28,
    factDescription: 'OFF THE POST! Gavi wins a thunderous tackle in midfield and feeds Raphinha, who unleashes a venomous drive that cannons off the base of the left upright!',
    tacticalConcept: 'High Press Turnover & Cut-Inside Inverted Strike',
    explanation: 'Gavi wins a thunderous tackle on the edge of the final third, finding Raphinha who shifts onto his favored left foot and releases a 104 km/h strike that beats the goalkeeper but hits the woodwork.',
    keyMechanisms: [
      'Gavi high pressing intensity winning second ball',
      'Rapid lateral shift creating an unblocked shooting corridor',
      'High-velocity 104 km/h strike beating Sivera\'s stretch'
    ],
    counterfactual: 'If the ball had struck 4cm more to the right, Barcelona would have regained the lead 6 minutes earlier without needing the subsequent penalty.',
    chalkboardAnnotations: [
      { type: 'arrow', from: { x: 65, y: 48 }, to: { x: 84, y: 35 }, color: '#10B981', label: 'Tackle to Feed' },
      { type: 'arrow', from: { x: 84, y: 35 }, to: { x: 99, y: 45 }, color: '#F59E0B', label: 'Venomous Strike Off Post' }
    ]
  },
  {
    eventId: 'evt_026',
    minute: 71,
    type: 'penalty_awarded',
    badge: '🎯 PENALTY WON',
    badgeColor: 'cyan',
    player: 'Ferran Torres',
    secondaryPlayer: 'Nahuel Tenaglia',
    team: 'FC Barcelona',
    teamId: 'barcelona',
    teamCrest: '🔵🔴',
    phase: 'attack',
    coordinates: { x: 88, y: 52 },
    endCoordinates: { x: 88, y: 52 },
    xg: 0.0,
    factDescription: 'PENALTY AWARDED TO BARCELONA! Ferran Torres bursts into the penalty box, cuts sharply past Tenaglia, and gets brought down by a trailing leg! The referee points to the spot without hesitation!',
    tacticalConcept: 'Direct Penetrative Dribble in the Half-Space Seam',
    explanation: 'Fresh substitute Ferran Torres attacks the seam between left center-back and right-back, forcing Tenaglia into a desperate lunging tackle inside the penalty area.',
    keyMechanisms: [
      'Substitute pace injected directly between Tenaglia and Abqar',
      'Sudden change of direction provoking committed tackle',
      'Referee clean unobstructed view pointing immediately to the spot'
    ],
    counterfactual: 'If Tenaglia had stayed on his feet and matched Ferran\'s run towards the byline, the defender would have maintained containment without risking a penalty.',
    chalkboardAnnotations: [
      { type: 'arrow', from: { x: 75, y: 60 }, to: { x: 88, y: 52 }, color: '#00F0FF', label: 'Incisive Penalty Run' }
    ]
  },
  {
    eventId: 'evt_027',
    minute: 73,
    type: 'goal',
    badge: '⚽ PENALTY BRACE (2-1)',
    badgeColor: 'purple',
    player: 'Robert Lewandowski',
    secondaryPlayer: 'Antonio Sivera',
    team: 'FC Barcelona',
    teamId: 'barcelona',
    teamCrest: '🔵🔴',
    phase: 'set_piece',
    coordinates: { x: 88, y: 50 },
    endCoordinates: { x: 100, y: 54 },
    xg: 0.79,
    factDescription: 'GOAL! FC Barcelona 2, Deportivo Alavés 1! Robert Lewandowski steps up, employs his trademark stuttering run-up, and sends Sivera the wrong way, slotting into the bottom-right corner!',
    tacticalConcept: 'Psychological Stutter & Goalkeeper Freeze Technique',
    explanation: 'Lewandowski uses his signature stuttering run-up, waiting for Sivera to initiate weight transfer before coolly rolling the ball into the opposite bottom corner.',
    keyMechanisms: [
      'Controlled hesitation step checking keeper\'s momentum',
      'Weight-shift trigger dictating placement opposite Sivera\'s lean',
      'Ice-cold precision into the bottom-right netting'
    ],
    counterfactual: 'If Sivera had held his central posture until the moment of ball contact, his reach would have covered 60% more of the lower target area.',
    chalkboardAnnotations: [
      { type: 'arrow', from: { x: 88, y: 50 }, to: { x: 100, y: 54 }, color: '#10B981', label: 'Stutter Penalty Conversion' }
    ]
  },
  {
    eventId: 'evt_029',
    minute: 80,
    type: 'red_card',
    badge: '🟥 RED CARD',
    badgeColor: 'red',
    player: 'Aleksandar Sedlar',
    secondaryPlayer: 'Lamine Yamal',
    team: 'Deportivo Alavés',
    teamId: 'alaves',
    teamCrest: '🔵⚪',
    phase: 'defense',
    coordinates: { x: 75, y: 82 },
    endCoordinates: { x: 75, y: 82 },
    xg: 0.0,
    factDescription: 'RED CARD! Alavés are down to 10 men! Aleksandar Sedlar lunges late into Lamine Yamal near the touchline. The referee brandishes a second yellow followed by the RED CARD!',
    tacticalConcept: 'Wide Isolation Fatigue & Double-Yellow Dismissal',
    explanation: 'Lamine Yamal\'s continuous 1-on-1 isolation on the flank compounds physical and mental fatigue on Sedlar, provoking an overcommitted late challenge that leaves Alavés with 10 men.',
    keyMechanisms: [
      'Relentless 1-on-1 isolation targeting already cautioned defender',
      'Late lunging challenge near touchline',
      'Alavés forced into a 4-4-1 low-block bunker'
    ],
    counterfactual: 'If Luis García Plaza had substituted Sedlar after his 38th-minute yellow, Alavés would have maintained 11 players for the final 15 minutes of the match.',
    chalkboardAnnotations: [
      { type: 'zone', x: 70, y: 75, width: 15, height: 20, color: 'rgba(239, 68, 68, 0.35)', label: 'Dismissal Zone (2nd Yellow)' }
    ]
  },
  {
    eventId: 'evt_032',
    minute: 88,
    type: 'goal',
    badge: '⚡ WONDER GOAL (3-1)',
    badgeColor: 'purple',
    player: 'Lamine Yamal',
    secondaryPlayer: 'Gavi',
    team: 'FC Barcelona',
    teamId: 'barcelona',
    teamCrest: '🔵🔴',
    phase: 'attack',
    coordinates: { x: 83, y: 72 },
    endCoordinates: { x: 100, y: 52 },
    xg: 0.31,
    factDescription: 'GOAL! FC Barcelona 3, Deportivo Alavés 1! Pure brilliance from Lamine Yamal! Gavi switches play out wide; Yamal drops a shoulder, cuts inside Manu Sánchez onto his left boot, and curls an exquisite finish into the top far corner!',
    tacticalConcept: 'Weak-Side Overload Switch & Curled Far-Post Missile',
    explanation: 'Gavi switches play across the pitch, catching Manu Sánchez isolated without midfield cover. Yamal cuts inside onto his left boot and curls an unstoppable finish into the top stanchion.',
    keyMechanisms: [
      'Gavi rapid diagonal switch exploiting 10-man defensive shift lag',
      'Shoulder-drop isolation beating Manu Sánchez onto strong foot',
      'Curled missile targeting the unsavable top corner stanchion'
    ],
    counterfactual: 'If Alavés still had 11 men on the pitch, an auxiliary defensive midfielder would have provided an inside double-team on Yamal\'s cutting path.',
    chalkboardAnnotations: [
      { type: 'arrow', from: { x: 60, y: 40 }, to: { x: 83, y: 72 }, color: '#10B981', label: 'Diagonal Switch' },
      { type: 'arrow', from: { x: 83, y: 72 }, to: { x: 100, y: 52 }, color: '#A855F7', label: 'Curled Top Stanchion' }
    ]
  },
  {
    eventId: 'evt_035',
    minute: 94,
    type: 'full_time',
    badge: '🏁 FULL TIME',
    badgeColor: 'green',
    player: 'Ronald Araújo',
    team: 'FC Barcelona',
    teamId: 'barcelona',
    teamCrest: '🔵🔴',
    phase: 'neutral',
    coordinates: { x: 25, y: 50 },
    endCoordinates: { x: 25, y: 50 },
    xg: 0.0,
    factDescription: 'FULL TIME! FC Barcelona 3, Deportivo Alavés 1! The Blaugrana secure all three points following an eventful encounter highlighted by Lewandowski\'s brace, an Alavés red card, and Yamal\'s late screamer.',
    tacticalConcept: 'Game State Management & Structural Dominance',
    explanation: 'Barcelona controlled game tempo through an unbroken 19-pass sequence, capitalizing on the numerical advantage to comfortably see out the matchday victory.',
    keyMechanisms: [
      'Unbroken 19-pass circulation bleeding the clock',
      'Game state management neutralizing any Basque comeback attempts',
      'Complete 3-1 tactical triumph at Montjuïc'
    ],
    counterfactual: 'If Barcelona had retreated into a defensive low block after going 2-1 up, Alavés\' aerial bombardment through direct set pieces would have generated higher volatility.',
    chalkboardAnnotations: [
      { type: 'zone', x: 20, y: 20, width: 60, height: 60, color: 'rgba(16, 185, 129, 0.2)', label: '3-1 Victory Game Management' }
    ]
  }
];

export const TACTICAL_MOMENTS_MAP = TACTICAL_MOMENTS_CATALOG.reduce((acc, m) => {
  acc[m.eventId] = m;
  return acc;
}, {});
