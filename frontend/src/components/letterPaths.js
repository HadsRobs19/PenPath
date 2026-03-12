/*
* <summary>
* Improved SVG paths for cursive letters A–H (uppercase & lowercase)
* American cursive style with entry + exit strokes
* Enhanced with flowing loops and natural pen movement
* Optimized for tracing animations
*/

export const letterPaths = {
  Aa: [
    // lowercase cursive a - starts with upstroke, oval, down and exit connector
    `M 50 140
     C 50 140, 55 130, 60 125
     C 75 105, 100 100, 115 110
     C 135 120, 135 145, 115 155
     C 95 165, 70 155, 65 135
     C 60 115, 80 105, 105 105
     C 125 105, 135 115, 140 130
     C 145 145, 155 150, 170 145`,

    // uppercase cursive A - elegant loop with crossbar
    `M 80 160
     C 80 160, 95 100, 120 60
     C 140 30, 160 30, 175 60
     C 195 100, 210 160, 210 160
     M 95 120
     C 95 120, 140 110, 185 120`
  ],

  Bb: [
    // lowercase cursive b - tall ascender with loop, bowl and connector
    `M 70 50
     C 70 50, 65 40, 75 35
     C 90 30, 95 45, 90 70
     C 85 100, 85 130, 90 150
     C 95 160, 115 160, 130 145
     C 150 125, 145 105, 125 100
     C 105 95, 90 110, 95 130
     C 100 145, 125 155, 160 145`,

    // uppercase cursive B - ornate with double bump
    `M 85 160
     C 85 160, 85 100, 85 50
     C 85 40, 95 35, 105 40
     C 140 55, 155 70, 145 95
     C 135 115, 95 110, 95 110
     C 95 110, 155 115, 160 140
     C 165 165, 130 175, 85 160`
  ],

  Cc: [
    // lowercase cursive c - smooth arc with entry and exit
    `M 155 100
     C 155 100, 145 85, 120 85
     C 85 85, 65 110, 65 135
     C 65 160, 90 175, 120 165
     C 145 157, 160 145, 175 140`,

    // uppercase cursive C - graceful sweeping curve
    `M 175 55
     C 175 55, 145 30, 100 40
     C 55 50, 40 100, 50 140
     C 60 180, 120 195, 170 170`
  ],

  Dd: [
    // lowercase cursive d - oval with tall loop ascender
    `M 140 145
     C 140 145, 115 155, 90 145
     C 65 135, 60 110, 75 95
     C 95 80, 125 85, 140 100
     C 150 110, 150 50, 145 35
     C 140 25, 155 25, 160 35
     C 165 50, 155 130, 160 150
     C 165 165, 180 155, 190 145`,

    // uppercase cursive D - elegant curved stroke
    `M 80 160
     C 80 160, 80 100, 80 50
     C 80 35, 100 30, 130 40
     C 175 55, 195 100, 185 140
     C 175 175, 130 180, 80 160`
  ],

  Ee: [
    // lowercase cursive e - looped entry with curve
    `M 55 130
     C 55 130, 70 100, 100 100
     C 130 100, 145 115, 140 135
     C 135 150, 110 158, 85 155
     C 65 152, 55 140, 60 125
     C 68 105, 100 98, 130 105
     C 155 112, 170 125, 180 135`,

    // uppercase cursive E - ornamental with loops
    `M 160 50
     C 160 50, 120 35, 85 55
     C 55 75, 55 100, 80 105
     C 100 108, 130 100, 130 100
     C 130 100, 60 115, 60 145
     C 60 175, 110 185, 165 165`
  ],

  Ff: [
    // lowercase cursive f - descender loop with crossbar
    `M 145 60
     C 145 60, 130 40, 110 45
     C 85 52, 80 80, 85 110
     C 90 145, 90 175, 80 195
     C 70 215, 50 210, 50 195
     M 60 115
     C 60 115, 100 110, 140 115`,

    // uppercase cursive F - flourish with cross strokes
    `M 165 40
     C 165 40, 120 35, 90 55
     C 65 75, 80 100, 80 130
     C 80 155, 85 165, 95 160
     M 65 90
     C 65 90, 115 85, 155 90`
  ],

  Gg: [
    // lowercase cursive g - oval with descender loop
    `M 145 105
     C 145 105, 125 85, 95 90
     C 70 95, 60 120, 70 145
     C 80 165, 115 170, 145 155
     C 155 148, 155 175, 145 200
     C 135 225, 95 225, 75 205
     C 60 190, 70 175, 85 175`,

    // uppercase cursive G - graceful curve with crossbar
    `M 175 50
     C 175 50, 130 25, 80 50
     C 40 75, 35 135, 60 165
     C 90 200, 160 195, 180 160
     C 185 150, 180 135, 165 135
     C 140 135, 130 145, 130 145`
  ],

  Hh: [
    // lowercase cursive h - ascender loop with arch
    `M 55 50
     C 55 50, 50 35, 60 30
     C 75 25, 80 45, 75 80
     C 72 110, 72 140, 80 155
     C 85 162, 95 155, 105 145
     C 120 130, 135 125, 145 135
     C 160 150, 155 165, 145 165
     C 135 165, 150 155, 175 150`,

    // uppercase cursive H - two stems with connecting loop
    `M 70 160
     C 70 160, 70 100, 70 50
     C 70 35, 85 35, 90 50
     C 95 70, 85 90, 95 100
     C 110 115, 145 110, 160 100
     C 175 90, 175 70, 180 50
     C 185 35, 195 35, 195 50
     C 195 100, 195 160, 195 160`
  ]
};
