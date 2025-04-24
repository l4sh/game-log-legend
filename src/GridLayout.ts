export class GridLayout {
  columns: number;
  rows: number;
  screenWidth: number;
  screenHeight: number;
  cellWidth: number;
  cellHeight: number;
  coordType: string;

  constructor(
    columns: number,
    rows: number,
    screenWidth: number,
    screenHeight: number,
    coordType?: "start" | "center" | "end"
  ) {
    this.columns = columns;
    this.rows = rows;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.cellWidth = screenWidth / columns;
    this.cellHeight = screenHeight / rows;
    this.coordType = coordType || "center"; // By default return coordinates to the center of the cell;
  }

  resize(screenWidth: number, screenHeight: number) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.cellWidth = screenWidth / this.columns;
    this.cellHeight = screenHeight / this.rows;
  }

  coordToCell(xCoord: number, yCoord: number): { x: number; y: number } {
    return {
      x: Math.floor(xCoord / this.cellWidth),
      y: Math.floor(yCoord / this.cellHeight),
    };
  }

  cellToCoord(xCell: number, yCell: number): { x: number; y: number } {
    let x = xCell * this.cellWidth;
    let y = yCell * this.cellHeight;

    if (this.coordType === "center") {
      x += this.cellWidth / 2;
      y += this.cellHeight / 2;
    } else if (this.coordType === "end") {
      x += this.cellWidth;
      y += this.cellHeight;
    }

    return { x: x, y: y };
  }

  column(xCell: number): number {
    return this.cellToCoord(xCell, 0).x;
  }

  row(yCell: number): number {
    return this.cellToCoord(0, yCell).y;
  }

  get centerX(): number {
    return this.screenWidth / 2;
  }
  get centerY(): number {
    return this.screenHeight / 2;
  }

  get w_2(): number {
    return this.screenWidth / 2;
  }

  get w_4(): number {
    return this.screenWidth / 4;
  }

  get w_8(): number {
    return this.screenWidth / 8;
  }

  get h_2(): number {
    return this.screenHeight / 2;
  }

  get h_4(): number {
    return this.screenHeight / 4;
  }

  get h_8(): number {
    return this.screenHeight / 8;
  }

  get aspectRatio(): number {
    return this.screenWidth / this.screenHeight;
  }
}
