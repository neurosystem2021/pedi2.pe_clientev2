import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CarritorutaPage } from './carritoruta.page';

describe('CarritorutaPage', () => {
  let component: CarritorutaPage;
  let fixture: ComponentFixture<CarritorutaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CarritorutaPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CarritorutaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
