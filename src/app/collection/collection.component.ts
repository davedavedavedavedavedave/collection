import { Component, OnInit } from '@angular/core';
import { CrawlerService } from '../crawler.service';
import { Card } from '../card';
import { Observable, combineLatest } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit {
  public cards$: Observable<Card[]>;

  constructor(private crawlerService: CrawlerService, private route: ActivatedRoute) {
    this.cards$ = combineLatest(route.paramMap, this.crawlerService.getUserName()).pipe(
      tap(d => console.log(d)),
      switchMap(params => this.crawlerService.getCollectionFor(params[0].get('name') || params[1]))
    )
  }

  ngOnInit(): void {
  }

}
