import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CrawlerService } from '../crawler.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  public footerHtml$: Observable<string>;

  constructor(private crawlerService: CrawlerService) {
    this.footerHtml$ = crawlerService.getFooterHtml();
  }

  ngOnInit(): void {
  }

}
