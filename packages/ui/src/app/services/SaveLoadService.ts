import { Injectable } from "@angular/core";

export interface Diagram {
  vin;
  year;
  brand;
  color;
}

@Injectable()
export class SaveLoadService{
  public getTable(): Diagram[] {
    return [
      {vin: 'aaa', year: 1985, brand: 'bbb', color: 'ccc'},
      {vin: 'fghj', year: 2005, brand: 'asd', color: 'ccc'},
      {vin: 'as', year: 8789, brand: 'bhfgh', color: 'ccc'}
    ]
  }
}
