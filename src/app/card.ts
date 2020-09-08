export class Card {
  constructor(
    public cardCode: string = '',
    public have: number = 0,
    public want: number = 0,
    public offer: number = 0
  ) { }

  public static buildFromObject(object: any) {
    let s = new Card();
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key) && ['CARDCODE', 'HAVE', 'WANT', 'OFFER'].indexOf(key.toUpperCase()) > -1) {
        s[key] = object[key];
      }
    }
    return s;
  }
}
