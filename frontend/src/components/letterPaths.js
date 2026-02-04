/*
* <summary>
* Handles the svg paths for cursive letters a-d, uppercase and lower case
*   -> note that the best paths for cursive are still a little off at the moment
*/

export const letterPaths = {
  Aa: [
    // lowercase cursive a
    `
    M80 120
    C 60 80, 130 60, 150 95
    C 170 130, 120 145, 95 120
    C 110 110, 150 115, 170 130


    `,

    // uppercase cursive A (loop style)
    `
    M120 150
    C 90 40, 200 40, 180 120
    C 170 155, 130 150, 120 115


    `
  ],

  Bb: [
    // lowercase cursive b
    `
    M90 40
    L 90 120
    C 90 150, 150 150, 150 120
    C 150 90, 100 95, 95 115

    `,

    // uppercase cursive B (soft loop)
    `
    M110 40
    L 110 150
    C 180 150, 180 90, 110 95

    `
  ],

  Cc: [
    `
    M150 95
    C 120 65, 80 85, 90 120
    C 105 155, 155 145, 165 130

    `,

    `
    M200 80
    C 140 30, 80 70, 90 120
    C 100 170, 170 150, 200 130

    `
  ],

  Dd: [
    `
    M150 40
    L 150 120
    C 150 150, 100 150, 95 120
    C 90 90, 140 95, 150 120

    `,

    `
    M110 40
    L 110 150
    C 200 145, 200 45, 110 40
    `
  ]
};
