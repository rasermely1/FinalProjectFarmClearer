const xLimit = 50;
function mapXLimits(x) {
  if (x <= xLimit) return xLimit;
  else if (x >= width - xLimit) return width - xLimit;
  else return x;
}


function generateVerticies(initialX, initialY, minSize, maxSize, amount) {
  let spread = 2*PI/(amount + 1);
  return Array(floor(amount)).fill(0).map((_, i) => {
    return p5.Vector
      .fromAngle(random(i * spread, (i + 1) * spread))
      .mult(random(minSize, maxSize))
      .add(initialX, initialY)
  });
}