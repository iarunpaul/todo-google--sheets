import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { TodoModule } from './todo/todo.module';
import { RouterOutlet } from '@angular/router';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, CoreModule, TodoModule, RouterOutlet],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

