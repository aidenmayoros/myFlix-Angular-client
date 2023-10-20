import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-movie-details-dialog',
  templateUrl: './movie-details-dialog.component.html',
  styleUrls: ['./movie-details-dialog.component.scss'],
})
export class MovieDetailsDialogComponent implements OnInit {
  /**
   *
   * @param {string} data
   * use @inject to add data from the movie object into the dialog modal in the movie-info-componenent.html.
   *
   */

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      content: string;
    },
  ) {}

  ngOnInit(): void {}
}
