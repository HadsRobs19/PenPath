/*
* <summary>
* Improved SVG paths for cursive letters A–D (uppercase & lowercase)
* American cursive style with entry + exit strokes
* Optimized for tracing animations
*/

export const letterPaths = {
  Aa: [
    // lowercase cursive a
    `
    M70 120
    C 70 90, 110 80, 135 105
    C 155 125, 130 145, 105 140
    C 85 135, 85 115, 105 110
    C 130 105, 155 115, 170 125
    `,

    // uppercase cursive A (looped, entry + exit)
    `
    M120 150
    C 80 60, 160 20, 220 70
    C 245 95, 225 125, 185 135
    C 155 145, 125 125, 135 100
    `
  ],

  Bb: [
    // lowercase cursive b
    `
    M90 40
    C 90 80, 90 120, 90 150
    C 90 165, 120 165, 140 145
    C 160 120, 135 95, 110 105
    C 95 110, 100 135, 125 135
    `,

    // uppercase cursive B
    `
    M120 40
    C 120 90, 120 130, 120 150
    C 170 150, 200 125, 175 100
    C 200 80, 165 55, 120 60
    `
  ],

  Cc: [
    // lowercase cursive c
    `
    M150 105
    C 120 80, 85 90, 85 120
    C 85 150, 120 155, 150 135
    `,

    // uppercase cursive C
    `
    M210 90
    C 170 30, 90 50, 90 120
    C 90 180, 170 160, 210 130
    `
  ],

  Dd: [
    // lowercase cursive d
    `
    M140 40
    C 140 80, 140 120, 140 150
    C 140 165, 110 165, 90 140
    C 70 115, 95 95, 120 105
    C 135 110, 145 130, 120 140
    `,

    // uppercase cursive D
    `
    M120 40
    C 120 90, 120 130, 120 150
    C 210 150, 235 100, 210 55
    C 185 35, 140 40, 120 55
    `
  ],

  Ee: [
    // lowercase cursive e
    `
    M150 110
    C 120 90, 85 95, 85 120
    C 85 145, 120 155, 150 135
    C 165 125, 175 120, 190 125
    `,

    // uppercase cursive E
    `
    M200 50
    C 140 30, 100 70, 120 110
    C 145 150, 185 150, 210 130
    `
  ],

  Ff: [
    // lowercase cursive f (tall loop)
    `
    M130 40
    C 90 40, 90 90, 130 120
    C 110 140, 90 130, 95 110
    L 95 95
    C 95 70, 130 70, 160 90
    `,

    // uppercase cursive F
    `
    M160 40
    C 100 40, 100 100, 160 140
    C 190 160, 210 145, 200 125
    `
  ],

  Gg: [
    // lowercase cursive g
    `
    M150 105
    C 120 80, 85 90, 85 120
    C 85 150, 120 155, 150 135
    L 150 155
    C 150 180, 110 185, 90 165
    `,

    // uppercase cursive G
    `
    M210 90
    C 170 30, 90 50, 90 120
    C 90 180, 180 170, 210 135
    C 195 125, 170 120, 150 125
    `
  ],

  Hh: [
    // lowercase cursive h
    `
    M90 40
    C 90 80, 90 120, 90 150
    C 90 165, 120 155, 140 135
    C 160 115, 155 95, 135 105
    C 120 110, 130 135, 155 135
    `,

    // uppercase cursive H
    `
    M110 40
    C 110 80, 110 120, 110 150
    M110 105
    C 140 85, 180 85, 210 105
    `
  ]
};
