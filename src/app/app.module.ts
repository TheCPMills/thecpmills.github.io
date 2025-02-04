import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent }  from './app.component';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '@modules/navbar/navbar.component';
import { HeaderComponent } from '@modules/header/header.component';
import { AboutSectionComponent } from '@modules/about-section/about-section.component';
import { PortfolioComponent } from '@modules/projects-portfolio/projects-portfolio.component';
import { ContentCreationComponent } from '@modules/content-creation/content-creation.component';

@NgModule({
  imports:      [ BrowserModule, ReactiveFormsModule ],
  declarations: [ AppComponent, NavbarComponent, HeaderComponent, AboutSectionComponent, PortfolioComponent, ContentCreationComponent ],
  bootstrap:    [ AppComponent ],
  providers:    [ /** services */ ]
})
export class AppModule {}