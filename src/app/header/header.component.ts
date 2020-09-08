import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CrawlerService } from '../crawler.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public headerHtml$: Observable<string>;

  constructor(private crawlerService: CrawlerService) {
    this.headerHtml$ = crawlerService.getHeaderHtml();
  }

  ngOnInit(): void {
  }

}
