import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PrincipalPageRoutingModule } from './principal-routing.module';

import { PrincipalPage } from './principal.page';
import { ChatPageModule } from 'src/app/modals/chat/chat.module';
import { InfoPageModule } from 'src/app/modals/info/info.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PrincipalPageRoutingModule,
    ChatPageModule,
    InfoPageModule
  ],
  declarations: [PrincipalPage]
})
export class PrincipalPageModule {}
