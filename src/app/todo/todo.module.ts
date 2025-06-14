import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoComponent } from './todo/todo.component';
import { CoreModule } from '../core/core.module';



@NgModule({
  declarations: [TodoComponent],
  imports: [
    CommonModule,
    CoreModule
  ],
  exports: [TodoComponent]
})
export class TodoModule { }
