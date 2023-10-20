import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicToolbarComponent } from './basic-toolbar.component';

describe('BasicToolbarComponent', () => {
  let component: BasicToolbarComponent;
  let fixture: ComponentFixture<BasicToolbarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BasicToolbarComponent]
    });
    fixture = TestBed.createComponent(BasicToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
