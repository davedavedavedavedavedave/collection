import { Injectable } from '@angular/core';
import { Observable, from, of, ReplaySubject } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { map, mergeMap, catchError, tap, take, share, filter } from 'rxjs/operators';
import { Card } from './card';

const BASE_URL = 'https://ccgdb.uber.space/user/profile_edit';
const DATA_URL = 'https://ccgdb.uber.space/collection/app.php';

@Injectable({
  providedIn: 'root'
})
export class CrawlerService {
  private _html$: Observable<string>;

  constructor() {
    this._html$ = fromFetch(BASE_URL, { headers: { 'x-cookie': 'PHPSESSID=3g81f7e04be51dfq7sg7lnf0cj', 'cookie': 'PHPSESSID=3g81f7e04be51dfq7sg7lnf0cj' } }).pipe(
      mergeMap(resp => from(resp.text())),
      share()
    );
  }

  getHeaderHtml(): Observable<string> {
    return this._html$.pipe(
      map(text => text.match(/<nav.*<\/nav>/gms)[0]),
    );
  }
  getFooterHtml(): Observable<string> {
    return this._html$.pipe(
      map(text => text.match(/<footer.*<\/footer>/gms)[0]),
    );
  }
  getCollectionFor(name: string): Observable<Card[]> {
    return fromFetch(DATA_URL).pipe(
      mergeMap(resp => from(resp.json())),
      map(json => json.map(r => Card.buildFromObject(r)))
    )
  }
  getUserName(): Observable<string|null> {
    return this._html$.pipe(
      map(text => text.match(/<input type="text" name="username" id="username" value="(.*?)"/gsm)[1]),
      catchError(error => of(null))
    )
  }
  getCollection(): Observable<Card[]> {
    return this.getUserName().pipe(
      mergeMap(name => this.getCollectionFor(name))
    )
  }
}
